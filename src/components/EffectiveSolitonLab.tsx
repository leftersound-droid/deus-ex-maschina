/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  Zap,
  Activity,
  Compass,
  Cpu,
  HelpCircle,
  Layers,
  Settings,
  Boxes,
  ArrowRightLeft,
  Info,
  Sliders,
  Scale,
  TrendingUp,
  Flame,
  LineChart
} from 'lucide-react';
import { GrowingR4Model, Coord4D } from '../model/toyModel';
import { EffectiveSoliton, SolitonObstacle } from '../model/EffectiveSoliton';
import { extractSolitonParameters, SolitonAnalysisParams } from '../analysis/solitonAnalyzer';

interface EffectiveSolitonLabProps {
  model: GrowingR4Model;
  lang: 'hu' | 'en' | 'de';
}

export const EffectiveSolitonLab: React.FC<EffectiveSolitonLabProps> = ({ model, lang }) => {
  // Main simulator state for the effective environment
  const [solitons, setSolitons] = useState<EffectiveSoliton[]>([]);
  const [obstacles, setObstacles] = useState<SolitonObstacle[]>([]);
  const [selectedSolitonId, setSelectedSolitonId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  
  // Physics environment constants
  const [simSpeed, setSimSpeed] = useState<number>(1.2);
  const [damping, setDamping] = useState<number>(0.003);
  const [tension, setTension] = useState<number>(0.4);
  const [gravityScale, setGravityScale] = useState<number>(1.2);

  // Scanned / Extracted reference from main model
  const [analysisResult, setAnalysisResult] = useState<SolitonAnalysisParams | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // ------------------------------------------------------------------------------
  // MODULE 1: SOLITON SAMPLER & PARAMETER DESIGNER STATE
  // ------------------------------------------------------------------------------
  
  // Soliton 1 config
  const [s1Preset, setS1Preset] = useState<string>('alpha');
  const [s1Winding, setS1Winding] = useState<number>(1);
  const [s1Radius, setS1Radius] = useState<number>(2.4);
  const [s1Energy, setS1Energy] = useState<number>(1.2e6);
  const [s1KMode, setS1KMode] = useState<number>(0.8);
  const [s1X, setS1X] = useState<number>(-3.5);
  const [s1Y, setS1Y] = useState<number>(0.0);
  const [s1W, setS1W] = useState<number>(0.05);
  const [s1Vx, setS1Vx] = useState<number>(0.0);
  const [s1Vy, setS1Vy] = useState<number>(1.6);
  const [s1Vw, setS1Vw] = useState<number>(0.1);

  // Soliton 2 config
  const [s2Preset, setS2Preset] = useState<string>('beta');
  const [s2Winding, setS2Winding] = useState<number>(-1);
  const [s2Radius, setS2Radius] = useState<number>(2.4);
  const [s2Energy, setS2Energy] = useState<number>(1.2e6);
  const [s2KMode, setS2KMode] = useState<number>(0.8);
  const [s2X, setS2X] = useState<number>(3.5);
  const [s2Y, setS2Y] = useState<number>(0.0);
  const [s2W, setS2W] = useState<number>(-0.05);
  const [s2Vx, setS2Vx] = useState<number>(0.0);
  const [s2Vy, setS2Vy] = useState<number>(-1.6);
  const [s2Vw, setS2Vw] = useState<number>(-0.1);

  // Canvas ref and interaction state
  const [placeMode, setPlaceMode] = useState<'none' | 'well' | 'barrier'>('none');
  const xyCanvasRef = useRef<HTMLCanvasElement>(null);
  const zwCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Live simulation history tracking for charts (scrolling timeline)
  const [timelineData, setTimelineData] = useState<{
    step: number;
    distance: number;
    relVel: number;
    overlapPot: number;
    eKin: number;
    eTotal: number;
  }[]>([]);
  const timelineStepRef = useRef<number>(0);

  // Bilingual translation dictionary
  const text = useMemo(() => {
    const translations = {
      hu: {
        title: 'Szoliton Spektrál- és Dinamikai Laboratórium',
        subtitle: 'Két-szoliton szórás, kötött állapotok és fázis-hullámfrekvencia moduláció ℝ⁴-ben',
        extractBtn: 'Szkennelés a fő rácsból',
        extractSuccess: 'Sikeresen kinyerve!',
        noAnalysis: 'Még nincs kinyert adat. Nyomja meg a gombot az aktív rács letapogatásához!',
        radialProfile: 'Projektált Sugár-Potenciál V(r)',
        fourierSpectrum: 'Frekvencia Spektrum (Fourier)',
        
        // Sampler labels
        samplerTitle: '1. Modul: Szoliton Mintavételező & Paraméter Tervező',
        samplerDesc: 'Válassza ki vagy konfigurálja a két vizsgálandó szoliton tulajdonságait és kiindulási pályáját.',
        soliton1: '1. Szoliton (Rózsaszín)',
        soliton2: '2. Szoliton (Smaragdzöld)',
        presetLabel: 'Minta-Sablon:',
        chargeLabel: 'Topológiai Töltés (Q):',
        radiusLabel: 'Effektív sugár (R_eff):',
        energyLabel: 'Középponti Feszültség (V_max):',
        kModeLabel: 'Belső Hullámhossz (k_mode):',
        positionLabel: 'Kezdeti Pozíció (X, Y, W):',
        velocityLabel: 'Kezdeti Sebesség (Vx, Vy, Vw):',
        loadPairBtn: 'Kiválasztott Pár Betöltése a Szimulátorba',
        
        // Lab labels
        labTitle: '2. Modul: Effektív Kontrollált Környezet (ℝ⁴ Szimulátor)',
        labDesc: 'A szolitonok 100%-ban az eredeti téregyenletek gradiens-áramlása szerint lépnek kölcsönhatásba.',
        simSpeed: 'Szimulációs sebesség:',
        dampingLabel: 'Közegellenállás / Disszipáció:',
        tensionLabel: 'Hipertér Feszülés:',
        gravityScaleLabel: 'Emergens Csatolási Erő (G):',
        canvasXYTitle: 'ℝ² Vetületi Sík (X-Y)',
        canvasZWTitle: 'ℝ² Hipersík Rezgés (Z-W)',
        placeWell: 'Vonzó potenciálgödör',
        placeBarrier: 'Taszító potenciálgát',
        clearBtn: 'Reset / Alaphelyzet',
        pulseBtn: 'Perturbációs lökés',
        
        // Diagnostics
        diagnosticsTitle: 'Valós Idejű Ütközés-Dinamika Diagnosztika',
        distance: 'Távolság (d):',
        relVel: 'Relatív sebesség (v_rel):',
        overlapPot: 'Csatolási Potenciál (V_overlap):',
        kineticEnergy: 'Relatív Kinetikus Energia (E_kin):',
        totalEnergy: 'Teljes Relatív Energia (E_tot):',
        stateLabel: 'Kölcsönhatási Állapot:',
        stateBound: 'KÖTÖTT PÁLYA / ORBIT (E_tot < 0)',
        stateScattering: 'SZÓRÁSI MEZŐ (E_tot >= 0)',
        stateAnnihilation: 'KÖZELI ANNIHILÁCIÓS SÁV!',
        stateDecoupled: 'NINCS KAPCSOLAT (Távoli)',
        mass: 'Dinamikus tehetetlen tömeg:',
        
        timelineTitle: 'Dinamikai Idővonal (Utolsó 100 lépés)',
        timelineDesc: 'Távolság (Rózsaszín) és Relatív Sebesség (Cián) folyamatos regisztrációja',
        fourierCompTitle: 'Belső Hullám-Spektrumok Összehasonlítása',
        fourierCompDesc: 'Az 1. (Rózsaszín) és 2. (Smaragd) szolitonok fázis-rezgési spektrumának eloszlása',
        
        limitsTitle: 'Fizikai Hatásmechanizmus & Magyarázat',
        limitsText: 'A szimulátor nem pontszerű részecskéket modellez, hanem kiterjedt hullámcsomagokat. Az interakció a szolitondominált potenciálgödrök átfedésének gradienséből (erőhatás) és a 4. dimenziós w-feszültségből fakad. Az ellentétes topológiai winding számú (W+ és W-) szolitonok vonzzák egymást, míg az azonosak taszítják vagy bonyolult szóródást mutatnak. A w-kitérés a Mach-elv szerint folyamatosan modulálja a belső tömeget és a Fourier spektrum belső módusait.'
      },
      en: {
        title: 'Soliton Spectral & Dynamics Laboratory',
        subtitle: 'Two-soliton scattering, bound states, and phase-wave frequency modulation in ℝ⁴',
        extractBtn: 'Scan Main Grid Parameters',
        extractSuccess: 'Successfully Extracted!',
        noAnalysis: 'No scanned data yet. Click the button above to probe the active 4D lattice!',
        radialProfile: 'Projected Radial Potential V(r)',
        fourierSpectrum: 'Frequency Spectrum (Fourier)',
        
        // Sampler labels
        samplerTitle: 'Module 1: Soliton Sampler & Parameter Designer',
        samplerDesc: 'Select or custom design the physical criteria and initial orbital trajectories for two test solitons.',
        soliton1: 'Soliton 1 (Pink / W+)',
        soliton2: 'Soliton 2 (Emerald / W-)',
        presetLabel: 'Sample Preset:',
        chargeLabel: 'Topological Charge (Q):',
        radiusLabel: 'Effective Radius (R_eff):',
        energyLabel: 'Core Central Potential (V_max):',
        kModeLabel: 'Internal Wavelength (k_mode):',
        positionLabel: 'Initial Position (X, Y, W):',
        velocityLabel: 'Initial Velocity (Vx, Vy, Vw):',
        loadPairBtn: 'Load Configured Pair to Simulation',
        
        // Lab labels
        labTitle: 'Module 2: Effective Controlled Environment (ℝ⁴ Simulator)',
        labDesc: 'Simulates the two solitons interacting 100% via gradient flow of overlapping potential wave-packets.',
        simSpeed: 'Simulation Speed:',
        dampingLabel: 'Viscosity / Damping:',
        tensionLabel: 'Hyperspace Tension:',
        gravityScaleLabel: 'Emergent Gravity Scale (G):',
        canvasXYTitle: 'ℝ² Projected Plane (X-Y)',
        canvasZWTitle: 'ℝ² Hypersheet Oscillation (Z-W)',
        placeWell: 'Place Potential Well',
        placeBarrier: 'Place Potential Barrier',
        clearBtn: 'Reset All',
        pulseBtn: 'Pulse Perturbation',
        
        // Diagnostics
        diagnosticsTitle: 'Real-Time Collision & Dynamics Diagnostics',
        distance: 'Distance (d):',
        relVel: 'Relative velocity (v_rel):',
        overlapPot: 'Overlap Potential (V_overlap):',
        kineticEnergy: 'Relative Kinetic Energy (E_kin):',
        totalEnergy: 'Total Relative Energy (E_tot):',
        stateLabel: 'Interaction State:',
        stateBound: 'BOUND ORBIT / LOCK (E_tot < 0)',
        stateScattering: 'SCATTERING ZONE (E_tot >= 0)',
        stateAnnihilation: 'CLOSE ANNIHILATION BAND!',
        stateDecoupled: 'DECOUPLED (Far apart)',
        mass: 'Dynamic inertial mass:',
        
        timelineTitle: 'Dynamics Timeline (Last 100 steps)',
        timelineDesc: 'Continuous tracking of Distance (Pink) and Relative Velocity (Cyan)',
        fourierCompTitle: 'Internal Wave Spectrum Comparison',
        fourierCompDesc: 'Fourier vibration spectra of Soliton 1 (Pink) vs. Soliton 2 (Emerald)',
        
        limitsTitle: 'Physical Mechanism & Intuition',
        limitsText: 'Instead of point masses, this sandbox simulates extended wave envelopes. The emergent force is computed via the gradient of overlapping potential structures combined with 4D w-tension. Solitons with opposite topological winding charges (W+ and W-) attract, whereas identical charges repel. Out-of-plane w-displacement dynamically modulates the inertial mass (Mach\'s Principle) and shifts internal spectral modes.'
      },
      de: {
        title: 'Spektral- und Dynamiklabor für Solitonen',
        subtitle: 'Zwei-Solitonen-Streuung, gebundene Zustände und Phasenwellenmodulation in ℝ⁴',
        extractBtn: 'Hauptgitter scannen',
        extractSuccess: 'Erfolgreich extrahiert!',
        noAnalysis: 'Noch keine Scandaten. Klicken Sie auf die Schaltfläche oben, um das aktive Gitter zu scannen!',
        radialProfile: 'Projiziertes radiales Potenzial V(r)',
        fourierSpectrum: 'Frequenzspektrum (Fourier)',
        
        // Sampler labels
        samplerTitle: 'Modul 1: Solitonen-Sampler & Parameterdesigner',
        samplerDesc: 'Wählen oder entwerfen Sie die physikalischen Kriterien und orbitalen Trajektorien zweier Testsolitonen.',
        soliton1: 'Soliton 1 (Rosa / W+)',
        soliton2: 'Soliton 2 (Smaragd / W-)',
        presetLabel: 'Muster-Vorlage:',
        chargeLabel: 'Topologische Ladung (Q):',
        radiusLabel: 'Effektiver Radius (R_eff):',
        energyLabel: 'Zentrales Potenzial (V_max):',
        kModeLabel: 'Interne Wellenlänge (k_mode):',
        positionLabel: 'Startposition (X, Y, W):',
        velocityLabel: 'Startgeschwindigkeit (Vx, Vy, Vw):',
        loadPairBtn: 'Ausgewähltes Paar in Simulator laden',
        
        // Lab labels
        labTitle: 'Modul 2: Effektive kontrollierte Umgebung (ℝ⁴ Simulator)',
        labDesc: 'Simuliert die Interaktion zweier Solitonen basierend auf dem Gradientenfluss überlappender Wellenpakete.',
        simSpeed: 'Simulationsgeschwindigkeit:',
        dampingLabel: 'Viskosität / Dämpfung:',
        tensionLabel: 'Hyperraum-Spannung:',
        gravityScaleLabel: 'Emergente Gravitationsstärke (G):',
        canvasXYTitle: 'ℝ² Projektionsebene (X-Y)',
        canvasZWTitle: 'ℝ² Hyperflächen-Schwingung (Z-W)',
        placeWell: 'Potenzialtrichter platzieren',
        placeBarrier: 'Potenzialbarriere platzieren',
        clearBtn: 'Zurücksetzen',
        pulseBtn: 'Perturbationsimpuls',
        
        // Diagnostics
        diagnosticsTitle: 'Echtzeit-Kollisionsdiagnostik',
        distance: 'Abstand (d):',
        relVel: 'Relative Geschwindigkeit (v_rel):',
        overlapPot: 'Überlappungspotenzial (V_overlap):',
        kineticEnergy: 'Relative kinetische Energie (E_kin):',
        totalEnergy: 'Gesamtenergie (E_tot):',
        stateLabel: 'Interaktionszustand:',
        stateBound: 'GEBUNDENER ORBIT (E_tot < 0)',
        stateScattering: 'STREUUNGSBEREICH (E_tot >= 0)',
        stateAnnihilation: 'KRITISCHER ANNIHILATIONSBEREICH!',
        stateDecoupled: 'ENTKOPPELT (Zu weit entfernt)',
        mass: 'Dynamische träge Masse:',
        
        timelineTitle: 'Dynamik-Zeitachse (Letzte 100 Schritte)',
        timelineDesc: 'Laufende Aufzeichnung von Abstand (Rosa) und relativer Geschwindigkeit (Cyan)',
        fourierCompTitle: 'Vergleich der internen Wellenspektren',
        fourierCompDesc: 'Fourier-Schwingungsspektrum von Soliton 1 (Rosa) im Vergleich zu Soliton 2 (Smaragd)',
        
        limitsTitle: 'Physikalische Erklärung & Gesetzmäßigkeiten',
        limitsText: 'Anstelle von Punktmassen werden hier ausgedehnte Wellenhüllen simuliert. Die emergente Anziehungskraft resultiert aus dem Gradienten überlappender Potenziale kombiniert mit 4D-w-Spannung. Solitonen mit entgegengesetzten Ladungen (W+ und W-) ziehen sich an, wohingegen gleichnamige Ladungen einander abstoßen. W-Achsen-Abweichungen modulieren die träge Masse (Machsches Prinzip) und verändern die Fourier-Moden.'
      }
    };
    return translations[lang] || translations.en;
  }, [lang]);

  // Handle preset selection for Soliton 1
  useEffect(() => {
    if (s1Preset === 'alpha') {
      setS1Winding(1); setS1Radius(2.4); setS1Energy(1.2e6); setS1KMode(0.8);
      setS1X(-3.5); setS1Y(0.0); setS1W(0.05); setS1Vx(0.0); setS1Vy(1.6); setS1Vw(0.1);
    } else if (s1Preset === 'beta') {
      setS1Winding(-1); setS1Radius(2.4); setS1Energy(1.2e6); setS1KMode(0.8);
      setS1X(-3.5); setS1Y(0.0); setS1W(0.05); setS1Vx(0.0); setS1Vy(1.6); setS1Vw(0.1);
    } else if (s1Preset === 'scatter') {
      setS1Winding(1); setS1Radius(1.6); setS1Energy(8e5); setS1KMode(1.2);
      setS1X(-7.0); setS1Y(-1.0); setS1W(0.0); setS1Vx(4.2); setS1Vy(0.5); setS1Vw(0.0);
    } else if (s1Preset === 'coaxial') {
      setS1Winding(1); setS1Radius(3.2); setS1Energy(2.0e6); setS1KMode(0.4);
      setS1X(-2.0); setS1Y(2.0); setS1W(0.3); setS1Vx(-0.5); setS1Vy(-1.0); setS1Vw(0.4);
    } else if (s1Preset === 'scanned' && analysisResult) {
      setS1Winding(1);
      setS1Radius(Number(analysisResult.effectiveRadius.toFixed(2)) || 2.4);
      setS1Energy(analysisResult.maxPotential || 1.2e6);
      setS1KMode(0.8); // reference baseline
      setS1X(-3.0); setS1Y(0.0); setS1W(0.1); setS1Vx(0.2); setS1Vy(1.2); setS1Vw(0.05);
    }
  }, [s1Preset, analysisResult]);

  // Handle preset selection for Soliton 2
  useEffect(() => {
    if (s2Preset === 'alpha') {
      setS2Winding(1); setS2Radius(2.4); setS2Energy(1.2e6); setS2KMode(0.8);
      setS2X(3.5); setS2Y(0.0); setS2W(-0.05); setS2Vx(0.0); setS2Vy(-1.6); setS2Vw(-0.1);
    } else if (s2Preset === 'beta') {
      setS2Winding(-1); setS2Radius(2.4); setS2Energy(1.2e6); setS2KMode(0.8);
      setS2X(3.5); setS2Y(0.0); setS2W(-0.05); setS2Vx(0.0); setS2Vy(-1.6); setS2Vw(-0.1);
    } else if (s2Preset === 'scatter') {
      setS2Winding(-1); setS2Radius(2.0); setS2Energy(1e6); setS2KMode(1.0);
      setS2X(1.0); setS2Y(-2.5); setS2W(0.0); setS2Vx(-1.0); setS2Vy(1.0); setS2Vw(0.0);
    } else if (s2Preset === 'coaxial') {
      setS2Winding(-1); setS2Radius(3.2); setS2Energy(2.0e6); setS2KMode(0.4);
      setS2X(2.0); setS2Y(-2.0); setS2W(-0.3); setS2Vx(0.5); setS2Vy(1.0); setS2Vw(-0.4);
    } else if (s2Preset === 'scanned' && analysisResult) {
      setS2Winding(-1);
      setS2Radius(Number(analysisResult.effectiveRadius.toFixed(2)) || 2.4);
      setS2Energy(analysisResult.maxPotential || 1.2e6);
      setS2KMode(0.8);
      setS2X(3.0); setS2Y(0.0); setS2W(-0.1); setS2Vx(-0.2); setS2Vy(-1.2); setS2Vw(-0.05);
    }
  }, [s2Preset, analysisResult]);

  // Probe main grid to scan real soliton parameters
  const handleExtractFromGrid = () => {
    const params = extractSolitonParameters(model);
    if (params) {
      setAnalysisResult(params);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      // Auto switch custom configurations to let the user select scanned parameters
      if (s1Preset === 'scanned') {
        setS1Radius(Number(params.effectiveRadius.toFixed(2)) || 2.4);
        setS1Energy(params.maxPotential || 1.2e6);
      }
      if (s2Preset === 'scanned') {
        setS2Radius(Number(params.effectiveRadius.toFixed(2)) || 2.4);
        setS2Energy(params.maxPotential || 1.2e6);
      }
    }
  };

  // Load Sampler pair into active simulator
  const handleLoadPair = () => {
    setSelectedSolitonId(null);
    setObstacles([]);
    setTimelineData([]);
    timelineStepRef.current = 0;

    // Build energy profiles based on R_eff and maxPotential
    const defProfile1 = [1.0, 0.85, 0.6, 0.4, 0.22, 0.1, 0.04, 0.01].map(v => v * (s1KMode * 1.1));
    const defProfile2 = [1.0, 0.85, 0.6, 0.4, 0.22, 0.1, 0.04, 0.01].map(v => v * (s2KMode * 1.1));

    // Fourier modes are determined by internal wavelength (k_mode)
    const fourier1 = [0.15 * s1KMode, 0.08 * s1KMode, 0.04 * s1KMode, 0.01];
    const fourier2 = [0.15 * s2KMode, 0.08 * s2KMode, 0.04 * s2KMode, 0.01];

    const s1 = new EffectiveSoliton(
      'soliton-1',
      [s1X, s1Y, 0, s1W],
      [s1Vx, s1Vy, 0, s1Vw],
      s1Radius,
      s1Energy,
      defProfile1,
      fourier1,
      s1Winding
    );

    const s2 = new EffectiveSoliton(
      'soliton-2',
      [s2X, s2Y, 0, s2W],
      [s2Vx, s2Vy, 0, s2Vw],
      s2Radius,
      s2Energy,
      defProfile2,
      fourier2,
      s2Winding
    );

    setSolitons([s1, s2]);
    setSelectedSolitonId('soliton-1');
  };

  // Initialize once on mount with default pair
  useEffect(() => {
    handleLoadPair();
  }, []);

  // Run physical update steps and sync canvas renderings
  useEffect(() => {
    const updatePhysics = (timestamp: number) => {
      if (!lastUpdateTimeRef.current) lastUpdateTimeRef.current = timestamp;
      const elapsed = (timestamp - lastUpdateTimeRef.current) / 1000;
      lastUpdateTimeRef.current = timestamp;

      if (isRunning && elapsed > 0) {
        // Safe time step bound to avoid numerical overflows
        const dt = Math.min(0.025, elapsed) * simSpeed;

        setSolitons(prev => {
          if (prev.length < 2) return prev;
          
          const s1_new = prev[0].clone();
          const s2_new = prev[1].clone();

          // Step each relative to the environment and the other
          s1_new.step(obstacles, prev, dt, tension, damping, gravityScale);
          s2_new.step(obstacles, prev, dt, tension, damping, gravityScale);

          // Track telemetry stats in scrolling history log once every 3 updates to be efficient
          timelineStepRef.current += 1;
          if (timelineStepRef.current % 3 === 0) {
            const dx = s1_new.position[0] - s2_new.position[0];
            const dy = s1_new.position[1] - s2_new.position[1];
            const dz = s1_new.position[2] - s2_new.position[2];
            const dw = s1_new.position[3] - s2_new.position[3];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz + dw*dw);

            const dxV = s1_new.velocity[0] - s2_new.velocity[0];
            const dyV = s1_new.velocity[1] - s2_new.velocity[1];
            const dzV = s1_new.velocity[2] - s2_new.velocity[2];
            const dwV = s1_new.velocity[3] - s2_new.velocity[3];
            const relVel = Math.sqrt(dxV*dxV + dyV*dyV + dzV*dzV + dwV*dwV);

            // Compute overlapping binding potential energy V_overlap
            const beta = 1.2 / ((s1_new.radius + s2_new.radius) / 2);
            const G = 0.15 * gravityScale;
            const signMultiplier = s1_new.topologicalCharge * s2_new.topologicalCharge < 0 ? -1.0 : (s1_new.topologicalCharge === 0 || s2_new.topologicalCharge === 0 ? -0.2 : 1.0);
            const overlapPot = signMultiplier * G * Math.sqrt(s1_new.maxPotential * s2_new.maxPotential) / (Math.cosh(beta * dist) ** 2);

            // Kinetic energy in relative coordinate system: E_kin = 0.5 * mu * v_rel^2
            const mu = (s1_new.mass * s2_new.mass) / (s1_new.mass + s2_new.mass + 1e-5);
            const eKin = 0.5 * mu * (relVel * relVel);
            const eTotal = eKin + overlapPot;

            setTimelineData(h => {
              const updated = [...h, {
                step: timelineStepRef.current,
                distance: dist,
                relVel: relVel,
                overlapPot: overlapPot,
                eKin: eKin,
                eTotal: eTotal
              }];
              if (updated.length > 100) updated.shift();
              return updated;
            });
          }

          return [s1_new, s2_new];
        });
      }

      // Re-draw stages
      drawXYCanvas();
      drawZWCanvas();

      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animationFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, obstacles, simSpeed, tension, damping, gravityScale]);

  // Render the XY projection membrane
  const drawXYCanvas = () => {
    const canvas = xyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Dark sleek workspace bg
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    // Map [-10, 10] coordinate box to pixels
    const mapX = (x: number) => ((x + 10) / 20) * w;
    const mapY = (y: number) => ((10 - y) / 20) * h;
    const mapRadius = (r: number) => (r / 20) * w;

    // Coordinate grid overlay
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 1.0;
    for (let i = -10; i <= 10; i += 2) {
      if (i === 0) continue;
      // Verticals
      ctx.beginPath();
      ctx.moveTo(mapX(i), 0);
      ctx.lineTo(mapX(i), h);
      ctx.stroke();

      // Horizontals
      ctx.beginPath();
      ctx.moveTo(0, mapY(i));
      ctx.lineTo(w, mapY(i));
      ctx.stroke();
    }

    // Centered physical axes
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mapX(0), 0); ctx.lineTo(mapX(0), h);
    ctx.moveTo(0, mapY(0)); ctx.lineTo(w, mapY(0));
    ctx.stroke();

    // Render obstacles (Wells & Barriers)
    obstacles.forEach(obs => {
      const x = mapX(obs.position[0]);
      const y = mapY(obs.position[1]);
      const r = mapRadius(obs.radius);

      const radGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
      if (obs.type === 'barrier') {
        radGrad.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        radGrad.addColorStop(0.6, 'rgba(239, 68, 68, 0.12)');
        radGrad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
      } else {
        radGrad.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
        radGrad.addColorStop(0.6, 'rgba(14, 165, 233, 0.12)');
        radGrad.addColorStop(1, 'rgba(14, 165, 233, 0.0)');
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.45)';
      }

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fill();

      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(x, y, r * 0.85, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Render Solitons
    solitons.forEach((sol, idx) => {
      const x = mapX(sol.position[0]);
      const y = mapY(sol.position[1]);
      const r = mapRadius(sol.radius);
      const isS1 = idx === 0;

      // Trajectory tail
      if (sol.history.length > 1) {
        ctx.beginPath();
        ctx.moveTo(mapX(sol.history[0][0]), mapY(sol.history[0][1]));
        for (let i = 1; i < sol.history.length; i++) {
          ctx.lineTo(mapX(sol.history[i][0]), mapY(sol.history[i][1]));
        }
        ctx.strokeStyle = isS1 ? 'rgba(244, 63, 94, 0.45)' : 'rgba(16, 185, 129, 0.45)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // Outer wave envelope glow
      const solGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 1.6);
      const colorHex = isS1 ? '244, 63, 94' : '16, 185, 129';
      solGrad.addColorStop(0, `rgba(${colorHex}, 0.65)`);
      solGrad.addColorStop(0.4, `rgba(${colorHex}, 0.22)`);
      solGrad.addColorStop(0.8, `rgba(${colorHex}, 0.05)`);
      solGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = solGrad;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.6, 0, 2 * Math.PI);
      ctx.fill();

      // Sharp localized core
      ctx.fillStyle = isS1 ? '#f43f5e' : '#10b981';
      ctx.beginPath();
      ctx.arc(x, y, Math.max(3, r * 0.15), 0, 2 * Math.PI);
      ctx.fill();

      // Halo ring representing core limits
      ctx.strokeStyle = isS1 ? 'rgba(244, 63, 94, 0.35)' : 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.stroke();

      // Labeling the topological state
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const qSign = sol.topologicalCharge > 0 ? `+${sol.topologicalCharge}` : `${sol.topologicalCharge}`;
      ctx.fillText(`Soliton ${idx+1} [Q=${qSign}]`, x, y - r * 1.1 - 5);
    });
  };

  // Render the ZW hyperspace oscillation (Z dimension as horizontal, W coordinate as vertical)
  const drawZWCanvas = () => {
    const canvas = zwCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    // Lateral mapping: map X coord from [-10, 10] to horizontal pixels, W coord from [-1.5, 1.5] to vertical pixels
    const mapZ = (z: number) => ((z + 10) / 20) * w;
    const mapW = (wv: number) => ((1.5 - wv) / 3) * h;

    // Membrane sheets (flat references at w = 0)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, mapW(0));
    ctx.lineTo(w, mapW(0));
    ctx.stroke();

    // Helper bounds
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, mapW(0.5)); ctx.lineTo(w, mapW(0.5));
    ctx.moveTo(0, mapW(-0.5)); ctx.lineTo(w, mapW(-0.5));
    ctx.stroke();
    ctx.setLineDash([]);

    // Render Solitons
    solitons.forEach((sol, idx) => {
      const zVal = sol.position[0]; // using X-coord projection as lateral horizontal
      const wVal = sol.position[3]; // out-of-membrane fluctuation (W-coord)
      const isS1 = idx === 0;

      const x = mapZ(zVal);
      const y = mapW(wVal);

      // Vertical tension thread connecting back to membrane w = 0
      ctx.strokeStyle = isS1 ? 'rgba(244, 63, 94, 0.18)' : 'rgba(16, 185, 129, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, mapW(0));
      ctx.lineTo(x, y);
      ctx.stroke();

      // ZW Trajectory tail
      if (sol.history.length > 1) {
        ctx.beginPath();
        ctx.moveTo(mapZ(sol.history[0][0]), mapW(sol.history[0][3]));
        for (let i = 1; i < sol.history.length; i++) {
          ctx.lineTo(mapZ(sol.history[i][0]), mapW(sol.history[i][3]));
        }
        ctx.strokeStyle = isS1 ? 'rgba(244, 63, 94, 0.28)' : 'rgba(16, 185, 129, 0.28)';
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }

      // Fluctuation packet
      const rPx = Math.max(5, (sol.radius / 20) * w);
      const zwGrad = ctx.createRadialGradient(x, y, 0, x, y, rPx * 1.5);
      const col = isS1 ? '244, 63, 94' : '16, 185, 129';
      zwGrad.addColorStop(0, `rgba(${col}, 0.8)`);
      zwGrad.addColorStop(0.4, `rgba(${col}, 0.25)`);
      zwGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = zwGrad;
      ctx.beginPath();
      ctx.arc(x, y, rPx * 1.5, 0, 2 * Math.PI);
      ctx.fill();

      // Central core dot
      ctx.fillStyle = isS1 ? '#f43f5e' : '#10b981';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  // Add customized obstacle wells/barriers via click
  const handleXYCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (placeMode === 'none') return;
    const canvas = xyCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const simX = ((clickX / canvas.width) * 20) - 10;
    const simY = (10 - (clickY / canvas.height) * 20);

    const isWell = placeMode === 'well';
    const newObstacle: SolitonObstacle = {
      id: `obs-${Date.now()}`,
      position: [simX, simY, 0, 0],
      potential: isWell ? -1.2e6 : 1.5e6,
      radius: isWell ? 2.4 : 1.6,
      type: isWell ? 'well' : 'barrier'
    };

    setObstacles(prev => [...prev, newObstacle]);
    setPlaceMode('none');
  };

  // Apply localized perturbation pulse to selected soliton
  const handleTriggerPulse = () => {
    if (solitons.length > 0) {
      setSolitons(prev => prev.map((s, idx) => {
        const cloned = s.clone();
        // Give a strong opposing impulse to spark chaotic interaction
        const sign = idx === 0 ? 1 : -1;
        cloned.applyPulse([
          sign * (Math.random() * 2.5 + 1.0),
          (Math.random() - 0.5) * 3.0,
          0.0,
          (Math.random() - 0.5) * 1.5
        ]);
        return cloned;
      }));
    }
  };

  // Compute live diagnostic metrics for Module 2
  const liveDiagnostics = useMemo(() => {
    if (solitons.length < 2) return null;
    const s1 = solitons[0];
    const s2 = solitons[1];

    const dx = s1.position[0] - s2.position[0];
    const dy = s1.position[1] - s2.position[1];
    const dz = s1.position[2] - s2.position[2];
    const dw = s1.position[3] - s2.position[3];
    const d = Math.sqrt(dx*dx + dy*dy + dz*dz + dw*dw);

    const dxV = s1.velocity[0] - s2.velocity[0];
    const dyV = s1.velocity[1] - s2.velocity[1];
    const dzV = s1.velocity[2] - s2.velocity[2];
    const dwV = s1.velocity[3] - s2.velocity[3];
    const vRel = Math.sqrt(dxV*dxV + dyV*dyV + dzV*dzV + dwV*dwV);

    const beta = 1.2 / ((s1.radius + s2.radius) / 2);
    const G = 0.15 * gravityScale;
    const qProd = s1.topologicalCharge * s2.topologicalCharge;
    const signMultiplier = qProd < 0 ? -1.0 : (s1.topologicalCharge === 0 || s2.topologicalCharge === 0 ? -0.2 : 1.0);
    const overlapPot = signMultiplier * G * Math.sqrt(s1.maxPotential * s2.maxPotential) / (Math.cosh(beta * d) ** 2);

    const mu = (s1.mass * s2.mass) / (s1.mass + s2.mass + 1e-5);
    const eKin = 0.5 * mu * (vRel * vRel);
    const eTotal = eKin + overlapPot;

    let interactionStateStr = text.stateDecoupled;
    if (d < 1.0) {
      interactionStateStr = text.stateAnnihilation;
    } else if (eTotal < 0 && d < 6.5) {
      interactionStateStr = text.stateBound;
    } else if (d < 7.0) {
      interactionStateStr = text.stateScattering;
    }

    return {
      distance: d,
      vRel: vRel,
      overlapPot: overlapPot,
      eKin: eKin,
      eTotal: eTotal,
      stateStr: interactionStateStr,
      isBound: eTotal < 0 && d < 6.5,
      isCritical: d < 1.0,
      mass1: s1.mass,
      mass2: s2.mass
    };
  }, [solitons, gravityScale, text]);

  // Clean both sampler and simulator to starting values
  const handleResetSimulator = () => {
    setObstacles([]);
    setTimelineData([]);
    timelineStepRef.current = 0;
    handleLoadPair();
  };

  return (
    <div className="flex flex-col gap-6" id="effective-soliton-lab-tab">
      
      {/* Parameters extraction card (Connection to the main 4D Lattice) */}
      <section className="rounded-2xl border border-sky-500/20 bg-[#090f1d] p-5 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-sky-500/10 p-3 border border-sky-500/25 text-sky-400">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide font-mono flex items-center gap-2">
                {text.title}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  SOLITON WAVEFRONT SCANNER
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {text.subtitle}
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleExtractFromGrid}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                isCopied 
                  ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400' 
                  : 'bg-sky-600 hover:bg-sky-500 text-slate-950 border-sky-500'
              }`}
            >
              <Cpu className="h-4 w-4" />
              {isCopied ? text.extractSuccess : text.extractBtn}
            </button>
          </div>
        </div>

        {/* Dynamic Scan Result Display */}
        {analysisResult ? (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 border-t border-slate-800/60 pt-4 animate-fade-in">
            {/* Measured Numeric telemetry */}
            <div className="lg:col-span-4 flex flex-col justify-center gap-2 text-xs font-mono bg-slate-950/40 p-3.5 rounded-xl border border-slate-900">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                {lang === 'hu' ? 'Mért rácslépés:' : 'Measured step:'} <span className="text-slate-400 font-bold">#{analysisResult.stepCount}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">{lang === 'hu' ? 'Mért effektív sugár:' : 'Measured radius:'}</span>
                <span className="text-sky-400 font-bold text-sm">{analysisResult.effectiveRadius.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-900/50">
                <span className="text-slate-400">{lang === 'hu' ? 'Középponti amplitúdó:' : 'Max central potential:'}</span>
                <span className="text-amber-400 font-bold">{analysisResult.maxPotential.toLocaleString(lang === 'hu' ? 'hu-HU' : 'en-US')}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-900/50">
                <span className="text-slate-400">{lang === 'hu' ? 'Belső fluktuáció (Gini):' : 'Fluctuation (Gini):'}</span>
                <span className="text-rose-400 font-bold">{(analysisResult.wavefrontGini * 100).toFixed(2)}%</span>
              </div>
              <div className="text-[10px] text-amber-300 mt-2 font-mono flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {lang === 'hu' ? 'Betölthető sablonként a lenti Szoliton Mintavételezőbe!' : 'Available to select as template in Sampler below!'}
              </div>
            </div>

            {/* Radial profile vector graph */}
            <div className="lg:col-span-4 bg-slate-950/40 p-3.5 rounded-xl border border-slate-900">
              <span className="text-[10px] text-slate-400 font-bold font-mono block uppercase mb-3 flex items-center gap-1.5 text-sky-400">
                <Layers className="h-3.5 w-3.5" /> {text.radialProfile}
              </span>
              <div className="h-24 flex items-end gap-1.5 pb-1">
                {analysisResult.radialProfile.slice(0, 10).map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div className="absolute bottom-full mb-1 bg-slate-950 border border-slate-800 text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-mono text-amber-400">
                      {v.toFixed(3)}
                    </div>
                    <div 
                      className="w-full rounded-t bg-sky-500/20 group-hover:bg-sky-400/30 border-t border-sky-400/40 transition-all"
                      style={{ height: `${Math.min(100, v * 100)}%` }}
                    />
                    <span className="text-[8px] text-slate-600 mt-1 font-mono">{i}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fourier spectrograph */}
            <div className="lg:col-span-4 bg-slate-950/40 p-3.5 rounded-xl border border-slate-900">
              <span className="text-[10px] text-slate-400 font-bold font-mono block uppercase mb-3 flex items-center gap-1.5 text-pink-400">
                <Activity className="h-3.5 w-3.5" /> {text.fourierSpectrum}
              </span>
              <div className="h-24 flex items-end gap-2 pb-1">
                {analysisResult.fourierAmplitudes.slice(0, 5).map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div className="absolute bottom-full mb-1 bg-slate-950 border border-slate-800 text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-mono text-pink-400">
                      {v.toFixed(4)}
                    </div>
                    <div 
                      className="w-full rounded-t bg-pink-500/20 group-hover:bg-pink-400/30 border-t border-pink-400/40 transition-all"
                      style={{ height: `${Math.min(100, v * 200)}%` }}
                    />
                    <span className="text-[8px] text-slate-600 mt-1 font-mono">f{i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 bg-slate-950/30 border border-slate-900 rounded-xl p-3 text-center text-xs text-slate-500 font-mono">
            {text.noAnalysis}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------------------
          MODULE 1: SOLITON SAMPLER (SZOLITON MINTAVÉTELEZŐ)
          ------------------------------------------------------------------------------ */}
      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/20 p-5 backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-4">
          <Scale className="h-5 w-5 text-indigo-400" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              {text.samplerTitle}
            </h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              {text.samplerDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          
          {/* Soliton 1 Designer */}
          <div className="p-4 rounded-xl border border-rose-500/15 bg-rose-500/5 flex flex-col gap-3.5 relative">
            <div className="absolute top-3 right-3 text-[9px] font-mono font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20">
              SOLITON 1 (W+)
            </div>
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              {text.soliton1}
            </h3>

            {/* Presets */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-[10px]">{text.presetLabel}</label>
              <select
                value={s1Preset}
                onChange={(e) => setS1Preset(e.target.value)}
                className="bg-slate-950 text-rose-300 border border-slate-800 rounded py-1 px-2 focus:outline-none"
              >
                <option value="alpha">G-Soliton Alpha (Stable W+)</option>
                <option value="scatter">Scattered Singularity (Fast, Light)</option>
                <option value="coaxial">Co-axial Massive Packet (Broad, Heavy)</option>
                <option value="scanned" disabled={!analysisResult}>
                  {lang === 'hu' ? 'Kinyert Sablon a Rácsból' : 'Scanned from Grid'} {!analysisResult ? '(Nem beolvasott)' : ''}
                </option>
              </select>
            </div>

            {/* Grid properties */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-[10px]">{text.chargeLabel}</label>
                <div className="flex gap-1.5">
                  {[-1, 0, 1].map((val) => (
                    <button
                      key={val}
                      onClick={() => { setS1Winding(val); setS1Preset('custom'); }}
                      className={`flex-1 py-1 rounded border text-[10px] font-bold ${
                        s1Winding === val 
                          ? 'bg-rose-500 text-slate-950 border-rose-400' 
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {val > 0 ? `+${val}` : val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-[10px]">{text.radiusLabel}</label>
                <input
                  type="range" min="0.5" max="5.0" step="0.1"
                  value={s1Radius}
                  onChange={(e) => { setS1Radius(parseFloat(e.target.value)); setS1Preset('custom'); }}
                  className="w-full accent-rose-500 h-1 bg-slate-950 rounded"
                />
                <span className="text-[10px] text-rose-300 text-right">{s1Radius.toFixed(1)} r_0</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-[10px]">{text.energyLabel}</label>
                <input
                  type="range" min="1e5" max="3e6" step="5e4"
                  value={s1Energy}
                  onChange={(e) => { setS1Energy(parseInt(e.target.value)); setS1Preset('custom'); }}
                  className="w-full accent-rose-500 h-1 bg-slate-950 rounded"
                />
                <span className="text-[10px] text-rose-300 text-right">{(s1Energy / 1e6).toFixed(2)} MeV</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-[10px]">{text.kModeLabel}</label>
                <input
                  type="range" min="0.1" max="1.8" step="0.05"
                  value={s1KMode}
                  onChange={(e) => { setS1KMode(parseFloat(e.target.value)); setS1Preset('custom'); }}
                  className="w-full accent-rose-500 h-1 bg-slate-950 rounded"
                />
                <span className="text-[10px] text-rose-300 text-right">{s1KMode.toFixed(2)} k_0</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 border-t border-rose-500/10 pt-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500">X_start</span>
                <input
                  type="number" step="0.5" value={s1X}
                  onChange={(e) => { setS1X(parseFloat(e.target.value) || 0); setS1Preset('custom'); }}
                  className="bg-slate-950 text-rose-300 text-center rounded border border-slate-850 p-0.5"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500">Y_start</span>
                <input
                  type="number" step="0.5" value={s1Y}
                  onChange={(e) => { setS1Y(parseFloat(e.target.value) || 0); setS1Preset('custom'); }}
                  className="bg-slate-950 text-rose-300 text-center rounded border border-slate-850 p-0.5"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500">W_start</span>
                <input
                  type="number" step="0.05" value={s1W}
                  onChange={(e) => { setS1W(parseFloat(e.target.value) || 0); setS1Preset('custom'); }}
                  className="bg-slate-950 text-rose-300 text-center rounded border border-slate-850 p-0.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500">Vx_start</span>
                <input
                  type="number" step="0.1" value={s1Vx}
                  onChange={(e) => { setS1Vx(parseFloat(e.target.value) || 0); setS1Preset('custom'); }}
                  className="bg-slate-950 text-rose-300 text-center rounded border border-slate-850 p-0.5"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500">Vy_start</span>
                <input
                  type="number" step="0.1" value={s1Vy}
                  onChange={(e) => { setS1Vy(parseFloat(e.target.value) || 0); setS1Preset('custom'); }}
                  className="bg-slate-950 text-rose-300 text-center rounded border border-slate-850 p-0.5"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500">Vw_start</span>
                <input
                  type="number" step="0.05" value={s1Vw}
                  onChange={(e) => { setS1Vw(parseFloat(e.target.value) || 0); setS1Preset('custom'); }}
                  className="bg-slate-950 text-rose-300 text-center rounded border border-slate-850 p-0.5"
                />
              </div>
            </div>
          </div>

          {/* Soliton 2 Designer */}
          <div className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 flex flex-col gap-3.5 relative">
            <div className="absolute top-3 right-3 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
              SOLITON 2 (W-)
            </div>
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              {text.soliton2}
            </h3>

            {/* Presets */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-[10px]">{text.presetLabel}</label>
              <select
                value={s2Preset}
                onChange={(e) => setS2Preset(e.target.value)}
                className="bg-slate-950 text-emerald-300 border border-slate-800 rounded py-1 px-2 focus:outline-none"
              >
                <option value="beta">G-Soliton Beta (Stable W-)</option>
                <option value="alpha">G-Soliton Alpha (Stable W+)</option>
                <option value="scatter">Scattered Well (Target Obstacle)</option>
                <option value="coaxial">Co-axial Massive Packet (Heavy opposing)</option>
                <option value="scanned" disabled={!analysisResult}>
                  {lang === 'hu' ? 'Kinyert Sablon a Rácsból' : 'Scanned from Grid'} {!analysisResult ? '(Nem beolvasott)' : ''}
                </option>
              </select>
            </div>

            {/* Grid properties */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-[10px]">{text.chargeLabel}</label>
                <div className="flex gap-1.5">
                  {[-1, 0, 1].map((val) => (
                    <button
                      key={val}
                      onClick={() => { setS2Winding(val); setS2Preset('custom'); }}
                      className={`flex-1 py-1 rounded border text-[10px] font-bold ${
                        s2Winding === val 
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {val > 0 ? `+${val}` : val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-[10px]">{text.radiusLabel}</label>
                <input
                  type="range" min="0.5" max="5.0" step="0.1"
                  value={s2Radius}
                  onChange={(e) => { setS2Radius(parseFloat(e.target.value)); setS2Preset('custom'); }}
                  className="w-full accent-emerald-500 h-1 bg-slate-950 rounded"
                />
                <span className="text-[10px] text-emerald-300 text-right">{s2Radius.toFixed(1)} r_0</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-[10px]">{text.energyLabel}</label>
                <input
                  type="range" min="1e5" max="3e6" step="5e4"
                  value={s2Energy}
                  onChange={(e) => { setS2Energy(parseInt(e.target.value)); setS2Preset('custom'); }}
                  className="w-full accent-emerald-500 h-1 bg-slate-950 rounded"
                />
                <span className="text-[10px] text-emerald-300 text-right">{(s2Energy / 1e6).toFixed(2)} MeV</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-[10px]">{text.kModeLabel}</label>
                <input
                  type="range" min="0.1" max="1.8" step="0.05"
                  value={s2KMode}
                  onChange={(e) => { setS2KMode(parseFloat(e.target.value)); setS2Preset('custom'); }}
                  className="w-full accent-emerald-500 h-1 bg-slate-950 rounded"
                />
                <span className="text-[10px] text-emerald-300 text-right">{s2KMode.toFixed(2)} k_0</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 border-t border-emerald-500/10 pt-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500">X_start</span>
                <input
                  type="number" step="0.5" value={s2X}
                  onChange={(e) => { setS2X(parseFloat(e.target.value) || 0); setS2Preset('custom'); }}
                  className="bg-slate-950 text-emerald-300 text-center rounded border border-slate-850 p-0.5"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500">Y_start</span>
                <input
                  type="number" step="0.5" value={s2Y}
                  onChange={(e) => { setS2Y(parseFloat(e.target.value) || 0); setS2Preset('custom'); }}
                  className="bg-slate-950 text-emerald-300 text-center rounded border border-slate-850 p-0.5"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500">W_start</span>
                <input
                  type="number" step="0.05" value={s2W}
                  onChange={(e) => { setS2W(parseFloat(e.target.value) || 0); setS2Preset('custom'); }}
                  className="bg-slate-950 text-emerald-300 text-center rounded border border-slate-850 p-0.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500">Vx_start</span>
                <input
                  type="number" step="0.1" value={s2Vx}
                  onChange={(e) => { setS2Vx(parseFloat(e.target.value) || 0); setS2Preset('custom'); }}
                  className="bg-slate-950 text-emerald-300 text-center rounded border border-slate-850 p-0.5"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500">Vy_start</span>
                <input
                  type="number" step="0.1" value={s2Vy}
                  onChange={(e) => { setS2Vy(parseFloat(e.target.value) || 0); setS2Preset('custom'); }}
                  className="bg-slate-950 text-emerald-300 text-center rounded border border-slate-850 p-0.5"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500">Vw_start</span>
                <input
                  type="number" step="0.05" value={s2Vw}
                  onChange={(e) => { setS2Vw(parseFloat(e.target.value) || 0); setS2Preset('custom'); }}
                  className="bg-slate-950 text-emerald-300 text-center rounded border border-slate-850 p-0.5"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleLoadPair}
          className="mt-4 w-full py-3 bg-gradient-to-r from-rose-600 to-emerald-600 hover:from-rose-500 hover:to-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 uppercase font-mono tracking-wider"
        >
          <ArrowRightLeft className="h-4 w-4" />
          {text.loadPairBtn}
        </button>
      </section>

      {/* ------------------------------------------------------------------------------
          MODULE 2: EFFECTIVE CONTROLLED ENVIRONMENT
          ------------------------------------------------------------------------------ */}
      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/20 p-5 backdrop-blur-md">
        
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-4">
          <Activity className="h-5 w-5 text-emerald-400" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              {text.labTitle}
            </h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              {text.labDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Render Canvas Arenas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* XY Canvas */}
              <div className="flex flex-col bg-slate-950 border border-slate-900 rounded-2xl p-4 overflow-hidden relative group">
                <div className="absolute top-4 right-4 text-[9px] font-mono text-slate-500 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                  ℝ² XY PROJECTION
                </div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                  <Compass className="h-4 w-4 text-rose-400" /> {text.canvasXYTitle}
                </h3>
                
                <canvas
                  ref={xyCanvasRef}
                  width={500}
                  height={380}
                  onClick={handleXYCanvasClick}
                  className={`w-full aspect-[5/3.8] rounded-xl border border-slate-900 bg-[#020409] shadow-inner transition-all ${
                    placeMode !== 'none' ? 'cursor-crosshair border-amber-500/40 animate-pulse' : 'cursor-pointer'
                  }`}
                />
                <span className="text-[9.5px] text-slate-500 mt-2 font-mono leading-normal">
                  {lang === 'hu' ? 'A szolitonok valós ütközési és szórási pályáját mutatja.' : 'Shows real soliton scattering trajectory.'}
                </span>
              </div>

              {/* ZW Canvas */}
              <div className="flex flex-col bg-slate-950 border border-slate-900 rounded-2xl p-4 overflow-hidden relative group">
                <div className="absolute top-4 right-4 text-[9px] font-mono text-slate-500 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                  ℝ² ZW OSCILLATION
                </div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                  <Layers className="h-4 w-4 text-emerald-400" /> {text.canvasZWTitle}
                </h3>
                
                <canvas
                  ref={zwCanvasRef}
                  width={500}
                  height={380}
                  className="w-full aspect-[5/3.8] rounded-xl border border-slate-900 bg-[#020409] shadow-inner"
                />
                <span className="text-[9.5px] text-slate-500 mt-2 font-mono leading-normal">
                  {lang === 'hu' ? 'X tengely menti kitérés (vízszintes) vs. 4. dimenziós w-feszültség kitérés (függőleges).' : 'X coordinate (lateral) vs. out-of-membrane 4D w-tension deflection (vertical).'}
                </span>
              </div>
            </div>

            {/* Placement Toolbar for obstacles */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950 border border-slate-850/80 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono mr-1">
                {lang === 'hu' ? 'Akadályok:' : 'Obstacles:'}
              </span>
              <button
                onClick={() => setPlaceMode(placeMode === 'well' ? 'none' : 'well')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  placeMode === 'well' 
                    ? 'bg-sky-500/20 border-sky-400/50 text-sky-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Plus className="h-3 w-3 text-sky-500" /> {text.placeWell}
              </button>
              <button
                onClick={() => setPlaceMode(placeMode === 'barrier' ? 'none' : 'barrier')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  placeMode === 'barrier' 
                    ? 'bg-red-500/20 border-red-400/50 text-red-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Plus className="h-3 w-3 text-red-500" /> {text.placeBarrier}
              </button>
              
              {placeMode !== 'none' && (
                <span className="text-[10.5px] text-amber-400 animate-pulse font-mono ml-2">
                  {lang === 'hu' ? 'Kattintson az X-Y vetület síkba az elhelyezéshez!' : 'Click in the X-Y Projection to place!'}
                </span>
              )}

              <div className="ml-auto flex gap-1.5">
                <button
                  onClick={handleTriggerPulse}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                >
                  <Zap className="h-3 w-3" />
                  {text.pulseBtn}
                </button>
                <button
                  onClick={handleResetSimulator}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-mono cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  {text.clearBtn}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Physics Controller & Real-Time Data (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Control Panel */}
            <section className="rounded-2xl border border-slate-850 bg-slate-950 p-4 font-mono text-xs">
              <h3 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                <Settings className="h-3.5 w-3.5 text-indigo-400" />
                {lang === 'hu' ? 'Környezeti Paraméterek' : 'Environment Physics'}
              </h3>

              <div className="flex flex-col gap-3.5">
                {/* Play/Pause */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`py-2 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isRunning 
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                  >
                    {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {isRunning ? 'PAUSE' : 'RUN'}
                  </button>
                  <button
                    onClick={handleResetSimulator}
                    className="py-2 px-3 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800 transition-all cursor-pointer"
                  >
                    RESET ALL
                  </button>
                </div>

                {/* Physics Constants */}
                <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-900">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">{text.simSpeed}</span>
                      <span className="text-sky-400 font-bold">{simSpeed.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range" min="0.2" max="3.0" step="0.1" value={simSpeed}
                      onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
                      className="w-full accent-sky-400 h-1 bg-slate-900 rounded"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">{text.dampingLabel}</span>
                      <span className="text-sky-400 font-bold">{(damping * 100).toFixed(2)}%</span>
                    </div>
                    <input
                      type="range" min="0.0" max="0.05" step="0.001" value={damping}
                      onChange={(e) => setDamping(parseFloat(e.target.value))}
                      className="w-full accent-sky-400 h-1 bg-slate-900 rounded"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">{text.tensionLabel}</span>
                      <span className="text-sky-400 font-bold">{tension.toFixed(2)} k_T</span>
                    </div>
                    <input
                      type="range" min="0.0" max="2.0" step="0.05" value={tension}
                      onChange={(e) => setTension(parseFloat(e.target.value))}
                      className="w-full accent-sky-400 h-1 bg-slate-900 rounded"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">{text.gravityScaleLabel}</span>
                      <span className="text-sky-400 font-bold">{gravityScale.toFixed(2)} G</span>
                    </div>
                    <input
                      type="range" min="0.1" max="3.0" step="0.1" value={gravityScale}
                      onChange={(e) => setGravityScale(parseFloat(e.target.value))}
                      className="w-full accent-sky-400 h-1 bg-slate-900 rounded"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Dynamic Telemetry & State Monitor */}
            {liveDiagnostics && (
              <section className="rounded-2xl border border-slate-850 bg-slate-950 p-4 font-mono text-xs flex flex-col gap-3">
                <h3 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider pb-2 border-b border-slate-900 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-emerald-400" />
                  {text.diagnosticsTitle}
                </h3>

                <div className="flex justify-between py-1 border-b border-slate-900/50">
                  <span className="text-slate-500">{text.distance}</span>
                  <span className="text-slate-200 font-bold">{liveDiagnostics.distance.toFixed(4)} r_0</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-900/50">
                  <span className="text-slate-500">{text.relVel}</span>
                  <span className="text-slate-200 font-bold">{liveDiagnostics.vRel.toFixed(4)} c</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-900/50">
                  <span className="text-slate-500">{text.overlapPot}</span>
                  <span className="text-amber-400 font-bold">{liveDiagnostics.overlapPot.toExponential(3)} eV</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-900/50">
                  <span className="text-slate-500">{text.kineticEnergy}</span>
                  <span className="text-cyan-400 font-bold">{liveDiagnostics.eKin.toExponential(3)} eV</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-900/50">
                  <span className="text-slate-500">{text.totalEnergy}</span>
                  <span className={`font-bold ${liveDiagnostics.eTotal < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {liveDiagnostics.eTotal.toExponential(3)} eV
                  </span>
                </div>

                {/* State classifier */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-slate-500 text-[10px]">{text.stateLabel}</span>
                  <div className={`p-2 rounded text-center text-[10px] font-bold ${
                    liveDiagnostics.isCritical 
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse' 
                      : liveDiagnostics.isBound 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {liveDiagnostics.stateStr}
                  </div>
                </div>

                {/* Inertial Mass details (Mach's principle visualization) */}
                <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-slate-900 text-[9.5px]">
                  <div className="bg-rose-500/5 p-2 rounded border border-rose-500/10">
                    <span className="text-slate-500 block uppercase mb-1">SOLITON 1 MASS</span>
                    <span className="text-rose-400 font-bold">{liveDiagnostics.mass1.toFixed(3)} eV_m</span>
                  </div>
                  <div className="bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                    <span className="text-slate-500 block uppercase mb-1">SOLITON 2 MASS</span>
                    <span className="text-emerald-400 font-bold">{liveDiagnostics.mass2.toFixed(3)} eV_m</span>
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------------
          DYNAMIC SCROLLING TIMELINE GRAPH
          ------------------------------------------------------------------------------ */}
      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/20 p-5 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4 font-mono">
          <LineChart className="h-5 w-5 text-pink-400" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {text.timelineTitle}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {text.timelineDesc}
            </p>
          </div>
        </div>

        {timelineData.length > 0 ? (
          <div className="h-36 bg-slate-950/80 rounded-xl border border-slate-900/60 p-4 relative overflow-hidden flex flex-col justify-between">
            {/* Legend */}
            <div className="absolute top-2 right-4 flex gap-4 text-[9px] font-mono">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-0.5 bg-rose-400 inline-block" />
                {lang === 'hu' ? 'Távolság (d)' : 'Distance (d)'}
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" />
                {lang === 'hu' ? 'Relatív Sebesség (v_rel)' : 'Relative Velocity (v_rel)'}
              </span>
            </div>

            {/* Custom SVG Line Graph */}
            <svg className="w-full h-24 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Horizontal Reference Line at 0 */}
              <line x1="0" y1="100" x2="100" y2="100" stroke="#1f2937" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#111827" strokeDasharray="3,3" strokeWidth="0.5" />

              {/* Path for Distance */}
              {(() => {
                const maxD = Math.max(...timelineData.map(d => d.distance), 10);
                const points = timelineData.map((d, idx) => {
                  const x = (idx / (timelineData.length - 1)) * 100;
                  const y = 100 - (d.distance / maxD) * 90; // scale so it fits nicely
                  return `${x},${y}`;
                }).join(' ');
                return <polyline fill="none" stroke="#f43f5e" strokeWidth="1.8" points={points} />;
              })()}

              {/* Path for Relative Velocity */}
              {(() => {
                const maxV = Math.max(...timelineData.map(d => d.relVel), 4);
                const points = timelineData.map((d, idx) => {
                  const x = (idx / (timelineData.length - 1)) * 100;
                  const y = 100 - (d.relVel / maxV) * 90;
                  return `${x},${y}`;
                }).join(' ');
                return <polyline fill="none" stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="1,1" points={points} />;
              })()}
            </svg>

            {/* Scale readings */}
            <div className="flex justify-between text-[8px] text-slate-500 font-mono pt-2 border-t border-slate-900/50">
              <span>{lang === 'hu' ? 'Kezdet' : 'Start'}</span>
              <span>{lang === 'hu' ? 'Időbeli szórás tenger' : 'Spacetime scatter history'}</span>
              <span>{lang === 'hu' ? 'Most' : 'Now'}</span>
            </div>
          </div>
        ) : (
          <div className="h-36 bg-slate-950/40 border border-slate-900/60 rounded-xl flex items-center justify-center text-xs text-slate-500 font-mono">
            {lang === 'hu' ? 'Futtassa a szimulációt az adatok rögzítéséhez!' : 'Run the simulation to log spacetime history.'}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------------------
          FOURIER SPECTRUM SEPARATE COMPARISON (KÜLÖNÁLLÓ SPECTRA)
          ------------------------------------------------------------------------------ */}
      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/20 p-5 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4 font-mono">
          <Activity className="h-5 w-5 text-indigo-400" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {text.fourierCompTitle}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {text.fourierCompDesc}
            </p>
          </div>
        </div>

        {solitons.length >= 2 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            
            {/* Soliton 1 Spectrum */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-rose-500/10 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Soliton 1 Internal Vibrational Modes
              </span>
              <div className="flex flex-col gap-2.5">
                {solitons[0].fourierAmplitudes.map((amp, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>{lang === 'hu' ? `${idx+1}. Hullámmódus (f${idx+1})` : `Harmonic Mode f${idx+1}`}</span>
                      <span className="text-rose-300 font-bold">{amp.toFixed(4)}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded overflow-hidden border border-slate-800/60">
                      <div 
                        className="bg-gradient-to-r from-rose-600 to-pink-500 h-full rounded"
                        style={{ width: `${Math.min(100, amp * 500)}%` }} // Scaled for gorgeous visibility
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Soliton 2 Spectrum */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-emerald-500/10 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Soliton 2 Internal Vibrational Modes
              </span>
              <div className="flex flex-col gap-2.5">
                {solitons[1].fourierAmplitudes.map((amp, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>{lang === 'hu' ? `${idx+1}. Hullámmódus (f${idx+1})` : `Harmonic Mode f${idx+1}`}</span>
                      <span className="text-emerald-300 font-bold">{amp.toFixed(4)}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded overflow-hidden border border-slate-800/60">
                      <div 
                        className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded"
                        style={{ width: `${Math.min(100, amp * 500)}%` }} // Scaled for gorgeous visibility
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-xl flex items-center justify-center text-xs text-slate-500 font-mono">
            {lang === 'hu' ? 'A szolitonok betöltése szükséges a Fourier spektrumok elemzéséhez.' : 'Solitons must be loaded to analyze spectra.'}
          </div>
        )}
      </section>

      {/* Explanatory callout for physics */}
      <section className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex gap-3 text-xs leading-relaxed text-amber-300/95 mt-4">
        <HelpCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-400" />
        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-200">{text.limitsTitle}</span>
          <span>{text.limitsText}</span>
        </div>
      </section>

    </div>
  );
};

export default EffectiveSolitonLab;
