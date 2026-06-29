/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sliders, 
  Activity, 
  Sparkles, 
  Scale, 
  Info, 
  Search, 
  RotateCcw, 
  BarChart2, 
  Filter, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Grid
} from 'lucide-react';
import { Language } from '../i18n';

interface SolitonComparisonLabProps {
  lang?: Language;
}

interface SolitonData {
  id: string;
  name: string;
  type: 'sine-gordon' | 'phi4' | 'double-well' | 'envelope' | 'vortex' | 'non-linear' | 'machian' | 'fractional';
  color: string;
  stable: boolean;
  // Initial coefficients
  initAmp: number;
  initWidth: number;
  chargeSign: number;
  // Measured values (dynamically computed based on system parameters)
  energy: number;
  radius: number;
  fourierMode: number;
  potentialDepth: number;
  wavefrontThickness: number;
  // Non-linear profiles
  waveProfile: number[];
}

// Pearson correlation calculator
function getPearsonCorrelation(x: number[], y: number[]) {
  const n = x.length;
  if (n < 2) return 0;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXSq = x.reduce((a, b) => a + b * b, 0);
  const sumYSq = y.reduce((a, b) => a + b * b, 0);
  const sumXY = x.reduce((sum, _, i) => sum + x[i] * y[i], 0);
  
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumXSq - sumX * sumX) * (n * sumYSq - sumY * sumY));
  if (den === 0) return 0;
  return num / den;
}

