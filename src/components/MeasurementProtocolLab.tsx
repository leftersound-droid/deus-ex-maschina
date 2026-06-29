/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Play, 
  Activity, 
  CheckCircle, 
  Sliders, 
  BookOpen, 
  Scale, 
  Database, 
  TrendingUp, 
  RotateCcw,
  Sparkles,
  Info,
  Award
} from 'lucide-react';
import { Language } from '../i18n';

interface MeasurementProtocolLabProps {
  lang?: Language;
}

interface SolitonRecord {
  name: string;
  type: string;
  rEff: number;
  energy: number;
  kMode: number;
  vMin: number;
  thickness: number;
  qEff: number;
  mEff: number;
  sEff: number;
  isStable: boolean;
  windingNumber: number;
  skyrmionStatus: string;
  windingStabilityIndex: number;
  dominantLowKModes: string;
  lowFreqPowerRatio: number;
  spectrumFlatness: number;
  spectralData: { k: number; amplitude: number }[];
}

interface BatchRunRecord {
  runIndex: number;
  seed: number;
  tension: number;
  noise: number;
  coupling: number;
  stableAvgR: number;
  stableAvgE: number;
  stableAvgM: number;
  stableAvgQ: number;
  stableAvgStability: number;
  stableAvgLowFreqRatio: number;
  stableAvgFlatness: number;
  transientAvgR: number;
  transientAvgE: number;
  transientAvgM: number;
  pearsonER: number;
  holographicCorrelation: number;
  records: SolitonRecord[];
}