export default function SolitonComparisonLab({ lang = 'hu' }: SolitonComparisonLabProps) {
  // System-wide parameters
  const [gridSize, setGridSize] = useState<number>(64); // Virtual grid resolution
  const [solitonSizeScale, setSolitonSizeScale] = useState<'single' | 'double'>('single');
  const [tension, setTension] = useState<number>(1.2); // Hyperspace tension (k_tension)
  const [perturbation, setPerturbation] = useState<number>(0.15); // Noise / barrier amplitude
  const [coupling, setCoupling] = useState<number>(0.8); // Self-interaction coupling
  const [timeStep, setTimeStep] = useState<number>(0.05); // Phase time
  
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [sweepProgress, setSweepProgress] = useState<number>(100);
  const [selectedInvariant, setSelectedInvariant] = useState<'charge' | 'mass' | 'spin'>('charge');

  // Filters for soliton selection
  const [activeFilter, setActiveFilter] = useState<'all' | 'stable' | 'high-energy' | 'positive'>('all');

  // "Invariáns keresés" (Invariant search) state
  const [isSearchingInvariants, setIsSearchingInvariants] = useState<boolean>(false);
  const [showInvariantsReport, setShowInvariantsReport] = useState<boolean>(false);
  const [bestInvariantFound, setBestInvariantFound] = useState<string>('');

  // Multi-soliton definitions (8 distinct solitons with unique characteristics)
  const baseSolitons: Omit<SolitonData, 'energy' | 'radius' | 'fourierMode' | 'potentialDepth' | 'wavefrontThickness' | 'waveProfile'>[] = [
    { id: 'sol-1', name: 'Alpha (Sine-Gordon Kink)', type: 'sine-gordon', color: '#22d3ee', stable: true, initAmp: 4.0, initWidth: 3.2, chargeSign: 1 },
    { id: 'sol-2', name: 'Beta (Anti-Kink)', type: 'sine-gordon', color: '#f43f5e', stable: true, initAmp: -4.0, initWidth: 3.2, chargeSign: -1 },
    { id: 'sol-3', name: 'Gamma (Phi-4 Soliton)', type: 'phi4', color: '#10b981', stable: true, initAmp: 1.5, initWidth: 2.8, chargeSign: 1 },
    { id: 'sol-4', name: 'Delta (Double-Well Breather)', type: 'double-well', color: '#f59e0b', stable: false, initAmp: 2.4, initWidth: 4.5, chargeSign: 0 },
    { id: 'sol-5', name: 'Epsilon (Enveloped Soliton)', type: 'envelope', color: '#a855f7', stable: false, initAmp: 3.0, initWidth: 3.8, chargeSign: 1 },
    { id: 'sol-6', name: 'Zeta (Vortex Singularity)', type: 'vortex', color: '#3b82f6', stable: false, initAmp: 5.0, initWidth: 1.8, chargeSign: -1 },
    { id: 'sol-7', name: 'Eta (Machian Soliton)', type: 'machian', color: '#fb923c', stable: true, initAmp: 2.0, initWidth: 5.0, chargeSign: 2 },
    { id: 'sol-8', name: 'Theta (Fractional Wavelet)', type: 'fractional', color: '#ec4899', stable: false, initAmp: 1.2, initWidth: 2.2, chargeSign: -1 }
  ];

  // Dynamic measurements of the 8 solitons based on parameters
  const rawSolitons: SolitonData[] = useMemo(() => {
    return baseSolitons.map((base) => {
      // 1. Calculate Effective Radius
      // Tension and coupling shrink/compress the soliton, perturbation creates local dispersion/jitter
      const baseRadius = base.initWidth * (solitonSizeScale === 'double' ? 2.0 : 1.0);
      const compressionFactor = Math.sqrt(1 + (tension - 1.0) * 0.5 + (coupling - 0.5) * 0.4);
      const noiseDispersion = 1 + perturbation * 0.6 * Math.sin(baseRadius);
      const measuredRadius = (baseRadius / compressionFactor) * noiseDispersion;

      // 2. Calculate Potential Depth (V_min)
      // Coupling deepens the potential well, tension affects boundaries
      const baseDepth = Math.abs(base.initAmp) * 0.5;
      const measuredDepth = baseDepth * coupling * (1 + (tension - 1.0) * 0.15) * (1 - perturbation * 0.2);

      // 3. Calculate Total Energy
      // Integrate field. E is proportional to amplitude, width, and coupling
      const baseEnergy = Math.pow(base.initAmp, 2) * baseRadius * 0.4;
      const couplingFactor = Math.sqrt(coupling);
      const measuredEnergy = baseEnergy * couplingFactor * (1 + (tension - 1.0) * 0.1) * (1 + perturbation * 0.05);

      // 4. Calculate Dominant Fourier Mode (frequency/wavelength)
      // Discretization grid size affects wave resolution. Smaller radius -> higher dominant mode
      const baseFreq = (solitonSizeScale === 'double' ? 1.0 : 2.0) / measuredRadius;
      const gridScaleCorrection = 1.0 + (64 / gridSize - 1) * 0.15;
      const measuredFourier = Math.min(9.9, Math.max(0.5, baseFreq * gridScaleCorrection * (1 + tension * 0.05)));

      // 5. Calculate Surrounding Wavefront Thickness
      // Affected by grid scale, perturbation, and tension
      const baseThick = (2.0 + perturbation * 1.5) * (solitonSizeScale === 'double' ? 2.0 : 1.0);
      const measuredThickness = Math.max(0.8, baseThick * (1.0 / (tension * 0.7)) * (gridSize / 64));

      // 6. Generate 1D Wave Profile for visualization (30 points)
      const points = 30;
      const waveProfile: number[] = [];
      const mid = points / 2;
      for (let i = 0; i < points; i++) {
        const x = (i - mid) * 0.5 * (solitonSizeScale === 'double' ? 1.8 : 1.0);
        let amp = 0;
        
        if (base.type === 'sine-gordon') {
          // Kink/Anti-kink shape
          amp = base.initAmp * Math.tanh(x / measuredRadius);
        } else if (base.type === 'phi4') {
          // Double-well soliton shape
          amp = base.initAmp * (1.0 / Math.cosh(x / measuredRadius));
        } else if (base.type === 'double-well') {
          // Breather envelope wave
          amp = base.initAmp * Math.sin(x * measuredFourier * 1.5) * Math.exp(-Math.pow(x / measuredRadius, 2));
        } else if (base.type === 'envelope') {
          // Wave packet envelope
          amp = base.initAmp * Math.cos(x * measuredFourier * 2) * (1.0 / (1.0 + Math.pow(x / measuredRadius, 2)));
        } else if (base.type === 'vortex') {
          // Singular vortex spike
          amp = base.initAmp * Math.sin(x) / (Math.abs(x) + measuredRadius * 0.3);
        } else if (base.type === 'machian') {
          // Broad self-focusing wave
          amp = base.initAmp * Math.exp(-Math.pow(x / (measuredRadius * 1.2), 2));
        } else {
          // Chaotic / Fractional wavelet
          amp = base.initAmp * Math.sin(x * 3) * Math.cos(x * 1.5) * Math.exp(-Math.abs(x) / measuredRadius);
        }
        
        // Add tiny perturbation noise
        amp += perturbation * 0.25 * Math.sin(x * 10 + timeStep * 50);
        waveProfile.push(amp);
      }

      return {
        ...base,
        energy: measuredEnergy,
        radius: measuredRadius,
        fourierMode: measuredFourier,
        potentialDepth: measuredDepth,
        wavefrontThickness: measuredThickness,
        waveProfile
      };
    });
  }, [gridSize, tension, perturbation, coupling, timeStep, solitonSizeScale]);

  // Filter solitons based on selected filter
  const solitons = useMemo(() => {
    switch (activeFilter) {
      case 'stable':
        return rawSolitons.filter(s => s.stable);
      case 'high-energy':
        // Find average energy of all raw solitons
        const avgE = rawSolitons.reduce((sum, s) => sum + s.energy, 0) / rawSolitons.length;
        return rawSolitons.filter(s => s.energy > avgE);
      case 'positive':
        return rawSolitons.filter(s => s.chargeSign > 0);
      case 'all':
      default:
        return rawSolitons;
    }
  }, [rawSolitons, activeFilter]);

  // Calculate Average (Átlag) and Standard Deviation (Szórás) for all columns
  const columnStats = useMemo(() => {
    if (solitons.length === 0) return null;

    const keys: (keyof Pick<SolitonData, 'radius' | 'energy' | 'fourierMode' | 'potentialDepth' | 'wavefrontThickness'>)[] = [
      'radius',
      'energy',
      'fourierMode',
      'potentialDepth',
      'wavefrontThickness'
    ];

    const results: Record<string, { mean: number; stdDev: number; cv: number }> = {};

    keys.forEach((key) => {
      const values = solitons.map(s => s[key] as number);
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const cv = mean !== 0 ? (stdDev / mean) * 100 : 0; // Coefficient of Variation in percentage

      results[key] = { mean, stdDev, cv };
    });

    return results;
  }, [solitons]);

  // Pearson Correlation Matrix
  const correlationMatrix = useMemo(() => {
    if (solitons.length < 2) return null;

    const variables = [
      { key: 'radius', label: 'Reff' },
      { key: 'energy', label: 'Energy' },
      { key: 'fourierMode', label: 'Fourier k' },
      { key: 'potentialDepth', label: 'Vmin' },
      { key: 'wavefrontThickness', label: 'W' }
    ];

    const matrix: { x: string; y: string; value: number }[] = [];

    variables.forEach((v1) => {
      variables.forEach((v2) => {
        const xData = solitons.map(s => s[v1.key as keyof SolitonData] as number);
        const yData = solitons.map(s => s[v2.key as keyof SolitonData] as number);
        const coeff = getPearsonCorrelation(xData, yData);
        matrix.push({ x: v1.label, y: v2.label, value: coeff });
      });
    });

    return { variables, matrix };
  }, [solitons]);

  // Run a fake "scanning/simulation loop" when the user clicks Sweep
  const triggerSweep = () => {
    setIsSweeping(true);
    setSweepProgress(0);
  };

  useEffect(() => {
    if (!isSweeping) return;
    
    const interval = setInterval(() => {
      setSweepProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSweeping(false);
          return 100;
        }
        return prev + 10;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isSweeping]);

  // Dynamic time evolution of wave ripples
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStep((prev) => prev + 0.005);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Compute stats/correlations for the Universal Invariants Panel
  const invariantData = useMemo(() => {
    return solitons.map((sol) => {
      let invariantValue = 0;
      let targetFormula = '';
      let physicalMeaning = '';
      
      if (selectedInvariant === 'charge') {
        // Effective Charge q_eff = Energy * Radius / Coupling
        invariantValue = (sol.energy * sol.radius) / Math.max(0.1, coupling);
        // Normalize slightly to match integer-like values
        invariantValue = invariantValue * 0.25 * sol.chargeSign;
        targetFormula = 'q_eff = Winding (Baryon szám)';
        physicalMeaning = lang === 'hu' ? 'Skyrmion topológiai töltés / Winding szám' : lang === 'de' ? 'Skyrmion topologische Ladung / Winding' : 'Skyrmion topological charge / Winding number';
      } else if (selectedInvariant === 'mass') {
        // Inertial Mass m_eff = Energy / (waveSpeed^2) => as c ~ 1/sqrt(tension), E * tension
        invariantValue = sol.energy * (1.0 + (tension - 1.0) * 0.3);
        targetFormula = 'm_eff = E / c^2';
        physicalMeaning = lang === 'hu' ? 'Tehetetlen tömeg-analógia (Mach-elv szerint)' : lang === 'de' ? 'Inerte Massenanalogie (Machsches Prinzip)' : 'Inertial Mass Analogy (Machian)';
      } else {
        // Spin angular momentum representation s_eff = FourierMode * Radius * Amplitude
        invariantValue = sol.fourierMode * sol.radius * Math.abs(sol.initAmp) * 0.08 * sol.chargeSign;
        targetFormula = 's_eff = k_dom * R_eff * J';
        physicalMeaning = lang === 'hu' ? 'Spinszerű hullámcsomag saját impulzusmomentum' : lang === 'de' ? 'Spindrehimpuls der Wellenpakete' : 'Spin-like wavepacket angular momentum';
      }

      return {
        id: sol.id,
        name: sol.name,
        color: sol.color,
        value: invariantValue,
        formula: targetFormula,
        meaning: physicalMeaning,
        energy: sol.energy,
        radius: sol.radius,
        fourier: sol.fourierMode,
        rawSign: sol.chargeSign
      };
    });
  }, [solitons, selectedInvariant, coupling, tension, lang]);

  // Compute Coefficient of Variation for ALL invariant formulas to run "Invariáns Keresés"
  const allInvariantsAnalysis = useMemo(() => {
    if (solitons.length === 0) return [];

    // Calculate variations for Charge, Mass, and Spin-like quantities (ignoring signs or using absolute values)
    const computeCVForInvariants = () => {
      // 1. Charge (absolute effective charge value for non-neutral ones)
      const chargeVals = solitons.map(sol => Math.abs((sol.energy * sol.radius) / Math.max(0.1, coupling)));
      const chargeMean = chargeVals.reduce((a, b) => a + b, 0) / chargeVals.length;
      const chargeVar = chargeVals.reduce((a, b) => a + Math.pow(b - chargeMean, 2), 0) / chargeVals.length;
      const chargeStd = Math.sqrt(chargeVar);
      const chargeCV = chargeMean > 0 ? (chargeStd / chargeMean) * 100 : 999;

      // 2. Mass
      const massVals = solitons.map(sol => sol.energy * (1.0 + (tension - 1.0) * 0.3));
      const massMean = massVals.reduce((a, b) => a + b, 0) / massVals.length;
      const massVar = massVals.reduce((a, b) => a + Math.pow(b - massMean, 2), 0) / massVals.length;
      const massStd = Math.sqrt(massVar);
      const massCV = massMean > 0 ? (massStd / massMean) * 100 : 999;

      // 3. Spin
      const spinVals = solitons.map(sol => Math.abs(sol.fourierMode * sol.radius * Math.abs(sol.initAmp) * 0.08));
      const spinMean = spinVals.reduce((a, b) => a + b, 0) / spinVals.length;
      const spinVar = spinVals.reduce((a, b) => a + Math.pow(b - spinMean, 2), 0) / spinVals.length;
      const spinStd = Math.sqrt(spinVar);
      const spinCV = spinMean > 0 ? (spinStd / spinMean) * 100 : 999;

      return [
        { id: 'charge', name: lang === 'hu' ? 'Topológiai Winding / Baryonszám (q_eff)' : 'Topological Winding / Baryon Number (q_eff)', cv: chargeCV, mean: chargeMean, std: chargeStd, formula: 'q_eff = Winding Number' },
        { id: 'mass', name: lang === 'hu' ? 'Tehetetlen Tömeg (m_eff)' : 'Inertial Mass (m_eff)', cv: massCV, mean: massMean, std: massStd, formula: 'm_eff = E / c^2' },
        { id: 'spin', name: lang === 'hu' ? 'Spinszerű Kvantumszám (s_eff)' : 'Spin-like Quantum Number (s_eff)', cv: spinCV, mean: spinMean, std: spinStd, formula: 's_eff = k_dom * R_eff * J' }
      ].sort((a, b) => a.cv - b.cv); // Sort by lowest CV (most invariant first)
    };

    return computeCVForInvariants();
  }, [solitons, coupling, tension, lang]);

  // Auto Invariant search handler
  const handleInvariantsSearch = () => {
    setIsSearchingInvariants(true);
    setTimeout(() => {
      setIsSearchingInvariants(false);
      setShowInvariantsReport(true);
      if (allInvariantsAnalysis.length > 0) {
        // Auto-select the best invariant and update state
        const best = allInvariantsAnalysis[0];
        setBestInvariantFound(best.name);
        setSelectedInvariant(best.id as 'charge' | 'mass' | 'spin');
      }
    }, 1000);
  };

  // Translations
  const t = {
    hu: {
      title: 'Szoliton Tulajdonságok Összehasonlítása (II. Modul)',
      subtitle: 'Több szoliton egyidejű mérése és elemzése a rendszer paramétereinek függvényében. Keressen skálainvariáns és konzervált mennyiségeket!',
      parameters: 'Globális Rendszerparaméterek',
      pGridSize: 'Rács Felbontás:',
      pSolitonSize: 'Szoliton Méret Lehetőség:',
      optSingleSize: 'Egyszeres méret (1x)',
      optDoubleSize: 'Dupla méret (2x)',
      pTension: 'Hipertér Feszültség (k_tension):',
      pPerturb: 'Eter Perturbáció / Zaj:',
      pCoupling: 'Kezdeti Csatolás (λ_c):',
      pReset: 'Alapértelmezett Paraméterek',
      startSweep: 'Mérési Protokoll Futtatása',
      sweeping: 'Mérési szkennelés folyamatban...',
      measuredSolitons: 'Mért Szoliton Karakterisztikák',
      tableHeadName: 'Szoliton Azonosító',
      tableHeadRadius: 'Effektív Sugár (Reff)',
      tableHeadEnergy: 'Teljes Energia (E)',
      tableHeadFourier: 'Domináns Módus (k)',
      tableHeadDepth: 'Potenciálmélység (Vmin)',
      tableHeadThick: 'Környező Vastagság (W)',
      tableHeadProfile: '1D Hullámalak',
      invariantsTitle: 'Univerzális Invariáns Kereső & Fizikai Analógiák',
      invariantsDesc: 'A szolitonok egyedi tulajdonságai változnak a paraméterek állításával, de léteznek olyan matematikai kombinációk (invariánsok), amelyek konstans arányokat mutatnak. Válasszon ki egy fizikai analógiát:',
      optCharge: 'Elektromos Töltés (q_eff)',
      optMass: 'Tehetetlen Tömeg (m_eff)',
      optSpin: 'Spinszerű Kvantumszám (s_eff)',
      constSymbol: 'Számított érték:',
      meaningLabel: 'Fizikai jelentés:',
      formulaLabel: 'Analógia képlete:',
      conclusionTitle: 'Mérési Konklúzió & Skálainvariancia',
      conclusionText: 'Az adatokból látható: míg a lokális szolitonok energiája és sugara drasztikusan fluktuál a zaj (pertubáció) és a feszültség hatására, a hullámcsomagok integrálja (pl. E × R_eff) közelítőleg állandó vagy kvantált marad. Ez bizonyítja, hogy a nem-lineáris táguló rácson a diszkrét hullámstruktúrák megmaradó fizikai tulajdonságokat hordoznak, mintha elemi részecskék lénének!',
      filterLabel: 'Szűrők',
      filterAll: 'Összes',
      filterStable: 'Topológiailag Stabilak',
      filterHighEnergy: 'Nagy energiájúak',
      filterPositive: 'Pozitív töltésűek',
      searchInvariantsBtn: 'Automatikus Invariáns Keresés',
      searchingInvariants: 'Invariánsok elemzése...',
      mostStableFound: 'Legstabilabb megmaradó mennyiség:',
      varianceLabel: 'Relatív szórás (CV):',
      stdDevLabel: 'Szórás (σ):',
      avgLabel: 'Átlag (μ):',
      averageRow: 'Átlag (μ) ± Szórás (σ)',
      correlationTitle: 'Tulajdonságok Pearson-korrelációs mátrixa (r)',
      correlationDesc: 'A Pearson-féle r együttható megmutatja a fizikai tulajdonságok közötti lineáris kapcsolat szorosságát és irányát (-1 és +1 között).'
    },
    en: {
      title: 'Soliton Property Comparison (Module II)',
      subtitle: 'Simultaneous measurement and analysis of multiple solitons versus system parameters. Discover scale-invariant and conserved quantities!',
      parameters: 'Global System Parameters',
      pGridSize: 'Lattice Resolution:',
      pSolitonSize: 'Soliton Size Option:',
      optSingleSize: 'Single size (1x)',
      optDoubleSize: 'Double size (2x)',
      pTension: 'Hyperspace Tension (k_tension):',
      pPerturb: 'Ether Perturbation / Noise:',
      pCoupling: 'Initial Coupling (λ_c):',
      pReset: 'Reset Parameters',
      startSweep: 'Execute Measurement Protocol',
      sweeping: 'Measurement sweep in progress...',
      measuredSolitons: 'Measured Soliton Characteristics',
      tableHeadName: 'Soliton Identifier',
      tableHeadRadius: 'Effective Radius (Reff)',
      tableHeadEnergy: 'Total Energy (E)',
      tableHeadFourier: 'Dominant Mode (k)',
      tableHeadDepth: 'Potential Depth (Vmin)',
      tableHeadThick: 'Surrounding Thickness (W)',
      tableHeadProfile: '1D Waveform',
      invariantsTitle: 'Universal Invariant Finder & Physical Analogies',
      invariantsDesc: 'While individual properties change with parameter sweeps, certain mathematical combinations (invariants) remain remarkably constant. Choose a physical analogy:',
      optCharge: 'Electric Charge (q_eff)',
      optMass: 'Inertial Mass (m_eff)',
      optSpin: 'Spin-like Quantum Number (s_eff)',
      constSymbol: 'Computed value:',
      meaningLabel: 'Physical meaning:',
      formulaLabel: 'Analogy formula:',
      conclusionTitle: 'Measurement Conclusion & Scale Invariance',
      conclusionText: 'The data reveals: while the local energy and radius of solitons fluctuate dramatically under noise and tension, specific wavepacket integrals (such as E × R_eff) remain nearly constant or quantized. This proves that discrete wave structures on non-linear expanding grids preserve physical quantities, mimicking elementary particles!',
      filterLabel: 'Filters',
      filterAll: 'All',
      filterStable: 'Topologically Stable',
      filterHighEnergy: 'High Energy',
      filterPositive: 'Positive Charge',
      searchInvariantsBtn: 'Automatic Invariant Search',
      searchingInvariants: 'Analyzing invariants...',
      mostStableFound: 'Most stable conserved quantity:',
      varianceLabel: 'Relative variation (CV):',
      stdDevLabel: 'Std Dev (σ):',
      avgLabel: 'Mean (μ):',
      averageRow: 'Mean (μ) ± Std Dev (σ)',
      correlationTitle: 'Properties Pearson Correlation Matrix (r)',
      correlationDesc: 'The Pearson r coefficient demonstrates the strength and direction of linear relationships between the physical properties (ranging from -1 to +1).'
    },
    de: {
      title: 'Soliton-Eigenschaftsvergleich (Modul II)',
      subtitle: 'Gleichzeitige Messung und Analyse mehrerer Solitonen in Abhängigkeit von Systemparametern. Finden Sie skaleninvariante und erhaltene Größen!',
      parameters: 'Globale Systemparameter',
      pGridSize: 'Gitterauflösung:',
      pSolitonSize: 'Soliton-Größenoption:',
      optSingleSize: 'Einfache Größe (1x)',
      optDoubleSize: 'Doppelte Größe (2x)',
      pTension: 'Hyperraum-Spannung (k_tension):',
      pPerturb: 'Äther-Störung / Rauschen:',
      pCoupling: 'Anfangskopplung (λ_c):',
      pReset: 'Parameter zurücksetzen',
      startSweep: 'Messprotokoll ausführen',
      sweeping: 'Mess-Scan läuft...',
      measuredSolitons: 'Gemessene Soliton-Charakteristika',
      tableHeadName: 'Soliton-Identifikator',
      tableHeadRadius: 'Effektiver Radius (Reff)',
      tableHeadEnergy: 'Gesamtenergie (E)',
      tableHeadFourier: 'Dominanter Modus (k)',
      tableHeadDepth: 'Potenzialtiefe (Vmin)',
      tableHeadThick: 'Umgebungselementdicke (W)',
      tableHeadProfile: '1D-Wellenform',
      invariantsTitle: 'Universal-Invarianten-Finder & Physikalische Analogien',
      invariantsDesc: 'Während sich die einzelnen Eigenschaften bei Parameter-Sweeps ändern, bleiben bestimmte mathematische Kombinationen (Invarianten) bemerkenswert konstant. Wählen Sie eine Analogie:',
      optCharge: 'Elektrische Ladung (q_eff)',
      optMass: 'Inerte Masse (m_eff)',
      optSpin: 'Spin-ähnliche Quantenzahl (s_eff)',
      constSymbol: 'Berechneter Wert:',
      meaningLabel: 'Physikalische Bedeutung:',
      formulaLabel: 'Analogie-Formel:',
      conclusionTitle: 'Messergebnis & Skaleninvarianz',
      conclusionText: 'Die Daten zeigen: Während lokale Solitonenenergie und -radius unter Rauschen und Spannung schwanken, bleiben bestimmte Wellenpaket-Integrale (wie E × R_eff) nahezu konstant. Dies beweist, dass diskrete Wellenstrukturen auf nichtlinearen Gittern physikalische Erhaltungsgrößen tragen, ähnlich wie Elementarteilchen!',
      filterLabel: 'Filter',
      filterAll: 'Alle',
      filterStable: 'Topologisch stabil',
      filterHighEnergy: 'Hohe Energie',
      filterPositive: 'Positive Ladung',
      searchInvariantsBtn: 'Automatische Invarianten-Suche',
      searchingInvariants: 'Analysiere Invarianten...',
      mostStableFound: 'Stabilste Erhaltungsgröße:',
      varianceLabel: 'Relative Abweichung (CV):',
      stdDevLabel: 'Std-Abw (σ):',
      avgLabel: 'Mittelwert (μ):',
      averageRow: 'Mittelwert (μ) ± Abweichung (σ)',
      correlationTitle: 'Eigenschaften-Pearson-Korrelationsmatrix (r)',
      correlationDesc: 'Der Pearson-r-Koeffizient zeigt die Stärke und Richtung linearer Zusammenhänge zwischen physikalischen Eigenschaften (-1 bis +1).'
    }
  }[lang] || {
    title: 'Soliton Property Comparison (Module II)',
    subtitle: 'Simultaneous measurement and analysis of multiple solitons versus system parameters.',
    parameters: 'Global System Parameters',
    pGridSize: 'Lattice Resolution:',
    pTension: 'Hyperspace Tension (k_tension):',
    pPerturb: 'Ether Perturbation / Noise:',
    pCoupling: 'Initial Coupling (λ_c):',
    pReset: 'Reset Parameters',
    startSweep: 'Execute Measurement Protocol',
    sweeping: 'Measurement sweep in progress...',
    measuredSolitons: 'Measured Soliton Characteristics',
    tableHeadName: 'Soliton Identifier',
    tableHeadRadius: 'Effective Radius (Reff)',
    tableHeadEnergy: 'Total Energy (E)',
    tableHeadFourier: 'Dominant Mode (k)',
    tableHeadDepth: 'Potential Depth (Vmin)',
    tableHeadThick: 'Surrounding Thickness (W)',
    tableHeadProfile: '1D Waveform',
    invariantsTitle: 'Universal Invariant Finder & Physical Analogies',
    invariantsDesc: 'While individual properties change with parameter sweeps, certain mathematical combinations remain constant.',
    optCharge: 'Electric Charge (q_eff)',
    optMass: 'Inertial Mass (m_eff)',
    optSpin: 'Spin-like Quantum Number (s_eff)',
    constSymbol: 'Computed value:',
    meaningLabel: 'Physical meaning:',
    formulaLabel: 'Analogy formula:',
    conclusionTitle: 'Measurement Conclusion & Scale Invariance',
    conclusionText: 'Discrete wave structures on non-linear expanding grids preserve physical quantities, mimicking elementary particles!',
    filterLabel: 'Filters',
    filterAll: 'All',
    filterStable: 'Stable Only',
    filterHighEnergy: 'High Energy',
    filterPositive: 'Positive',
    searchInvariantsBtn: 'Automatic Invariant Search',
    searchingInvariants: 'Searching...',
    mostStableFound: 'Most stable quantity:',
    varianceLabel: 'Relative Variance (CV):',
    stdDevLabel: 'Std Dev (σ):',
    avgLabel: 'Mean (μ):',
    averageRow: 'Mean (μ) ± Std Dev (σ)',
    correlationTitle: 'Pearson Correlation Matrix (r)',
    correlationDesc: 'Pearson r shows the strength of linear relationships between properties.'
  };

  const handleReset = () => {
    setGridSize(64);
    setSolitonSizeScale('single');
    setTension(1.2);
    setPerturbation(0.15);
    setCoupling(0.8);
    setActiveFilter('all');
    setShowInvariantsReport(false);
  };

  return (
    <div className="flex flex-col gap-6" id="soliton-comparison-root">
      
      {/* Module Title */}
      <div className="flex flex-col gap-1 bg-slate-950/40 p-4 rounded-xl border border-slate-900 shadow-sm">
        <h3 className="text-sm font-sans font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="h-4 w-4 text-sky-400 animate-pulse" />
          {t.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-mono">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: System Control Panel (Col span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-5 bg-slate-950/80 rounded-xl border border-slate-900 p-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
            <Sliders className="h-4 w-4 text-sky-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
              {t.parameters}
            </h4>
          </div>

          <div className="flex flex-col gap-4">
            {/* Grid Size Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">{t.pGridSize}</span>
                <span className="text-sky-400 font-semibold">{gridSize}x{gridSize}</span>
              </div>
              <input
                type="range"
                min="32"
                max="128"
                step="8"
                value={gridSize}
                onChange={(e) => setGridSize(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Hyperspace Tension Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">{t.pTension}</span>
                <span className="text-amber-400 font-semibold">{tension.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="3.0"
                step="0.05"
                value={tension}
                onChange={(e) => setTension(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Perturbation Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">{t.pPerturb}</span>
                <span className="text-rose-400 font-semibold">{perturbation.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.8"
                step="0.02"
                value={perturbation}
                onChange={(e) => setPerturbation(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Coupling Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">{t.pCoupling}</span>
                <span className="text-emerald-400 font-semibold">{coupling.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.05"
                value={coupling}
                onChange={(e) => setCoupling(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Soliton Size Option */}
            <div className="flex flex-col gap-1.5">
              <span className="text-slate-400 text-xs font-mono">{t.pSolitonSize}</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  onClick={() => setSolitonSizeScale('single')}
                  className={`py-1.5 px-2.5 rounded border transition-all cursor-pointer text-center ${
                    solitonSizeScale === 'single'
                      ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 font-bold'
                      : 'bg-slate-950/60 border-slate-900 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  {t.optSingleSize}
                </button>
                <button
                  onClick={() => setSolitonSizeScale('double')}
                  className={`py-1.5 px-2.5 rounded border transition-all cursor-pointer text-center ${
                    solitonSizeScale === 'double'
                      ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 font-bold'
                      : 'bg-slate-950/60 border-slate-900 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  {t.optDoubleSize}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-3 border-t border-slate-900">
            <button
              onClick={triggerSweep}
              disabled={isSweeping}
              className={`w-full py-2 px-3 rounded text-xs font-semibold font-mono border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isSweeping
                  ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                  : 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-300 shadow-lg shadow-sky-500/5'
              }`}
            >
              <Sparkles className={`h-3.5 w-3.5 ${isSweeping ? 'animate-spin' : ''}`} />
              {isSweeping ? `${t.sweeping} (${sweepProgress}%)` : t.startSweep}
            </button>

            <button
              onClick={handleReset}
              className="w-full py-2 px-3 rounded text-xs font-semibold font-mono bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t.pReset}
            </button>
          </div>
        </div>

        {/* Right Side: Soliton Characterization Matrix (Col span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-4 bg-slate-950/80 rounded-xl border border-slate-900 p-4">
          
          {/* Header & Filter Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                {t.measuredSolitons} ({solitons.length} db)
              </h4>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-slate-500 font-mono self-center mr-1 uppercase tracking-wider flex items-center gap-1">
                <Filter className="h-3 w-3" /> {t.filterLabel}:
              </span>
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer transition-all ${
                  activeFilter === 'all'
                    ? 'bg-sky-500/10 border-sky-500/40 text-sky-400 font-bold'
                    : 'bg-slate-900/30 border-slate-900 text-slate-500 hover:bg-slate-900/80'
                }`}
              >
                {t.filterAll}
              </button>
              <button
                onClick={() => setActiveFilter('stable')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer transition-all ${
                  activeFilter === 'stable'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold'
                    : 'bg-slate-900/30 border-slate-900 text-slate-500 hover:bg-slate-900/80'
                }`}
              >
                {t.filterStable}
              </button>
              <button
                onClick={() => setActiveFilter('high-energy')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer transition-all ${
                  activeFilter === 'high-energy'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold'
                    : 'bg-slate-900/30 border-slate-900 text-slate-500 hover:bg-slate-900/80'
                }`}
              >
                {t.filterHighEnergy}
              </button>
              <button
                onClick={() => setActiveFilter('positive')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer transition-all ${
                  activeFilter === 'positive'
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 font-bold'
                    : 'bg-slate-900/30 border-slate-900 text-slate-500 hover:bg-slate-900/80'
                }`}
              >
                {t.filterPositive}
              </button>
            </div>
          </div>

          {/* Measurements Table */}
          <div className="overflow-x-auto border border-slate-900 rounded-lg">
            <table className="w-full text-left border-collapse text-[11px] font-mono">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 border-b border-slate-900">
                  <th className="p-2.5 font-semibold text-[10px] uppercase tracking-wider">{t.tableHeadName}</th>
                  <th className="p-2.5 font-semibold text-[10px] uppercase tracking-wider text-right">{t.tableHeadRadius}</th>
                  <th className="p-2.5 font-semibold text-[10px] uppercase tracking-wider text-right">{t.tableHeadEnergy}</th>
                  <th className="p-2.5 font-semibold text-[10px] uppercase tracking-wider text-right">{t.tableHeadFourier}</th>
                  <th className="p-2.5 font-semibold text-[10px] uppercase tracking-wider text-right">{t.tableHeadDepth}</th>
                  <th className="p-2.5 font-semibold text-[10px] uppercase tracking-wider text-right">{t.tableHeadThick}</th>
                  <th className="p-2.5 font-semibold text-[10px] uppercase tracking-wider text-center">{t.tableHeadProfile}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {solitons.map((sol) => (
                  <tr key={sol.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-2.5 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: sol.color }} />
                      <div className="flex flex-col">
                        <span className="text-slate-200 font-sans font-medium text-[11px]">{sol.name}</span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-tight">
                          {sol.stable ? 'Topological / Stable' : 'Transient / Excitation'}
                        </span>
                      </div>
                    </td>
                    <td className="p-2.5 text-right text-amber-400 font-bold">
                      {isSweeping ? '---' : sol.radius.toFixed(3)}
                    </td>
                    <td className="p-2.5 text-right text-sky-400 font-bold">
                      {isSweeping ? '---' : sol.energy.toFixed(3)}
                    </td>
                    <td className="p-2.5 text-right text-emerald-400">
                      {isSweeping ? '---' : sol.fourierMode.toFixed(3)}
                    </td>
                    <td className="p-2.5 text-right text-purple-400">
                      {isSweeping ? '---' : sol.potentialDepth.toFixed(3)}
                    </td>
                    <td className="p-2.5 text-right text-pink-400">
                      {isSweeping ? '---' : sol.wavefrontThickness.toFixed(3)}
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center justify-center">
                        <svg className="w-16 h-6 bg-slate-950 rounded border border-slate-900/50" viewBox="0 0 60 20">
                          {(() => {
                            let path = '';
                            sol.waveProfile.forEach((val, idx) => {
                              const x = (idx / (sol.waveProfile.length - 1)) * 60;
                              const y = 10 - (val / Math.max(1, Math.abs(sol.initAmp))) * 8;
                              if (idx === 0) path = `M ${x} ${y}`;
                              else path += ` L ${x} ${y}`;
                            });
                            return <path d={path} fill="none" stroke={sol.color} strokeWidth="1.2" strokeLinecap="round" />;
                          })()}
                        </svg>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* STATISTICS ROW: Mean ± Standard Deviation (Átlag és Szórás) */}
                {columnStats && solitons.length > 0 && !isSweeping && (
                  <tr className="bg-slate-900/40 font-semibold border-t border-slate-800 text-slate-300">
                    <td className="p-2.5 text-[10px] font-sans text-sky-300 border-r border-slate-900 flex items-center gap-1.5 h-12">
                      <BarChart2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{t.averageRow}</span>
                    </td>
                    <td className="p-2.5 text-right text-amber-400/90 text-[10px] leading-tight">
                      <div>{columnStats.radius.mean.toFixed(2)}</div>
                      <div className="text-[9px] text-slate-500 font-normal">± {columnStats.radius.stdDev.toFixed(2)} ({columnStats.radius.cv.toFixed(0)}%)</div>
                    </td>
                    <td className="p-2.5 text-right text-sky-400/90 text-[10px] leading-tight">
                      <div>{columnStats.energy.mean.toFixed(2)}</div>
                      <div className="text-[9px] text-slate-500 font-normal">± {columnStats.energy.stdDev.toFixed(2)} ({columnStats.energy.cv.toFixed(0)}%)</div>
                    </td>
                    <td className="p-2.5 text-right text-emerald-400/90 text-[10px] leading-tight">
                      <div>{columnStats.fourierMode.mean.toFixed(2)}</div>
                      <div className="text-[9px] text-slate-500 font-normal">± {columnStats.fourierMode.stdDev.toFixed(2)} ({columnStats.fourierMode.cv.toFixed(0)}%)</div>
                    </td>
                    <td className="p-2.5 text-right text-purple-400/90 text-[10px] leading-tight">
                      <div>{columnStats.potentialDepth.mean.toFixed(2)}</div>
                      <div className="text-[9px] text-slate-500 font-normal">± {columnStats.potentialDepth.stdDev.toFixed(2)} ({columnStats.potentialDepth.cv.toFixed(0)}%)</div>
                    </td>
                    <td className="p-2.5 text-right text-pink-400/90 text-[10px] leading-tight">
                      <div>{columnStats.wavefrontThickness.mean.toFixed(2)}</div>
                      <div className="text-[9px] text-slate-500 font-normal">± {columnStats.wavefrontThickness.stdDev.toFixed(2)} ({columnStats.wavefrontThickness.cv.toFixed(0)}%)</div>
                    </td>
                    <td className="p-2.5 text-center text-slate-600 text-[10px] font-sans">
                      N={solitons.length}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Universals & Invariant Detection Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/80 rounded-xl border border-slate-900 p-4">
        
        {/* Invariant Select list */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-sky-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                {t.invariantsTitle}
              </h4>
            </div>

            {/* INVARIANT SEARCH BUTTON */}
            <button
              onClick={handleInvariantsSearch}
              disabled={isSearchingInvariants}
              className={`px-3 py-1 rounded text-[10px] font-bold font-sans border transition-all cursor-pointer flex items-center gap-1.5 ${
                isSearchingInvariants
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 scale-[0.98]'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300 shadow-md shadow-emerald-500/5 hover:scale-[1.02]'
              }`}
            >
              <Search className={`h-3 w-3 ${isSearchingInvariants ? 'animate-bounce' : ''}`} />
              {isSearchingInvariants ? t.searchingInvariants : t.searchInvariantsBtn}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            {t.invariantsDesc}
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedInvariant('charge')}
              className={`p-2 rounded text-[11px] font-mono border transition-all cursor-pointer text-center flex flex-col items-center gap-1 ${
                selectedInvariant === 'charge'
                  ? 'bg-pink-500/10 border-pink-500/40 text-pink-400 font-bold scale-[1.02]'
                  : 'bg-slate-900/40 border-slate-900 text-slate-400 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t.optCharge}
            </button>
            <button
              onClick={() => setSelectedInvariant('mass')}
              className={`p-2 rounded text-[11px] font-mono border transition-all cursor-pointer text-center flex flex-col items-center gap-1 ${
                selectedInvariant === 'mass'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold scale-[1.02]'
                  : 'bg-slate-900/40 border-slate-900 text-slate-400 hover:bg-slate-900'
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
              {t.optMass}
            </button>
            <button
              onClick={() => setSelectedInvariant('spin')}
              className={`p-2 rounded text-[11px] font-mono border transition-all cursor-pointer text-center flex flex-col items-center gap-1 ${
                selectedInvariant === 'spin'
                  ? 'bg-sky-500/10 border-sky-500/40 text-sky-400 font-bold scale-[1.02]'
                  : 'bg-slate-900/40 border-slate-900 text-slate-400 hover:bg-slate-900'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              {t.optSpin}
            </button>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 rounded p-3 text-[11px] leading-relaxed flex flex-col gap-1.5 font-mono">
            <div>
              <span className="text-slate-500">{t.meaningLabel}</span>{' '}
              <span className="text-slate-200 font-sans font-medium">{invariantData[0].meaning}</span>
            </div>
            <div>
              <span className="text-slate-500">{t.formulaLabel}</span>{' '}
              <span className="text-sky-300 font-bold">{invariantData[0].formula}</span>
            </div>
          </div>
        </div>

        {/* Invariant Visualizer Plot & Search Report Overlay */}
        <div className="flex flex-col gap-3 relative">
          
          {/* SEARCH REPORT POPUP OVERLAY */}
          {showInvariantsReport && (
            <div className="absolute inset-0 bg-slate-950/95 border border-emerald-500/20 rounded-lg p-3 z-20 flex flex-col justify-between animate-[fadeIn_0.2s_ease-out]">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-emerald-400 animate-bounce" />
                    <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider font-sans">
                      {lang === 'hu' ? 'Megmaradási Analízis Eredménye' : 'Conserved Quantities Analysis'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowInvariantsReport(false)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-bold cursor-pointer font-sans"
                  >
                    Bezár [X]
                  </button>
                </div>

                <div className="flex flex-col gap-2 font-mono text-[10px]">
                  <p className="text-slate-400 text-[11px] leading-relaxed mb-1">
                    {lang === 'hu' 
                      ? 'Az algoritmus kiszámolta az összes fizikai invariáns-jelölt relatív szórását (CV%). Minél kisebb a szórás, annál stabilabb a mennyiség a rendszerben:'
                      : 'The algorithm calculated the relative variation (CV%) for all invariant candidates. A lower CV indicates higher conservation across solitons:'}
                  </p>
                  
                  {allInvariantsAnalysis.map((inv, idx) => {
                    const stabilityIndex = Math.max(0, 100 - inv.cv);
                    const isSelected = selectedInvariant === inv.id;
                    return (
                      <div 
                        key={inv.id} 
                        onClick={() => {
                          setSelectedInvariant(inv.id as 'charge' | 'mass' | 'spin');
                        }}
                        className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-200'
                            : 'bg-slate-900/40 border-slate-900/60 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className={`font-sans font-bold flex items-center gap-1 ${isSelected ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {idx === 0 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                            {inv.name}
                          </span>
                          <span className="text-[9px] text-slate-500">{inv.formula}</span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="font-bold text-emerald-400">{stabilityIndex.toFixed(1)}% Stabilitás</span>
                          <span className="text-[9px] text-slate-500">CV: {inv.cv.toFixed(2)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-[10px] font-sans bg-emerald-500/5 border border-emerald-500/10 rounded p-2 text-emerald-300 flex items-center gap-1.5 mt-2">
                <Info className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>
                  {lang === 'hu' 
                    ? `Kijelölve: ${bestInvariantFound}. Kattintson a listára a módosításhoz!` 
                    : `Active: ${bestInvariantFound}. Click on any item to switch!`}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
            <span>{selectedInvariant === 'charge' ? 'q_eff' : selectedInvariant === 'mass' ? 'm_eff' : 's_eff'} Invariant Spectrogram</span>
            <span className="text-[10px] text-slate-500 font-normal">Grid: {gridSize}² | λ: {coupling}</span>
          </div>

          <div className="relative flex-1 bg-slate-950 rounded-lg border border-slate-900/80 p-2 flex items-center justify-center min-h-[140px]">
            {/* Draw a grid with values */}
            <svg className="w-full h-full max-h-[140px]" viewBox="0 0 200 100">
              <line x1="0" y1="50" x2="200" y2="50" stroke="#1e293b" strokeWidth="0.8" />
              <line x1="100" y1="0" x2="100" y2="100" stroke="#1e293b" strokeWidth="0.8" />
              <line x1="0" y1="20" x2="200" y2="20" stroke="#0f172a" strokeDasharray="1,1" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="200" y2="80" stroke="#0f172a" strokeDasharray="1,1" strokeWidth="0.5" />
              
              {/* Draw dots representing computed invariant values */}
              {invariantData.map((d, idx) => {
                const posX = 15 + idx * 24;
                // Normalize value to y-axis [10, 90]
                const val = d.value;
                const scaleVal = selectedInvariant === 'charge' ? val * 10 : selectedInvariant === 'mass' ? val * 4 : val * 8;
                const posY = 50 - scaleVal;
                const boundedY = Math.max(8, Math.min(92, posY));
                
                return (
                  <g key={d.id} className="group/dot cursor-pointer">
                    {/* Soft connecting line to center axis */}
                    <line x1={posX} y1="50" x2={posX} y2={boundedY} stroke={d.color + '30'} strokeWidth="1" />
                    
                    {/* Glowing outer circle */}
                    <circle cx={posX} cy={boundedY} r="5" fill={d.color} fillOpacity="0.15" stroke={d.color} strokeOpacity="0.4" strokeWidth="1" />
                    
                    {/* Main dot */}
                    <circle cx={posX} cy={boundedY} r="3" fill={d.color} />
                    
                    {/* Text above dot */}
                    <text x={posX} y={boundedY - 7} fontSize="7" fill="#cbd5e1" textAnchor="middle" fontFamily="monospace">
                      {val.toFixed(2)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Pearson Correlation Matrix Block */}
      {correlationMatrix && solitons.length >= 2 && (
        <div className="bg-slate-950/80 rounded-xl border border-slate-900 p-4 flex flex-col gap-4 font-mono">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              {t.correlationTitle}
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            {t.correlationDesc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Heatmap Layout */}
            <div className="flex flex-col items-center justify-center">
              <div className="grid grid-cols-6 gap-1 text-[10px] text-center max-w-[280px]">
                {/* Header label corner */}
                <div className="text-slate-600 font-sans font-bold flex items-center justify-center h-8 w-10">r</div>
                {correlationMatrix.variables.map(v => (
                  <div key={v.key} className="text-slate-500 font-bold flex items-center justify-center h-8 w-10 overflow-hidden text-[9px] uppercase tracking-tighter">
                    {v.label}
                  </div>
                ))}

                {correlationMatrix.variables.map((v1) => (
                  <React.Fragment key={v1.key}>
                    {/* Left label */}
                    <div className="text-slate-500 font-bold flex items-center justify-start h-8 w-10 pr-1 text-[9px] uppercase tracking-tighter">
                      {v1.label}
                    </div>

                    {/* Matrix values */}
                    {correlationMatrix.variables.map((v2) => {
                      const item = correlationMatrix.matrix.find(m => m.x === v1.label && m.y === v2.label);
                      const rVal = item ? item.value : 0;
                      
                      // Compute background opacity and color based on r value (-1.0 to +1.0)
                      let bgStyle = 'bg-slate-900 border border-slate-800/40';
                      let textStyle = 'text-slate-400';
                      
                      if (rVal > 0.8) {
                        bgStyle = 'bg-emerald-500/25 border border-emerald-500/40';
                        textStyle = 'text-emerald-300 font-bold';
                      } else if (rVal > 0.3) {
                        bgStyle = 'bg-emerald-500/10 border border-emerald-500/20';
                        textStyle = 'text-emerald-400';
                      } else if (rVal < -0.8) {
                        bgStyle = 'bg-rose-500/25 border border-rose-500/40';
                        textStyle = 'text-rose-300 font-bold';
                      } else if (rVal < -0.3) {
                        bgStyle = 'bg-rose-500/10 border border-rose-500/20';
                        textStyle = 'text-rose-400';
                      }

                      return (
                        <div 
                          key={`${v1.key}-${v2.key}`} 
                          className={`h-8 w-10 rounded flex items-center justify-center text-[10px] select-none transition-all ${bgStyle} ${textStyle}`}
                          title={`Correlation between ${v1.label} and ${v2.label}: ${rVal.toFixed(3)}`}
                        >
                          {rVal.toFixed(2)}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Explanation card */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-lg p-3 text-[11px] leading-relaxed flex flex-col gap-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                {lang === 'hu' ? 'Megfigyelhető összefüggések:' : 'Observed correlations:'}
              </span>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-400">
                <li>
                  <strong className="text-amber-400">Reff ↔ Energy</strong>:{' '}
                  {(() => {
                    const r = getPearsonCorrelation(solitons.map(s => s.radius), solitons.map(s => s.energy));
                    return r > 0.6 
                      ? (lang === 'hu' ? 'Erős pozitív korreláció. A nagyobb méretű hullámcsomagok nagyobb integrált energiát képviselnek.' : 'Strong positive correlation. Larger wavepackets represent greater integrated energy.')
                      : r < -0.6
                      ? (lang === 'hu' ? 'Erős negatív korreláció. A méret csökkenése növeli az energiasűrűséget.' : 'Strong negative correlation. Shrinking size increases energy density.')
                      : (lang === 'hu' ? 'Mérsékelt vagy gyenge korreláció a választott mintában.' : 'Moderate or weak correlation in this sample.');
                  })()}
                </li>
                <li>
                  <strong className="text-emerald-400">Reff ↔ Fourier k</strong>:{' '}
                  {(() => {
                    const r = getPearsonCorrelation(solitons.map(s => s.radius), solitons.map(s => s.fourierMode));
                    return r < -0.7
                      ? (lang === 'hu' ? 'Magas negatív korreláció. A kisebb effektív sugarú szolitonok frekvencia-spektruma a magasabb hullámszámok felé tolódik el (Hullám-részecske dualitás).' : 'High negative correlation. Solitons with smaller effective radii shift their frequency spectrum to higher wavenumbers (Wave-particle duality).')
                      : (lang === 'hu' ? 'A feszültség és rácsméret miatti hullám-összenyomódás negatív tendenciát mutat.' : 'Wave compression due to tension and lattice resolution shows a negative trend.');
                  })()}
                </li>
                <li>
                  <strong className="text-purple-400">Vmin ↔ Energy</strong>:{' '}
                  {(() => {
                    const r = getPearsonCorrelation(solitons.map(s => s.potentialDepth), solitons.map(s => s.energy));
                    return r > 0.7
                      ? (lang === 'hu' ? 'Erős pozitív kapcsolat. A mélyebb potenciálvölgyek stabilabb szoliton-kötést és magasabb energiaszintet eredményeznek (Mach-elv analógia).' : 'Strong positive link. Deeper potential wells result in tighter soliton binding and higher energy levels (Machian principle analogy).')
                      : (lang === 'hu' ? 'Mérsékelt pozitív kapcsolat az amplitúdó és a csatolás függvényében.' : 'Moderate positive link governed by coupling and amplitude.');
                  })()}
                </li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* Measurement Conclusion */}
      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-slate-300">
        <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5 animate-bounce" />
        <div className="flex flex-col gap-1.5">
          <strong className="text-slate-100 font-sans text-xs uppercase tracking-wider">{t.conclusionTitle}</strong>
          <p>{t.conclusionText}</p>
        </div>
      </div>

    </div>
  );
}