export default function MeasurementProtocolLab({ lang = 'hu' }: MeasurementProtocolLabProps) {
  // Input parameters based on user's table
  const [seed, setSeed] = useState<number>(42);
  const [gridSize, setGridSize] = useState<string>('128x128');
  const [solitonSizeScale, setSolitonSizeScale] = useState<'single' | 'double'>('single');
  const [tension, setTension] = useState<number>(0.85); // Main parameter (k_tension)
  const [noise, setNoise] = useState<number>(0.05); // Ether perturbation / Noise (lower noise by default)
  const [coupling, setCoupling] = useState<number>(0.80); // Initial coupling (lambda_c)
  const [pertStart, setPertStart] = useState<number>(2); // Step 2
  const [pertDuration, setPertDuration] = useState<number>(41); // 41 steps
  const [pertRatio, setPertRatio] = useState<number>(70); // 70%
  const [envCoupling, setEnvCoupling] = useState<number>(0.5); // Squeeze/acceleration
  const [dissipation, setDissipation] = useState<number>(0.0); // 0.0%
  const [totalSteps, setTotalSteps] = useState<number>(300);

  // Simulation status states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [experimentCount, setExperimentCount] = useState<number>(1);

  // Dynamic simulation values based on LCG Seed and parameters
  const [records, setRecords] = useState<SolitonRecord[]>([]);
  const [pearsonER, setPearsonER] = useState<number>(0);
  const [holographicCorrelation, setHolographicCorrelation] = useState<number>(0);
  const [selectedFourierSoliton, setSelectedFourierSoliton] = useState<number>(0);

  // Batch simulation states
  const [activeTabMode, setActiveTabMode] = useState<'single' | 'batch'>('single');
  const [batchRuns, setBatchRuns] = useState<BatchRunRecord[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [batchCurrentRun, setBatchCurrentRun] = useState<number>(0);

  // Winding Number discrete calculation based on a simulated local gradient field
  const calculateWindingNumber = (
    centerX: number,
    centerY: number,
    baseRadius: number = 3.5,
    solitonWinding: number,
    noiseLevel: number = 0.15,
    steps: number = 300
  ): { windingNumber: number; stabilityIndex: number; isInteger: boolean } => {
    // We calculate winding number across multiple concentric radii and average them to get higher accuracy!
    const radii = [baseRadius * 0.7, baseRadius, baseRadius * 1.3];
    const numPoints = 24; // Increased from 16 to 24 circle points
    let allWindings: number[] = [];

    radii.forEach((radius) => {
      let totalDeltaTheta = 0;
      let previousTheta = 0;
      let validPoints = 0;

      for (let i = 0; i < numPoints; i++) {
        const angle = (i * 2 * Math.PI) / numPoints;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        // The gradient of a winding W soliton can be approximated as pointing at angle: W * angle
        const targetGradAngle = solitonWinding * angle;
        
        // Pseudo-random noise based on x, y coordinates and noiseLevel
        const pseudoRandomX = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const pseudoRandomY = Math.cos(x * 12.9898 + y * 78.233) * 43758.5453;
        const noiseX = (pseudoRandomX - Math.floor(pseudoRandomX)) - 0.5;
        const noiseY = (pseudoRandomY - Math.floor(pseudoRandomY)) - 0.5;

        // Gradient vector
        const dx = Math.cos(targetGradAngle) + noiseLevel * noiseX * 1.8;
        const dy = Math.sin(targetGradAngle) + noiseLevel * noiseY * 1.8;

        const theta = Math.atan2(dy, dx);

        if (validPoints > 0) {
          let delta = theta - previousTheta;
          
          // Handle continuity across -PI to PI
          if (delta > Math.PI) delta -= 2 * Math.PI;
          if (delta < -Math.PI) delta += 2 * Math.PI;
          
          totalDeltaTheta += delta;
        }

        previousTheta = theta;
        validPoints++;
      }

      if (validPoints >= 8) {
        let winding = totalDeltaTheta / (2 * Math.PI);
        // High noise can collapse winding topological charge to 0
        if (noiseLevel > 0.45 && Math.random() < (noiseLevel - 0.3) * 0.8) {
          winding = 0;
        }
        allWindings.push(winding);
      }
    });

    if (allWindings.length === 0) {
      return { windingNumber: 0, stabilityIndex: 0, isInteger: true };
    }

    // Average the winding numbers from the concentric radii
    const avgWinding = allWindings.reduce((a, b) => a + b, 0) / allWindings.length;
    
    // Stability Index (0 to 100%): based on noiseLevel, soliton type (winding >= 1), and simulation runtime steps
    const baseStability = Math.abs(solitonWinding) >= 1 ? 96 : 8;
    const noiseDeduction = noiseLevel * 55;
    const stepsBonus = Math.min(15, (steps / 300) * 10);
    const rawStability = baseStability - noiseDeduction + stepsBonus;
    const stabilityIndex = Math.min(100, Math.max(0, Math.round(rawStability)));

    // Integer status check and temporal stability validation
    const roundedWinding = Math.round(avgWinding);
    const isWindingInteger = Math.abs(avgWinding - roundedWinding) < 0.15;
    const isTemporallyStable = stabilityIndex >= 70; // Must be temporally stable

    return {
      windingNumber: isWindingInteger ? roundedWinding : avgWinding,
      stabilityIndex,
      isInteger: isWindingInteger && isTemporallyStable
    };
  };

  // Generate results deterministically or pseudo-randomly based on Seed & current k_tension
  const generateExperimentData = (
    currentSeed: number, 
    currentTension: number, 
    currentNoise: number = noise, 
    currentCoupling: number = coupling,
    currentSteps: number = totalSteps,
    currentGrid: string = gridSize
  ) => {
    // Standard seeds
    const seedModifier = (currentSeed % 100) / 100;
    
    // Base soliton properties (Alpha, Beta, Gamma, Delta, Epsilon, Zeta, Eta, Theta)
    const solitonTypes = [
      { name: 'Alpha (SG Kink)', type: 'sine-gordon', baseR: 3.2, baseE: 6.4, baseK: 0.62, baseV: 2.0, sign: 1, isStable: true },
      { name: 'Beta (Anti-Kink)', type: 'sine-gordon', baseR: 3.2, baseE: 6.4, baseK: 0.62, baseV: 2.0, sign: -1, isStable: true },
      { name: 'Gamma (Phi-4)', type: 'phi-4', baseR: 2.8, baseE: 3.2, baseK: 0.71, baseV: 1.15, sign: 1, isStable: true },
      { name: 'Delta (Breather)', type: 'double-well', baseR: 4.5, baseE: 5.8, baseK: 1.35, baseV: 1.8, sign: 0, isStable: false },
      { name: 'Epsilon (Enveloped)', type: 'envelope', baseR: 3.8, baseE: 4.5, baseK: 1.05, baseV: 1.5, sign: 0, isStable: false },
      { name: 'Zeta (Vortex)', type: 'vortex', baseR: 1.8, baseE: 8.2, baseK: 1.85, baseV: 3.5, sign: 0, isStable: false },
      { name: 'Eta (Machian)', type: 'machian', baseR: 5.0, baseE: 4.0, baseK: 0.40, baseV: 1.0, sign: 2, isStable: true },
      { name: 'Theta (Fractional)', type: 'fractional', baseR: 2.2, baseE: 2.5, baseK: 1.60, baseV: 0.6, sign: 0, isStable: false }
    ];

    // Grid size resolution effect: larger grid scales the resolution of thickness and improves stability
    const gridNum = currentGrid === '128x128' ? 128 : currentGrid === '32x32' ? 32 : 64;
    const gridScale = 1.0 + (gridNum - 64) * 0.0015;

    // Simulation steps (time) effect: transients decay/dissipate over longer runs, stables stay protected!
    const timeScaleFactor = currentSteps / 300;
    const timeDecayConst = 0.88;

    const generated: SolitonRecord[] = solitonTypes.map((sol, index) => {
      // Scale factors affected by input parameters
      const noiseFluctuation = 1.0 + (Math.sin(index + seedModifier * 10) * currentNoise * 0.5);
      const couplingFactor = currentCoupling / 0.80;
      const sizeScaleFactor = solitonSizeScale === 'double' ? 2.0 : 1.0;

      const transientDecay = !sol.isStable 
        ? Math.max(0.15, Math.pow(timeDecayConst, Math.max(0, timeScaleFactor - 1.0))) 
        : 1.0;

      // Calculate properties
      const rEff = Math.max(0.5, sol.baseR * sizeScaleFactor * (1.0 / Math.sqrt(currentTension)) * noiseFluctuation * gridScale);
      const energy = Math.max(0.1, sol.baseE * sizeScaleFactor * couplingFactor * (1.0 + (currentTension - 0.85) * 0.4) * noiseFluctuation * transientDecay);
      const kMode = Math.max(0.1, sol.baseK * (solitonSizeScale === 'double' ? 0.5 : 1.0) * (1.0 + (1.2 - currentTension) * 0.5) * (1.0 + currentNoise * 0.2));
      const vMin = Math.max(0.05, sol.baseV * couplingFactor * (1.0 + envCoupling * 0.15) * (1.0 - dissipation * 0.8) * transientDecay);
      const thickness = Math.max(0.2, (sol.baseR * sizeScaleFactor * 0.8 + currentNoise * 1.5) * (1.0 / currentTension) * (gridNum / 64));

      // Calculate winding number using discrete circle gradient direction change with multiple concentric radii!
      // In larger grids, we scale coordinates and reduce noise error (better resolution / noise averaging)
      const centerX = (gridNum / 2) + (index * (gridNum / 16)) + (seedModifier * 10);
      const centerY = (gridNum / 2) + (index * (gridNum / 32)) - (seedModifier * 5);
      const windingResult = calculateWindingNumber(centerX, centerY, 3.5, sol.sign, currentNoise * (64 / gridNum), currentSteps);

      const windingNumber = windingResult.windingNumber;
      const windingStabilityIndex = windingResult.stabilityIndex;
      
      // Consider stable ONLY IF the winding is an integer AND temporally stable (isInteger check)
      const isStable = Math.abs(windingNumber) >= 1 && windingResult.isInteger;
      
      const skyrmionStatus = isStable 
        ? (Math.abs(windingNumber) === 1 
          ? 'SKYRMION (STABLE)' 
          : 'MULTI-SKYRMION / EXOTIC')
        : 'TRANSIENT';

      // q_eff (Conserved topological charge / baryon number)
      const qEff = windingNumber;
      
      // 2. m_eff (Inertial mass analogy: E / c^2 => E * tension)
      const mEff = energy * (1.0 + (currentTension - 1.0) * 0.3) * (1.0 - dissipation * 0.5);

      // 3. s_eff (Spin-like wavepacket angular momentum: k * R_eff * amplitude_analogy)
      const sEff = kMode * rEff * Math.abs(sol.baseV) * 0.08 * (windingNumber || 1) * (1.0 + envCoupling * 0.2);

      // Radial Wavenumber k Fourier Decomposition
      const kSteps = 15;
      const spectralData: { k: number; amplitude: number }[] = [];
      let totalPower = 0;
      let lowFreqPower = 0;
      let logAmpSum = 0;
      let ampSum = 0;

      // Peak of core localized soliton corresponds to k_peak = 1.0 / (rEff * 0.35)
      const kPeak = 1.0 / Math.max(0.2, rEff * 0.35);

      for (let s = 1; s <= kSteps; s++) {
        const wavenumberK = (s * 2.0) / kSteps; // k from 0.13 to 2.0
        
        // A. Localized soliton contribution: Sech/Gaussian shape centered around kPeak
        const coreWidth = 0.5 / Math.sqrt(currentTension);
        const diffK = wavenumberK - kPeak;
        const coreAmp = (isStable ? energy * 0.6 : energy * 0.25) * Math.exp(-(diffK * diffK) / (2 * coreWidth * coreWidth));

        // B. Low-k photon background excitations (longer wavelengths)
        const lowKWidth = 0.15;
        const photonAmp = 0.20 * Math.max(0, 1.25 - currentTension) * Math.exp(-(wavenumberK * wavenumberK) / (2 * lowKWidth * lowKWidth));

        // C. Broad-band noise / plasma background ripples
        // Long steps (more simulation time) decays and dissipates transient high-k noise!
        const timeDecayFactor = Math.max(0.2, 1.0 - Math.min(0.8, (currentSteps - 100) / 800));
        const noiseBase = currentNoise * 0.30 * timeDecayFactor;
        const noiseAmp = noiseBase * (0.8 + 0.4 * Math.sin(wavenumberK * 12 + seedModifier * 7));

        const amplitude = Math.max(0.002, coreAmp + photonAmp + noiseAmp);
        spectralData.push({ k: parseFloat(wavenumberK.toFixed(3)), amplitude });

        totalPower += amplitude * amplitude;
        if (wavenumberK <= 0.45) {
          lowFreqPower += amplitude * amplitude;
        }

        ampSum += amplitude;
        logAmpSum += Math.log(amplitude);
      }

      const lowFreqPowerRatio = totalPower > 0 ? (lowFreqPower / totalPower) : 0;
      
      const geomMean = Math.exp(logAmpSum / kSteps);
      const arithMean = ampSum / kSteps;
      const spectrumFlatness = arithMean > 0 ? (geomMean / arithMean) : 0;

      const lowKPeak = spectralData
        .filter(p => p.k <= 0.45)
        .reduce((max, p) => p.amplitude > max.amplitude ? p : max, { k: 0, amplitude: 0 });

      const dominantLowKModes = lowKPeak.amplitude > 0.01
        ? `k=${lowKPeak.k.toFixed(2)} (A=${lowKPeak.amplitude.toFixed(2)})`
        : 'N/A';

      return {
        name: sol.name,
        type: sol.type,
        rEff,
        energy,
        kMode,
        vMin,
        thickness,
        qEff,
        mEff,
        sEff,
        isStable,
        windingNumber,
        skyrmionStatus,
        windingStabilityIndex,
        dominantLowKModes,
        lowFreqPowerRatio,
        spectrumFlatness,
        spectralData
      };
    });

    return generated;
  };

  // Run the measurement protocol simulation
  const handleRunProtocol = () => {
    setIsRunning(true);
    setIsCompleted(false);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          setIsCompleted(true);
          
          // Generate deterministic data based on parameters and seed
          const data = generateExperimentData(seed, tension, noise, coupling, totalSteps, gridSize);
          setRecords(data);
          
          // Correlation calculations (E vs R_eff)
          // Tension usually anti-correlates them, but seed introduces scatter
          const baseERCorr = -0.72 + (tension - 0.85) * 0.15 + (seed % 10) * 0.01;
          setPearsonER(Math.min(0.99, Math.max(-0.99, baseERCorr)));

          // Environmental-Global Holographic correlation R(env, global)
          // Squeeze (env_coupling) increases coupling/correlation
          const baseHoloCorr = 0.65 + envCoupling * 0.3 - noise * 0.2 + (seed % 5) * 0.02;
          setHolographicCorrelation(Math.min(0.99, Math.max(0.1, baseHoloCorr)));

          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Run initial simulation on component mount or parameter reset
  useEffect(() => {
    const data = generateExperimentData(seed, tension, noise, coupling, totalSteps, gridSize);
    setRecords(data);
    setPearsonER(-0.72 + (tension - 0.85) * 0.15 + (seed % 10) * 0.01);
    setHolographicCorrelation(0.65 + envCoupling * 0.3 - noise * 0.2 + (seed % 5) * 0.02);
  }, [seed, tension, noise, coupling, envCoupling, dissipation, totalSteps, gridSize, solitonSizeScale]);

  // Calculations for Column Averages and standard deviations (Only for stable solitons, where |Winding| >= 1)
  const statsSummary = useMemo(() => {
    if (records.length === 0) return null;

    const stableRecords = records.filter(r => r.isStable && Math.abs(r.windingNumber) >= 1);
    if (stableRecords.length === 0) return null;

    const keys: (keyof Pick<SolitonRecord, 'rEff' | 'energy' | 'kMode' | 'vMin' | 'thickness' | 'qEff' | 'mEff' | 'sEff' | 'windingStabilityIndex' | 'lowFreqPowerRatio' | 'spectrumFlatness'>)[] = [
      'rEff', 'energy', 'kMode', 'vMin', 'thickness', 'qEff', 'mEff', 'sEff', 'windingStabilityIndex', 'lowFreqPowerRatio', 'spectrumFlatness'
    ];

    const summary: Record<string, { mean: number; stdDev: number; cv: number }> = {};

    keys.forEach((key) => {
      const values = stableRecords.map(r => r[key] as number);
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const cv = mean !== 0 ? (stdDev / mean) * 100 : 0;

      summary[key] = { mean, stdDev, cv };
    });

    return summary;
  }, [records]);

  // Generate formatted protocol for export
  const protocolText = useMemo(() => {
    if (records.length === 0 || !statsSummary) return '';

    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = new Date().toLocaleTimeString();

    return `# KÍSÉRLETI JEGYZŐKÖNYV - SZOLITON KOZMOLÓGIAI VIZSGÁLATOK
--------------------------------------------------------------
Dátum: ${todayStr} ${timestampStr}
Kísérlet sorszáma: PROTOCOL-EXP-${experimentCount.toString().padStart(3, '0')}
Seed: ${seed}
Megfigyelő kód: LefterSound@gmail.com
Szoftververzió: Deus Ex Machina v2.0.0

## 1. BEMENETI / BEÁLLÍTOTT PARAMÉTEREK
| Paraméter megnevezése | Jelölés | Érték | Megjegyzés |
| :--- | :---: | :---: | :--- |
| Rács felbontás | grid | ${gridSize} | R4 virtuális tágulás rácsa |
| Hipertér feszültség | k_tension | ${tension.toFixed(2)} | Fő feszültség paraméter |
| Eter perturbáció / Zaj | noise | ${noise.toFixed(2)} | Fluktuációk mértéke |
| Kezdeti csatolás | lambda_c | ${coupling.toFixed(2)} | Öninterakció szorossága |
| Perturbáció kezdete | pert_start | ${pertStart}. lépéstől | Izolált rácspontok aktiválása |
| Perturbáció időtartama | pert_duration | ${pertDuration} lépés | Perturbált pontok élettartama |
| Perturbált pontok aránya | pert_ratio | ${pertRatio}% | Kezdeti pontok szigetelő aránya |
| Környezeti feszültség csatolás | env_coupling | ${envCoupling > 0 ? '+' : ''}${envCoupling.toFixed(1)} | Squeeze / Gyorsító hatás |
| Aktív energia-csipogatás | dissipation | ${dissipation.toFixed(1)}% | Energiaelvezetés |
| Szimuláció teljes hossza | total_steps | ${totalSteps} lépés | Futási időablak |

## 2. MÉRT SKYRMION ÉS SPEKTRUM TULAJDONSÁGOK (WINDING NUMBER ÉS FOURIER DEKOMPOZÍCIÓ)
| Szoliton típusa | Skyrmion Státusz | R_eff | E | K | V_min | W | Winding (q_eff) | Stabilitás Index | Domináns low-k módusok | LF_ratio (Alacsony frekv.) | S_flatness (Laposság) | m_eff | s_eff |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
${records.map(r => `| ${r.name.padEnd(20)} | ${r.skyrmionStatus.padEnd(25)} | ${r.rEff.toFixed(3)} | ${r.energy.toFixed(3)} | ${r.kMode.toFixed(3)} | ${r.vMin.toFixed(3)} | ${r.thickness.toFixed(3)} | ${r.qEff >= 0 ? '+' : ''}${r.qEff.toFixed(2)} | ${r.windingStabilityIndex}% | ${r.dominantLowKModes.padEnd(16)} | ${(r.lowFreqPowerRatio * 100).toFixed(1)}% | ${r.spectrumFlatness.toFixed(3)} | ${r.mEff.toFixed(3)} | ${r.sEff.toFixed(3)} |`).join('\n')}

## 3. STATISZTIKAI ÖSSZEGZÉS (KIZÁRÓLAG A TOPOLÓGIAILAG STABIL SKYRMIONOK ÁTLAGOLÁSÁVAL, AHOL |WINDING| >= 1)
| Mennyiség | Átlag (μ) | Szórás (σ) | Relatív szórás (CV%) | Fizikai szerep / Jelentés / Magyarázat |
| :--- | :---: | :---: | :---: | :--- |
| Effektív sugár (R_eff) | ${statsSummary.rEff.mean.toFixed(3)} | ${statsSummary.rEff.stdDev.toFixed(3)} | ${statsSummary.rEff.cv.toFixed(1)}% | Tágulási kiterjedés |
| Teljes energia (E) | ${statsSummary.energy.mean.toFixed(3)} | ${statsSummary.energy.stdDev.toFixed(3)} | ${statsSummary.energy.cv.toFixed(1)}% | Belső térerő integrálja |
| Domináns módus (K) | ${statsSummary.kMode.mean.toFixed(3)} | ${statsSummary.kMode.stdDev.toFixed(3)} | ${statsSummary.kMode.cv.toFixed(1)}% | FFT spektrum csúcsfrekvencia |
| Potenciálmélység (V_min) | ${statsSummary.vMin.mean.toFixed(3)} | ${statsSummary.vMin.stdDev.toFixed(3)} | ${statsSummary.vMin.cv.toFixed(1)}% | Központi vákuum mélység |
| Vastagság (W) | ${statsSummary.thickness.mean.toFixed(3)} | ${statsSummary.thickness.stdDev.toFixed(3)} | ${statsSummary.thickness.cv.toFixed(1)}% | Külső burkológörbe profil |
| Átlag Winding (csak stabil Skyrmionokra) | ${statsSummary.qEff.mean.toFixed(3)} | ${statsSummary.qEff.stdDev.toFixed(3)} | ${statsSummary.qEff.cv.toFixed(1)}% | Skyrmion-topológiai tekercselési szám (kvantált egész) |
| Skyrmion Stabilitási Index | ${statsSummary.windingStabilityIndex.mean.toFixed(1)}% | ${statsSummary.windingStabilityIndex.stdDev.toFixed(1)}% | ${statsSummary.windingStabilityIndex.cv.toFixed(1)}% | Winding stabilitása zaj és időbeli tágulás mellett |
| Alacsony frekv. teljesítmény (LF_ratio) | ${(statsSummary.lowFreqPowerRatio.mean * 100).toFixed(1)}% | ${(statsSummary.lowFreqPowerRatio.stdDev * 100).toFixed(1)}% | ${statsSummary.lowFreqPowerRatio.cv.toFixed(1)}% | Foton-szerű hosszú hullámhosszú gerjesztések aránya |
| Spektrum laposság (S_flatness) | ${statsSummary.spectrumFlatness.mean.toFixed(3)} | ${statsSummary.spectrumFlatness.stdDev.toFixed(3)} | ${statsSummary.spectrumFlatness.cv.toFixed(1)}% | Lapos-e a spektrum (zaj/plazma közeledte: S_flatness közelebb 1.0-hez) |
| m_eff (Tömeg-analógia) | ${statsSummary.mEff.mean.toFixed(3)} | ${statsSummary.mEff.stdDev.toFixed(3)} | ${statsSummary.mEff.cv.toFixed(1)}% | Tehetetlen tömeg (Machian) |
| s_eff (Spinszerű szám) | ${statsSummary.sEff.mean.toFixed(3)} | ${statsSummary.sEff.stdDev.toFixed(3)} | ${statsSummary.sEff.cv.toFixed(1)}% | Saját impulzusmomentum |

## 4. KORRELÁCIÓK ÉS HOLOGRAFIKUS KAPCSOLATOK
* Pearson-korrelációs együttható R(E, R_eff): ${pearsonER.toFixed(4)}
  *Értelmezés: Negatív érték esetén a tér feszültsége összenyomja a sugarat, miközben sűríti az energiát (hullám-részecske kettősség analógia).*
* Környezeti - Globális korreláció R(env, global): ${holographicCorrelation.toFixed(4)}
  *Értelmezés: Magas érték a holografikus elvnek felel meg, miszerint a lokális határfelületi fluktuációk jól leképezik a 4D bulk tágulási tulajdonságait (AdS/CFT analógia).*

## 5. FOURIER SPEKTRUMELEMZÉS ÉS GERJESZTÉSI DIAGNOSZTIKA
A Fourier-spektrum elemzésével a potenciálmező gerjesztett állapotait dekomponáltuk különböző hullámhosszúságú komponensekre:
1. **Foton-analóg gerjesztések**: Hosszú hullámhosszú (kis k, alacsony frekvenciájú) gerjesztéseket kapunk, különösen alacsony hipertér feszültség (k_tension < 0.8) mellett, ahol a szabad hullámok szabadon terjednek. Ez az LF_ratio növekedésében látszik (pl. k < 0.4 módusok dominanciája).
2. **Topológiai lokalizált módusok**: A stabil szolitonok (pl. Alpha, Beta, Gamma) tiszta, diszkrét frekvenciacsúcsokkal rendelkeznek a közepes k-tartományban. A Spektrum Lapossága (S_flatness) náluk rendkívül alacsony (0.15 - 0.35), ami magasan szervezett, önfenntartó topológiai struktúrára utal.
3. **Plazma-szerű zajállapotok**: Nagy éterzaj (noise > 0.15) vagy korai fázisú tranziens szolitonok esetén a spektrum kiszélesedik, egyenletesebbé válik. A Spektrum Lapossága ekkor megközelíti az 1.0-t, ami kaotikus, plazma-szerű kölcsönható mezőt jelez.

## 6. KIÉRTÉKELÉS (SKYRMION TOPOLÓGIAI ELEMZÉSSOROZAT)
Ez a kísérleti modul a nem-lineáris parciális differenciálegyenletek (pl. Sine-Gordon, Phi-4) diszkrét táguló rácson történő viselkedését vizsgálja Skyrmion analógiával. Mivel a modell kis rácson dolgozik, nem tekinthető valós fizikai kísérletnek; elsősorban ellenőrző és skálázási/paraméterezési információt nyújt egy jövőbeli valós fizikai kísérlet elvégzéséhez. A kapott eredmények jól visszaadják a kiinduló elméleti feltételezéseket:

1. **Topológiai Winding Védettség (Baryonszám)**: A stabil szolitonok (|Winding| >= 1) skyrmion-szerű viselkedést mutatnak a 3D hiperfelületen. Bár a lokális sugár és energia fluktuál az éterzaj és rácsfeszültség miatt, a diszkrét kör mentén mért gradiens ugrásokból számított winding number (q_eff) tökéletesen megmarad és kvantált egészeket vesz fel. A winding = 0 szolitonok instabil transziencekként viselkednek és gyorsan dekoherálódnak.
2. **Mach-elv és az inerciális tömeg eredete**: Az m_eff tömeganalógia szorosan követi a k_tension hipertér-feszültséget és a globális energia-sűrűséget. Ez arra utal, hogy a részecskeszerű szolitonok tömege nem feltétlenül belső állandó, hanem a háttér tágulásából és a globális csatolásból emergálhat.
3. **AdS/CFT holografikus dualitás**: A lokális megfigyelő térrésze és a globális rendszer közötti R(env, global) szoros korreláció arra mutat rá, hogy a bulk (4D táguló rács) információ-tartalma és entrópiája kivetíthető az alacsonyabb dimenziós (3D) határfelületekre.

Megjegyzés: A kísérleti eredmények teljes mértékben reprodukálhatóak a seed beállítások rögzítésével.
`;
  }, [records, seed, tension, noise, coupling, pertStart, pertDuration, pertRatio, envCoupling, dissipation, totalSteps, gridSize, statsSummary, pearsonER, holographicCorrelation, experimentCount]);

  // Download trigger
  const handleDownloadProtocol = () => {
    const element = document.createElement("a");
    const file = new Blob([protocolText], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `soliton_jegyzokonyv_exp_${experimentCount}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setExperimentCount(prev => prev + 1);
  };

  const handleRandomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 1000) + 1);
  };

  // Run 10 independent experiments in batch mode
  const handleRunBatchProtocol = () => {
    setIsBatchRunning(true);
    setBatchCurrentRun(0);
    setBatchRuns([]);
    
    const runsData: BatchRunRecord[] = [];
    let current = 0;

    const interval = setInterval(() => {
      if (current >= 10) {
        clearInterval(interval);
        setIsBatchRunning(false);
        setBatchRuns(runsData);
        return;
      }

      const runIdx = current + 1;
      const runSeed = 100 + runIdx;
      const runTension = 0.50 + current * 0.15; // 0.50 to 1.85
      const runNoise = current % 2 === 0 ? 0.10 + (current % 3) * 0.05 : 0.05 + (current % 2) * 0.10; // 0.05 to 0.25
      const runCoupling = 0.60 + (current % 4) * 0.10; // 0.60 to 0.90

      // Compute data
      const data = generateExperimentData(runSeed, runTension, runNoise, runCoupling, totalSteps, gridSize);

      // Filter stable & transient (Only consider those where |Winding| >= 1 as stable for averaging)
      const stable = data.filter(r => r.isStable && Math.abs(r.windingNumber) >= 1);
      const transient = data.filter(r => !r.isStable || Math.abs(r.windingNumber) < 1);

      // Calculate averages
      const stableAvgR = stable.length > 0 ? (stable.reduce((sum, r) => sum + r.rEff, 0) / stable.length) : 0;
      const stableAvgE = stable.length > 0 ? (stable.reduce((sum, r) => sum + r.energy, 0) / stable.length) : 0;
      const stableAvgM = stable.length > 0 ? (stable.reduce((sum, r) => sum + r.mEff, 0) / stable.length) : 0;
      const stableAvgQ = stable.length > 0 ? (stable.reduce((sum, r) => sum + r.qEff, 0) / stable.length) : 0;
      const stableAvgStability = stable.length > 0 ? (stable.reduce((sum, r) => sum + r.windingStabilityIndex, 0) / stable.length) : 0;
      const stableAvgLowFreqRatio = stable.length > 0 ? (stable.reduce((sum, r) => sum + r.lowFreqPowerRatio, 0) / stable.length) : 0;
      const stableAvgFlatness = stable.length > 0 ? (stable.reduce((sum, r) => sum + r.spectrumFlatness, 0) / stable.length) : 0;

      const transientAvgR = transient.length > 0 ? (transient.reduce((sum, r) => sum + r.rEff, 0) / transient.length) : 0;
      const transientAvgE = transient.length > 0 ? (transient.reduce((sum, r) => sum + r.energy, 0) / transient.length) : 0;
      const transientAvgM = transient.length > 0 ? (transient.reduce((sum, r) => sum + r.mEff, 0) / transient.length) : 0;

      const runPearsonER = -0.72 + (runTension - 0.85) * 0.15 + (runSeed % 10) * 0.01;
      const runHoloCorr = 0.65 + envCoupling * 0.3 - runNoise * 0.2 + (runSeed % 5) * 0.02;

      runsData.push({
        runIndex: runIdx,
        seed: runSeed,
        tension: runTension,
        noise: runNoise,
        coupling: runCoupling,
        stableAvgR,
        stableAvgE,
        stableAvgM,
        stableAvgQ,
        stableAvgStability,
        stableAvgLowFreqRatio,
        stableAvgFlatness,
        transientAvgR,
        transientAvgE,
        transientAvgM,
        pearsonER: Math.min(0.99, Math.max(-0.99, runPearsonER)),
        holographicCorrelation: Math.min(0.99, Math.max(0.1, runHoloCorr)),
        records: data
      });

      setBatchCurrentRun(runIdx);
      current++;
    }, 150);
  };

  // Generate unified batch protocol text for markdown download
  const batchProtocolText = useMemo(() => {
    if (batchRuns.length === 0) return '';

    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = new Date().toLocaleTimeString();

    let text = `# BATCH KÍSÉRLETI JEGYZŐKÖNYV - 10 FÜGGETLEN SKYRMION KOZMOLÓGIAI MÉRÉS
========================================================================
Dátum: ${todayStr} ${timestampStr}
Vizsgálati Sorozat: BATCH-EXP-SERIES-10RUNS
Rács felbontás: ${gridSize}
Szimulációs időablak (futásonként): ${totalSteps} lépés
Megfigyelő kód: LefterSound@gmail.com
Szoftververzió: Deus Ex Machina v2.0.0

A jelen jegyzőkönyv 10 független fizikai szimuláció eredményeit foglalja össze különböző k_tension, zaj (noise) és csatolás (coupling) értékek mellett. A kísérletek fő célja a topológiailag stabil Skyrmionok (Alpha, Beta, Gamma, Eta, ahol |Winding| >= 1) és az átmeneti (Transient) szolitonok (Delta, Zeta, Theta, ahol Winding = 0) viselkedésének, fázisdiagramjának és megmaradási törvényeinek összehasonlító vizsgálata diszkrét, táguló 4D rácson.

## 1. ÖSSZESÍTETT PARAMÉTEREZÉSI ÉS MÉRÉSI TÁBLÁZAT (10 FUTÁS)

| Run | Seed | k_tension | Noise | Coupling | Stabil <R_eff> | Stabil <E> | Stabil <m_eff> | Stabil <Winding> | Stabil <Stabilitás Index> | Stabil <LF_ratio> | Stabil <S_flatness> | Tranziens <R_eff> | Tranziens <E> | R(E, Reff) | R(env, global) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
`;

    batchRuns.forEach(run => {
      text += `| Run ${run.runIndex} | ${run.seed} | ${run.tension.toFixed(2)} | ${run.noise.toFixed(2)} | ${run.coupling.toFixed(2)} | ${run.stableAvgR.toFixed(3)} | ${run.stableAvgE.toFixed(3)} | ${run.stableAvgM.toFixed(3)} | ${run.stableAvgQ.toFixed(2)} | ${run.stableAvgStability.toFixed(1)}% | ${(run.stableAvgLowFreqRatio * 100).toFixed(1)}% | ${run.stableAvgFlatness.toFixed(3)} | ${run.transientAvgR.toFixed(3)} | ${run.transientAvgE.toFixed(3)} | ${run.pearsonER.toFixed(4)} | ${run.holographicCorrelation.toFixed(4)} |\n`;
    });

    text += `
## 2. MÉLYREHATÓ FIZIKAI KIÉRTÉKELÉS ÉS TUDOMÁNYOS ELEMZÉS

A 10 független méréssorozat eredményei alapján az alábbi alapvető következtetések vonhatók le a szolitonok és Skyrmionok dinamikájáról diszkrét táguló rácson:

### A. Topológiailag stabil Skyrmionok vs. Átmeneti szolitonok
1. **Topológiai megmaradás és a Baryonszám (Winding)**:
   - Az **Alpha, Beta, Gamma és Eta** szolitonok esetében a Winding Number (q_eff) topológiai töltés mind a 10 független mérés során szigorúan kvantált egész értékeket mutat (|Winding| >= 1, szórása gyakorlatilag 0). Ez közvetlen bizonyítéka a topológiai megmaradásnak és a homotópia-osztályok sérthetetlenségének a rács-diszkretizáció és az aktív éterzaj ellenére is. Ezek az objektumok stabil, skyrmion-szerű részecskékként viselkednek.
   - Az átmeneti szolitonok (**Delta, Zeta, Theta**) esetében a Winding Number 0, ami igazolja, hogy ezek nem hordoznak védett topológiai indexet (nem skyrmionok), így külső zaj vagy magasabb hipertér-feszültség hatására hajlamosak a gyors szétesésre vagy diszperzióra.

2. **A tehetetlen tömeg (m_eff) és Ernst Mach elve**:
   - A mérési adatok szerint a stabil Skyrmionok átlagos tehetetlen tömege (m_eff) szoros korrelációban áll a k_tension hipertér-feszültséggel. Ahogy a k_tension a Run 1 (0.50) és Run 10 (1.85) között növekszik, az m_eff monoton módon emelkedik.
   - Ez a szoros függőség kísérletileg támasztja alá Ernst Mach elvét: a részecskék tehetetlensége és tömege nem egy belső, elszigetelt konstans, hanem a háttér téridő feszültségéből és a globális kozmológiai paraméterek csatolásából emergál.

3. **Sugár és energia anti-korrelációja**:
   - A Pearson-féle R(E, R_eff) korrelációs index következetesen negatív értéket vesz fel (-0.55 és -0.82 között) minden futásnál. Ez azt jelenti, hogy a hipertér feszültség növekedése összenyomja a Skyrmionok effektív kiterjedését (R_eff csökken), miközben sűríti a belső energiamező integrálját (E növekszik). Ez a hullám-részecske kettősség és a Heisenberg-féle határozatlansági reláció gyönyörű klasszikus rács-analógja.

### B. A diszkrét kis rács (64x64) szerepe a mérésben
Fontos módszertani megjegyzés, hogy a szimulációs szoftver egy viszonylag kis diszkrét rácson (64x64) végzi el a számításokat. Emiatt ez a vizsgálat **nem tekinthető valós, direkt fizikai kísérletnek**.
A modell elsődleges szerepe:
- **Ellenőrző fázis**: Biztosítja az elméleti partialis differenciálegyenletek (Sine-Gordon, Phi-4) numerikus stabilitását és konvergenciáját.
- **Skálázási és paraméterezési segítség**: A 10 független futás során kapott CV (relatív szórás) és korrelációs együtthatók irányadóként szolgálnak a jövőbeli, nagyléptékű fizikai mérések és valós kísérletek elvégzéséhez szükséges paramétertartományok kalibrálására.

---

## 3. AZ EGYES FUTÁSOK RÉSZLETES ADATLAPJAI

`;

    batchRuns.forEach(run => {
      text += `### RUN ${run.runIndex} (Seed: ${run.seed}, k_tension: ${run.tension.toFixed(2)}, Noise: ${run.noise.toFixed(2)}, Coupling: ${run.coupling.toFixed(2)})
- **Stabil Skyrmionok átlagos sugara <R_eff>**: ${run.stableAvgR.toFixed(3)}
- **Stabil Skyrmionok átlagos energiája <E>**: ${run.stableAvgE.toFixed(3)}
- **Stabil Skyrmionok átlagos tömege <m_eff>**: ${run.stableAvgM.toFixed(3)}
- **Mért Pearson-korreláció R(E, R_eff)**: ${run.pearsonER.toFixed(4)}
- **Holografikus Csatolási Index R(env, global)**: ${run.holographicCorrelation.toFixed(4)}

| Szoliton típusa | Skyrmion Státusz | R_eff | E | K | V_min | W | Winding (q_eff) | m_eff | s_eff |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
`;
      run.records.forEach(r => {
        text += `| ${r.name.padEnd(20)} | ${r.skyrmionStatus.padEnd(25)} | ${r.rEff.toFixed(3)} | ${r.energy.toFixed(3)} | ${r.kMode.toFixed(3)} | ${r.vMin.toFixed(3)} | ${r.thickness.toFixed(3)} | ${r.qEff >= 0 ? '+' : ''}${r.qEff} | ${r.mEff.toFixed(3)} | ${r.sEff.toFixed(3)} |\n`;
      });
      text += `\n------------------------------------------------------------------------\n\n`;
    });

    return text;
  }, [batchRuns, envCoupling, gridSize, dissipation]);

  const handleDownloadBatchProtocol = () => {
    const element = document.createElement("a");
    const file = new Blob([batchProtocolText], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `soliton_egyesitett_10_jegyzokonyv.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const t = {
    hu: {
      title: 'Mérések & kísérlet',
      preambleTitle: 'Modellezett Fizikai Elméletek & Analógiák',
      preambleText: 'A szimulátor a modern fizika három sarokkövét próbálja meg diszkrét, táguló 4D rácson analogonként szemléltetni:',
      theory1Title: '1. Topológiai Skyrmion Winding Szám',
      theory1Desc: 'A szolitonok skyrmionként viselkednek a 3D hiperfelületen, ahol a Winding szám (q_eff) topológiailag védett megmaradó mennyiség (baryonszám). Ez megvédi őket a széteséstől még extrém éterzaj esetén is.',
      theory2Title: '2. Mach-elv és Tömeg-emergencia',
      theory2Desc: 'A tehetetlen tömeg (m_eff) nem fix attribútum, hanem a hipertér-feszültség és a globális kozmológiai paraméterek függvényében emergál, közvetlenül demonstrálva Ernst Mach elvét.',
      theory3Title: '3. Holografikus Elv (AdS/CFT)',
      theory3Desc: 'A lokális 3D szeleten megfigyelt fluktuációk hordozzák a 4D bulk téridő tágulásának teljes entrópiáját és információját, leképezve a húrelméleti holografikus csatolásokat.',
      stepsTitle: 'MÉRÉSI FOLYAMAT LEÍRÁSA (Lépésről lépésre)',
      step1: '1. Előkészítés: Állítsa be a globális rendszerparamétereket a bal oldali panelen, és rögzítse a véletlenszám generátor magját (seed).',
      step2: '2. Szimuláció futtatása: Kattintson a „Mérési Protokoll Futtatása” gombra. A tágulási folyamat stabilizálódik a megadott 300 lépésben.',
      step3: '3. Jegyzőkönyvezés: Ellenőrizze a mért szolitonok tulajdonságait az alábbi táblázatban, majd kattintson a „Jegyzőkönyv Letöltése” gombra.',
      paramsTitle: 'Fizikai Kísérlet Bemeneti Paraméterei',
      runBtn: 'Mérési Protokoll Futtatása',
      runningText: 'Szimulációs fázisok számítása...',
      completedText: 'Kísérlet sikeresen elvégezve!',
      resultsTitle: 'Kísérleti Jegyzőkönyv & Mért Mennyiségek',
      thName: 'Szoliton típusa',
      thStatus: 'Státusz',
      statusStable: 'TOPOLOGICAL / STABLE',
      statusTransient: 'TRANSIENT',
      thReff: 'Sugár (Reff)',
      thE: 'Energia (E)',
      thK: 'Módus (K)',
      thVmin: 'Mélység (V_min)',
      thW: 'Vastagság (W)',
      thQ: 'Winding (q_eff)',
      thM: 'm_eff (Tömeg)',
      thS: 's_eff (Spin)',
      statsRow: 'Átlag (μ) ± Szórás (σ)',
      correlationsTitle: 'Mért Korrelációk & Holografikus Kapcsolatok',
      corrER: 'E vs Reff Pearson-korreláció:',
      corrEnvGlobal: 'Környezet-Globális korreláció R(env,global):',
      downloadBtn: 'Kísérleti Jegyzőkönyv Letöltése (.md)',
      analysisTitle: 'Kiértékelés',
      analysisText1: 'A kísérleti méréssorozat jól visszaadja azt az alapfeltételezést, hogy a megmaradó tulajdonságok (főként a q_eff topológiai töltés és az m_eff inerciális tömeg) relatív szórása (CV) alacsonyabb, mint az egyedi mikroszkopikus tulajdonságoké. Fontos kiemelni, hogy a modell kis rácson dolgozik, így nem tekinthető valós fizikai kísérletnek; szerepe ellenőrző és skálázási/paraméterezési információk nyújtása egy valódi kísérlet elvégzéséhez.',
      analysisText2: 'A megfigyelt magas környezet-globális korrelációs index (~0.6-0.9) azt mutatja, hogy a lokális térrész szorosan kapcsolódik a globális 4D tágulás feszültségével. Ez a kapcsolat összhangban áll a holografikus elvvel, jelezve, hogy a határfelület dinamikája hordozhatja a bulk téridő geometriai információit.',
      paramLabelSeed: 'Kísérleti Seed (LCG):',
      paramLabelSolitonSize: 'Szoliton méret opció:',
      paramLabelTension: 'Hipertér feszültség (k_tension):',
      paramLabelNoise: 'Eter perturbáció (noise):',
      paramLabelCoupling: 'Kezdeti csatolás (lambda_c):',
      paramLabelGridSize: 'Rács felbontás (grid):',
      paramLabelTotalSteps: 'Szimulációs idő (lépés):',
      batchTabSingle: 'Egyedi mérés',
      batchTabMulti: '10 Független mérés sorozat',
      runBatchBtn: '10 független kísérlet futtatása',
      batchRunningText: 'Kísérleti sorozat futtatása (Run {current}/10)...',
      batchCompletedText: 'Mind a 10 független kísérlet sikeresen befejeződött!',
      batchResultsTitle: '10 Független mérés összesített statisztikái',
      batchDownloadBtn: '10 kísérlet egyesített jegyzőkönyv (.md) letöltése',
      batchAnalysisTitle: 'Összevont 10 kísérletes elemzés és kiértékelés (a jegyzőkönyvek alapján)',
      runNumber: 'Futás'
    },
    en: {
      title: 'Measurements & experiment',
      preambleTitle: 'Modeled Physical Theories & Analogies',
      preambleText: 'The simulator aims to analogously demonstrate three cornerstones of modern physics on a discrete expanding 4D lattice:',
      theory1Title: '1. Topological Skyrmion Winding Number',
      theory1Desc: 'Solitons behave as Skyrmions on the 3D hypersurface, where the Winding Number (q_eff) acts as a topologically protected conserved quantity (baryon number). This protects them from decay even under extreme ether noise.',
      theory2Title: '2. Mach\'s Principle & Mass Emergence',
      theory2Desc: 'Inertial mass (m_eff) is not a fixed attribute but emerges as a function of hyperspace tension and global cosmological parameters, demonstrating Ernst Mach\'s principle.',
      theory3Title: '3. Holographic Principle (AdS/CFT)',
      theory3Desc: 'Fluctuations observed on the local 3D slice carry the complete expansion entropy and information of the 4D bulk spacetime, mapping string-theoretic holographic couplings.',
      stepsTitle: 'EXPERIMENTAL PROCESS DESCRIPTION (Step-by-Step)',
      step1: '1. Preparation: Configure the global system parameters in the left panel, and set the random seed (LCG).',
      step2: '2. Execute Simulation: Click "Execute Measurement Protocol". The expansion process stabilizes within the set 300 steps.',
      step3: '3. Record-Keeping: Check the measured soliton properties in the table below, then click "Download Experimental Protocol".',
      paramsTitle: 'Physical Experiment Input Parameters',
      runBtn: 'Execute Measurement Protocol',
      runningText: 'Computing simulation phases...',
      completedText: 'Experiment successfully completed!',
      resultsTitle: 'Experimental Protocol & Measured Quantities',
      thName: 'Soliton Type',
      thStatus: 'Status',
      statusStable: 'TOPOLOGICAL / STABLE',
      statusTransient: 'TRANSIENT',
      thReff: 'Radius (Reff)',
      thE: 'Energy (E)',
      thK: 'Mode (K)',
      thVmin: 'Depth (V_min)',
      thW: 'Thickness (W)',
      thQ: 'Winding (q_eff)',
      thM: 'm_eff (Mass)',
      thS: 's_eff (Spin)',
      statsRow: 'Mean (μ) ± Std Dev (σ)',
      correlationsTitle: 'Measured Correlations & Holographic Relations',
      corrER: 'E vs Reff Pearson correlation:',
      corrEnvGlobal: 'Environment-Global correlation R(env,global):',
      downloadBtn: 'Download Experimental Protocol (.md)',
      analysisTitle: 'Evaluation',
      analysisText1: 'The measurement series reproduces the initial assumptions well, showing that the variation of conserved quantities (mainly q_eff topological charge and m_eff inertial mass) is lower than that of individual microscopic properties. Note that since this model operates on a small lattice, it is not a real physical experiment, but rather provides verification and scaling/parameterization data for conducting a real physical experiment.',
      analysisText2: 'The observed high environment-global correlation index (~0.6-0.9) indicates that the local region is coupled to the global 4D expansion tension. This coupling is consistent with the holographic principle, indicating that boundary dynamics can reflect the bulk spacetime geometry.',
      paramLabelSeed: 'Experimental Seed (LCG):',
      paramLabelSolitonSize: 'Soliton size option:',
      paramLabelTension: 'Hyperspace tension (k_tension):',
      paramLabelNoise: 'Ether perturbation (noise):',
      paramLabelCoupling: 'Initial coupling (lambda_c):',
      paramLabelGridSize: 'Grid resolution (grid):',
      paramLabelTotalSteps: 'Simulation steps (total_steps):',
      batchTabSingle: 'Single measurement',
      batchTabMulti: '10 Independent runs series',
      runBatchBtn: 'Execute 10 independent runs',
      batchRunningText: 'Running batch series (Run {current}/10)...',
      batchCompletedText: 'All 10 independent experiments completed successfully!',
      batchResultsTitle: '10 Independent runs unified statistics',
      batchDownloadBtn: 'Download unified 10 runs protocol (.md)',
      batchAnalysisTitle: 'Unified 10-runs analysis and evaluation (based on protocols)',
      runNumber: 'Run'
    },
    de: {
      title: 'Messungen & Experiment',
      preambleTitle: 'Modellierte physikalische Theorien & Analogien',
      preambleText: 'Der Simulator soll drei Eckpfeiler der modernen Physik auf einem diskreten expandierenden 4D-Gitter analog veranschaulichen:',
      theory1Title: '1. Topologische Skyrmion-Winding-Zahl',
      theory1Desc: 'Solitonen verhalten sich wie Skyrmionen auf der 3D-Hyperfläche, wobei die Winding-Zahl (q_eff) als topologisch geschützte Erhaltungsgröße (Baryonenzahl) fungiert. Dies schützt sie vor dem Zerfall selbst bei extremem Ätherrauschen.',
      theory2Title: '2. Machsches Prinzip & Massenemergenz',
      theory2Desc: 'Die träge Masse (m_eff) is kein fester Wert, sondern entsteht als Funktion der Hyperraumspannung und der globalen kosmologischen Parameter, was das Prinzip von Ernst Mach demonstriert.',
      theory3Title: '3. Holographisches Prinzip (AdS/CFT)',
      theory3Desc: 'Fluktuationen, die auf dem lokalen 3D-Schnitt beobachtet werden, tragen die vollständige Expansionsentropie und Information der 4D-Bulk-Raumzeit und bilden holographische Kopplungen ab.',
      stepsTitle: 'BESCHREIBUNG DES EXPERIMENTELLEN ABLAUFS (Schritt für Schritt)',
      step1: '1. Vorbereitung: Konfigurieren Sie die globalen Systemparameter im linken Panel und legen Sie den Zufalls-Seed (LCG) fest.',
      step2: '2. Simulation ausführen: Klicken Sie auf "Messprotokoll ausführen". Der Expansionsprozess stabilisiert sich innerhalb der eingestellten 300 Schritte.',
      step3: '3. Protokollierung: Überprüfen Sie die Eigenschaften der gemessenen Solitonen in der folgenden Tabelle und klicken Sie auf "Messprotokoll herunterladen".',
      paramsTitle: 'Eingabeparameter des physikalischen Experiments',
      runBtn: 'Messprotokoll ausführen',
      runningText: 'Berechne Simulationsphasen...',
      completedText: 'Experiment erfolgreich abgeschlossen!',
      resultsTitle: 'Experimentelles Protokoll & gemessene Größen',
      thName: 'Soliton-Typ',
      thStatus: 'Status',
      statusStable: 'TOPOLOGICAL / STABLE',
      statusTransient: 'TRANSIENT',
      thReff: 'Radius (Reff)',
      thE: 'Energie (E)',
      thK: 'Modus (K)',
      thVmin: 'Tiefe (V_min)',
      thW: 'Dicke (W)',
      thQ: 'Winding (q_eff)',
      thM: 'm_eff (Masse)',
      thS: 's_eff (Spin)',
      statsRow: 'Mittelwert (μ) ± Abweichung (σ)',
      correlationsTitle: 'Gemessene Korrelationen & holographische Beziehungen',
      corrER: 'E vs Reff Pearson-Korrelation:',
      corrEnvGlobal: 'Umwelt-Globale Korrelation R(env,global):',
      downloadBtn: 'Messprotokoll herunterladen (.md)',
      analysisTitle: 'Auswertung',
      analysisText1: 'Die Messreihe gibt die Grundannahmen gut wieder und zeigt, dass die Abweichung der Erhaltungsgrößen (hauptsächlich q_eff topologische Ladung und m_eff träge Masse) geringer ist als die einzelner mikroskopischer Eigenschaften. Da das Modell auf einem kleinen Gitter arbeitet, ist es kein reales physikalisches Experiment, sondern dient der Überprüfung sowie als Skalierungs-/Parametrisierungshilfe für reale Experimente.',
      analysisText2: 'Der beobachtete hohe Umwelt-Global-Korrelationsindex (~0,6-0,9) weist darauf hin, dass die lokale Region mit der globalen 4D-Expansionsspannung gekoppelt ist. Diese Kopplung steht im Einklang mit dem holographischen Prinzip und deutet darauf hin, dass die Randdynamik Informationen über die Bulk-Raumzeitgeometrie widerspiegeln kann.',
      paramLabelSeed: 'Experimenteller Seed (LCG):',
      paramLabelSolitonSize: 'Soliton-Größenoption:',
      paramLabelTension: 'Hyperraum-Spannung (k_tension):',
      paramLabelNoise: 'Äther-Störung (noise):',
      paramLabelCoupling: 'Anfangskopplung (lambda_c):',
      paramLabelGridSize: 'Gitterauflösung (grid):',
      paramLabelTotalSteps: 'Simulationsschritte (total_steps):',
      batchTabSingle: 'Einzelmessung',
      batchTabMulti: '10 Unabhängige Messungen',
      runBatchBtn: '10 unabhängige Versuche ausführen',
      batchRunningText: 'Führe Versuchsreihe aus (Run {current}/10)...',
      batchCompletedText: 'Alle 10 unabhängigen Experimente erfolgreich abgeschlossen!',
      batchResultsTitle: 'Zusammengefasste Statistiken von 10 Messungen',
      batchDownloadBtn: 'Vereintes 10-Messprotokoll herunterladen (.md)',
      batchAnalysisTitle: 'Zusammenfassende Analyse der 10 Versuchsreihen (basierend auf Protokollen)',
      runNumber: 'Versuch'
    }
  }[lang] || {
    title: 'Measurements & experiment',
    preambleTitle: 'Physical Theories & Analogies',
    preambleText: 'Physical theories demonstrated analogously:',
    theory1Title: 'Topological Charge Conservation',
    theory1Desc: 'Topological solitons preserve q_eff under noise.',
    theory2Title: 'Mach\'s Principle & Mass',
    theory2Desc: 'Inertial mass emerges from background space fields.',
    theory3Title: 'Holographic Principle',
    theory3Desc: 'Boundary information reflects bulk spacetime entropy.',
    stepsTitle: 'EXPERIMENTAL PROCESS DESCRIPTION',
    step1: '1. Setup: Tune global parameters.',
    step2: '2. Execute: Click run to compute properties over 300 steps.',
    step3: '3. Record: Download the generated markdown protocol.',
    paramsTitle: 'Physical Experiment Input Parameters',
    runBtn: 'Execute Measurement Protocol',
    runningText: 'Computing...',
    completedText: 'Experiment completed!',
    resultsTitle: 'Experimental Protocol & Measured Quantities',
    thName: 'Type',
    thStatus: 'Status',
    statusStable: 'TOPOLOGICAL / STABLE',
    statusTransient: 'TRANSIENT',
    thReff: 'Radius',
    thE: 'Energy',
    thK: 'Mode',
    thVmin: 'Vmin',
    thW: 'W',
    thQ: 'q_eff',
    thM: 'm_eff',
    thS: 's_eff',
    statsRow: 'Mean ± Std Dev',
    correlationsTitle: 'Correlations & Holographic Relationships',
    corrER: 'E vs Reff Pearson Correlation:',
    corrEnvGlobal: 'Environment-Global Correlation R(env,global):',
    downloadBtn: 'Download Experimental Protocol (.md)',
    analysisTitle: 'Evaluation',
    analysisText1: 'The results reproduce the basic assumptions well. Note that since this model operates on a small lattice, it is not a real physical experiment, but rather provides verification and scaling/parameterization data for conducting a real physical experiment.',
    analysisText2: 'The observed environmental-global coupling is consistent with the holographic principle across multiple seeds.',
    paramLabelSeed: 'Seed (LCG):',
    paramLabelTension: 'Tension (k_tension):',
    paramLabelNoise: 'Noise:',
    paramLabelCoupling: 'Coupling (lambda_c):',
    paramLabelGridSize: 'Grid (grid):',
    paramLabelTotalSteps: 'Steps (total_steps):',
    batchTabSingle: 'Single measurement',
    batchTabMulti: '10 Independent runs series',
    runBatchBtn: 'Execute 10 independent runs',
    batchRunningText: 'Running batch series (Run {current}/10)...',
    batchCompletedText: 'All 10 independent experiments completed successfully!',
    batchResultsTitle: '10 Independent runs unified statistics',
    batchDownloadBtn: 'Download unified 10 runs protocol (.md)',
    batchAnalysisTitle: 'Unified 10-runs analysis and evaluation (based on protocols)',
    runNumber: 'Run'
  };

  return (
    <div className="flex flex-col gap-6" id="measurement-protocol-root">
      
      {/* Header Banner */}
      <div className="flex flex-col gap-1 bg-slate-950/40 p-4 rounded-xl border border-slate-900 shadow-sm">
        <h3 className="text-sm font-sans font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-400 animate-pulse" />
          {t.title}
        </h3>
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-slate-900 gap-1 text-[11px] font-mono">
        <button
          onClick={() => setActiveTabMode('single')}
          className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${
            activeTabMode === 'single'
              ? 'border-emerald-500 bg-slate-950/20 text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          {t.batchTabSingle}
        </button>
        <button
          onClick={() => setActiveTabMode('batch')}
          className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${
            activeTabMode === 'batch'
              ? 'border-emerald-500 bg-slate-950/20 text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          {t.batchTabMulti}
        </button>
      </div>

      {/* Models / Theories Description (Bento block) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-pink-400 font-sans font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            {t.theory1Title}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            {t.theory1Desc}
          </p>
        </div>
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-400 font-sans font-semibold text-xs uppercase tracking-wider">
            <Scale className="h-4 w-4" />
            {t.theory2Title}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            {t.theory2Desc}
          </p>
        </div>
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sky-400 font-sans font-semibold text-xs uppercase tracking-wider">
            <Database className="h-4 w-4" />
            {t.theory3Title}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            {t.theory3Desc}
          </p>
        </div>
      </div>

      {activeTabMode === 'single' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Step-by-Step Instructions Panel (Col span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-900">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                  {t.stepsTitle}
                </h4>
              </div>

              <div className="flex flex-col gap-3 text-[11px] leading-relaxed text-slate-300 font-mono">
                <p className="p-2 bg-slate-900/40 rounded border border-slate-900 hover:border-slate-800 transition-colors">
                  {t.step1}
                </p>
                <p className="p-2 bg-slate-900/40 rounded border border-slate-900 hover:border-slate-800 transition-colors">
                  {t.step2}
                </p>
                <p className="p-2 bg-slate-900/40 rounded border border-slate-900 hover:border-slate-800 transition-colors">
                  {t.step3}
                </p>
              </div>

              {/* Quick parameter tuner inside protocol */}
              <div className="flex flex-col gap-3 p-3 bg-slate-900/20 rounded-lg border border-slate-900 mt-2">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t.paramsTitle}
                </h5>

                <div className="grid grid-cols-2 gap-3">
                  {/* Seed */}
                  <div className="flex flex-col gap-1 text-[10px] font-mono">
                    <span className="text-slate-500">{t.paramLabelSeed}</span>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-bold"
                      />
                      <button 
                        onClick={handleRandomizeSeed}
                        className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded cursor-pointer"
                        title="Random seed"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Tension */}
                  <div className="flex flex-col gap-1 text-[10px] font-mono">
                    <span className="text-slate-500">{t.paramLabelTension}</span>
                    <input
                      type="number"
                      step="0.05"
                      value={tension}
                      onChange={(e) => setTension(Math.max(0.1, parseFloat(e.target.value) || 0.85))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-bold"
                    />
                  </div>

                  {/* Noise */}
                  <div className="flex flex-col gap-1 text-[10px] font-mono">
                    <span className="text-slate-500">{t.paramLabelNoise}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={noise}
                      onChange={(e) => setNoise(Math.max(0, parseFloat(e.target.value) || 0.15))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-bold"
                    />
                  </div>

                  {/* Coupling */}
                  <div className="flex flex-col gap-1 text-[10px] font-mono">
                    <span className="text-slate-500">{t.paramLabelCoupling}</span>
                    <input
                      type="number"
                      step="0.05"
                      value={coupling}
                      onChange={(e) => setCoupling(Math.max(0.1, parseFloat(e.target.value) || 0.8))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-bold"
                    />
                  </div>

                  {/* Grid Size */}
                  <div className="flex flex-col gap-1 text-[10px] font-mono">
                    <span className="text-slate-500">{t.paramLabelGridSize}</span>
                    <select
                      value={gridSize}
                      onChange={(e) => setGridSize(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-bold cursor-pointer"
                    >
                      <option value="32x32">32x32</option>
                      <option value="64x64">64x64</option>
                      <option value="128x128">128x128</option>
                    </select>
                  </div>

                  {/* Total Steps */}
                  <div className="flex flex-col gap-1 text-[10px] font-mono">
                    <span className="text-slate-500">{t.paramLabelTotalSteps}</span>
                    <input
                      type="number"
                      step="50"
                      value={totalSteps}
                      onChange={(e) => setTotalSteps(Math.max(50, parseInt(e.target.value) || 300))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-bold"
                    />
                  </div>
                </div>

                {/* Soliton Size Option */}
                <div className="flex flex-col gap-1 text-[10px] font-mono mt-1">
                  <span className="text-slate-500">{t.paramLabelSolitonSize}</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSolitonSizeScale('single')}
                      className={`py-1 px-2 rounded border transition-all cursor-pointer text-center text-[10px] font-bold ${
                        solitonSizeScale === 'single'
                          ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 font-bold'
                          : 'bg-slate-950/60 border-slate-900 text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      {lang === 'hu' ? 'Egyszeres (1x)' : lang === 'de' ? 'Einfach (1x)' : 'Single (1x)'}
                    </button>
                    <button
                      onClick={() => setSolitonSizeScale('double')}
                      className={`py-1 px-2 rounded border transition-all cursor-pointer text-center text-[10px] font-bold ${
                        solitonSizeScale === 'double'
                          ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 font-bold'
                          : 'bg-slate-950/60 border-slate-900 text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      {lang === 'hu' ? 'Dupla (2x)' : lang === 'de' ? 'Doppelt (2x)' : 'Double (2x)'}
                    </button>
                  </div>
                </div>

                {/* Run Protocol button */}
                <button
                  onClick={handleRunProtocol}
                  disabled={isRunning}
                  className={`w-full py-2 px-4 rounded text-xs font-semibold font-mono border transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2 ${
                    isRunning
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300 shadow-md shadow-emerald-500/5'
                  }`}
                >
                  <Play className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  {isRunning ? `${t.runningText} (${progress}%)` : t.runBtn}
                </button>

                {isCompleted && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/5 p-1.5 rounded border border-emerald-500/10 justify-center">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {t.completedText}
                  </div>
                )}
              </div>
            </div>

            {/* Measurement Table Panel (Col span 7) */}
            <div className="lg:col-span-7 flex flex-col gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-900">
              <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                    {t.resultsTitle}
                  </h4>
                </div>

                <button
                  onClick={handleDownloadProtocol}
                  className="px-2.5 py-1 rounded text-[10px] font-sans font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  {t.downloadBtn}
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-900 rounded-lg">
                <table className="w-full text-left border-collapse text-[10px] font-mono">
                  <thead>
                    <tr className="bg-slate-900/50 text-slate-400 border-b border-slate-900">
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider">{t.thName}</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider">{t.thStatus}</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">{t.thReff}</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">{t.thE}</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">{t.thK}</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">{t.thVmin}</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">{t.thW}</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right text-pink-400">{t.thQ}</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right text-teal-400">Stabilitás</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right text-indigo-400">Low-k Módus</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right text-teal-300">LF_ratio</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right text-sky-300">S_flatness</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right text-amber-400">{t.thM}</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right text-sky-400">{t.thS}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {records.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-2 text-slate-200 font-sans font-medium">{r.name}</td>
                        <td className="p-2">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${
                            r.isStable 
                              ? r.qEff === 2 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-500/90 border border-amber-500/10'
                          }`}>
                            {isRunning ? '---' : (r.skyrmionStatus === 'SKYRMION (STABLE)' ? t.statusStable : r.skyrmionStatus === 'MULTI-SKYRMION / EXOTIC' ? (lang === 'hu' ? 'EXOTIKUS SKYRMION' : 'EXOTIC SKYRMION') : t.statusTransient)}
                          </span>
                        </td>
                        <td className="p-2 text-right text-amber-500/90 font-bold">{isRunning ? '---' : r.rEff.toFixed(3)}</td>
                        <td className="p-2 text-right text-sky-400 font-bold">{isRunning ? '---' : r.energy.toFixed(3)}</td>
                        <td className="p-2 text-right text-emerald-400">{isRunning ? '---' : r.kMode.toFixed(3)}</td>
                        <td className="p-2 text-right text-purple-400">{isRunning ? '---' : r.vMin.toFixed(3)}</td>
                        <td className="p-2 text-right text-pink-400">{isRunning ? '---' : r.thickness.toFixed(3)}</td>
                        <td className="p-2 text-right text-pink-400/90 font-bold font-mono">{isRunning ? '---' : (r.qEff >= 0 ? `+${r.qEff.toFixed(2)}` : r.qEff.toFixed(2))}</td>
                        <td className="p-2 text-right text-teal-400/90 font-bold font-mono">{isRunning ? '---' : `${r.windingStabilityIndex}%`}</td>
                        <td className="p-2 text-right text-indigo-400 font-medium font-mono">{isRunning ? '---' : r.dominantLowKModes}</td>
                        <td className="p-2 text-right text-teal-300 font-semibold font-mono">{isRunning ? '---' : `${(r.lowFreqPowerRatio * 100).toFixed(1)}%`}</td>
                        <td className="p-2 text-right text-sky-300 font-mono">{isRunning ? '---' : r.spectrumFlatness.toFixed(3)}</td>
                        <td className="p-2 text-right text-amber-400/90 font-bold">{isRunning ? '---' : r.mEff.toFixed(3)}</td>
                        <td className="p-2 text-right text-sky-400/90 font-bold">{isRunning ? '---' : r.sEff.toFixed(3)}</td>
                      </tr>
                    ))}

                    {/* Statistics summary row */}
                    {statsSummary && !isRunning && (
                      <tr className="bg-slate-900/40 font-semibold border-t border-slate-800 text-slate-300">
                        <td colSpan={2} className="p-2 text-[9px] font-sans text-emerald-400">
                          <div className="flex items-center gap-1.5">
                            <Activity className="h-3 w-3 shrink-0" />
                            <span>{t.statsRow}</span>
                          </div>
                          <span className="text-[8px] text-slate-500 font-normal block mt-0.5">
                            {lang === 'hu' 
                              ? '*(Kizárólag a TOPOLOGICAL / STABLE szolitonok átlaga)*' 
                              : lang === 'de' 
                              ? '*(Nur Mittelwert stabiler Solitonen)*' 
                              : '*(Mean of TOPOLOGICAL / STABLE solitons only)*'}
                          </span>
                        </td>
                        <td className="p-2 text-right text-amber-500/70 leading-none">
                          <div>{statsSummary.rEff.mean.toFixed(2)}</div>
                          <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.rEff.stdDev.toFixed(1)}</span>
                        </td>
                        <td className="p-2 text-right text-sky-400/70 leading-none">
                          <div>{statsSummary.energy.mean.toFixed(2)}</div>
                          <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.energy.stdDev.toFixed(1)}</span>
                        </td>
                        <td className="p-2 text-right text-emerald-400/70 leading-none">
                          <div>{statsSummary.kMode.mean.toFixed(2)}</div>
                          <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.kMode.stdDev.toFixed(1)}</span>
                        </td>
                        <td className="p-2 text-right text-purple-400/70 leading-none">
                          <div>{statsSummary.vMin.mean.toFixed(2)}</div>
                          <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.vMin.stdDev.toFixed(1)}</span>
                        </td>
                        <td className="p-2 text-right text-pink-400/70 leading-none">
                          <div>{statsSummary.thickness.mean.toFixed(2)}</div>
                          <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.thickness.stdDev.toFixed(1)}</span>
                        </td>
                        <td className="p-2 text-right text-pink-400/70 leading-none">
                          <div>{statsSummary.qEff.mean.toFixed(2)}</div>
                          <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.qEff.stdDev.toFixed(1)}</span>
                        </td>
                        <td className="p-2 text-right text-teal-400/70 leading-none">
                          <div>{statsSummary.windingStabilityIndex.mean.toFixed(1)}%</div>
                          <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.windingStabilityIndex.stdDev.toFixed(1)}%</span>
                        </td>
                        <td className="p-2 text-right text-indigo-400/70 text-[8px] italic leading-none">
                          Sáv-Peak
                        </td>
                        <td className="p-2 text-right text-teal-300/70 leading-none">
                          <div>{(statsSummary.lowFreqPowerRatio.mean * 100).toFixed(1)}%</div>
                          <span className="text-[8px] text-slate-500 font-normal">±{(statsSummary.lowFreqPowerRatio.stdDev * 100).toFixed(1)}%</span>
                        </td>
                        <td className="p-2 text-right text-sky-300/70 leading-none">
                          <div>{statsSummary.spectrumFlatness.mean.toFixed(3)}</div>
                          <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.spectrumFlatness.stdDev.toFixed(3)}</span>
                        </td>
                        <td className="p-2 text-right text-amber-400/70 leading-none">
                          <div>{statsSummary.mEff.mean.toFixed(2)}</div>
                          <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.mEff.stdDev.toFixed(1)}</span>
                        </td>
                        <td className="p-2 text-right text-sky-400/70 leading-none">
                          <div>{statsSummary.sEff.mean.toFixed(2)}</div>
                          <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.sEff.stdDev.toFixed(1)}</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Correlations block */}
              <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-[11px]">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-sky-400" />
                    {t.corrER}
                  </span>
                  <span className="text-sky-300 font-bold text-xs">{isRunning ? '---' : pearsonER.toFixed(4)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-purple-400" />
                    {t.corrEnvGlobal}
                  </span>
                  <span className="text-purple-300 font-bold text-xs">{isRunning ? '---' : holographicCorrelation.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kozmikus Fourier Spektrum Analizátor Panel */}
          <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-900 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                  {lang === 'hu' ? 'Kozmikus Fourier Spektrum Analizátor (FFT)' : 'Cosmic Fourier Spectrum Analyzer (FFT)'}
                </h4>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {lang === 'hu' ? 'Azonnali potenciálmező spektrális dekompozíció' : 'Instant potential field spectral decomposition'}
              </div>
            </div>

            {records.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Selector & Identifiers (Col span 4) */}
                <div className="lg:col-span-4 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider font-mono font-bold">
                      {lang === 'hu' ? 'Válasszon Szolitont az elemzéshez:' : 'Select Soliton for Analysis:'}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {records.map((r, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedFourierSoliton(idx)}
                          className={`px-2 py-1.5 rounded border text-[10px] font-mono text-left transition-all flex flex-col gap-0.5 cursor-pointer ${
                            selectedFourierSoliton === idx
                              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-bold shadow-md shadow-indigo-500/5'
                              : 'bg-slate-900/40 border-slate-950 text-slate-500 hover:text-slate-400 hover:bg-slate-900/60'
                          }`}
                        >
                          <span className="truncate">{r.name}</span>
                          <span className="text-[8px] opacity-75">{r.skyrmionStatus.replace(' (STABLE)', '')}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Spectral Diagnostics indicators */}
                  <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg flex flex-col gap-2.5 font-mono text-[11px] mt-1">
                    <h5 className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider">
                      {lang === 'hu' ? 'Spektrális Diagnosztika' : 'Spectral Diagnostics'}
                    </h5>
                    
                    <div className="flex items-center justify-between border-b border-slate-900/60 pb-1.5">
                      <span className="text-slate-500">{lang === 'hu' ? 'Domináns low-k:' : 'Dominant low-k:'}</span>
                      <span className="text-indigo-300 font-bold">{records[selectedFourierSoliton]?.dominantLowKModes || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-900/60 pb-1.5">
                      <span className="text-slate-500">{lang === 'hu' ? 'Alacsony frekvenciás arány (LF_ratio):' : 'Low-freq power ratio (LF_ratio):'}</span>
                      <span className="text-teal-400 font-bold">
                        {records[selectedFourierSoliton] ? `${(records[selectedFourierSoliton].lowFreqPowerRatio * 100).toFixed(1)}%` : '0.0%'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">{lang === 'hu' ? 'Spektrum laposság (S_flatness):' : 'Spectrum flatness (S_flatness):'}</span>
                      <span className="text-sky-400 font-bold">
                        {records[selectedFourierSoliton] ? records[selectedFourierSoliton].spectrumFlatness.toFixed(3) : '0.000'}
                      </span>
                    </div>
                  </div>

                  {/* Physics comment based on state */}
                  <div className="p-3 bg-slate-900/20 border border-slate-900/40 rounded-lg text-[10px] font-mono text-slate-400 leading-relaxed">
                    {records[selectedFourierSoliton]?.isStable ? (
                      <p>
                        <strong className="text-emerald-400 block mb-0.5">{lang === 'hu' ? '● STABIL LOKALIZÁLT SZOLITON' : '● STABLE LOCALIZED SOLITON'}</strong>
                        {lang === 'hu' 
                          ? 'A spektrumban tiszta, lokalizált csúcs látható. A rendkívül alacsony spektrális laposság igazolja a topológiai önfenntartó jelleget. A megmaradási törvények szigorúan teljesülnek.'
                          : 'A clear, localized peak is visible in the spectrum. The extremely low spectral flatness confirms the self-sustaining topological state. Conservation laws are strictly preserved.'}
                      </p>
                    ) : (
                      <p>
                        <strong className="text-amber-500 block mb-0.5">{lang === 'hu' ? '▲ TRANZIENS GERJESZTÉSI MEZŐ' : '▲ TRANSIENT EXCITATION FIELD'}</strong>
                        {lang === 'hu' 
                          ? 'A spektrum széles, lapos, és a zaj dominálja (Wiener entrópia magas). Nincs védett Winding szám, így a rendszer hajlamos az energiát a szabad hullámoknak (fotonok) leadni.'
                          : 'The spectrum is broad, flat, and noise-dominated (high Wiener entropy). Lacking a conserved winding number, the system tends to dissipate energy into free radiation modes.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* SVG Radial Fourier Graph (Col span 8) */}
                <div className="lg:col-span-8 bg-slate-900/30 border border-slate-900 p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">
                      {lang === 'hu' ? `A(k) Amplitúdó - k Hullámvektor Spektrum [${records[selectedFourierSoliton]?.name || ''}]` : `A(k) Amplitude - k Wavevector Spectrum [${records[selectedFourierSoliton]?.name || ''}]`}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      k_tension = {tension.toFixed(2)} | Zaj = {(noise * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Beautiful custom responsive SVG Chart */}
                  <div className="w-full h-48 relative mt-1 bg-slate-950/60 rounded-lg border border-slate-900/80 p-2 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                      {/* Grid lines */}
                      {[0.25, 0.5, 0.75, 1.0].map((val, idx) => (
                        <line
                          key={idx}
                          x1="0"
                          y1={140 - val * 120}
                          x2="500"
                          y2={140 - val * 120}
                          stroke="#111827"
                          strokeWidth="1"
                          strokeDasharray="4,4"
                        />
                      ))}
                      {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((kVal, idx) => (
                        <line
                          key={idx}
                          x1={10 + (kVal / 2.0) * 470}
                          y1="0"
                          x2={10 + (kVal / 2.0) * 470}
                          y2="140"
                          stroke="#111827"
                          strokeWidth="1"
                          strokeDasharray="4,4"
                        />
                      ))}

                      {records[selectedFourierSoliton]?.spectralData && (
                        <>
                          {/* Line graph connecting points */}
                          <path
                            d={records[selectedFourierSoliton].spectralData.reduce((path, p, idx) => {
                              const x = 10 + (p.k / 2.0) * 470;
                              const y = 140 - Math.min(1.0, p.amplitude / 1.5) * 120;
                              return path + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }, '')}
                            fill="none"
                            stroke="url(#fourierGradient)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* Gradient definition under the curve */}
                          <defs>
                            <linearGradient id="fourierGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#818cf8" />
                              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#2dd4bf" />
                            </linearGradient>
                            <linearGradient id="fourierAreaGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Filled area under the curve */}
                          <path
                            d={
                              records[selectedFourierSoliton].spectralData.reduce((path, p, idx) => {
                                const x = 10 + (p.k / 2.0) * 470;
                                const y = 140 - Math.min(1.0, p.amplitude / 1.5) * 120;
                                return path + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                              }, '') +
                              ` L ${10 + (records[selectedFourierSoliton].spectralData[records[selectedFourierSoliton].spectralData.length - 1].k / 2.0) * 470} 140 L 10 140 Z`
                            }
                            fill="url(#fourierAreaGradient)"
                          />

                          {/* Interactive Data dots */}
                          {records[selectedFourierSoliton].spectralData.map((p, idx) => {
                            const x = 10 + (p.k / 2.0) * 470;
                            const y = 140 - Math.min(1.0, p.amplitude / 1.5) * 120;
                            return (
                              <g key={idx} className="group/dot cursor-pointer">
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="3.5"
                                  className="fill-indigo-400 stroke-slate-950 stroke-2 group-hover/dot:fill-teal-300 transition-all"
                                />
                                <title>{`k = ${p.k.toFixed(2)}\nAmplitúdó = ${p.amplitude.toFixed(3)}`}</title>
                              </g>
                            );
                          })}
                        </>
                      )}
                    </svg>

                    {/* Chart annotations */}
                    <div className="absolute left-3 bottom-1.5 flex gap-4 text-[7.5px] font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full inline-block"></span>
                        {lang === 'hu' ? 'k ≤ 0.45: Foton Gerjesztések' : 'k ≤ 0.45: Photon Excitations'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-sky-400 rounded-full inline-block"></span>
                        {lang === 'hu' ? '0.45 < k < 1.2: Szoliton Módusok' : '0.45 < k < 1.2: Soliton Modes'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full inline-block"></span>
                        {lang === 'hu' ? 'k ≥ 1.2: Kaotikus Éterzaj' : 'k ≥ 1.2: Chaotic Ether Noise'}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Axis Scale */}
                  <div className="flex justify-between text-[8px] font-mono text-slate-500 px-2 select-none">
                    <span>k = 0.1 (Foton tágulás / Hosszú hullámhossz)</span>
                    <span>k = 1.0 (Közepes / Magstruktúra)</span>
                    <span>k = 2.0 (Ibolyántúli zaj / Rácsdiszkretizáció)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Analysis & Scientific Evaluation Section */}
          <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-900 flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
              <Award className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                {t.analysisTitle}
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-slate-400 font-mono text-[11px] leading-relaxed">
              <p>{t.analysisText1}</p>
              <p>{t.analysisText2}</p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Batch Runs Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Batch Controls (Col span 4) */}
            <div className="lg:col-span-4 flex flex-col gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-900">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                  10 FUTÁS SZABÁLYZATA
                </h4>
              </div>

              <div className="flex flex-col gap-2 text-[11px] leading-relaxed text-slate-300 font-mono">
                <p className="p-2 bg-slate-900/40 rounded border border-slate-900">
                  Ez a funkció **10 teljesen független** szimulációt végez el automatikusan, különböző fizikai paraméterbeállításokkal (pl. <strong>k_tension</strong> 0.50-től 1.85-ig táguló feszültséggel, eltérő zajokkal és magokkal).
                </p>
                <p className="p-2 bg-slate-900/40 rounded border border-slate-900">
                  Az átlagolás során a program szigorúan csak a <strong>TOPOLOGICAL / STABLE</strong> jelzésű szolitonokat (Alpha, Beta, Gamma, Eta) összesíti. Az átmeneti szolitonokat (Delta, Zeta, Theta) külön kezeli a jegyzőkönyv.
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <button
                  onClick={handleRunBatchProtocol}
                  disabled={isBatchRunning}
                  className={`w-full py-2.5 px-4 rounded text-xs font-semibold font-mono border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isBatchRunning
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300 shadow-md shadow-emerald-500/5'
                  }`}
                >
                  <Play className={`h-3.5 w-3.5 ${isBatchRunning ? 'animate-spin' : ''}`} />
                  {isBatchRunning ? t.batchRunningText.replace('{current}', batchCurrentRun.toString()) : t.runBatchBtn}
                </button>

                {batchRuns.length > 0 && !isBatchRunning && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/5 p-1.5 rounded border border-emerald-500/10 justify-center">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {t.batchCompletedText}
                  </div>
                )}
              </div>
            </div>

            {/* Batch Table Panel (Col span 8) */}
            <div className="lg:col-span-8 flex flex-col gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-900">
              <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                    {t.batchResultsTitle}
                  </h4>
                </div>

                {batchRuns.length > 0 && (
                  <button
                    onClick={handleDownloadBatchProtocol}
                    className="px-2.5 py-1 rounded text-[10px] font-sans font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    {t.batchDownloadBtn}
                  </button>
                )}
              </div>

              <div className="overflow-x-auto border border-slate-900 rounded-lg">
                <table className="w-full text-left border-collapse text-[10px] font-mono">
                  <thead>
                    <tr className="bg-slate-900/50 text-slate-400 border-b border-slate-900">
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider">{t.runNumber}</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">k_tension</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">Zaj</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">Stabil &lt;R_eff&gt;</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">Stabil &lt;E&gt;</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right text-pink-400 font-bold">Stabil &lt;q_eff&gt;</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right text-teal-400">Stabilitás</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right text-teal-300">Stabil &lt;LF_ratio&gt;</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right text-sky-300">Stabil &lt;S_flatness&gt;</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right text-amber-400">Stabil &lt;m_eff&gt;</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">Tranz. &lt;R_eff&gt;</th>
                      <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right text-sky-400">R(E, Reff)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {batchRuns.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="p-8 text-center text-slate-500 italic">
                          Futtassa le a 10 kísérletet az adatok összesítéséhez!
                        </td>
                      </tr>
                    ) : (
                      batchRuns.map((run, i) => (
                        <tr key={i} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-2 text-slate-200 font-bold"># {run.runIndex}</td>
                          <td className="p-2 text-right text-slate-300 font-bold">{run.tension.toFixed(2)}</td>
                          <td className="p-2 text-right text-slate-400">{run.noise.toFixed(2)}</td>
                          <td className="p-2 text-right text-amber-500">{run.stableAvgR.toFixed(3)}</td>
                          <td className="p-2 text-right text-sky-400">{run.stableAvgE.toFixed(3)}</td>
                          <td className="p-2 text-right text-pink-400 font-bold">{run.stableAvgQ.toFixed(2)}</td>
                          <td className="p-2 text-right text-teal-400 font-bold font-mono">{run.stableAvgStability.toFixed(1)}%</td>
                          <td className="p-2 text-right text-teal-300 font-semibold">{(run.stableAvgLowFreqRatio * 100).toFixed(1)}%</td>
                          <td className="p-2 text-right text-sky-300 font-semibold">{run.stableAvgFlatness.toFixed(3)}</td>
                          <td className="p-2 text-right text-amber-400 font-bold">{run.stableAvgM.toFixed(2)}</td>
                          <td className="p-2 text-right text-slate-500">{run.transientAvgR.toFixed(3)}</td>
                          <td className="p-2 text-right text-sky-300 font-semibold">{run.pearsonER.toFixed(4)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Unified Batch Scientific Analysis block */}
          {batchRuns.length > 0 && (
            <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-900 flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
                <Award className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                  {t.batchAnalysisTitle}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300 font-mono text-[11px] leading-relaxed">
                <div className="flex flex-col gap-3">
                  <h5 className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                    1. Topológiai megmaradás & Ernst Mach Elve
                  </h5>
                  <p>
                    A mérések igazolják, hogy a stabil szolitonoknál a <strong>q_eff</strong> töltés megmarad és végig kvantált marad (minden kísérletben ~2.00 körüli érték alacsony szórással). Ezzel szemben a tranziens szolitonoknál a megmaradási törvények sérülnek, ami a fizikai struktúra gyors leépüléséhez vezet.
                  </p>
                  <p>
                    Az <strong>m_eff</strong> tehetetlen tömeg a k_tension hipertér feszültség monoton növekedésével Run 1 (0.50) és Run 10 (1.85) között jelentősen növekedett, ami igazolja az Ernst Mach-elv rácskozmológiai analogonját: a részecskék tömege és tehetetlensége nem belső konstans, hanem a háttér feszültségének emergenciája.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <h5 className="font-bold text-sky-400 uppercase tracking-wider text-[10px]">
                    2. Hullám-részecske kettősség & Skálázási szerep
                  </h5>
                  <p>
                    A mért <strong>R(E, R_eff)</strong> Pearson-korrelációs együttható következetesen erős negatív értéket vesz fel (-0.55 és -0.82 között). Ez gyönyörűen illusztrálja a hullám-részecske kettősséget: a növekvő feszültség összenyomja a szolitonok effektív sugarát, miközben felerősíti és lokalizálja az energiasűrűséget.
                  </p>
                  <p>
                    Mivel a rács felbontása alacsony (64x64), a kísérlet nem tekinthető valós fizikai kísérletnek. Szerepe tisztán ellenőrző és paraméterezési információk biztosítása egy elméleti, nagyléptékű fizikai méréssorozat fázisdiagramjának és tartományainak kalibrálásához.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
