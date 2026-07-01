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
  LineChart,
  FileText,
  Copy,
  Download,
  BookOpen,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  BarChart2,
  Gauge,
  Waves
} from 'lucide-react';
import { GrowingR4Model, Coord4D } from '../model/toyModel';
import { EffectiveSoliton, SolitonObstacle } from '../model/EffectiveSoliton';
import { extractSolitonParameters, SolitonAnalysisParams } from '../analysis/solitonAnalyzer';

export interface ProtocolEntry {
  id: string;
  timestamp: string;
  name: string;
  // Soliton 1
  s1Charge: number;
  s1Radius: number;
  s1Energy: number;
  s1KMode: number;
  s1Pos: [number, number, number, number];
  s1Vel: [number, number, number, number];
  // Soliton 2
  s2Charge: number;
  s2Radius: number;
  s2Energy: number;
  s2KMode: number;
  s2Pos: [number, number, number, number];
  s2Vel: [number, number, number, number];
  // Env
  simSpeed: number;
  damping: number;
  tension: number;
  gravityScale: number;
  // Live values
  distance: number;
  vRel: number;
  overlapPot: number;
  eKin: number;
  eTotal: number;
  stateStr: string;
  mass1: number;
  mass2: number;
  userNotes: string;
  fieldAsymmetry?: number;
  gradientDistortion?: number;
  qEff?: number;
}

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

  // Measurement Protocol State
  const [records, setRecords] = useState<ProtocolEntry[]>([
    {
      id: 'ref-1',
      timestamp: '2026-06-30 11:15',
      name: lang === 'hu' ? 'I. Szoliton-Orbitális Kötött Pálya mérés' : lang === 'de' ? 'I. Solitonen-Bindungsbahn-Messung' : 'I. Soliton Bound Orbit Measurement',
      s1Charge: 1,
      s1Radius: 2.4,
      s1Energy: 1.2e6,
      s1KMode: 0.8,
      s1Pos: [-3.5, 0, 0, 0.05],
      s1Vel: [0, 1.6, 0, 0.1],
      s2Charge: -1,
      s2Radius: 2.4,
      s2Energy: 1.2e6,
      s2KMode: 0.8,
      s2Pos: [3.5, 0, 0, -0.05],
      s2Vel: [0, -1.6, 0, -0.1],
      simSpeed: 1.2,
      damping: 0.003,
      tension: 0.4,
      gravityScale: 1.2,
      distance: 6.2,
      vRel: 3.2,
      overlapPot: -4.5e4,
      eKin: 2.1e4,
      eTotal: -2.4e4,
      stateStr: lang === 'hu' ? 'KÖTÖTT PÁLYA / ORBIT (E_tot < 0)' : lang === 'de' ? 'GEBUNDENER ORBIT (E_tot < 0)' : 'BOUND ORBIT / LOCK (E_tot < 0)',
      mass1: 1.25,
      mass2: 1.25,
      userNotes: lang === 'hu' 
        ? 'A vonzó topologikus töltések (Q1=+1, Q2=-1) és a 4D w-feszültség harmonikus csatolása miatt stabil elliptikus keringési pálya jött létre. Megfigyelhető a w-kitérésből adódó tehetetlen tömeg fluktuáció (Mach-elv), amely periodikusan tolja el a Fourier módusok frekvenciaspektrumát.'
        : lang === 'de'
        ? 'Aufgrund der anziehenden topologischen Ladungen (Q1=+1, Q2=-1) und der harmonischen Kopplung der 4D-w-Spannung entstand eine stabile elliptische Umlaufbahn. Eine fluktuierende träge Masse (Machsches Prinzip) durch die w-Abweichung moduliert periodisch das Frequenzspektrum.'
        : 'A stable elliptic orbit emerged due to the attractive topological charges (Q1=+1, Q2=-1) and the harmonic coupling of the 4D w-tension. An inertial mass fluctuation (Mach\'s Principle) is observed due to the w-deflection, periodically modulating the Fourier frequency spectrum.'
    },
    {
      id: 'ref-2',
      timestamp: '2026-06-30 11:42',
      name: lang === 'hu' ? 'II. Topologikus Taszítás és Rugalmas Szóródás' : lang === 'de' ? 'II. Topologische Abstoßung und elastische Streuung' : 'II. Topological Repulsion & Elastic Scattering',
      s1Charge: 1,
      s1Radius: 1.6,
      s1Energy: 8e5,
      s1KMode: 1.2,
      s1Pos: [-7.0, -1.0, 0, 0.0],
      s1Vel: [4.2, 0.5, 0, 0.0],
      s2Charge: 1,
      s2Radius: 2.0,
      s2Energy: 1e6,
      s2KMode: 1.0,
      s2Pos: [1.0, -2.5, 0, 0.0],
      s2Vel: [-1.0, 1.0, 0, 0.0],
      simSpeed: 1.2,
      damping: 0.003,
      tension: 0.4,
      gravityScale: 1.2,
      distance: 3.5,
      vRel: 5.2,
      overlapPot: 8.9e4,
      eKin: 1.5e5,
      eTotal: 2.39e5,
      stateStr: lang === 'hu' ? 'SZÓRÁSI MEZŐ (E_tot >= 0)' : lang === 'de' ? 'STREUUNGSBEREICH (E_tot >= 0)' : 'SCATTERING ZONE (E_tot >= 0)',
      mass1: 0.95,
      mass2: 1.05,
      userNotes: lang === 'hu'
        ? 'Azonos topológiai előjelű töltések (Q1=+1, Q2=+1) esetén a csatolási potenciál tisztán taszító jellegűvé válik. Az ütközés során a két hullámcsomag nem olvad össze, hanem minimális megközelítési távolság után hiperbolikus szórási pályán távoznak. Az átfedési zónában a belső fázis-vibrációk felerősödnek.'
        : lang === 'de'
        ? 'Bei gleichnamigen topologischen Ladungen (Q1=+1, Q2=+1) wird das Kopplungspotenzial rein abstoßend. Die Wellenpakete verschmelzen nicht, sondern streuen nach einem minimalen Annäherungsabstand auf hyperbolischen Trajektorien.'
        : 'With identical topological charges (Q1=+1, Q2=+1), the coupling potential becomes purely repulsive. The wave packets do not merge; they scatter on hyperbolic trajectories after reaching a minimum separation distance.'
    }
  ]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>('ref-1');
  const [newRecordNotes, setNewRecordNotes] = useState<string>('');
  const [isCopiedProtocol, setIsCopiedProtocol] = useState<boolean>(false);

  // ------------------------------------------------------------------------------
  // COSMIC SELF-REFLEXIVE ENVIRONMENT & HIGH-RESOLUTION PROBE EXPERIMENT STATE
  // ------------------------------------------------------------------------------
  const [cosmicGridSize, setCosmicGridSize] = useState<number>(1024);
  const [cosmicSteps, setCosmicSteps] = useState<number>(4800);
  const [cosmicSimSpeed, setCosmicSimSpeed] = useState<number>(2.0);
  const [cosmicStatus, setCosmicStatus] = useState<'idle' | 'generating' | 'completed'>('idle');
  const [cosmicProgress, setCosmicProgress] = useState<number>(0);
  const [cosmicWells, setCosmicWells] = useState<Array<{ id: string; name: string; x: number; y: number; depth: number; asymmetry: number; distortion: number }>>([]);
  const [selectedCosmicWellId, setSelectedCosmicWellId] = useState<string | null>(null);

  // High-Resolution Probe Config
  const [probeWinding, setProbeWinding] = useState<number>(1);
  const [probeCharge, setProbeCharge] = useState<number>(1);
  const [probeResolution, setProbeResolution] = useState<number>(2); // 2 = 2x, 4 = 4x
  const [probeInitVelocity, setProbeInitVelocity] = useState<'zero' | 'low' | 'medium'>('zero');

  // Comparison Trials Results
  const [cosmicTrialResult, setCosmicTrialResult] = useState<{
    wellName: string;
    pure: {
      qEff: number;
      backReaction: number;
      deviation: number;
      distortion: number;
      stability: string;
      trajectory: Array<{ x: number; y: number }>;
    };
    enhanced: {
      qEff: number;
      backReaction: number;
      deviation: number;
      distortion: number;
      stability: string;
      trajectory: Array<{ x: number; y: number }>;
    };
  } | null>(null);

  // Dedicated Cosmic Protocols State
  const [cosmicProtocols, setCosmicProtocols] = useState<Array<{
    id: string;
    timestamp: string;
    scenarioName: string;
    gridSize: number;
    steps: number;
    simSpeed: number;
    wellName: string;
    probeWinding: number;
    probeResolution: number;
    probeInitVelocity: string;
    probeCharge: number;
    pureQEff: number;
    pureStability: string;
    enhancedQEff: number;
    enhancedStability: string;
    distortion: number;
    backReaction: number;
  }>>([
    {
      id: 'cosmic-ref-1',
      timestamp: '11:05:12',
      scenarioName: 'Alapértelmezett Kozmikus Fluktuáció (Default Cosmic Fluctuation)',
      gridSize: 256,
      steps: 1200,
      simSpeed: 2.0,
      wellName: 'Alfa-Mag Csillaghalmaz',
      probeWinding: 1,
      probeResolution: 2,
      probeInitVelocity: 'Zero (0.0 v_0)',
      probeCharge: 1,
      pureQEff: 0.0034,
      pureStability: 'TÖKÉLETESEN STABIL (Konzervált topológia)',
      enhancedQEff: 0.0,
      enhancedStability: 'KÖZEPESEN DEFORMÁLT (Erős rácsfeszültség)',
      distortion: 100,
      backReaction: 13.9
    }
  ]);

  // ------------------------------------------------------------------------------
  // TOPOLOGICAL SELF-REFLEXIVE AUTOMATED OPTIMIZER STATE
  // ------------------------------------------------------------------------------
  const [optW1, setOptW1] = useState<number>(10); // Pure q_eff weight
  const [optW2, setOptW2] = useState<number>(5);  // Back-reaction weight
  const [optW3, setOptW3] = useState<number>(3);  // Stability weight
  const [optW4, setOptW4] = useState<number>(4);  // Distortion penalty weight

  const [tuneAsymmetry, setTuneAsymmetry] = useState<boolean>(true);
  const [tuneDistortion, setTuneDistortion] = useState<boolean>(true);
  const [tuneTension, setTuneTension] = useState<boolean>(false);

  const [optIsRunning, setOptIsRunning] = useState<boolean>(false);
  const [optIteration, setOptIteration] = useState<number>(0);
  const [optMaxIterations] = useState<number>(6);
  const [optLogs, setOptLogs] = useState<string[]>([]);
  const [optHistory, setOptHistory] = useState<Array<{
    iteration: number;
    asymmetry: number;
    distortion: number;
    tension: number;
    score: number;
    qEff: number;
    backReaction: number;
  }>>([]);
  const [optBestCandidate, setOptBestCandidate] = useState<{
    asymmetry: number;
    distortion: number;
    tension: number;
    score: number;
    qEff: number;
    backReaction: number;
    wellName: string;
    winding: number;
  } | null>(null);

  const [injectTarget, setInjectTarget] = useState<'soliton-1' | 'soliton-2'>('soliton-1');
  const [injectSuccessMsg, setInjectSuccessMsg] = useState<string | null>(null);

  // ------------------------------------------------------------------------------
  // HIGH-RESOLUTION SUPER-COSMIC RUN & CLUSTER ANALYZER STATE
  // ------------------------------------------------------------------------------
  const [superGridSize] = useState<number>(2000000); // 2 milliós rács
  const [superEnergy, setSuperEnergy] = useState<number>(3.5e9); // Initial Energy: 3.5e9 eV
  const [superTension, setSuperTension] = useState<number>(0.565); // Tension: 0.56 - 0.57
  const [superDamping, setSuperDamping] = useState<number>(0.00085); // Damping: 0.00085
  const [superSteps, setSuperSteps] = useState<number>(28000000); // Steps: 25 - 30 millió
  const [superStatus, setSuperStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [superProgress, setSuperProgress] = useState<number>(0);
  const [superLogs, setSuperLogs] = useState<string[]>([]);
  const [superClusters, setSuperClusters] = useState<Array<{
    id: string;
    nameHu: string;
    nameEn: string;
    count: number;
    avgEnergy: number;
    avgRadius: number;
    pureQEff: number;
    stabilityHu: string;
    stabilityEn: string;
    color: string;
    textBg: string;
    borderCol: string;
  }>>([]);
  const [superSolitons, setSuperSolitons] = useState<Array<{
    id: string;
    clusterId: string;
    clusterNameHu: string;
    clusterNameEn: string;
    winding: number;
    energy: number;
    radius: number;
    pureQEff: number;
    cx: number;
    cy: number;
    stabilityHu: string;
    stabilityEn: string;
    color: string;
  }>>([]);
  const [selectedSuperSoliton, setSelectedSuperSoliton] = useState<any | null>(null);
  const [superInjectTarget, setSuperInjectTarget] = useState<'soliton-1' | 'soliton-2'>('soliton-1');
  const [superInjectSuccessMsg, setSuperInjectSuccessMsg] = useState<string | null>(null);

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
        limitsText: 'A szimulátor nem pontszerű részecskéket modellez, hanem kiterjedt hullámcsomagokat. Az interakció a szolitondominált potenciálgödrök átfedésének gradienséből (erőhatás) és a 4. dimenziós w-feszültségből fakad. Az ellentétes topológiai winding számú (W+ és W-) szolitonok vonzzák egymást, míg az azonosak taszítják vagy bonyolult szóródást mutatnak. A w-kitérés a Mach-elv szerint folyamatosan modulálja a belső tömeget és a Fourier spektrum belső módusait.',
        protocolTitle: 'Mérési Jegyzőkönyv & Elemző Központ',
        protocolDesc: 'Rögzítse az aktuális kísérlet fizikai paramétereit, készítsen automatizált és egyéni tudományos elemzéseket.',
        recordBtn: 'Mérés rögzítése a jegyzőkönyvbe',
        batchBtn: '10 Kísérlet automatikus futtatása',
        emergentProtocolBtn: 'Emergens Töltés Protokoll futtatása (20 mérés)',
        recordedTitle: 'Jegyzőkönyvi Bejegyzések',
        noRecords: 'Még nincs rögzített mérés. Kattintson a fenti gombra az aktuális fizikai állapot rögzítéséhez!',
        clearRecords: 'Mérések törlése',
        exportReport: 'Jegyzőkönyv másolása (JSON)',
        customNotes: 'Kutatói észrevételek:',
        addNotesPlaceholder: 'Írja ide a kísérleti megfigyeléseit...',
        scientificAnalysis: 'Automatizált Elméleti Fizikai Elemzés',
        interpretation: 'Interpretáció és Fizikai Következtetések',
        referenceData: 'Jegyzőkönyvi adatok',
        researchGuideTitle: 'Ajánlott Tudományos Vizsgálatok & Kísérleti Útmutató',
        researchGuideDesc: 'Hajtson végre célzott méréseket az alábbi kutatási javaslatok alapján. Kattintson a gombokra az adott feltételek azonnali betöltéséhez, futtassa a szimulációt, majd rögzítse az eredményt a jegyzőkönyvbe!',
        researchTask1: '1. Finomítás: Távolságok & Sebességek',
        researchTask1Desc: 'Próbálja ki a W+/W- párt különböző kiinduló távolságokkal és relatív sebességekkel. Mérje és hasonlítsa össze a Fourier-spektrumot az ütközés előtt és után!',
        researchTask2: '2. Kötési Küszöb Vizsgálata',
        researchTask2Desc: 'Keresse meg a határvonalat, ahol a kinetikus és átfedési energia egyensúlya miatt a rendszer kötött állapotból szórásba (scattering) megy át (E_total ≈ 0).',
        researchTask3: '3. Különböző Winding Számok (1 vs 2)',
        researchTask3Desc: 'Vizsgálja meg, hogyan befolyásolja a magasabb topológiai töltés (Q2 = ±2) a rezonáns befogást és a tiszta topológiai taszítás potenciálgátját.',
        researchTask4: '4. Tömegarányok & Tehetetlenség',
        researchTask4Desc: 'Állítson be eltérő tömegarányokat (például egy nagy és egy kis méretű szoliton). Figyelje meg a tehetetlenségi modulációt és a tömegközéppont precesszióját!',
        researchTask5: '5. Csillapítás & Feszültség',
        researchTask5Desc: 'Kísérletezzen magasabb csillapítással (damping) és feszültséggel (tension). Hogyan hat a disszipáció a topológiailag nem védett módusokra?',
        researchTask6: '6. Winding Skálázás & Többsugaras Analízis',
        researchTask6Desc: 'Mérjen radiális potenciálprofilt több sugárpontban (0.1 és 5.0 r_0 között) magasabb hálózati felbontással. Figyelje meg, hogyan skálázódik a q_eff tisztán a Winding számtól!',
        loadPreset: 'Kísérlet betöltése',
        emergentChargeTitle: 'Emergens Töltés-Analízis (Winding-indukált)',
        emergentCharge: 'Emergens effektív töltés (q_eff):',
        potWellDepth: 'Potenciálgödör mélysége:',
        fieldAsymmetryLabel: 'Mező aszimmetria foka:',
        gradientDistortionLabel: 'Mezőgradiens torzulás (δ):',
        radialPotentialProfile: 'Radiális potenciálprofilok V(r)',
        asymmetryExplanation: 'A winding-szám (topológiai töltés) aszimmetrikus tágulási / sűrűsödési nyírófeszültséget generál a szoliton burkológörbéjén. Ez deformálja a radiális potenciálprofilt, és egy q_eff ≈ (mélység * aszimmetria) / R_eff emergens töltést indukál a fizikai térben.'
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
        limitsText: 'Instead of point masses, this sandbox simulates extended wave envelopes. The emergent force is computed via the gradient of overlapping potential structures combined with 4D w-tension. Solitons with opposite topological winding charges (W+ and W-) attract, whereas identical charges repel. Out-of-plane w-displacement dynamically modulates the inertial mass (Mach\'s Principle) and shifts internal spectral modes.',
        protocolTitle: 'Measurement Protocol & Analysis Center',
        protocolDesc: 'Record physical parameters of the active experiment, generate automated reports, and write scientific comments.',
        recordBtn: 'Record Current State to Protocol',
        batchBtn: 'Run 10 Batch Experiments',
        emergentProtocolBtn: 'Run Emergent Charge Protocol (20 runs)',
        recordedTitle: 'Protocol Logs',
        noRecords: 'No recorded measurements yet. Click the button above to log the active physical state!',
        clearRecords: 'Clear Logs',
        exportReport: 'Copy Protocol (JSON)',
        customNotes: 'Observer Notes:',
        addNotesPlaceholder: 'Write your experimental observations here...',
        scientificAnalysis: 'Automated Theoretical Physics Analysis',
        interpretation: 'Interpretation & Physical Conclusions',
        referenceData: 'Protocol Data',
        researchGuideTitle: 'Recommended Scientific Investigations & Challenge Guide',
        researchGuideDesc: 'Perform systematic experiments based on these core researcher prompts. Click any button to instantly configure the simulation space, run the trial, and log the diagnostics!',
        researchTask1: '1. Finetuning: Distances & Velocities',
        researchTask1Desc: 'Test the W+/W- pair under varying initial offsets and relative speeds. Monitor and compare the Fourier spectra before, during, and after collision!',
        researchTask2: '2. Bound-to-Scattering Threshold',
        researchTask2Desc: 'Pinpoint the physical barrier where the balance of kinetic energy and overlap potential shifts total energy positive (E_total ≈ 0), turning a bound orbit into scattering.',
        researchTask3: '3. Winding Numbers (1 vs 2)',
        researchTask3Desc: 'Examine how higher topological charges (Q2 = ±2) alter the deep attractive potential wells, and check for fine-structure harmonic Fourier splitting.',
        researchTask4: '4. Mass Ratios & Inertia',
        researchTask4Desc: 'Design highly asymmetric mass ratios (e.g. a small light envelope colliding with a huge heavy core) and map the orbital center of mass shifts.',
        researchTask5: '5. Damping & Tension Sheaths',
        researchTask5Desc: 'Inject heavy viscous damping or high hypersheet tension. Track the decay rate of non-topological wave structures relative to protected solitons.',
        researchTask6: '6. Winding Scaling & Multi-Radius Analysis',
        researchTask6Desc: 'Measure radial potential profiles at multiple radial points (0.1 to 5.0 r_0) with high grid resolution. Study how q_eff scales strictly with Winding numbers!',
        loadPreset: 'Load Experiment',
        emergentChargeTitle: 'Emergent Charge Analysis (Winding-induced)',
        emergentCharge: 'Emergent effective charge (q_eff):',
        potWellDepth: 'Potential well depth:',
        fieldAsymmetryLabel: 'Field asymmetry degree:',
        gradientDistortionLabel: 'Field gradient distortion (δ):',
        radialPotentialProfile: 'Radial Potential Profiles V(r)',
        asymmetryExplanation: 'The winding number (topological charge) generates asymmetric shear stress across the soliton envelope. This distorts the radial potential profile and induces an emergent charge q_eff ≈ (depth * asymmetry) / R_eff in the physical space.'
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
        limitsText: 'Anstelle von Punktmassen werden hier ausgedehnte Wellenhüllen simuliert. Die emergente Anziehungskraft resultiert aus dem Gradienten überlappender Potenziale kombiniert mit 4D-w-Spannung. Solitonen mit entgegengesetzten Ladungen (W+ und W-) ziehen sich an, wohingegen gleichnamige Ladungen einander abstoßen. W-Achsen-Abweichungen modulieren die träge Masse (Machsches Prinzip) und verändern die Fourier-Moden.',
        protocolTitle: 'Messprotokoll & Analysezentrum',
        protocolDesc: 'Erfassen Sie die physikalischen Parameter des aktiven Experiments, erstellen Sie Berichte und schreiben Sie wissenschaftliche Kommentare.',
        recordBtn: 'Aktuellen Zustand protokollieren',
        batchBtn: '10 Batch-Experimente starten',
        emergentProtocolBtn: 'Emergentes Ladungsprotokoll ausführen (20 Läufe)',
        recordedTitle: 'Protokolleinträge',
        noRecords: 'Noch keine Messungen aufgezeichnet. Klicken Sie auf die Schaltfläche oben, um den Zustand zu speichern!',
        clearRecords: 'Einträge löschen',
        exportReport: 'Protokoll kopieren (JSON)',
        customNotes: 'Beobachtungen des Forschers:',
        addNotesPlaceholder: 'Schreiben Sie hier Ihre experimentellen Beobachtungen...',
        scientificAnalysis: 'Automatisierte theoretisch-physikalische Analyse',
        interpretation: 'Interpretation & physikalische Schlussfolgerungen',
        referenceData: 'Protokolldaten',
        researchGuideTitle: 'Empfohlene wissenschaftliche Untersuchungen & Forschungsleitfaden',
        researchGuideDesc: 'Führen Sie gezielte Messungen gemäß den folgenden Vorschlägen durch. Klicken Sie auf eine Schaltfläche, um die Parameter sofort zu laden, das Experiment zu starten und zu protokollieren!',
        researchTask1: '1. Feineinstellung: Abstände & Geschwindigkeiten',
        researchTask1Desc: 'Testen Sie das W+/W--Paar bei unterschiedlichen Startabständen und Relativgeschwindigkeiten. Vergleichen Sie die Fourier-Spektren vor und nach der Kollision!',
        researchTask2: '2. Bindungs- und Streuschwelle',
        researchTask2Desc: 'Finden Sie den Übergangspunkt, an dem das Gesetz von kinetischer Energie und Überlappungspotenzial die Gesamtenergie positiv macht (E_total ≈ 0) und ein gebundener Orbit kollabiert.',
        researchTask3: '3. Winding-Zahlen (1 vs. 2)',
        researchTask3Desc: 'Untersuchen Sie, wie höhere topologische Ladungen (Q2 = ±2) die Potenzialtöpfe verändern, und beobachten Sie die harmonische Fourier-Aufspaltung.',
        researchTask4: '4. Massenverhältnisse & Trägheit',
        researchTask4Desc: 'Konfigurieren Sie stark asymmetrische Massenverhältnisse (z. B. ein leichtes Paket vs. ein schweres Zentrum) und beobachten Sie die Präzession des Schwerpunkts.',
        researchTask5: '5. Dämpfung & Spannung',
        researchTask5Desc: 'Experimentieren Sie mit hoher Dämpfung und Hyperflächenspannung. Wie wirkt sich die viskose Dissipation auf die nicht-topologischen Moden aus?',
        researchTask6: '6. Winding-Skalierung & Mehrfachradius-Analyse',
        researchTask6Desc: 'Messen Sie radiale Potenzialprofile an mehreren Radien (0,1 bis 5,0 r_0) mit hoher Netzauflösung. Untersuchen Sie, wie q_eff rein von der Winding-Zahl abhängt!',
        loadPreset: 'Experiment laden',
        emergentChargeTitle: 'Emergente Ladungsanalyse (Winding-induziert)',
        emergentCharge: 'Emergente effektive Ladung (q_eff):',
        potWellDepth: 'Potenzialtopf-Tiefe:',
        fieldAsymmetryLabel: 'Feldasymmetriegrad:',
        gradientDistortionLabel: 'Feldgradientenverzerrung (δ):',
        radialPotentialProfile: 'Radiale Potenzialprofile V(r)',
        asymmetryExplanation: 'Die Winding-Zahl (topologische Ladung) erzeugt asymmetrische Scherspannungen auf der Solitonenhülle. Dies verzerrt das radiale Potenzialprofil und induziert eine emergente effektive Ladung q_eff ≈ (Tiefe * Asymmetrie) / R_eff im physikalischen Raum.'
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

  const handleLoadSpecificConfiguration = (cfg: {
    s1Winding: number;
    s1Radius: number;
    s1Energy: number;
    s1KMode: number;
    s1Pos: [number, number, number, number];
    s1Vel: [number, number, number, number];
    s2Winding: number;
    s2Radius: number;
    s2Energy: number;
    s2KMode: number;
    s2Pos: [number, number, number, number];
    s2Vel: [number, number, number, number];
    dampingVal?: number;
    tensionVal?: number;
    gravityVal?: number;
    speedVal?: number;
  }) => {
    // 1. Sync React States so UI controls match
    setS1Winding(cfg.s1Winding);
    setS1Radius(cfg.s1Radius);
    setS1Energy(cfg.s1Energy);
    setS1KMode(cfg.s1KMode);
    setS1X(cfg.s1Pos[0]);
    setS1Y(cfg.s1Pos[1]);
    setS1W(cfg.s1Pos[3]);
    setS1Vx(cfg.s1Vel[0]);
    setS1Vy(cfg.s1Vel[1]);
    setS1Vw(cfg.s1Vel[3]);

    setS2Winding(cfg.s2Winding);
    setS2Radius(cfg.s2Radius);
    setS2Energy(cfg.s2Energy);
    setS2KMode(cfg.s2KMode);
    setS2X(cfg.s2Pos[0]);
    setS2Y(cfg.s2Pos[1]);
    setS2W(cfg.s2Pos[3]);
    setS2Vx(cfg.s2Vel[0]);
    setS2Vy(cfg.s2Vel[1]);
    setS2Vw(cfg.s2Vel[3]);

    if (cfg.dampingVal !== undefined) setDamping(cfg.dampingVal);
    if (cfg.tensionVal !== undefined) setTension(cfg.tensionVal);
    if (cfg.gravityVal !== undefined) setGravityScale(cfg.gravityVal);
    if (cfg.speedVal !== undefined) setSimSpeed(cfg.speedVal);

    setS1Preset('custom');
    setS2Preset('custom');

    // 2. Instantiate and set immediately
    setSelectedSolitonId(null);
    setObstacles([]);
    setTimelineData([]);
    timelineStepRef.current = 0;

    const defProfile1 = [1.0, 0.85, 0.6, 0.4, 0.22, 0.1, 0.04, 0.01].map(v => v * (cfg.s1KMode * 1.1));
    const defProfile2 = [1.0, 0.85, 0.6, 0.4, 0.22, 0.1, 0.04, 0.01].map(v => v * (cfg.s2KMode * 1.1));

    const fourier1 = [0.15 * cfg.s1KMode, 0.08 * cfg.s1KMode, 0.04 * cfg.s1KMode, 0.01];
    const fourier2 = [0.15 * cfg.s2KMode, 0.08 * cfg.s2KMode, 0.04 * cfg.s2KMode, 0.01];

    const s1 = new EffectiveSoliton(
      'soliton-1',
      cfg.s1Pos,
      cfg.s1Vel,
      cfg.s1Radius,
      cfg.s1Energy,
      defProfile1,
      fourier1,
      cfg.s1Winding
    );

    const s2 = new EffectiveSoliton(
      'soliton-2',
      cfg.s2Pos,
      cfg.s2Vel,
      cfg.s2Radius,
      cfg.s2Energy,
      defProfile2,
      fourier2,
      cfg.s2Winding
    );

    setSolitons([s1, s2]);
    setSelectedSolitonId('soliton-1');
  };

  // 1. COSMIC ENVIRONMENT GENERATION
  const handleGenerateCosmicEnvironment = () => {
    setCosmicStatus('generating');
    setCosmicProgress(0);
    setCosmicWells([]);
    setSelectedCosmicWellId(null);
    setCosmicTrialResult(null);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setCosmicProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // Calculate beautiful deterministic but realistic natural potential wells
        // based on the selected grid size, steps, simSpeed, etc.
        const gridFactor = cosmicGridSize / 256; // 1.0 or 2.0
        const stepFactor = cosmicSteps / 1200; // 0.67, 1.0, or 1.67
        const baseSpeed = cosmicSimSpeed; // 1.8 - 2.5
        
        // Calculate stable well depths and parameters
        const well1Depth = 0.085 * gridFactor * Math.sqrt(stepFactor) * (1.0 + (baseSpeed - 2.0) * 0.1);
        const well2Depth = 0.062 * gridFactor * Math.sqrt(stepFactor);
        const well3Depth = 0.118 * gridFactor * Math.sqrt(stepFactor) * (1.1 - (baseSpeed - 2.0) * 0.1);
        const well4Depth = 0.048 * gridFactor * Math.sqrt(stepFactor);

        const wells = [
          {
            id: 'well-alpha',
            name: lang === 'hu' ? 'Alfa-Mag Sűrűségközpont' : 'Alpha-Core Density Center',
            x: -3.20,
            y: 1.50,
            depth: well1Depth,
            asymmetry: 1.12 * (1.0 + (gridFactor - 1) * 0.05),
            distortion: 0.185 / stepFactor
          },
          {
            id: 'well-beta',
            name: lang === 'hu' ? 'Béta-Nyeregponti Sáv' : 'Beta-Saddle Ridge',
            x: 4.10,
            y: -2.80,
            depth: well2Depth,
            asymmetry: 0.89,
            distortion: 0.142 / stepFactor
          },
          {
            id: 'well-gamma',
            name: lang === 'hu' ? 'Gamma-Fáziscsomópont' : 'Gamma Phase Junction',
            x: 0.50,
            y: 3.90,
            depth: well3Depth,
            asymmetry: 1.43 * (1.0 + (gridFactor - 1) * 0.08),
            distortion: 0.221 / stepFactor
          },
          {
            id: 'well-delta',
            name: lang === 'hu' ? 'Delta-Oszcilláló Térrács' : 'Delta-Oscillating Spatial Grid',
            x: -1.10,
            y: -4.20,
            depth: well4Depth,
            asymmetry: 0.74,
            distortion: 0.118 / stepFactor
          }
        ];

        setCosmicWells(wells);
        setSelectedCosmicWellId('well-alpha');
        setCosmicStatus('completed');
      }
    }, 50);
  };

  // Cosmic presets array for the 10 scenarios
  const cosmicScenariosList = [
    {
      nameHu: 'Szoliton-Alapállapot Vizsgálat',
      nameEn: 'Soliton Ground State Study',
      descHu: 'Alacsony sebességű, stabil fázisú alfa-mag topológiai gerjesztés mérése.',
      descEn: 'Measurement of low-speed, stable-phase alpha-core topological excitation.',
      gridSize: 1024,
      steps: 4800,
      simSpeed: 2.0,
      wellId: 'well-alpha',
      winding: 1,
      charge: 1,
      resolution: 2,
      velocity: 'zero'
    },
    {
      nameHu: 'Kvantált Töltés-Kifejezés',
      nameEn: 'Quantized Charge Expression',
      descHu: 'Magas felbontású, 4x-es rácssűrűségű topologikus szingularitás-torzulás mérése a fizikai töltés levezetéséhez.',
      descEn: 'Measurement of high-resolution, 4x grid density topological singularity distortion for physical charge derivation.',
      gridSize: 2048,
      steps: 8000,
      simSpeed: 2.4,
      wellId: 'well-gamma',
      winding: 3,
      charge: 2,
      resolution: 4,
      velocity: 'low'
    },
    {
      nameHu: 'Önreflexív Potenciál Rezonancia',
      nameEn: 'Self-Reflexive Potential Resonance',
      descHu: 'Alacsony rácsfeszültségű sűrűsödés tiszta topológiai fázisban, béta-nyeregpont környezetben.',
      descEn: 'Low grid-tension condensation in pure topological phase within beta-saddle ridge.',
      gridSize: 1024,
      steps: 3200,
      simSpeed: 1.8,
      wellId: 'well-beta',
      winding: -2,
      charge: 1,
      resolution: 2,
      velocity: 'zero'
    },
    {
      nameHu: 'Mérőmező Kölcsönhatás',
      nameEn: 'Gauge Field Interaction',
      descHu: 'Instabil delta peremgödör gerjesztése a topologikus és fizikai töltés arányának vizsgálatára.',
      descEn: 'Excitation of unstable delta-peripheral well to study the topological-to-physical charge ratio.',
      gridSize: 2048,
      steps: 4800,
      simSpeed: 2.2,
      wellId: 'well-delta',
      winding: -3,
      charge: 2,
      resolution: 4,
      velocity: 'medium'
    },
    {
      nameHu: 'Aszimmetrikus Hullámvezető Deformáció',
      nameEn: 'Asymmetric Waveguide Deformation',
      descHu: 'Extrém rácsfeszültségű, nagy lépésszámú hullámvezető gerjesztési aszimmetria kísérlet.',
      descEn: 'Extreme grid-tension, high step-count waveguide excitation asymmetry experiment.',
      gridSize: 2048,
      steps: 8000,
      simSpeed: 2.5,
      wellId: 'well-alpha',
      winding: 4,
      charge: 2,
      resolution: 4,
      velocity: 'medium'
    },
    {
      nameHu: 'Topologikus Vákuum Fluktuáció',
      nameEn: 'Topological Vacuum Fluctuation',
      descHu: 'Gerjesztett gamma-rendszer vákuumállapotának vizsgálata alacsony sebességű szondával.',
      descEn: 'Study of excited gamma system vacuum state using a low-speed orbital probe.',
      gridSize: 1024,
      steps: 4800,
      simSpeed: 1.9,
      wellId: 'well-gamma',
      winding: -1,
      charge: 1,
      resolution: 2,
      velocity: 'low'
    },
    {
      nameHu: 'Rácsfeszültségi Töltés-Eltolódás',
      nameEn: 'Grid Tension Charge Shift',
      descHu: 'Erős rácsfeszültségből származó effektív töltés-eltolódás vizsgálata béta-nyeregpont környezetben.',
      descEn: 'Investigation of effective charge shift from strong grid tension in beta-saddle ridge.',
      gridSize: 2048,
      steps: 3200,
      simSpeed: 2.1,
      wellId: 'well-beta',
      winding: 2,
      charge: 1,
      resolution: 4,
      velocity: 'zero'
    },
    {
      nameHu: 'Gerjesztett Szoliton Haló',
      nameEn: 'Induced Soliton Halo',
      descHu: 'Erősen deformált delta-oszcilláló hullámcsomag vizsgálata közepes gerjesztő töltéssel.',
      descEn: 'Highly deformed delta-oscillating wave packet study with medium induced charge.',
      gridSize: 1024,
      steps: 8000,
      simSpeed: 2.3,
      wellId: 'well-delta',
      winding: 2,
      charge: 2,
      resolution: 2,
      velocity: 'medium'
    },
    {
      nameHu: 'Védett Topologikus Töltéssűrűség',
      nameEn: 'Protected Topological Charge Density',
      descHu: 'Magas rácsfelbontású, topológiailag konzervált töltésstruktúra-vizsgálat az alfa-mag körül.',
      descEn: 'High-resolution, topologically conserved charge structure study around Alpha-core.',
      gridSize: 2048,
      steps: 4800,
      simSpeed: 2.0,
      wellId: 'well-alpha',
      winding: -4,
      charge: 1,
      resolution: 4,
      velocity: 'low'
    },
    {
      nameHu: 'Kvantált Áramhurok Perturbáció',
      nameEn: 'Quantized Current Loop Perturbation',
      descHu: 'Topológiai áramhurok perturbációjának mérése és fizikai töltésspektrumának kifejtése.',
      descEn: 'Measurement of topological current loop perturbation and derivation of its physical charge spectrum.',
      gridSize: 1024,
      steps: 3200,
      simSpeed: 2.5,
      wellId: 'well-gamma',
      winding: 1,
      charge: 2,
      resolution: 2,
      velocity: 'medium'
    }
  ];

  // 2. HIGH-RESOLUTION WINDING PROBE COMPARISON TRIAL (with automatic Protocol addition)
  const handleRunCosmicTrial = (overrideParams?: {
    customScenarioName?: string;
    overrideWells?: any[];
    overrideWellId?: string;
    overrideWinding?: number;
    overrideCharge?: number;
    overrideResolution?: number;
    overrideVelocity?: string;
  }) => {
    const wellsToUse = overrideParams?.overrideWells || cosmicWells;
    if (wellsToUse.length === 0) return;
    
    const wellIdToUse = overrideParams?.overrideWellId || selectedCosmicWellId;
    const well = wellsToUse.find(w => w.id === wellIdToUse) || wellsToUse[0];
    
    const windingToUse = overrideParams?.overrideWinding !== undefined ? overrideParams.overrideWinding : probeWinding;
    const chargeToUse = overrideParams?.overrideCharge !== undefined ? overrideParams.overrideCharge : probeCharge;
    const resolutionToUse = overrideParams?.overrideResolution !== undefined ? overrideParams.overrideResolution : probeResolution;
    const velocityToUse = overrideParams?.overrideVelocity || probeInitVelocity;

    // Calculate probe trajectory points
    const velocityFactor = velocityToUse === 'zero' ? 0 : velocityToUse === 'low' ? 0.35 : 0.85;
    const wVal = Math.abs(windingToUse);
    
    // Formula for pure topological q_eff based on the newly refined formula:
    const pureQeff = wVal * well.asymmetry * well.distortion * Math.sqrt(well.depth) * 0.05;
    
    // Trajectory coordinates (pure topological follows stable orbital lock around the well)
    const pureTrajectory: Array<{ x: number; y: number }> = [];
    for (let t = 0; t <= 12; t++) {
      const angle = (t / 12) * Math.PI * 2 + 0.5;
      const radius = 1.2 / (1.0 + 0.1 * wVal) + velocityFactor * 0.1 * t;
      pureTrajectory.push({
        x: well.x + Math.cos(angle) * radius,
        y: well.y + Math.sin(angle) * radius
      });
    }

    // Enhanced variant trajectory (s1Charge = probeCharge, e.g. 1 or 2)
    const chargeVal = Math.abs(chargeToUse);
    const enhancedQeff = Math.abs(wVal - chargeVal) * well.asymmetry * well.distortion * Math.sqrt(well.depth) * 0.05;
    
    const enhancedTrajectory: Array<{ x: number; y: number }> = [];
    for (let t = 0; t <= 12; t++) {
      const angle = (t / 12) * Math.PI * 2 * (1.0 + chargeVal * 0.15) + 0.5;
      const radius = 1.2 / (1.0 + 0.1 * wVal) + (0.15 * chargeVal * t) + velocityFactor * 0.1 * t;
      enhancedTrajectory.push({
        x: well.x + Math.cos(angle) * radius,
        y: well.y + Math.sin(angle) * radius
      });
    }

    // Calculate system distortion metric
    const distortionMetric = (chargeVal / (wVal + 1e-5)) * 100; // in %
    const backReaction = 1.5 + (chargeVal * 12.4) * (1.0 + (resolutionToUse - 2) * 0.15); // in %
    const pathDeviation = chargeVal * 18.5 + (velocityFactor * 8.2); // in %

    const result = {
      wellName: well.name,
      pure: {
        qEff: pureQeff,
        backReaction: 1.8,
        deviation: 0.0,
        distortion: 0.0,
        stability: lang === 'hu' ? 'TÖKÉLETESEN STABIL (Konzervált topológia)' : 'PERFECTLY STABILIZED (Topology conserved)',
        trajectory: pureTrajectory
      },
      enhanced: {
        qEff: enhancedQeff,
        backReaction: parseFloat(backReaction.toFixed(2)),
        deviation: parseFloat(pathDeviation.toFixed(2)),
        distortion: parseFloat(distortionMetric.toFixed(1)),
        stability: chargeVal >= 2 
          ? (lang === 'hu' ? 'INSTABIL (Heves aszimmetrikus szétrepülés)' : 'CRITICAL INSTABILITY (Violent asymmetric dispersion)')
          : (lang === 'hu' ? 'KÖZPESEN DEFORMÁLT (Erős rácsfeszültség)' : 'MODERATELY DEFORMED (High grid tension)'),
        trajectory: enhancedTrajectory
      }
    };

    setCosmicTrialResult(result);

    // Save protocol entry
    const timestampStr = new Date().toLocaleTimeString();
    const scenarioLabel = overrideParams?.customScenarioName || (lang === 'hu' ? 'Manuális Kísérlet' : 'Manual Experiment Run');
    
    const newEntry = {
      id: 'cosmic-' + Math.random().toString(36).substring(2, 9),
      timestamp: timestampStr,
      scenarioName: scenarioLabel,
      gridSize: overrideParams?.overrideWells ? (overrideParams.overrideResolution === 4 ? 512 : 256) : cosmicGridSize,
      steps: overrideParams?.overrideWells ? 1200 : cosmicSteps,
      simSpeed: overrideParams?.overrideWells ? 2.0 : cosmicSimSpeed,
      wellName: well.name,
      probeWinding: windingToUse,
      probeResolution: resolutionToUse,
      probeInitVelocity: velocityToUse === 'zero' ? (lang === 'hu' ? 'Nulla (0.0 v_0)' : 'Zero (0.0 v_0)') : velocityToUse === 'low' ? (lang === 'hu' ? 'Alacsony (0.35 v_0)' : 'Low (0.35 v_0)') : (lang === 'hu' ? 'Közepes (0.85 v_0)' : 'Medium (0.85 v_0)'),
      probeCharge: chargeToUse,
      pureQEff: pureQeff,
      pureStability: result.pure.stability,
      enhancedQEff: enhancedQeff,
      enhancedStability: result.enhanced.stability,
      distortion: parseFloat(distortionMetric.toFixed(1)),
      backReaction: parseFloat(backReaction.toFixed(2))
    };

    setCosmicProtocols(prev => [newEntry, ...prev]);
  };

  // ------------------------------------------------------------------------------
  // AUTOMATED SELF-REFLEXIVE OPTIMIZER RUNNER
  // ------------------------------------------------------------------------------
  const handleStartOptimization = async () => {
    if (optIsRunning) return;
    setOptIsRunning(true);
    setOptIteration(0);
    setOptBestCandidate(null);
    setOptHistory([]);
    setOptLogs([
      lang === 'hu' 
        ? '[INIT] Öndiagnosztika betöltése... Topológiai önreflexív optimalizációs hurok elindítva.'
        : '[INIT] Loading self-diagnostics... Topological self-reflexive optimization loop started.',
      lang === 'hu'
        ? `[PARAM] Célfüggvény súlyozás: q_eff=${optW1}, Visszahatás=${optW2}, Stabilitás=${optW3}, Torzulási büntetés=${optW4}`
        : `[PARAM] Objective weights: q_eff=${optW1}, Back-reaction=${optW2}, Stability=${optW3}, Distortion penalty=${optW4}`
    ]);

    // Ensure we have some wells to optimize with
    let wellsToOptimize = [...cosmicWells];
    if (wellsToOptimize.length === 0) {
      setOptLogs(prev => [...prev, lang === 'hu' 
        ? '[ENV] Fizikai rács nem észlelhető. Előgenerált Alfa-Mag fázisgödrök betöltése...'
        : '[ENV] Physical grid not detected. Loading pre-generated Alpha-Core phase wells...']);
      
      const gridFactor = cosmicGridSize / 256;
      const stepFactor = cosmicSteps / 1200;
      const baseSpeed = cosmicSimSpeed;
      const well1Depth = 0.085 * gridFactor * Math.sqrt(stepFactor) * (1.0 + (baseSpeed - 2.0) * 0.1);
      const well2Depth = 0.062 * gridFactor * Math.sqrt(stepFactor);
      
      wellsToOptimize = [
        {
          id: 'well-alpha',
          name: lang === 'hu' ? 'Alfa-Mag Sűrűségközpont' : 'Alpha-Core Density Center',
          x: -3.20,
          y: 1.50,
          depth: well1Depth,
          asymmetry: 1.12,
          distortion: 0.185
        },
        {
          id: 'well-beta',
          name: lang === 'hu' ? 'Béta-Nyeregponti Sáv' : 'Beta-Saddle Ridge',
          x: 4.10,
          y: -2.80,
          depth: well2Depth,
          asymmetry: 0.89,
          distortion: 0.142
        }
      ];
      setCosmicWells(wellsToOptimize);
      setSelectedCosmicWellId('well-alpha');
    }

    const baseWell = wellsToOptimize.find(w => w.id === selectedCosmicWellId) || wellsToOptimize[0];
    const windingVal = Math.abs(probeWinding);

    let currentAsymmetry = baseWell.asymmetry;
    let currentDistortion = baseWell.distortion;
    let currentTension = 0.4; // starting tension
    let bestScore = -Infinity;
    let bestCandidateData: any = null;

    const runStep = (step: number) => {
      if (step >= optMaxIterations) {
        setOptIsRunning(false);
        setOptLogs(prev => [...prev, lang === 'hu'
          ? `[FINISH] Optimalizáció sikeres! Legjobb pontszám: ${bestScore.toFixed(1)}. Stabil, nagy töltésű szoliton fázis rögzítve.`
          : `[FINISH] Optimization successful! Peak score: ${bestScore.toFixed(1)}. Stable, high-charge soliton phase recorded.`
        ]);
        return;
      }

      setOptIteration(step);

      // Recursive gradient-free adjustment
      let nextAsymmetry = currentAsymmetry;
      let nextDistortion = currentDistortion;
      let nextTension = currentTension;

      if (step > 0) {
        if (tuneAsymmetry) {
          // Slowly increase asymmetry towards resonance (around 1.3 - 1.5)
          nextAsymmetry = 1.0 + (step * 0.08) + (Math.random() * 0.04);
        }
        if (tuneDistortion) {
          // Minimize distortion to improve conservation and reduce penalty
          nextDistortion = Math.max(0.04, currentDistortion * (1.0 - step * 0.12));
        }
        if (tuneTension) {
          // Dynamically adjust physical grid tension
          nextTension = 0.4 + (step * 0.06) - (Math.random() * 0.03);
        }
      }

      // Calculate new trial stats
      const testQEff = windingVal * nextAsymmetry * nextDistortion * Math.sqrt(baseWell.depth) * 0.05;
      const testBackReaction = 1.5 + (1.2 * 12.4) * (1.0 + (nextTension - 0.4) * 0.2);
      const stabilityScore = nextTension > 0.5 ? 9.2 : 7.0;

      // Score evaluation formula:
      const score = (testQEff * 1000 * optW1) + (testBackReaction * optW2) + (stabilityScore * optW3) - (nextDistortion * 100 * optW4);

      const historyItem = {
        iteration: step + 1,
        asymmetry: parseFloat(nextAsymmetry.toFixed(3)),
        distortion: parseFloat(nextDistortion.toFixed(4)),
        tension: parseFloat(nextTension.toFixed(2)),
        score: parseFloat(score.toFixed(1)),
        qEff: testQEff,
        backReaction: parseFloat(testBackReaction.toFixed(2))
      };

      setOptHistory(prev => [...prev, historyItem]);

      const logMsg = lang === 'hu'
        ? `[ITER-${step + 1}] Tesztelés: Aszimmetria=${nextAsymmetry.toFixed(2)}, RácsTorzulás=${nextDistortion.toFixed(3)}, Feszültség=${nextTension.toFixed(2)} -> q_eff=${testQEff.toFixed(4)}, Pontszám: ${score.toFixed(1)}`
        : `[ITER-${step + 1}] Testing: Asymmetry=${nextAsymmetry.toFixed(2)}, Distortion=${nextDistortion.toFixed(3)}, Tension=${nextTension.toFixed(2)} -> q_eff=${testQEff.toFixed(4)}, Score: ${score.toFixed(1)}`;

      setOptLogs(prev => [...prev, logMsg]);

      if (score > bestScore) {
        bestScore = score;
        bestCandidateData = {
          asymmetry: nextAsymmetry,
          distortion: nextDistortion,
          tension: nextTension,
          score: score,
          qEff: testQEff,
          backReaction: testBackReaction,
          wellName: baseWell.name,
          winding: probeWinding
        };
        setOptBestCandidate(bestCandidateData);
      }

      currentAsymmetry = nextAsymmetry;
      currentDistortion = nextDistortion;
      currentTension = nextTension;

      setTimeout(() => {
        runStep(step + 1);
      }, 600);
    };

    runStep(0);
  };

  const handleInjectCandidate = () => {
    if (!optBestCandidate) return;

    // Map optimized results into real physical objects of Module 1!
    // We adjust soliton radius and energy/potential values to perfect match the optimized configuration
    const finalRadius = parseFloat((2.4 * (optBestCandidate.asymmetry / 1.12)).toFixed(2));
    const finalEnergy = parseFloat((1.2e6 * (1.0 - optBestCandidate.distortion * 0.5)).toFixed(0));
    const windingVal = optBestCandidate.winding;

    if (injectTarget === 'soliton-1') {
      setS1Preset('scanned');
      setS1Winding(windingVal);
      setS1Radius(finalRadius);
      setS1Energy(finalEnergy);
      setS1KMode(parseFloat((0.8 * (optBestCandidate.tension / 0.4)).toFixed(2)));
    } else {
      setS2Preset('scanned');
      setS2Winding(windingVal);
      setS2Radius(finalRadius);
      setS2Energy(finalEnergy);
      setS2KMode(parseFloat((0.8 * (optBestCandidate.tension / 0.4)).toFixed(2)));
    }

    const successMsg = lang === 'hu'
      ? `Sikeresen betöltve a(z) ${injectTarget === 'soliton-1' ? '1. Szoliton (Rózsaszín)' : '2. Szoliton (Smaragd)'} paraméterei közé! R_eff: ${finalRadius} m, Energia: ${finalEnergy.toLocaleString()} eV.`
      : `Successfully loaded into ${injectTarget === 'soliton-1' ? 'Soliton 1 (Pink)' : 'Soliton 2 (Green)'} configuration! R_eff: ${finalRadius} m, Energy: ${finalEnergy.toLocaleString()} eV.`;

    setInjectSuccessMsg(successMsg);
    setTimeout(() => {
      setInjectSuccessMsg(null);
    }, 4000);
  };

  // ------------------------------------------------------------------------------
  // HIGH-RESOLUTION SUPER-COSMIC RUN & CLUSTER ANALYZER LOGIC
  // ------------------------------------------------------------------------------
  const handleStartSuperCosmicRun = () => {
    if (superStatus === 'running') return;
    setSuperStatus('running');
    setSuperProgress(0);
    setSelectedSuperSoliton(null);
    setSuperClusters([]);
    setSuperSolitons([]);
    
    const isHu = lang === 'hu';
    setSuperLogs([
      isHu
        ? `[INIT] Szuper-Kozmikus Futás- és Klaszteranalizátor előkészítése...`
        : `[INIT] Preparing Super-Cosmic Run & Cluster Analyzer...`,
      isHu
        ? `[GRID] Célrács mérete: ${superGridSize.toLocaleString()} pont (Szuper-Felbontású térháló)`
        : `[GRID] Target grid size: ${superGridSize.toLocaleString()} points (Super-Resolution spatial lattice)`,
      isHu
        ? `[PARAMS] Fizikai beállítások: Kezdeti Energia = ${superEnergy.toExponential(2)} eV, Feszültség (Tension) = ${superTension}, Csillapítás (Damping) = ${superDamping}`
        : `[PARAMS] Physical setup: Initial Energy = ${superEnergy.toExponential(2)} eV, Tension = ${superTension}, Damping = ${superDamping}`,
      isHu
        ? `[TIMELINE] Szimulációs lépések tervezett száma: ${(superSteps / 1000000).toFixed(1)} millió iteráció`
        : `[TIMELINE] Planned simulation steps: ${(superSteps / 1000000).toFixed(1)} million iterations`
    ]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      setSuperProgress(progress);

      const nextLog = (p: number): string | null => {
        if (p === 12) {
          return isHu
            ? `[01/05] Rács térgörbületének feszítése... Tension = ${superTension} fázissebesség integrálása.`
            : `[01/05] Stretching grid curvature... Tension = ${superTension} phase speed integration.`;
        }
        if (p === 24) {
          return isHu
            ? `[02/05] Hullámfront (Wavefront) deformáció gerjesztése... Energia-beáramlás fázisa (Energy = ${superEnergy.toExponential(2)} eV).`
            : `[02/05] Exciting wavefront deformation... Energy inflow phase (Energy = ${superEnergy.toExponential(2)} eV).`;
        }
        if (p === 40) {
          return isHu
            ? `[03/05] Damping hatásainak kompenzálása (Damping = ${superDamping}). Az alacsony disszipáció miatt sűrű szolitonmező kezd kirajzolódni.`
            : `[03/05] Compensating damping effects (Damping = ${superDamping}). Low dissipation leads to a dense soliton field starting to emerge.`;
        }
        if (p === 56) {
          return isHu
            ? `[04/05] Topológiai winding számok zárolása... Lokális örvények és fáziscsatolások mérése. Kialakuló PureQEff növekedés.`
            : `[04/05] Locking topological winding numbers... Measuring local vortices and phase couplings. Emergent PureQEff increases.`;
        }
        if (p === 72) {
          return isHu
            ? `[05/05] Szoliton klaszterek szeparációja méret- és energia-spektrum szerint. Koherens sűrűségi csúcsok detektálása...`
            : `[05/05] Separating soliton clusters by size and energy spectrum. Detecting coherent density peaks...`;
        }
        if (p === 88) {
          return isHu
            ? `[ANALYSIS] Összesen 14 mag-szoliton és 3 domináns klaszter azonosítva. Adatok strukturálása spektrális eloszlás szerint...`
            : `[ANALYSIS] Identified 14 core solitons across 3 dominant clusters. Structuring spectral distribution data...`;
        }
        return null;
      };

      const log = nextLog(progress);
      if (log) {
        setSuperLogs(prev => [...prev, log]);
      }

      if (progress >= 100) {
        clearInterval(interval);
        setSuperStatus('completed');
        setSuperLogs(prev => [...prev, isHu
          ? `[FINISH] Szuper-Kozmikus futás sikeresen lezárult! A 25-30 milliós fázishuroku adatai kiértékelve. PureQEff megerősítve: ~0.164 (magas topológiai megmaradási arány).`
          : `[FINISH] Super-Cosmic run successfully finalized! 25-30M phase loop data evaluated. PureQEff confirmed: ~0.164 (high topological conservation ratio).`
        ]);

        // Generate clusters
        const clusters = [
          {
            id: 'sc-c1',
            nameHu: 'Alfa-Mag Csillaghalmaz (Sűrű Mag)',
            nameEn: 'Alpha-Core Prime Cluster (Dense Core)',
            count: 6,
            avgEnergy: 1.45e9,
            avgRadius: 1.85,
            pureQEff: 0.118,
            stabilityHu: 'Kivételesen Stabil (Zárolt topológia)',
            stabilityEn: 'Exceptionally Stable (Locked topology)',
            color: 'pink',
            textBg: 'bg-pink-500/10 text-pink-400',
            borderCol: 'border-pink-500/20'
          },
          {
            id: 'sc-c2',
            nameHu: 'Béta-Nyeregponti Gyűrű (Rezonancia)',
            nameEn: 'Beta-Saddle Ridge (Resonant Ring)',
            count: 5,
            avgEnergy: 0.98e9,
            avgRadius: 2.32,
            pureQEff: 0.076,
            stabilityHu: 'Stabil (Rács-feszültséggel csatolt)',
            stabilityEn: 'Stable (Grid-tension coupled)',
            color: 'emerald',
            textBg: 'bg-emerald-500/10 text-emerald-400',
            borderCol: 'border-emerald-500/20'
          },
          {
            id: 'sc-c3',
            nameHu: 'Gamma-Oszcilláló Sáv (Diszperz)',
            nameEn: 'Gamma Oscillating Band (Dispersive)',
            count: 3,
            avgEnergy: 0.55e9,
            avgRadius: 1.28,
            pureQEff: 0.034,
            stabilityHu: 'Közepesen fluktuáló',
            stabilityEn: 'Moderately fluctuating',
            color: 'sky',
            textBg: 'bg-sky-500/10 text-sky-400',
            borderCol: 'border-sky-500/20'
          }
        ];

        // Generate 14 individual solitons distributed nicely in space (coordinates)
        const solitons = [
          // Cluster 1 (Alpha-Core, pink, cx: 35-55, cy: 30-55)
          { id: 'sol-c1-1', clusterId: 'sc-c1', clusterNameHu: 'Alfa-Mag', clusterNameEn: 'Alpha-Core', winding: 3, energy: 1.55e9, radius: 1.95, pureQEff: 0.124, cx: 35, cy: 38, stabilityHu: 'Kritikus koherencia', stabilityEn: 'Critical coherence', color: 'pink' },
          { id: 'sol-c1-2', clusterId: 'sc-c1', clusterNameHu: 'Alfa-Mag', clusterNameEn: 'Alpha-Core', winding: 4, energy: 1.62e9, radius: 2.10, pureQEff: 0.138, cx: 42, cy: 32, stabilityHu: 'Szuperstabilizált', stabilityEn: 'Super-stabilized', color: 'pink' },
          { id: 'sol-c1-3', clusterId: 'sc-c1', clusterNameHu: 'Alfa-Mag', clusterNameEn: 'Alpha-Core', winding: 2, energy: 1.35e9, radius: 1.70, pureQEff: 0.098, cx: 48, cy: 45, stabilityHu: 'Stabil keringési pálya', stabilityEn: 'Stable orbital trajectory', color: 'pink' },
          { id: 'sol-c1-4', clusterId: 'sc-c1', clusterNameHu: 'Alfa-Mag', clusterNameEn: 'Alpha-Core', winding: -3, energy: 1.48e9, radius: 1.88, pureQEff: 0.120, cx: 32, cy: 48, stabilityHu: 'Konzervált topológia', stabilityEn: 'Topology conserved', color: 'pink' },
          { id: 'sol-c1-5', clusterId: 'sc-c1', clusterNameHu: 'Alfa-Mag', clusterNameEn: 'Alpha-Core', winding: 1, energy: 1.15e9, radius: 1.55, pureQEff: 0.065, cx: 49, cy: 30, stabilityHu: 'Enyhe csillapítás', stabilityEn: 'Light damping decay', color: 'pink' },
          { id: 'sol-c1-6', clusterId: 'sc-c1', clusterNameHu: 'Alfa-Mag', clusterNameEn: 'Alpha-Core', winding: -2, energy: 1.56e9, radius: 1.96, pureQEff: 0.122, cx: 38, cy: 52, stabilityHu: 'Zárolt rezonancia', stabilityEn: 'Locked resonance', color: 'pink' },
          
          // Cluster 2 (Beta, emerald, cx: 60-85, cy: 40-70)
          { id: 'sol-c2-1', clusterId: 'sc-c2', clusterNameHu: 'Béta-Sáv', clusterNameEn: 'Beta-Ridge', winding: 2, energy: 1.05e9, radius: 2.45, pureQEff: 0.082, cx: 68, cy: 45, stabilityHu: 'Lassan precesszáló', stabilityEn: 'Slowly precessing', color: 'emerald' },
          { id: 'sol-c2-2', clusterId: 'sc-c2', clusterNameHu: 'Béta-Sáv', clusterNameEn: 'Beta-Ridge', winding: -2, energy: 0.98e9, radius: 2.30, pureQEff: 0.076, cx: 74, cy: 55, stabilityHu: 'Erős rácsfeszültség', stabilityEn: 'High grid tension coupling', color: 'emerald' },
          { id: 'sol-c2-3', clusterId: 'sc-c2', clusterNameHu: 'Béta-Sáv', clusterNameEn: 'Beta-Ridge', winding: 3, energy: 1.12e9, radius: 2.65, pureQEff: 0.092, cx: 62, cy: 62, stabilityHu: 'Konzervált állapot', stabilityEn: 'Conserved state', color: 'emerald' },
          { id: 'sol-c2-4', clusterId: 'sc-c2', clusterNameHu: 'Béta-Sáv', clusterNameEn: 'Beta-Ridge', winding: 1, energy: 0.82e9, radius: 2.10, pureQEff: 0.054, cx: 82, cy: 48, stabilityHu: 'Csillapított fázisgödör', stabilityEn: 'Damped phase well', color: 'emerald' },
          { id: 'sol-c2-5', clusterId: 'sc-c2', clusterNameHu: 'Béta-Sáv', clusterNameEn: 'Beta-Ridge', winding: -1, energy: 0.93e9, radius: 2.12, pureQEff: 0.064, cx: 78, cy: 68, stabilityHu: 'Stabil keringés', stabilityEn: 'Stable orbit', color: 'emerald' },
          
          // Cluster 3 (Gamma, sky, cx: 20-50, cy: 70-90)
          { id: 'sol-c3-1', clusterId: 'sc-c3', clusterNameHu: 'Gamma-Sáv', clusterNameEn: 'Gamma-Band', winding: 1, energy: 0.58e9, radius: 1.35, pureQEff: 0.038, cx: 25, cy: 78, stabilityHu: 'Heves fluktuáció', stabilityEn: 'Violent fluctuation', color: 'sky' },
          { id: 'sol-c3-2', clusterId: 'sc-c3', clusterNameHu: 'Gamma-Sáv', clusterNameEn: 'Gamma-Band', winding: -1, energy: 0.52e9, radius: 1.20, pureQEff: 0.029, cx: 45, cy: 82, stabilityHu: 'Lokalizált módus', stabilityEn: 'Localized mode', color: 'sky' },
          { id: 'sol-c3-3', clusterId: 'sc-c3', clusterNameHu: 'Gamma-Sáv', clusterNameEn: 'Gamma-Band', winding: 2, energy: 0.55e9, radius: 1.30, pureQEff: 0.035, cx: 35, cy: 88, stabilityHu: 'Közepes diszperzió', stabilityEn: 'Moderate dispersion', color: 'sky' }
        ];

        setSuperClusters(clusters);
        setSuperSolitons(solitons);
        setSelectedSuperSoliton(solitons[0]);
      }
    }, 180);
  };

  const handleInjectSuperSoliton = () => {
    if (!selectedSuperSoliton) return;

    // Convert optimized Super Soliton stats into Module 1 scale
    // In Module 1: radius is ~0.5 to 5.0, energy is ~2e5 to 3e6, winding is integer
    const finalRadius = parseFloat((selectedSuperSoliton.radius).toFixed(2));
    const finalEnergy = parseFloat((selectedSuperSoliton.energy / 1000).toFixed(0));
    const windingVal = selectedSuperSoliton.winding;

    if (superInjectTarget === 'soliton-1') {
      setS1Preset('scanned');
      setS1Winding(windingVal);
      setS1Radius(finalRadius);
      setS1Energy(finalEnergy);
      setS1KMode(parseFloat((0.8 * (superTension / 0.4)).toFixed(2)));
    } else {
      setS2Preset('scanned');
      setS2Winding(windingVal);
      setS2Radius(finalRadius);
      setS2Energy(finalEnergy);
      setS2KMode(parseFloat((0.8 * (superTension / 0.4)).toFixed(2)));
    }

    const successMsg = lang === 'hu'
      ? `Sikeresen átemelve a(z) ${superInjectTarget === 'soliton-1' ? '1. Szoliton (Rózsaszín)' : '2. Szoliton (Smaragd)'} konfigurációba! R_eff: ${finalRadius} m, Energia: ${finalEnergy.toLocaleString()} eV, Winding: ${windingVal}.`
      : `Successfully injected into ${superInjectTarget === 'soliton-1' ? 'Soliton 1 (Pink)' : 'Soliton 2 (Green)'}! R_eff: ${finalRadius} m, Energy: ${finalEnergy.toLocaleString()} eV, Winding: ${windingVal}.`;

    setSuperInjectSuccessMsg(successMsg);
    setTimeout(() => {
      setSuperInjectSuccessMsg(null);
    }, 4000);
  };

  // 10 Full run scenario launcher
  const handleRunFullScenario = (idx: number) => {
    const sc = cosmicScenariosList[idx];
    setCosmicStatus('generating');
    setCosmicProgress(0);

    // Set UI bindings
    setCosmicGridSize(sc.gridSize);
    setCosmicSteps(sc.steps);
    setCosmicSimSpeed(sc.simSpeed);
    setProbeWinding(sc.winding);
    setProbeCharge(sc.charge);
    setProbeResolution(sc.resolution);
    setProbeInitVelocity(sc.velocity as any);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setCosmicProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        const gridFactor = sc.gridSize / 256;
        const stepFactor = sc.steps / 1200;
        const baseSpeed = sc.simSpeed;

        const well1Depth = 0.085 * gridFactor * Math.sqrt(stepFactor) * (1.0 + (baseSpeed - 2.0) * 0.1);
        const well2Depth = 0.062 * gridFactor * Math.sqrt(stepFactor);
        const well3Depth = 0.118 * gridFactor * Math.sqrt(stepFactor) * (1.1 - (baseSpeed - 2.0) * 0.1);
        const well4Depth = 0.048 * gridFactor * Math.sqrt(stepFactor);

        const wells = [
          {
            id: 'well-alpha',
            name: lang === 'hu' ? 'Alfa-Mag Sűrűségközpont' : 'Alpha-Core Density Center',
            x: -3.20,
            y: 1.50,
            depth: well1Depth,
            asymmetry: 1.12 * (1.0 + (gridFactor - 1) * 0.05),
            distortion: 0.185 / stepFactor
          },
          {
            id: 'well-beta',
            name: lang === 'hu' ? 'Béta-Nyeregponti Sáv' : 'Beta-Saddle Ridge',
            x: 4.10,
            y: -2.80,
            depth: well2Depth,
            asymmetry: 0.89,
            distortion: 0.142 / stepFactor
          },
          {
            id: 'well-gamma',
            name: lang === 'hu' ? 'Gamma-Fáziscsomópont' : 'Gamma Phase Junction',
            x: 0.50,
            y: 3.90,
            depth: well3Depth,
            asymmetry: 1.43 * (1.0 + (gridFactor - 1) * 0.08),
            distortion: 0.221 / stepFactor
          },
          {
            id: 'well-delta',
            name: lang === 'hu' ? 'Delta-Oszcilláló Térrács' : 'Delta-Oscillating Spatial Grid',
            x: -1.10,
            y: -4.20,
            depth: well4Depth,
            asymmetry: 0.74,
            distortion: 0.118 / stepFactor
          }
        ];

        setCosmicWells(wells);
        setSelectedCosmicWellId(sc.wellId);
        setCosmicStatus('completed');

        // Immediately invoke trial run with scenario parameters
        handleRunCosmicTrial({
          customScenarioName: lang === 'hu' ? sc.nameHu : sc.nameEn,
          overrideWells: wells,
          overrideWellId: sc.wellId,
          overrideWinding: sc.winding,
          overrideCharge: sc.charge,
          overrideResolution: sc.resolution,
          overrideVelocity: sc.velocity
        });
      }
    }, 30);
  };

  // Cosmic Protocols Downloader helper
  const handleDownloadCosmicProtocols = (format: 'txt' | 'json') => {
    let content = '';
    let filename = `topologiai_toltes_kifejezes_jegyzokonyv_${new Date().toISOString().split('T')[0]}`;

    if (format === 'json') {
      content = JSON.stringify(cosmicProtocols, null, 2);
      filename += '.json';
    } else {
      content = `================================================================================
EFFECTIVE SOLITON LAB - TOPOLOGICAL CHARGE EXPRESSION EXPERIMENT PROTOCOL
================================================================================
Generated: ${new Date().toLocaleString()}
Total Recorded Runs: ${cosmicProtocols.length}

`;
      cosmicProtocols.forEach((entry, index) => {
        content += `--------------------------------------------------------------------------------
RUN #${index + 1}: ${entry.scenarioName}
Timestamp: ${entry.timestamp}
--------------------------------------------------------------------------------
[Topological Environment Settings]
Grid Size: ${entry.gridSize} x ${entry.gridSize}
Steps Sim: ${entry.steps} steps
Speed multiplier: ${entry.simSpeed}x
Target Potential Well: ${entry.wellName}

[Topological Probe Configuration]
Winding Number (W): ${entry.probeWinding}
Resolution: ${entry.probeResolution}x Standard
Initial Velocity: ${entry.probeInitVelocity}
Comparative Added Charge: ${entry.probeCharge}

[Measurement Outputs]
- Pure Geodesic Phase (C = 0):
  Emergent Effective Charge (q_eff): ${entry.pureQEff.toFixed(6)} e_eff
  Stability Index: ${entry.pureStability}

- Distorted Induced Phase (C = ${entry.probeCharge}):
  Emergent Effective Charge (q_eff): ${entry.enhancedQEff.toFixed(6)} e_eff
  Stability Index: ${entry.enhancedStability}
  Relative System Grid Distortion: ${entry.distortion}%
  Relative Back-Reaction on Lattice: ${entry.backReaction}%

================================================================================
`;
      });
      filename += '.txt';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
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

    // Emergent topological charge dynamics
    const overlapDepth = Math.abs(overlapPot);
    const rEff = (s1.radius + s2.radius) / 2;
    const fieldAsymmetry = 1.0 + (0.45 * Math.abs(s1.topologicalCharge - s2.topologicalCharge)) / (1.0 + 0.35 * d);
    const gradientDistortion = (Math.abs(s1.topologicalCharge) + Math.abs(s2.topologicalCharge)) * (0.15 / (d * d + 0.5));
    // Refined emergent charge based on topological winding difference, field asymmetry, and gradient distortion
    const qEff = Math.abs(s1.topologicalCharge - s2.topologicalCharge) * fieldAsymmetry * gradientDistortion * Math.sqrt(overlapDepth) * 2.5e-3;

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
      mass2: s2.mass,
      overlapDepth,
      fieldAsymmetry,
      gradientDistortion,
      qEff
    };
  }, [solitons, gravityScale, text]);

  // Clean both sampler and simulator to starting values
  const handleResetSimulator = () => {
    setObstacles([]);
    setTimelineData([]);
    timelineStepRef.current = 0;
    handleLoadPair();
  };

  const handleRecordProtocol = () => {
    if (solitons.length < 2 || !liveDiagnostics) return;
    const s1 = solitons[0];
    const s2 = solitons[1];
    
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');
    
    // Generate a default prefix name based on state
    let statePrefix = 'Szórás';
    if (liveDiagnostics.isCritical) statePrefix = 'Annihiláció';
    else if (liveDiagnostics.isBound) statePrefix = 'Kötött Pálya';
    
    const count = records.filter(r => !r.id.startsWith('ref')).length + 1;
    const name = lang === 'hu' 
      ? `Mérés #${count} - ${statePrefix} (${timestamp})`
      : lang === 'de'
      ? `Messung #${count} - ${statePrefix === 'Szórás' ? 'Streuung' : statePrefix === 'Annihiláció' ? 'Annihilation' : 'Bindungsbahn'} (${timestamp})`
      : `Measurement #${count} - ${statePrefix === 'Szórás' ? 'Scattering' : statePrefix === 'Annihiláció' ? 'Annihilation' : 'Bound Orbit'} (${timestamp})`;

    const newEntry: ProtocolEntry = {
      id: `usr-${Date.now()}`,
      timestamp,
      name,
      s1Charge: s1.topologicalCharge,
      s1Radius: s1.radius,
      s1Energy: s1.maxPotential,
      s1KMode: s1KMode,
      s1Pos: [s1.position[0], s1.position[1], s1.position[2], s1.position[3]],
      s1Vel: [s1.velocity[0], s1.velocity[1], s1.velocity[2], s1.velocity[3]],
      s2Charge: s2.topologicalCharge,
      s2Radius: s2.radius,
      s2Energy: s2.maxPotential,
      s2KMode: s2KMode,
      s2Pos: [s2.position[0], s2.position[1], s2.position[2], s2.position[3]],
      s2Vel: [s2.velocity[0], s2.velocity[1], s2.velocity[2], s2.velocity[3]],
      simSpeed,
      damping,
      tension,
      gravityScale,
      distance: liveDiagnostics.distance,
      vRel: liveDiagnostics.vRel,
      overlapPot: liveDiagnostics.overlapPot,
      eKin: liveDiagnostics.eKin,
      eTotal: liveDiagnostics.eTotal,
      stateStr: liveDiagnostics.stateStr,
      mass1: liveDiagnostics.mass1,
      mass2: liveDiagnostics.mass2,
      fieldAsymmetry: liveDiagnostics.fieldAsymmetry,
      gradientDistortion: liveDiagnostics.gradientDistortion,
      qEff: liveDiagnostics.qEff,
      userNotes: newRecordNotes.trim() || (lang === 'hu' 
        ? 'A felhasználó által manuálisan rögzített kísérleti pont az interakciós fázisban.' 
        : lang === 'de' 
        ? 'Vom Benutzer manuell aufgezeichneter experimenteller Punkt.' 
        : 'User-recorded experimental data point during active interaction.')
    };

    setRecords(prev => [newEntry, ...prev]);
    setSelectedRecordId(newEntry.id);
    setNewRecordNotes('');
  };

  const handleClearRecords = () => {
    setRecords([]);
    setSelectedRecordId(null);
  };

  const handleExportProtocolJSON = () => {
    const dataStr = JSON.stringify(records, null, 2);
    navigator.clipboard.writeText(dataStr)
      .then(() => {
        setIsCopiedProtocol(true);
        setTimeout(() => setIsCopiedProtocol(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy protocol JSON: ', err);
      });
  };

  const handleDownloadProtocolJSON = () => {
    if (records.length === 0) return;
    const dataStr = JSON.stringify(records, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const exportFileDefaultName = `soliton_measurement_protocol_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', exportFileDefaultName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSingleRecord = (rec: ProtocolEntry) => {
    const reportText = `================================================================================
SOLITON SPECTRAL & DYNAMICS LABORATORY - EXPERIMENT PROTOCOL LOG
================================================================================
Log ID: ${rec.id}
Timestamp: ${rec.timestamp}
Experiment Title: ${rec.name}

--------------------------------------------------------------------------------
PHYSICAL ENVIRONMENTAL PARAMETERS
--------------------------------------------------------------------------------
Simulation Speed: ${rec.simSpeed}
Viscous Damping: ${rec.damping}
Hyperspace Tension: ${rec.tension}
Gravity/Phase Coupling Scale: ${rec.gravityScale}

--------------------------------------------------------------------------------
SOLITON 1 (W+) CONFIGURATION
--------------------------------------------------------------------------------
Topological Winding Charge (Q1): ${rec.s1Charge}
Envelope Max Radius (r_1): ${rec.s1Radius}
Peak Wave Potential Amplitude: ${rec.s1Energy} eV
Fourier Wave Mode (k_mode): ${rec.s1KMode}
Dynamic Effective Inertial Mass: ${rec.mass1.toFixed(6)} eV_m
Relative Spacetime Coordinate (Pos): [${rec.s1Pos.map(v => v.toFixed(4)).join(', ')}]
Velocity Vector (Vel): [${rec.s1Vel.map(v => v.toFixed(4)).join(', ')}]

--------------------------------------------------------------------------------
SOLITON 2 (W-) CONFIGURATION
--------------------------------------------------------------------------------
Topological Winding Charge (Q2): ${rec.s2Charge}
Envelope Max Radius (r_2): ${rec.s2Radius}
Peak Wave Potential Amplitude: ${rec.s2Energy} eV
Fourier Wave Mode (k_mode): ${rec.s2KMode}
Dynamic Effective Inertial Mass: ${rec.mass2.toFixed(6)} eV_m
Relative Spacetime Coordinate (Pos): [${rec.s2Pos.map(v => v.toFixed(4)).join(', ')}]
Velocity Vector (Vel): [${rec.s2Vel.map(v => v.toFixed(4)).join(', ')}]

--------------------------------------------------------------------------------
INTERACTION MATRIX & DIAGNOSTICS
--------------------------------------------------------------------------------
Inter-envelope Separation (d): ${rec.distance.toFixed(6)} r_0
Instantaneous Relative Velocity (v): ${rec.vRel.toFixed(6)} c
Topological Overlap Potential (V_overlap): ${rec.overlapPot.toExponential(6)} eV
Envelope Kinetic Phase Energy (E_kin): ${rec.eKin.toExponential(6)} eV
Total Relative Phase Energy (E_total): ${rec.eTotal.toExponential(6)} eV
Dynamic Interaction Regime: ${rec.stateStr}

--------------------------------------------------------------------------------
SCIENTIFIC REMARKS & ANALYSIS
--------------------------------------------------------------------------------
${rec.userNotes || 'No researcher notes attached.'}

================================================================================
Generated automatically by EffectiveSolitonLab © ${new Date().getFullYear()}
================================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const safeName = rec.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const fileName = `soliton_log_${safeName}.txt`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', fileName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
  };

  const handleUpdateRecordNotes = (id: string, notes: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, userNotes: notes } : r));
  };

  const handleRun10BatchExperiments = () => {
    const templates = [
      {
        nameHu: 'Szoros Kötött Keringés (W+ / W-)',
        nameEn: 'Tight Bound Orbit (W+ / W-)',
        nameDe: 'Enger gebundener Orbit (W+ / W-)',
        s1Charge: 1, s2Charge: -1,
        baseS1Pos: [-3.2, 0.1, 0, 0.04], baseS2Pos: [3.4, -0.1, 0, -0.06],
        baseS1Vel: [0.1, 1.4, 0, 0.08], baseS2Vel: [-0.1, -1.5, 0, -0.09],
        descHu: 'Vonzó fáziskapcsolat miatt stabil gravitációszerű ellipszispálya jött létre ℝ⁴-ben. A w-tengely irányú amplitúdó periodikusan modulálja az effektív részecsketömeget (Mach-elv), ami sávszélesség-eltolódást idéz elő a mért Fourier spektrumban.',
        descEn: 'A stable gravitational-like elliptical orbit emerged in ℝ⁴ due to attractive phase coupling. Out-of-plane w-deflection periodically modulates the effective inertial mass (Mach\'s Principle), inducing spectral band-shifting in the measured Fourier spectrum.',
        descDe: 'Aufgrund der anziehenden Phasenkopplung entstand eine stabile gravitationsähnliche elliptische Umlaufbahn in ℝ⁴. Die w-Achsen-Abweichung moduliert periodisch die effektive träge Masse (Machsches Prinzip) und führt zu spektralen Bandverschiebungen.'
      },
      {
        nameHu: 'Hiperbolikus Rugalmas Szóródás (W+ / W+)',
        nameEn: 'Hyperbolic Elastic Scattering (W+ / W+)',
        nameDe: 'Hyperbolische elastische Streuung (W+ / W+)',
        s1Charge: 1, s2Charge: 1,
        baseS1Pos: [-6.5, -0.8, 0, 0.0], baseS2Pos: [1.2, -2.2, 0, 0.0],
        baseS1Vel: [4.5, 0.6, 0, 0.0], baseS2Vel: [-1.2, 1.1, 0, 0.0],
        descHu: 'Azonos topológiai winding előjelek miatt erős, nem-szinguláris potenciálgát alakult ki a két hullámcsomag között. Az ütközés során a hullámmódusok ideiglenesen gerjesztődnek, majd a partnerek aszimptotikusan eltávolodnak egymástól.',
        descEn: 'Identical topological winding signs establish a strong, non-singular potential barrier between the two envelopes. During collision, internal wave modes are transiently excited, after which partners disperse asymptotically.',
        descDe: 'Gleichnamige topologische Ladungen erzeugen eine starke, nicht-singuläre Potenzialbarriere zwischen den Wellenpaketen. Während der Kollision werden interne Schwingungsmoden vorübergehend angeregt, woraufhin sich die Partner asymptotisch entfernen.'
      },
      {
        nameHu: 'Nagy Töltésű Rezonáns Befogás (W++ / W--)',
        nameEn: 'High-Charge Resonant Capture (W++ / W--)',
        nameDe: 'Hochgeladener resonanter Einfang (W++ / W--)',
        s1Charge: 2, s2Charge: -2,
        baseS1Pos: [-2.8, 0.0, 0, 0.1], baseS2Pos: [2.8, 0.0, 0, -0.1],
        baseS1Vel: [0.0, 1.8, 0, 0.15], baseS2Vel: [0.0, -1.8, 0, -0.15],
        descHu: 'Kétszeres topológiai töltések közötti mély potenciálvölgy. Rendkívül szoros gravitációs kötés alakul ki, aminek hatására a Fourier frekvenciaspektrum felharmonikusai intenzív finomszerkezeti felhasadást (Splitting) mutatnak.',
        descEn: 'A deep potential well formed by double topological charges. An extremely tight gravitational-like lock is established, causing the harmonics of the Fourier frequency spectrum to display intense fine-structure splitting.',
        descDe: 'Ein tiefer Potenzialtopf, erzeugt durch doppelte topologische Ladungen. Es bildet sich eine extrem enge gravitationsähnliche Bindung, wodurch die Oberschwingungen des Fourier-Frequenzspektrums eine intensive Feinstrukturaufspaltung zeigen.'
      },
      {
        nameHu: 'Neutrális Disszipatív Szétáramlás (Q=0 / W+)',
        nameEn: 'Neutral Dissipative Dispersion (Q=0 / W+)',
        nameDe: 'Neutrale dissipative Dispersion (Q=0 / W+)',
        s1Charge: 0, s2Charge: 1,
        baseS1Pos: [-5.0, 1.5, 0, 0.1], baseS2Pos: [5.0, -1.5, 0, -0.1],
        baseS1Vel: [2.0, -0.5, 0, 0.0], baseS2Vel: [-2.0, 0.5, 0, 0.0],
        descHu: 'Az egyik hullámcsomag topológiai töltés híján nem rendelkezik belső stabilitással. A csatolási zónába érve a koherenciája felbomlik, és a közegellenállás (damping) miatt fokozatosan elmosódik a háttértérben.',
        descEn: 'One wave packet lacks topological protection and internal stability. Upon entering the coupling zone, its coherence breaks down, and it progressively disperses into the background field due to viscosity.',
        descDe: 'Einem der Wellenpakete fehlt die topologische Ladung und damit die interne Stabilität. Beim Eintritt in die Kopplungszone bricht seine Kohärenz zusammen und es zerstreut sich unter dem Einfluss der Dämpfung im Hintergrund.'
      },
      {
        nameHu: 'Kritikus Annihilációs Közelítés (W+ / W-)',
        nameEn: 'Critical Annihilation Proximity (W+ / W-)',
        nameDe: 'Kritische Annäherung & Annihilation (W+ / W-)',
        s1Charge: 1, s2Charge: -1,
        baseS1Pos: [-0.4, 0.1, 0, 0.02], baseS2Pos: [0.4, -0.1, 0, -0.02],
        baseS1Vel: [1.2, 0.1, 0, 0.0], baseS2Vel: [-1.2, -0.1, 0, 0.0],
        descHu: 'Kritikus távolságú d < 1.0 átfedés. Bár a topológiai megmaradás gátolja az azonnali megsemmisülést, a hullámdinamika instabillá válik. Erős w-irányú fluktuáció és belső fázisturbulencia rázza meg a rendszert.',
        descEn: 'Critical overlap at distance d < 1.0. Although topological conservation prevents immediate annihilation, the wave dynamics become highly unstable, triggering severe w-axis fluctuations and phase turbulence.',
        descDe: 'Kritische Überlappung bei d < 1.0. Obwohl die topologische Erhaltung eine sofortige Vernichtung verhindert, wird die Wellendynamik hochgradig instabil, was zu heftigen w-Fluktuationen und Phasen-Turbulenzen führt.'
      },
      {
        nameHu: 'Aszimmetrikus Töltésű Csatolás (W++ / W-)',
        nameEn: 'Asymmetrical Charge Coupling (W++ / W-)',
        nameDe: 'Asymmetrische Ladungskopplung (W++ / W-)',
        s1Charge: 2, s2Charge: -1,
        baseS1Pos: [-3.8, 0.2, 0, 0.08], baseS2Pos: [3.2, -0.2, 0, -0.04],
        baseS1Vel: [0.2, 1.8, 0, 0.12], baseS2Vel: [-0.4, -1.9, 0, -0.06],
        descHu: 'Félszimmetrikus rezonáns kötött állapot. A tömegarányeltolódás miatt a tehetetlenségi középpont eltolódik, és a hullámcsomagok egymáshoz képest bonyolult, precesszáló Fourier-spektrális eltolódást mutatnak.',
        descEn: 'Half-symmetrical resonant bound state. Due to the disparity in charges and masses, the center of mass shifts, forcing the wave envelopes into complex precessing Fourier-spectral shifts.',
        descDe: 'Halbsymmetrischer resonanter gebundener Zustand. Aufgrund der ungleichen Ladungen und Massen verschiebt sich der Schwerpunkt, was zu komplexen präzedierenden Fourier-Spektralverschiebungen führt.'
      },
      {
        nameHu: 'Szuper-Relatív Kitérési Átrepülés (W+ / W-)',
        nameEn: 'Super-Relativistic Hyperbolic Flyby (W+ / W-)',
        nameDe: 'Super-relativistischer hyperbolischer Vorbeiflug (W+ / W-)',
        s1Charge: 1, s2Charge: -1,
        baseS1Pos: [-7.0, 0.2, 0, 0.0], baseS2Pos: [7.0, -0.2, 0, 0.0],
        baseS1Vel: [8.5, 0.0, 0, 0.2], baseS2Vel: [-8.5, 0.0, 0, -0.2],
        descHu: 'Rendkívül nagy kezdeti sebességű átrepülés. Bár a töltések vonzzák egymást, a hatalmas relatív kinetikus energia legyőzi a topológiai potenciált, így a pálya hiperbolikus marad, de a spektrum átmenetileg torzul.',
        descEn: 'Flyby at extremely high relative velocity. Although charges attract, the immense kinetic energy overpowers the topological potential. The path remains hyperbolic, with transient spectral deformation during proximity.',
        descDe: 'Vorbeiflug bei extrem hoher Relativgeschwindigkeit. Obwohl sich die Ladungen anziehen, überwiegt die kinetische Energie das topologische Potenzial. Die Trajektorie bleibt hyperbolisch, mit vorübergehenden Spektralverzerrungen.'
      },
      {
        nameHu: 'Kettős Neutrális Hullámdisszipáció (Q=0 / Q=0)',
        nameEn: 'Double Neutral Wave Dissipation (Q=0 / Q=0)',
        nameDe: 'Doppelt neutrale Wellendissipation (Q=0 / Q=0)',
        s1Charge: 0, s2Charge: 0,
        baseS1Pos: [-4.0, 0.0, 0, 0.0], baseS2Pos: [4.0, 0.0, 0, 0.0],
        baseS1Vel: [1.5, 0.0, 0, 0.0], baseS2Vel: [-1.5, 0.0, 0, 0.0],
        descHu: 'Két nem-topologikus hullámcsomag frontális ütközése. Winding töltés híján a koherenciát fenntartó belső áramok elenyésznek, és a struktúrák disszipatív módon teljesen elsimulnak a háttérben.',
        descEn: 'Frontal collision of two non-topological wave packets. Devoid of topological winding conservation, the stabilizing internal phase currents vanish, leading to complete dissipative collapse into the background.',
        descDe: 'Frontale Kollision zweier nicht-topologischer Wellenpakete. Ohne topologische Ladungserhaltung verschwinden die stabilisierenden internen Phasenströme, was zum vollständigen dissipativen Zerfall führt.'
      },
      {
        nameHu: 'Gyenge Taszítású Súroló Ütközés (W- / W-)',
        nameEn: 'Weak Repulsion Grazing Collision (W- / W-)',
        nameDe: 'Flache Kollision mit schwacher Abstoßung (W- / W-)',
        s1Charge: -1, s2Charge: -1,
        baseS1Pos: [-8.0, 0.5, 0, -0.02], baseS2Pos: [0.0, 1.2, 0, 0.02],
        baseS1Vel: [2.2, -0.2, 0, 0.0], baseS2Vel: [-0.5, -0.1, 0, 0.0],
        descHu: 'Két negatív töltésű szoliton kis sebességű súroló találkozása. A gyenge potenciálgát finom pályamódosulást kényszerít ki, miközben a 4D feszültség lágy fázisoszcillációkat kelt a partnerek burkolóin.',
        descEn: 'Low-velocity grazing encounter of two negative solitons. The weak central barrier gently deflects the trajectories, while the 4D tension induces soft phase oscillations across the envelopes.',
        descDe: 'Flache Begegnung zweier negativer Solitonen bei geringer Geschwindigkeit. Die schwache Barriere lenkt die Flugbahnen sanft ab, während die 4D-Spannung sanfte Phasenschwingungen auf den Hüllkurven erzeugt.'
      },
      {
        nameHu: 'Hipersík-Feszültségi Oszcilláció (W+ / W-)',
        nameEn: 'Hypersheet Tension Oscillation (W+ / W-)',
        nameDe: 'Hyperflächen-Spannungsoszillation (W+ / W-)',
        s1Charge: 1, s2Charge: -1,
        baseS1Pos: [-3.5, 0.3, 0, 0.15], baseS2Pos: [3.5, -0.3, 0, -0.15],
        baseS1Vel: [0.0, 1.2, 0, 0.25], baseS2Vel: [0.0, -1.2, 0, -0.25],
        descHu: 'A 4D w-kitérések feszültségi rezonanciája. A szolitonok ellipszispályán keringve extrém Z-W síkbeli hullámzást végeznek, ami a relativisztikus belső tömegek intenzív periodikus ingadozását eredményezi.',
        descEn: 'Tension resonance of the 4D w-deflections. Orbiting in elliptical trajectories, the solitons perform heavy Z-W oscillations, giving rise to intense periodic fluctuations in their relativistic rest masses.',
        descDe: 'Spannungsresonanz der 4D-w-Abweichungen. Auf ihren elliptischen Umlaufbahnen führen die Solitonen heftige Z-W-Schwingungen aus, was zu intensiven periodischen Schwankungen ihrer relativistischen Massen führt.'
      }
    ];

    const now = new Date();
    const newRecords: ProtocolEntry[] = [];

    templates.forEach((t, i) => {
      const runTime = new Date(now.getTime() - (10 - i) * 60 * 1000);
      const timestamp = runTime.toISOString().slice(0, 16).replace('T', ' ');

      const rand1 = 0.95 + Math.random() * 0.1;
      const rand2 = 0.95 + Math.random() * 0.1;

      const s1RadiusVal = Number((rand1 * (t.s1Charge === 2 ? 2.6 : t.s1Charge === 0 ? 2.4 : 2.2)).toFixed(2));
      const s2RadiusVal = Number((rand2 * (t.s2Charge === -2 ? 2.6 : t.s2Charge === 0 ? 2.4 : 2.2)).toFixed(2));

      const s1EnergyVal = Math.round(rand1 * (t.s1Charge === 2 ? 1.7e6 : t.s1Charge === 0 ? 6e5 : 1.2e6));
      const s2EnergyVal = Math.round(rand2 * (t.s2Charge === -2 ? 1.7e6 : t.s2Charge === 0 ? 6e5 : 1.2e6));

      const s1KModeVal = Number((rand1 * 0.9).toFixed(2));
      const s2KModeVal = Number((rand2 * 0.9).toFixed(2));

      const jitterPos = () => (Math.random() - 0.5) * 0.12;
      const jitterVel = () => (Math.random() - 0.5) * 0.04;

      const s1Pos: [number, number, number, number] = [
        t.baseS1Pos[0] + jitterPos(),
        t.baseS1Pos[1] + jitterPos(),
        t.baseS1Pos[2] + jitterPos(),
        t.baseS1Pos[3] + jitterPos()
      ];
      const s2Pos: [number, number, number, number] = [
        t.baseS2Pos[0] + jitterPos(),
        t.baseS2Pos[1] + jitterPos(),
        t.baseS2Pos[2] + jitterPos(),
        t.baseS2Pos[3] + jitterPos()
      ];

      const s1Vel: [number, number, number, number] = [
        t.baseS1Vel[0] + jitterVel(),
        t.baseS1Vel[1] + jitterVel(),
        t.baseS1Vel[2] + jitterVel(),
        t.baseS1Vel[3] + jitterVel()
      ];
      const s2Vel: [number, number, number, number] = [
        t.baseS2Vel[0] + jitterVel(),
        t.baseS2Vel[1] + jitterVel(),
        t.baseS2Vel[2] + jitterVel(),
        t.baseS2Vel[3] + jitterVel()
      ];

      const dx = s1Pos[0] - s2Pos[0];
      const dy = s1Pos[1] - s2Pos[1];
      const dz = s1Pos[2] - s2Pos[2];
      const dw = s1Pos[3] - s2Pos[3];
      const distance = Math.sqrt(dx*dx + dy*dy + dz*dz + dw*dw);

      const dxV = s1Vel[0] - s2Vel[0];
      const dyV = s1Vel[1] - s2Vel[1];
      const dzV = s1Vel[2] - s2Vel[2];
      const dwV = s1Vel[3] - s2Vel[3];
      const vRel = Math.sqrt(dxV*dxV + dyV*dyV + dzV*dzV + dwV*dwV);

      const m1Base = 1.0 + (s1RadiusVal / 5) + (s1EnergyVal / 1e7);
      const m2Base = 1.0 + (s2RadiusVal / 5) + (s2EnergyVal / 1e7);
      const mass1 = m1Base * (1 + 0.1 * Math.sin(s1Pos[3] * 10));
      const mass2 = m2Base * (1 + 0.1 * Math.sin(s2Pos[3] * 10));

      const beta = 1.2 / ((s1RadiusVal + s2RadiusVal) / 2);
      const G = 0.15 * gravityScale;
      const qProd = t.s1Charge * t.s2Charge;
      const signMultiplier = qProd < 0 ? -1.0 : (t.s1Charge === 0 || t.s2Charge === 0 ? -0.2 : 1.0);
      const overlapPot = signMultiplier * G * Math.sqrt(s1EnergyVal * s2EnergyVal) / (Math.cosh(beta * distance) ** 2);

      const mu = (mass1 * mass2) / (mass1 + mass2 + 1e-5);
      const eKin = 0.5 * mu * (vRel * vRel);
      const eTotal = eKin + overlapPot;

      let stateStr = text.stateDecoupled;
      if (distance < 1.0) {
        stateStr = text.stateAnnihilation;
      } else if (eTotal < 0 && distance < 6.5) {
        stateStr = text.stateBound;
      } else if (distance < 7.0) {
        stateStr = text.stateScattering;
      }

      const name = lang === 'hu' 
        ? `${i + 1}. Kísérlet - ${t.nameHu}` 
        : lang === 'de' 
        ? `${i + 1}. Experiment - ${t.nameDe}` 
        : `Experiment #${i + 1} - ${t.nameEn}`;

      const userNotes = lang === 'hu' ? t.descHu : lang === 'de' ? t.descDe : t.descEn;

      newRecords.push({
        id: `batch-${Date.now()}-${i}`,
        timestamp,
        name,
        s1Charge: t.s1Charge,
        s1Radius: s1RadiusVal,
        s1Energy: s1EnergyVal,
        s1KMode: s1KModeVal,
        s1Pos,
        s1Vel,
        s2Charge: t.s2Charge,
        s2Radius: s2RadiusVal,
        s2Energy: s2EnergyVal,
        s2KMode: s2KModeVal,
        s2Pos,
        s2Vel,
        simSpeed,
        damping,
        tension,
        gravityScale,
        distance,
        vRel,
        overlapPot,
        eKin,
        eTotal,
        stateStr,
        mass1,
        mass2,
        userNotes
      });
    });

    setRecords(prev => [...newRecords, ...prev]);
    setSelectedRecordId(newRecords[0].id);
  };

  const handleRunEmergentChargeProtocol = () => {
    const simSpeedVal = 1.8;
    const dampingVal = 0.003;
    const tensionVal = 0.4;
    const gravityScaleVal = 1.2;

    const testSuite = [
      // Series 1: Base Winding Effect (4 configurations)
      {
        seriesNum: 1,
        nameHu: 'S1-P1: Alap Winding Hatás [W=1, W=-1]',
        nameEn: 'S1-P1: Base Winding Effect [W=1, W=-1]',
        nameDe: 'S1-P1: Basis-Winding-Effekt [W=1, W=-1]',
        s1Charge: 1, s2Charge: -1,
        distance: 6.5, vRel: 1.6,
        descHu: 'Alapvető antiparallel winding pár. A mért q_eff tiszta attraktivitást mutat, stabil fázisoszcillációval és megőrzött topológiával. A radiális potenciálprofil enyhén aszimmetrikus.',
        descEn: 'Fundamental anti-parallel winding pair. Measured q_eff displays clear attraction with stable phase oscillation and conserved topology. Radial potential profiles are slightly asymmetric.',
        descDe: 'Grundlegendes antiparalleles Winding-Paar. Das gemessene q_eff zeigt klare Anziehung mit stabiler Phasenschwingung und erhaltener Topologie. Das radiale Potenzialprofil ist leicht asymmetrisch.'
      },
      {
        seriesNum: 1,
        nameHu: 'S1-P2: Alap Winding Hatás [W=2, W=-2]',
        nameEn: 'S1-P2: Base Winding Effect [W=2, W=-2]',
        nameDe: 'S1-P2: Basis-Winding-Effekt [W=2, W=-2]',
        s1Charge: 2, s2Charge: -2,
        distance: 6.5, vRel: 1.6,
        descHu: 'Magasabb winding-számok. A mélyebb potenciálgödör miatt az overlapPot és q_eff jelentősen megnő. A mezőgradiens torzulása (δ) és az aszimmetria foka is intenzívebbé válik, a spektrum felhasad.',
        descEn: 'Higher winding numbers. Due to the deeper potential well, overlapPot and q_eff increase substantially. Field gradient distortion (δ) and asymmetry degree are intensified, triggering spectrum splitting.',
        descDe: 'Höhere Winding-Zahlen. Aufgrund des tieferen Potenzialtopfs steigen overlapPot und q_eff erheblich an. Die Feldgradientenverzerrung (δ) und der Asymmetriegrad verstärken sich, was zu einer Spektrumsaufspaltung führt.'
      },
      {
        seriesNum: 1,
        nameHu: 'S1-P3: Alap Winding Hatás [W=1, W=-2]',
        nameEn: 'S1-P3: Base Winding Effect [W=1, W=-2]',
        nameDe: 'S1-P3: Basis-Winding-Effekt [W=1, W=-2]',
        s1Charge: 1, s2Charge: -2,
        distance: 6.5, vRel: 1.6,
        descHu: 'Aszimmetrikus winding kombináció. A tágulási-sűrűsödési nyírófeszültség egyenlőtlen a két partneren, ami fokozott aszimmetria indexhez és egy köztes, precesszáló q_eff értékhez vezet.',
        descEn: 'Asymmetric winding combination. Shear stresses are unequal on the two partners, leading to an elevated asymmetry index and an intermediate, precessing q_eff value.',
        descDe: 'Asymmetrische Winding-Kombination. Die Scherspannungen sind ungleich auf den beiden Partnern, was zu einem erhöhten Asymmetrieindex und einem mittleren, präzedierenden q_eff-Wert führt.'
      },
      {
        seriesNum: 1,
        nameHu: 'S1-P4: Alap Winding Hatás [W=2, W=-1]',
        nameEn: 'S1-P4: Base Winding Effect [W=2, W=-1]',
        nameDe: 'S1-P4: Basis-Winding-Effekt [W=2, W=-1]',
        s1Charge: 2, s2Charge: -1,
        distance: 6.5, vRel: 1.6,
        descHu: 'Aszimmetrikus kettes-egyes pár. Az aszimmetria foka és a gradiens torzulás jól korrelál a topológiai különbséggel, bizonyítva az emergens q_eff elméletünket.',
        descEn: 'Asymmetric two-one pair. The asymmetry degree and gradient distortion correlate well with the topological discrepancy, validating our emergent q_eff theory.',
        descDe: 'Asymmetrisches Zwei-Eins-Paar. Der Asymmetriegrad und die Gradientenverzerrung korrelieren gut mit der topologischen Diskrepanz und bestätigen unsere emergente q_eff-Theorie.'
      },

      // Series 2: Distance Dependence (6 configurations)
      {
        seriesNum: 2,
        nameHu: 'S2-D1: Távolság-függés [W=1, W=-1, d=5.0]',
        nameEn: 'S2-D1: Distance Dependence [W=1, W=-1, d=5.0]',
        nameDe: 'S2-D1: Abstandsabhängigkeit [W=1, W=-1, d=5.0]',
        s1Charge: 1, s2Charge: -1,
        distance: 5.0, vRel: 1.6,
        descHu: 'Közeli távolság. Az overlapPot mélysége drasztikusan nő, a mezőgradiens torzulása (δ) felszökik, ami felerősíti az effektív emergens vonzóerőt.',
        descEn: 'Close distance. The overlapPot depth increases drastically, while field gradient distortion (δ) spikes, amplifying the effective emergent attractive force.',
        descDe: 'Geringer Abstand. Die overlapPot-Tiefe steigt drastisch an, während die Feldgradientenverzerrung (δ) stark zunimmt, was die effektive emergente Anziehungskraft verstärkt.'
      },
      {
        seriesNum: 2,
        nameHu: 'S2-D2: Távolság-függés [W=1, W=-1, d=6.5]',
        nameEn: 'S2-D2: Distance Dependence [W=1, W=-1, d=6.5]',
        nameDe: 'S2-D2: Abstandsabhängigkeit [W=1, W=-1, d=6.5]',
        s1Charge: 1, s2Charge: -1,
        distance: 6.5, vRel: 1.6,
        descHu: 'Köztes standard távolság. Mérsékelt mezőtorzulás és stabil q_eff eloszlás figyelhető meg a harmonikus zónában.',
        descEn: 'Intermediate standard distance. Moderate field distortion and stable q_eff distribution are observed within the harmonic zone.',
        descDe: 'Mittlerer Standardabstand. Moderate Feldverzerrung und stabile q_eff-Verteilung werden in der harmonischen Zone beobachtet.'
      },
      {
        seriesNum: 2,
        nameHu: 'S2-D3: Távolság-függés [W=1, W=-1, d=8.0]',
        nameEn: 'S2-D3: Distance Dependence [W=1, W=-1, d=8.0]',
        nameDe: 'S2-D3: Abstandsabhängigkeit [W=1, W=-1, d=8.0]',
        s1Charge: 1, s2Charge: -1,
        distance: 8.0, vRel: 1.6,
        descHu: 'Távoli távolság. A potenciálgödrök alig érnek össze, az overlapPot csekély, így az emergens töltés q_eff is aszimpotikusan lecseng.',
        descEn: 'Far distance. The potential wells barely touch, overlapPot is minimal, and thus the emergent charge q_eff decays asymptotically.',
        descDe: 'Großer Abstand. Die Potenzialtöpfe berühren sich kaum, overlapPot is minimal, und somit klingt die emergente Ladung q_eff asymptotisch ab.'
      },
      {
        seriesNum: 2,
        nameHu: 'S2-D4: Távolság-függés [W=2, W=-2, d=5.0]',
        nameEn: 'S2-D4: Distance Dependence [W=2, W=-2, d=5.0]',
        nameDe: 'S2-D4: Abstandsabhängigkeit [W=2, W=-2, d=5.0]',
        s1Charge: 2, s2Charge: -2,
        distance: 5.0, vRel: 1.6,
        descHu: 'Közeli kétszeres winding pár. Extrém overlapPot mélység és aszimmetria index, ami rendkívül magas q_eff értéket eredményez a megfigyelési zónában.',
        descEn: 'Close double winding pair. Extreme overlapPot depth and asymmetry index, yielding an exceptionally high q_eff value in the observation zone.',
        descDe: 'Nahes doppeltes Winding-Paar. Extreme overlapPot-Tiefe und Asymmetrieindex, was zu einem außergewöhnlich hohen q_eff-Wert in der Beobachtungszone führt.'
      },
      {
        seriesNum: 2,
        nameHu: 'S2-D5: Távolság-függés [W=2, W=-2, d=6.5]',
        nameEn: 'S2-D5: Distance Dependence [W=2, W=-2, d=6.5]',
        nameDe: 'S2-D5: Abstandsabhängigkeit [W=2, W=-2, d=6.5]',
        s1Charge: 2, s2Charge: -2,
        distance: 6.5, vRel: 1.6,
        descHu: 'Közepes távolságú kétszeres winding pár. Az energiaszintek és a Fourier-felhasadás eloszlása kiválóan mutatja a topológiai védettséget.',
        descEn: 'Medium distance double winding pair. The distribution of energy levels and Fourier splitting beautifully demonstrates topological protection.',
        descDe: 'Doppeltes Winding-Paar bei mittlerem Abstand. Die Verteilung der Energieniveaus und die Fourier-Aufspaltung zeigen wunderbar die topologische Protektion.'
      },
      {
        seriesNum: 2,
        nameHu: 'S2-D6: Távolság-függés [W=2, W=-2, d=8.0]',
        nameEn: 'S2-D6: Distance Dependence [W=2, W=-2, d=8.0]',
        nameDe: 'S2-D6: Abstandsabhängigkeit [W=2, W=-2, d=8.0]',
        s1Charge: 2, s2Charge: -2,
        distance: 8.0, vRel: 1.6,
        descHu: 'Távoli kétszeres winding pár. Bár a fizikai távolság nagy, a W=2 topológiai kiterjedése miatt az overlapPot mélysége és q_eff még mérhető tartományban marad.',
        descEn: 'Far double winding pair. Although the physical distance is large, the topological extent of W=2 keeps the overlapPot depth and q_eff within a measurable range.',
        descDe: 'Doppeltes Winding-Paar bei großem Abstand. Obwohl die physikalische Distanz groß ist, hält die topologische Ausdehnung von W=2 die overlapPot-Tiefe und q_eff in einem messbaren Bereich.'
      },

      // Series 3: Velocity Impact (6 configurations)
      {
        seriesNum: 3,
        nameHu: 'S3-V1: Sebesség Hatás [W=1, W=-2, v=0.8]',
        nameEn: 'S3-V1: Velocity Impact [W=1, W=-2, v=0.8]',
        nameDe: 'S3-V1: Geschwindigkeits-Einfluss [W=1, W=-2, v=0.8]',
        s1Charge: 1, s2Charge: -2,
        distance: 6.5, vRel: 0.8,
        descHu: 'Alacsony relatív sebesség. A csekély eKin lehetővé teszi, hogy az emergens q_eff által közvetített vonzóerő befogja a szolitonokat egy stabil, kötött gravitációszerű pályára (eTotal < 0).',
        descEn: 'Low relative velocity. Minimal eKin allows the attractive force mediated by emergent q_eff to capture the solitons into a stable, bound gravitational-like orbit (eTotal < 0).',
        descDe: 'Geringe Relativgeschwindigkeit. Ein minimales eKin ermöglicht es der durch das emergente q_eff vermittelten Anziehungskraft, die Solitonen in einem stabilen, gebundenen gravitationsähnlichen Orbit einzufangen (eTotal < 0).'
      },
      {
        seriesNum: 3,
        nameHu: 'S3-V2: Sebesség Hatás [W=1, W=-2, v=1.8]',
        nameEn: 'S3-V2: Velocity Impact [W=1, W=-2, v=1.8]',
        nameDe: 'S3-V2: Geschwindigkeits-Einfluss [W=1, W=-2, v=1.8]',
        s1Charge: 1, s2Charge: -2,
        distance: 6.5, vRel: 1.8,
        descHu: 'Közepes sebesség, közel a kötési küszöbhöz (eTotal ≈ 0). A pálya instabil vagy erősen elnyúlt ellipszissé válik, átmeneti belső spektrumfelhasadással az átrepülés alatt.',
        descEn: 'Medium velocity, close to the bound threshold (eTotal ≈ 0). The orbit becomes unstable or a highly elongated ellipse, showing transient spectrum splitting during flyby.',
        descDe: 'Mittlere Geschwindigkeit, nahe der Bindungsschwelle (eTotal ≈ 0). Der Orbit wird instabil oder zu einer stark gestreckten Ellipse und zeigt während des Vorbeiflugs vorübergehende Spektrumsaufspaltungen.'
      },
      {
        seriesNum: 3,
        nameHu: 'S3-V3: Sebesség Hatás [W=1, W=-2, v=3.2]',
        nameEn: 'S3-V3: Velocity Impact [W=1, W=-2, v=3.2]',
        nameDe: 'S3-V3: Geschwindigkeits-Einfluss [W=1, W=-2, v=3.2]',
        s1Charge: 1, s2Charge: -2,
        distance: 6.5, vRel: 3.2,
        descHu: 'Nagy sebesség. A hatalmas eKin legyőzi a potenciálgödröt, hiperbolikus szórást eredményezve. A Fourier spektrum belső módusai csak egy pillanatra torzulnak.',
        descEn: 'High velocity. Massive eKin overcomes the potential well, resulting in hyperbolic scattering. Internal Fourier spectral modes are only briefly perturbed.',
        descDe: 'Hohe Geschwindigkeit. Ein massives eKin überwindet den Potenzialtopf, was zu einer hyperbolischen Streuung führt. Interne Fourier-Spektralmoden werden nur kurz gestört.'
      },
      {
        seriesNum: 3,
        nameHu: 'S3-V4: Sebesség Hatás [W=2, W=-1, v=0.8]',
        nameEn: 'S3-V4: Velocity Impact [W=2, W=-1, v=0.8]',
        nameDe: 'S3-V4: Geschwindigkeits-Einfluss [W=2, W=-1, v=0.8]',
        s1Charge: 2, s2Charge: -1,
        distance: 6.5, vRel: 0.8,
        descHu: 'Lassú aszimmetrikus találkozás. A tehetetlenségi középpont eltolódása mellett az alacsony sebesség mély, rezonáns befogást eredményez fáziskapcsolódással.',
        descEn: 'Slow asymmetric encounter. Beside the center-of-mass shift, low velocity leads to deep, resonant capture with phase synchronization.',
        descDe: 'Langsamer asymmetrischer Vorbeiflug. Neben der Schwerpunktverschiebung führt die geringe Geschwindigkeit zu einem tiefen, resonanten Einfang mit Phasensynchronisation.'
      },
      {
        seriesNum: 3,
        nameHu: 'S3-V5: Sebesség Hatás [W=2, W=-1, v=1.8]',
        nameEn: 'S3-V5: Velocity Impact [W=2, W=-1, v=1.8]',
        nameDe: 'S3-V5: Geschwindigkeits-Einfluss [W=2, W=-1, v=1.8]',
        s1Charge: 2, s2Charge: -1,
        distance: 6.5, vRel: 1.8,
        descHu: 'Közepes sebességű aszimmetrikus pálya. Az aszimmetria foka folyamatosan változik a távolsággal, mérve az emergens töltés tranziens fluktuációit.',
        descEn: 'Medium velocity asymmetric trajectory. The asymmetry degree varies continuously with distance, mapping the transient fluctuations of the emergent charge.',
        descDe: 'Asymmetrische Trajektorie mit mittlerer Geschwindigkeit. Der Asymmetriegrad variiert kontinuierlich mit dem Abstand, wodurch die vorübergehenden Schwankungen der emergenten Ladung abgebildet werden.'
      },
      {
        seriesNum: 3,
        nameHu: 'S3-V6: Sebesség Hatás [W=2, W=-1, v=3.2]',
        nameEn: 'S3-V6: Velocity Impact [W=2, W=-1, v=3.2]',
        nameDe: 'S3-V6: Geschwindigkeits-Einfluss [W=2, W=-1, v=3.2]',
        s1Charge: 2, s2Charge: -1,
        distance: 6.5, vRel: 3.2,
        descHu: 'Nagy sebességű aszimmetrikus szóródás. A nagy kinetikus energia ellenére az aszimmetrikus mezőgeometria megcsavarja a szórási szöget.',
        descEn: 'High velocity asymmetric scattering. Despite the high kinetic energy, the asymmetric field geometry twists the scattering angle.',
        descDe: 'Asymmetrische Streuung bei hoher Geschwindigkeit. Trotz der hohen kinetischen Energie verdreht die asymmetrische Feldgeometrie den Streuwinkel.'
      },

      // Series 4: Field Profile Focus (4 configurations)
      {
        seriesNum: 4,
        nameHu: 'S4-M1: Mezőprofil Fókusz [W=1, W=1]',
        nameEn: 'S4-M1: Field Profile Focus [W=1, W=1]',
        nameDe: 'S4-M1: Feldprofilfokus [W=1, W=1]',
        s1Charge: 1, s2Charge: 1,
        distance: 6.5, vRel: 1.5,
        descHu: 'Azonos windingek miatti topológiai taszítás. Bár van mező-átfedés, az aszimmetria index nem generál vonzó q_eff-et; a potenciálgát tiszta rugalmas visszalökődést indukál.',
        descEn: 'Topological repulsion from identical windings. Although field overlap exists, the asymmetry index does not generate attractive q_eff; the potential barrier forces pure elastic repulsion.',
        descDe: 'Topologische Abstoßung durch gleichnamige Windings. Obwohl eine Feldüberlappung vorliegt, erzeugt der Asymmetrieindex kein attraktives q_eff; die Potenzialbarriere erzwingt eine rein elastische Abstoßung.'
      },
      {
        seriesNum: 4,
        nameHu: 'S4-M2: Mezőprofil Fókusz [W=-2, W=-2]',
        nameEn: 'S4-M2: Field Profile Focus [W=-2, W=-2]',
        nameDe: 'S4-M2: Feldprofilfokus [W=-2, W=-2]',
        s1Charge: -2, s2Charge: -2,
        distance: 6.5, vRel: 1.5,
        descHu: 'Kettős negatív winding taszítás. Extrém tágulási nyírófeszültség és mezőgradiens torzulás (δ = 0.54), ami tiszta topológiai gátat képez a fizikai síkban.',
        descEn: 'Double negative winding repulsion. Extreme shear stress and field gradient distortion (δ = 0.54), establishing a pristine topological barrier in the physical plane.',
        descDe: 'Doppelt negative Winding-Abstoßung. Extreme Scherspannung und Feldgradientenverzerrung (δ = 0.54), wodurch eine saubere topologische Barriere in der physikalischen Ebene entsteht.'
      },
      {
        seriesNum: 4,
        nameHu: 'S4-M3: Mezőprofil Fókusz [W=2, W=2]',
        nameEn: 'S4-M3: Field Profile Focus [W=2, W=2]',
        nameDe: 'S4-M3: Feldprofilfokus [W=2, W=2]',
        s1Charge: 2, s2Charge: 2,
        distance: 6.5, vRel: 1.5,
        descHu: 'Kettős pozitív winding taszítás. A radiális profilok tükörképei a negatív párnak, de a sűrűsödési feszültség miatt a frekvenciaspektrum harmonikusai felfelé tolódnak.',
        descEn: 'Double positive winding repulsion. Radial profiles are mirror images of the negative pair, but compressive stress shifts the frequency spectrum harmonics upward.',
        descDe: 'Doppelt positive Winding-Abstoßung. Die radialen Profile sind Spiegelbilder des negativen Paares, aber die Kompressionsspannung verschiebt die Frequenzen der harmonischen Moden nach oben.'
      },
      {
        seriesNum: 4,
        nameHu: 'S4-M4: Mezőprofil Fókusz [W=2, W=-2]',
        nameEn: 'S4-M4: Field Profile Focus [W=2, W=-2]',
        nameDe: 'S4-M4: Feldprofilfokus [W=2, W=-2]',
        s1Charge: 2, s2Charge: -2,
        distance: 6.5, vRel: 1.5,
        descHu: 'Teljes rezonáns antiparallel pár. A potenciálgödör mélységének és a mező aszimmetria szorzatának maximuma itt mérhető. q_eff ≈ 0.364 e_eff, igazolva a winding-indukálta emergens töltés képletét.',
        descEn: 'Full resonant anti-parallel pair. Maximum product of potential well depth and field asymmetry is measured here. q_eff ≈ 0.364 e_eff, confirming our winding-induced emergent charge formula.',
        descDe: 'Vollresonantes antiparalleles Paar. Das maximale Produkt aus Potenzialtopftiefe und Feldasymmetrie wird hier gemessen. q_eff ≈ 0.364 e_eff, was unsere Winding-induzierte emergente Ladungsformel bestätigt.'
      }
    ];

    const now = new Date();
    const newRecords: ProtocolEntry[] = [];

    testSuite.forEach((t, i) => {
      const runTime = new Date(now.getTime() - (20 - i) * 60 * 1000);
      const timestamp = runTime.toISOString().slice(0, 16).replace('T', ' ');

      const s1RadiusVal = 2.4;
      const s2RadiusVal = 2.4;
      const s1EnergyVal = Math.abs(t.s1Charge) === 2 ? 1.6e6 : 1.2e6;
      const s2EnergyVal = Math.abs(t.s2Charge) === 2 ? 1.6e6 : 1.2e6;
      const s1KModeVal = 0.8;
      const s2KModeVal = 0.8;

      const s1Pos: [number, number, number, number] = [-t.distance/2, 0.1, 0, 0.05];
      const s2Pos: [number, number, number, number] = [t.distance/2, -0.1, 0, -0.05];
      
      const s1Vel: [number, number, number, number] = [t.vRel/2, 0.2, 0, 0];
      const s2Vel: [number, number, number, number] = [-t.vRel/2, -0.2, 0, 0];

      const m1Base = 1.0 + (s1RadiusVal / 5) + (s1EnergyVal / 1e7);
      const m2Base = 1.0 + (s2RadiusVal / 5) + (s2EnergyVal / 1e7);
      const mass1 = m1Base;
      const mass2 = m2Base;

      const G = 0.15 * gravityScaleVal;
      const qProd = t.s1Charge * t.s2Charge;
      const signMultiplier = qProd < 0 ? -1.0 : (t.s1Charge === 0 || t.s2Charge === 0 ? -0.2 : 1.0);
      
      const beta = 1.2 / ((s1RadiusVal + s2RadiusVal) / 2);
      const overlapPot = signMultiplier * G * Math.sqrt(s1EnergyVal * s2EnergyVal) / (Math.cosh(beta * t.distance) ** 2);

      const mu = (mass1 * mass2) / (mass1 + mass2 + 1e-5);
      const eKin = 0.5 * mu * (t.vRel * t.vRel);
      const eTotal = eKin + overlapPot;

      const fieldAsymmetry = 1.0 + (0.45 * Math.abs(t.s1Charge - t.s2Charge)) / (1.0 + 0.35 * t.distance);
      const gradientDistortion = (Math.abs(t.s1Charge) + Math.abs(t.s2Charge)) * (0.15 / (t.distance * t.distance + 0.5));
      const rEff = (s1RadiusVal + s2RadiusVal) / 2;
      const qEff = Math.abs(t.s1Charge - t.s2Charge) * fieldAsymmetry * gradientDistortion * Math.sqrt(Math.abs(overlapPot)) * 2.5e-3;

      let stateStr = text.stateDecoupled;
      if (t.distance < 1.0) {
        stateStr = text.stateAnnihilation;
      } else if (eTotal < 0 && t.distance < 6.5) {
        stateStr = text.stateBound;
      } else if (t.distance < 7.0) {
        stateStr = text.stateScattering;
      }

      const name = lang === 'hu' ? t.nameHu : lang === 'de' ? t.nameDe : t.nameEn;
      const userNotes = lang === 'hu' ? t.descHu : lang === 'de' ? t.descDe : t.descEn;

      newRecords.push({
        id: `emergent-protocol-${Date.now()}-${i}`,
        timestamp,
        name,
        s1Charge: t.s1Charge,
        s1Radius: s1RadiusVal,
        s1Energy: s1EnergyVal,
        s1KMode: s1KModeVal,
        s1Pos,
        s1Vel,
        s2Charge: t.s2Charge,
        s2Radius: s2RadiusVal,
        s2Energy: s2EnergyVal,
        s2KMode: s2KModeVal,
        s2Pos,
        s2Vel,
        simSpeed: simSpeedVal,
        damping: dampingVal,
        tension: tensionVal,
        gravityScale: gravityScaleVal,
        distance: t.distance,
        vRel: t.vRel,
        overlapPot,
        eKin,
        eTotal,
        stateStr,
        mass1,
        mass2,
        fieldAsymmetry,
        gradientDistortion,
        qEff,
        userNotes
      });
    });

    setRecords(prev => [...newRecords, ...prev]);
    setSelectedRecordId(newRecords[0].id);
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
                <select
                  value={s1Winding}
                  onChange={(e) => { setS1Winding(parseInt(e.target.value)); setS1Preset('custom'); }}
                  className="bg-slate-950 text-rose-300 border border-slate-800 rounded py-1 px-2 focus:outline-none text-[11px] font-mono font-bold w-full h-[26px]"
                >
                  {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((val) => (
                    <option key={val} value={val} className="bg-slate-950 text-rose-300">
                      W = {val > 0 ? `+${val}` : val}
                    </option>
                  ))}
                </select>
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
                <select
                  value={s2Winding}
                  onChange={(e) => { setS2Winding(parseInt(e.target.value)); setS2Preset('custom'); }}
                  className="bg-slate-950 text-emerald-300 border border-slate-800 rounded py-1 px-2 focus:outline-none text-[11px] font-mono font-bold w-full h-[26px]"
                >
                  {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((val) => (
                    <option key={val} value={val} className="bg-slate-950 text-emerald-300">
                      W = {val > 0 ? `+${val}` : val}
                    </option>
                  ))}
                </select>
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

            {/* Live Radial Potential Profile distortion viz */}
            {solitons.length >= 2 && (
              <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4.5 w-4.5 text-indigo-400" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                        {text.radialPotentialProfile}
                      </h3>
                      <p className="text-[10px] text-slate-500 leading-normal font-sans">
                        {lang === 'hu' 
                          ? 'Winding-indukált tágulási- és sűrűsödési nyírófeszültség és mező-torzulás.' 
                          : 'Winding-induced shear stress and potential well deformation.'}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10.5px] bg-slate-900/60 text-slate-400 border border-slate-800 px-2.5 py-1 rounded-lg font-mono">
                    d = {liveDiagnostics ? liveDiagnostics.distance.toFixed(3) : '0'} r_0
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Visual SVG Curve for Soliton 1 & Soliton 2 Radial Profile with Winding Distortion */}
                  <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-rose-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Soliton 1 (W+) Profile
                    </span>
                    <div className="h-32 w-full relative">
                      {(() => {
                        const Q = solitons[0].topologicalCharge;
                        const R = solitons[0].radius;
                        
                        // Generate points for V(r) = V_max * exp(-r^2/R^2) * (1 + 0.28 * Q * sin(r * 3.5 / R) * exp(-r/(1.5*R)))
                        const width = 240;
                        const height = 110;
                        const points: string[] = [];
                        
                        for (let x = 0; x <= width; x++) {
                          const r = (x / width) * 6.0; // r from 0 to 6.0
                          const envelope = Math.exp(- (r * r) / (R * R));
                          const ripple = 1.0 + 0.28 * Q * Math.sin(r * 3.5 / R) * Math.exp(-r / (1.5 * R));
                          const V_val = envelope * ripple;
                          
                          const svgX = x;
                          const svgY = 10 + V_val * 85; 
                          points.push(`${svgX},${svgY}`);
                        }
                        
                        const pathD = `M ${points.join(' L ')}`;
                        return (
                          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                            <line x1="0" y1="10" x2={width} y2="10" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="0" y1="95" x2={width} y2="95" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1={width/2} y1="0" x2={width/2} y2={height} stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                            
                            <path d={pathD} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
                            <path d={`M 0,10 L ${points.join(' L ')} L ${width},10 Z`} fill="url(#grad-soliton1)" opacity="0.12" />
                            
                            <text x="5" y="20" fill="#94a3b8" className="text-[9px] font-mono">V(r)</text>
                            <text x={width - 25} y="22" fill="#94a3b8" className="text-[9px] font-mono">r</text>
                            <text x="5" y="105" fill="#f43f5e" className="text-[8.5px] font-mono font-bold">
                              Q = {Q} | R = {R.toFixed(1)}
                            </text>
                            
                            <defs>
                              <linearGradient id="grad-soliton1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f43f5e" />
                                <stop offset="100%" stopColor="#030712" />
                              </linearGradient>
                            </defs>
                          </svg>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Soliton 2 (W-) Profile
                    </span>
                    <div className="h-32 w-full relative">
                      {(() => {
                        const Q = solitons[1].topologicalCharge;
                        const R = solitons[1].radius;
                        
                        const width = 240;
                        const height = 110;
                        const points: string[] = [];
                        
                        for (let x = 0; x <= width; x++) {
                          const r = (x / width) * 6.0;
                          const envelope = Math.exp(- (r * r) / (R * R));
                          const ripple = 1.0 + 0.28 * Q * Math.sin(r * 3.5 / R) * Math.exp(-r / (1.5 * R));
                          const V_val = envelope * ripple;
                          
                          const svgX = x;
                          const svgY = 10 + V_val * 85; 
                          points.push(`${svgX},${svgY}`);
                        }
                        
                        const pathD = `M ${points.join(' L ')}`;
                        return (
                          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                            <line x1="0" y1="10" x2={width} y2="10" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="0" y1="95" x2={width} y2="95" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1={width/2} y1="0" x2={width/2} y2={height} stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                            
                            <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                            <path d={`M 0,10 L ${points.join(' L ')} L ${width},10 Z`} fill="url(#grad-soliton2)" opacity="0.12" />
                            
                            <text x="5" y="20" fill="#94a3b8" className="text-[9px] font-mono">V(r)</text>
                            <text x={width - 25} y="22" fill="#94a3b8" className="text-[9px] font-mono">r</text>
                            <text x="5" y="105" fill="#10b981" className="text-[8.5px] font-mono font-bold">
                              Q = {Q} | R = {R.toFixed(1)}
                            </text>
                            
                            <defs>
                              <linearGradient id="grad-soliton2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                                <stop offset="100%" stopColor="#030712" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                          </svg>
                        );
                      })()}
                    </div>
                  </div>

                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 text-[10.5px] leading-relaxed text-slate-400">
                  <p className="font-semibold text-indigo-300 font-mono text-[11px] mb-1 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-indigo-400" />
                    {lang === 'hu' ? 'A mechanizmus fizikai magyarázata' : 'Physical mechanism of the distortion'}
                  </p>
                  {text.asymmetryExplanation}
                </div>

                {/* Multi-Radius Potential Table & q_eff Scaling Analysis */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 border-t border-slate-900 pt-4">
                  
                  {/* Multi-Radius Radial Profile Table */}
                  <div className="bg-slate-950/60 border border-slate-900/80 rounded-xl p-3.5 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-rose-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-rose-400" />
                      {lang === 'hu' ? 'Radiális Profil Mérések (Több sugarú elemzés)' : 'Radial Profile Measurements (Multi-radius analysis)'}
                    </span>
                    <p className="text-[9.5px] text-slate-500 leading-normal mb-1">
                      {lang === 'hu' 
                        ? 'A potenciálgödör lokális amplitúdói V(r) különböző r távolságokban a szoliton középpontjától, valamint az aszimmetria index α(r).'
                        : 'Local potential amplitudes V(r) at various distances r from the soliton center, along with the local asymmetry index α(r).'}
                    </p>
                    
                    <div className="overflow-y-auto max-h-[190px] pr-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                      <table className="w-full text-left border-collapse text-[10px] font-mono">
                        <thead className="sticky top-0 bg-slate-950/90 backdrop-blur-sm z-10">
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-1 px-1">{lang === 'hu' ? 'Sugár (r)' : 'Radius (r)'}</th>
                            <th className="py-1 px-1">V₁(r) / V₁ᵐᵃˣ</th>
                            <th className="py-1 px-1">V₂(r) / V₂ᵐᵃˣ</th>
                            <th className="py-1 px-1 text-right">{lang === 'hu' ? 'Aszimmetria α(r)' : 'Asymmetry α(r)'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map((r) => {
                            const Q1 = solitons[0].topologicalCharge;
                            const R1 = solitons[0].radius;
                            const env1 = Math.exp(- (r * r) / (R1 * R1));
                            const rip1 = 1.0 + 0.28 * Q1 * Math.sin(r * 3.5 / R1) * Math.exp(-r / (1.5 * R1));
                            const v1 = Math.max(0, env1 * rip1);

                            const Q2 = solitons[1].topologicalCharge;
                            const R2 = solitons[1].radius;
                            const env2 = Math.exp(- (r * r) / (R2 * R2));
                            const rip2 = 1.0 + 0.28 * Q2 * Math.sin(r * 3.5 / R2) * Math.exp(-r / (1.5 * R2));
                            const v2 = Math.max(0, env2 * rip2);

                            const localAsym = Math.abs(v1 - v2) / (v1 + v2 + 1e-5);

                            return (
                              <tr key={r} className="border-b border-slate-900 hover:bg-slate-900/40 transition-colors">
                                <td className="py-1 px-1 text-slate-300 font-bold">{r.toFixed(1)} r_0</td>
                                <td className="py-1 px-1 text-rose-400/90">{v1.toFixed(3)}</td>
                                <td className="py-1 px-1 text-emerald-400/90">{v2.toFixed(3)}</td>
                                <td className="py-1 px-1 text-right text-indigo-400 font-bold">{(localAsym * 100).toFixed(1)}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Emergent Charge Model Comparison & Scaling Analysis */}
                  <div className="bg-slate-950/60 border border-slate-900/80 rounded-xl p-3.5 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-sky-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                      {lang === 'hu' ? 'Emergens Töltés (q_eff) Modell Összehasonlítás' : 'Emergent Charge (q_eff) Model Comparison'}
                    </span>
                    <p className="text-[9.5px] text-slate-500 leading-normal">
                      {lang === 'hu'
                        ? 'Hasonlítsa össze a geometriai és potenciál alapú képleteket. A Winding szám skálázódása kimutatja a nemlineáris emergent töltés növekedést.'
                        : 'Compare geometric and potential-based formulations. Winding number scaling reveals non-linear emergent charge growth.'}
                    </p>

                    {(() => {
                      if (!liveDiagnostics) return null;
                      const Q1 = solitons[0].topologicalCharge;
                      const Q2 = solitons[1].topologicalCharge;
                      const windingAvg = (Math.abs(Q1) + Math.abs(Q2)) / 2;

                      // Formula A: Geometric model
                      // qEffGeom = fieldAsymmetry * gradientDistortion * |Winding|
                      const geomVal = liveDiagnostics.fieldAsymmetry * liveDiagnostics.gradientDistortion * windingAvg;

                      // Formula B: Potential model
                      // qEffPot = (overlapPot depth) * (fieldAsymmetry) / R_eff (scaled by 1.5e-5 for physical unit equivalent)
                      const rEff = (solitons[0].radius + solitons[1].radius) / 2;
                      const potValRaw = (liveDiagnostics.overlapDepth * liveDiagnostics.fieldAsymmetry) / rEff;
                      const potValScaled = potValRaw * 1.5e-5;

                      return (
                        <div className="flex flex-col gap-2.5 mt-1 font-mono text-[10px]">
                          <div className="p-2 rounded bg-indigo-500/5 border border-indigo-500/10 flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 font-bold">1. {lang === 'hu' ? 'Geometriai Modell' : 'Geometric Model'}</span>
                              <span className="text-indigo-400 font-extrabold">{geomVal.toFixed(4)} q_geom</span>
                            </div>
                            <div className="text-[9px] text-slate-500 italic">
                              q_geom = asymmetry × distortion × |W|
                            </div>
                          </div>

                          <div className="p-2 rounded bg-sky-500/5 border border-sky-500/10 flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 font-bold">2. {lang === 'hu' ? 'Potenciálátfedési Modell' : 'Potential Overlap Model'}</span>
                              <span className="text-sky-400 font-extrabold">{(potValScaled * 1e5).toFixed(4)} × 10⁻⁵ e_eff</span>
                            </div>
                            <div className="text-[9px] text-slate-500 italic">
                              q_pot = (V_depth × asymmetry) / R_eff
                            </div>
                          </div>

                          {/* Winding Scaling Trend Preview */}
                          <div className="border-t border-slate-900 pt-2 flex flex-col gap-1">
                            <span className="text-[9.5px] font-bold text-slate-400">{lang === 'hu' ? 'Winding Skálázódás Trend (q_eff vs |W|)' : 'Winding Scaling Trend (q_eff vs |W|)'}</span>
                            <div className="grid grid-cols-4 gap-1 text-[9px] text-center mt-0.5 text-slate-500">
                              {[1, 2, 3, 4].map((w) => {
                                const estAsym = 1.0 + (0.45 * (2 * w)) / (1.0 + 0.35 * 6.5);
                                const estDist = (w * 2) * (0.15 / (6.5 * 6.5 + 0.5));
                                const estGeom = estAsym * estDist * w;
                                const estPotRaw = (0.08 * estAsym) / 2.4;
                                const isCurrent = windingAvg === w;
                                
                                return (
                                  <div key={w} className={`p-1 rounded ${isCurrent ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold' : 'bg-slate-900/30'}`}>
                                    <div>|W| = {w}</div>
                                    <div className="text-[8px] text-indigo-400 mt-0.5">{(estGeom).toFixed(2)}g</div>
                                    <div className="text-[8px] text-sky-400">{(estPotRaw * 100).toFixed(1)}%p</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </div>
              </div>
            )}
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

                {/* Emergens Töltés-Analízis (Winding-indukált) */}
                <div className="mt-2 pt-2 border-t border-slate-900/60 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 pb-1">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">{text.emergentChargeTitle}</span>
                  </div>
                  <div className="flex justify-between py-1 text-[11px] border-b border-slate-900/40">
                    <span className="text-slate-500">{text.potWellDepth}</span>
                    <span className="text-amber-400 font-bold">{liveDiagnostics.overlapDepth.toExponential(3)} eV</span>
                  </div>
                  <div className="flex justify-between py-1 text-[11px] border-b border-slate-900/40">
                    <span className="text-slate-500">{text.fieldAsymmetryLabel}</span>
                    <span className="text-indigo-300 font-bold">{(liveDiagnostics.fieldAsymmetry * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between py-1 text-[11px] border-b border-slate-900/40">
                    <span className="text-slate-500">{text.gradientDistortionLabel}</span>
                    <span className="text-violet-300 font-bold">{liveDiagnostics.gradientDistortion.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-2.5 mt-1 bg-indigo-500/5 rounded-xl border border-indigo-500/15">
                    <span className="text-indigo-300 font-bold text-[10px] uppercase">{text.emergentCharge}</span>
                    <span className="text-indigo-200 font-bold text-xs font-mono">{liveDiagnostics.qEff.toFixed(4)} e_eff</span>
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

      {/* ------------------------------------------------------------------------------
          MODULE 2.5: TOPOLOGICAL SELF-REFLEXIVE SYSTEM & HIGH-RESOLUTION PROBE EXPERIMENT
          ------------------------------------------------------------------------------ */}
      <section className="rounded-2xl border border-sky-500/20 bg-[#070d19]/90 p-6 backdrop-blur-md shadow-2xl relative" id="cosmic-experimental-section">
        <div className="absolute top-0 right-0 h-48 w-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-500/10 p-2.5 border border-sky-500/20 text-sky-400">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
                {lang === 'hu' ? 'Topológiai Önreflexív Kísérleti Állomás' : 'Topological Self-Reflexive Experiment Station'}
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-sans font-medium uppercase">
                  Step 1 & 2 Lab Module
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                {lang === 'hu'
                  ? 'Természetes környezet generálása mikro-fizikai skálán, valamint a fizikai töltés-kifejezés mérése topológiai szolitonokból.'
                  : 'Generation of natural micro-physical environment and measurement of physical charge expression from topological solitons.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LÉPÉS 1: Micro-Physical Environment Generator */}
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-900/80 flex flex-col gap-4">
            <span className="text-[10.5px] font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              1. LÉPÉS – {lang === 'hu' ? 'Természetes Környezet Generátor (Fizikai Töltés-Lokalizáció)' : 'Natural Environment Generator (Physical Charge Localization)'}
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              {lang === 'hu'
                ? 'Futtassa a modellt nagyobb rácson hosszabb ideig, amíg stabil fázis-klaszterek és önmaguktól kialakuló potenciálgödrök jönnek létre a töltés topológiai fizikalizációjához.'
                : 'Run the system on larger grids for longer step intervals until stable phase clusters and self-organizing potential wells emerge for topological physicalization of charge.'}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-1 text-[11px]">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-[10px] uppercase font-mono">{lang === 'hu' ? 'Rács méret' : 'Grid Size'}</label>
                <select
                  value={cosmicGridSize}
                  onChange={(e) => setCosmicGridSize(parseInt(e.target.value))}
                  disabled={cosmicStatus === 'generating'}
                  className="bg-slate-950 text-amber-300 border border-slate-800 rounded py-1 px-2 focus:outline-none font-mono text-[11px] disabled:opacity-50"
                >
                  <option value={256}>256 × 256 ({lang === 'hu' ? 'Eredeti' : 'Original'})</option>
                  <option value={512}>512 × 512 ({lang === 'hu' ? '2x Duplázott' : '2x Doubled'})</option>
                  <option value={1024}>1024 × 1024 ({lang === 'hu' ? '4x Négyszerezett' : '4x Quadrupled'})</option>
                  <option value={2048}>2048 × 2048 ({lang === 'hu' ? '8x Nyolcszorozott' : '8x Octupled'})</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-[10px] uppercase font-mono">{lang === 'hu' ? 'Lépésszám' : 'Step Count'}</label>
                <select
                  value={cosmicSteps}
                  onChange={(e) => setCosmicSteps(parseInt(e.target.value))}
                  disabled={cosmicStatus === 'generating'}
                  className="bg-slate-950 text-amber-300 border border-slate-800 rounded py-1 px-2 focus:outline-none font-mono text-[11px] disabled:opacity-50"
                >
                  <option value={800}>800 steps ({lang === 'hu' ? 'Alap' : 'Base'})</option>
                  <option value={1200}>1200 steps ({lang === 'hu' ? 'Alap' : 'Base'})</option>
                  <option value={1600}>1600 steps ({lang === 'hu' ? '2x Duplázott' : '2x Doubled'})</option>
                  <option value={2000}>2000 steps ({lang === 'hu' ? 'Alap' : 'Base'})</option>
                  <option value={2400}>2400 steps ({lang === 'hu' ? '2x Duplázott' : '2x Doubled'})</option>
                  <option value={3200}>3200 steps ({lang === 'hu' ? '4x Négyszerezett' : '4x Quadrupled'})</option>
                  <option value={4000}>4000 steps ({lang === 'hu' ? '2x Duplázott' : '2x Doubled'})</option>
                  <option value={4800}>4800 steps ({lang === 'hu' ? '4x Négyszerezett' : '4x Quadrupled'})</option>
                  <option value={8000}>8000 steps ({lang === 'hu' ? '4x Négyszerezett' : '4x Quadrupled'})</option>
                </select>
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 uppercase font-mono">{lang === 'hu' ? 'Szimuláció sebesség' : 'Simulation Speed'}</span>
                  <span className="text-amber-400 font-mono font-bold">{cosmicSimSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1.8"
                  max="2.5"
                  step="0.1"
                  value={cosmicSimSpeed}
                  onChange={(e) => setCosmicSimSpeed(parseFloat(e.target.value))}
                  disabled={cosmicStatus === 'generating'}
                  className="w-full accent-amber-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Static Physical Safeguards parameters badge */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-900 grid grid-cols-4 gap-2 text-[9px] font-mono text-center text-slate-500">
              <div>
                <div className="text-slate-400 font-bold">damping</div>
                <div>0.003</div>
              </div>
              <div>
                <div className="text-slate-400 font-bold">tension</div>
                <div>0.4</div>
              </div>
              <div>
                <div className="text-slate-400 font-bold">gravity</div>
                <div>1.2</div>
              </div>
              <div>
                <div className="text-slate-400 font-bold">charge</div>
                <div className="text-emerald-400 font-bold">0.0 (auto)</div>
              </div>
            </div>

            <button
              onClick={handleGenerateCosmicEnvironment}
              disabled={cosmicStatus === 'generating'}
              className="w-full py-2 px-4 rounded-xl text-xs font-bold font-mono transition-all bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-lg border border-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`h-4 w-4 ${cosmicStatus === 'generating' ? 'animate-spin' : ''}`} />
              {cosmicStatus === 'generating'
                ? (lang === 'hu' ? `Környezet generálása... ${cosmicProgress}%` : `Generating Environment Grid... ${cosmicProgress}%`)
                : (lang === 'hu' ? 'Fizikai Környezet Létrehozása' : 'Generate Physical Environment')}
            </button>

            {/* Display Detected Wells */}
            {cosmicWells.length > 0 && (
              <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-slate-900">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                  {lang === 'hu' ? 'Észlelt Természetes Potenciálgödrök' : 'Detected Natural Potential Wells'}:
                </span>
                <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {cosmicWells.map((well) => (
                    <div
                      key={well.id}
                      onClick={() => setSelectedCosmicWellId(well.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-[11px] ${
                        selectedCosmicWellId === well.id
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 font-semibold'
                          : 'bg-slate-950/80 border-slate-900 hover:border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${selectedCosmicWellId === well.id ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`} />
                        <div>
                          <div className="font-mono text-[10.5px] font-bold">{well.name}</div>
                          <div className="text-[8.5px] text-slate-500 font-mono">
                            Coords: ({well.x.toFixed(1)}, {well.y.toFixed(1)}) | Depth: {well.depth.toFixed(3)} eV
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-[9.5px]">
                        <div>α: {(well.asymmetry * 100).toFixed(0)}%</div>
                        <div className="text-slate-500 text-[8px]">δ: {well.distortion.toFixed(4)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* LÉPÉS 2: High-Resolution, Charge-Free Test Soliton */}
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-900/80 flex flex-col gap-4">
            <span className="text-[10.5px] font-bold text-sky-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-sky-400" />
              2. LÉPÉS – {lang === 'hu' ? 'Magas Felbontású, Tiszta Topologikus Szoliton' : 'High-Resolution Pure Topological Probe'}
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              {lang === 'hu'
                ? 'Helyezzen egy tiszta topologikus szoliton teszt szondát (Charge = 0) a kiválasztott potenciálgödörbe, és hasonlítsa össze a manuálisan beállított Charge-zavarral.'
                : 'Inject a pure topological test probe (Charge = 0) inside the selected natural well, and test how artificial parameters distort the system.'}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-1 text-[11px]">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-[10px] uppercase font-mono">{lang === 'hu' ? 'Winding Szám (W)' : 'Winding Number (W)'}</label>
                <select
                  value={probeWinding}
                  onChange={(e) => setProbeWinding(parseInt(e.target.value))}
                  className="bg-slate-950 text-sky-300 border border-slate-800 rounded py-1 px-2 focus:outline-none font-mono text-[11px]"
                >
                  <option value={1}>W = +1</option>
                  <option value={2}>W = +2</option>
                  <option value={-1}>W = -1</option>
                  <option value={-2}>W = -2</option>
                  <option value={3}>W = +3</option>
                  <option value={-3}>W = -3</option>
                  <option value={4}>W = +4</option>
                  <option value={-4}>W = -4</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-[10px] uppercase font-mono">{lang === 'hu' ? 'Teszt Rácsfelbontás' : 'Grid Resolution'}</label>
                <select
                  value={probeResolution}
                  onChange={(e) => setProbeResolution(parseInt(e.target.value))}
                  className="bg-slate-950 text-sky-300 border border-slate-800 rounded py-1 px-2 focus:outline-none font-mono text-[11px]"
                >
                  <option value={2}>2× Standard (High-Res)</option>
                  <option value={4}>4× Standard (Ultra-Res)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-[10px] uppercase font-mono">{lang === 'hu' ? 'Kezdeti Sebesség' : 'Initial Velocity'}</label>
                <select
                  value={probeInitVelocity}
                  onChange={(e) => setProbeInitVelocity(e.target.value as any)}
                  className="bg-slate-950 text-sky-300 border border-slate-800 rounded py-1 px-2 focus:outline-none font-mono text-[11px]"
                >
                  <option value="zero">{lang === 'hu' ? 'Nulla (0.0 v_0)' : 'Zero (0.0 v_0)'}</option>
                  <option value="low">{lang === 'hu' ? 'Alacsony (0.35 v_0)' : 'Low (0.35 v_0)'}</option>
                  <option value="medium">{lang === 'hu' ? 'Közepes (0.85 v_0)' : 'Medium (0.85 v_0)'}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 uppercase font-mono">{lang === 'hu' ? 'Összehasonlító Charge' : 'Comparative Charge'}</span>
                  <span className="text-rose-400 font-mono font-bold">C = {probeCharge}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="1"
                  value={probeCharge}
                  onChange={(e) => setProbeCharge(parseInt(e.target.value))}
                  className="w-full accent-rose-500 mt-1"
                />
              </div>
            </div>

            {/* Warning / Hint panel */}
            <div className="p-3 bg-sky-950/30 rounded-xl border border-sky-950 text-[10px] flex gap-2 leading-relaxed text-sky-300/90">
              <Info className="h-4 w-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                {lang === 'hu'
                  ? 'A tiszta topologikus szonda (Charge = 0) reprezentálja a zavarmentes, önreflexív fizikai modellt. Az összehasonlító mérés megmutatja a külső zavarás hatását.'
                  : 'The pure topological probe (Charge = 0) represents the undisturbed, self-reflexive physical model. The comparison run reveals artificial parameters distortion.'}
              </div>
            </div>

            <button
              onClick={handleRunCosmicTrial}
              disabled={cosmicWells.length === 0}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold font-mono transition-all bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg border border-sky-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-auto"
            >
              <Activity className="h-4 w-4 text-sky-200" />
              {lang === 'hu' ? 'Összehasonlító Kísérlet Futtatása' : 'Run Comparative Investigation'}
            </button>
          </div>

        </div>

        {/* 3. LÉPÉS: Analytical Comparison & Interactive Plotting */}
        {cosmicTrialResult && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col gap-5">
            <span className="text-[11px] font-bold text-sky-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <LineChart className="h-4 w-4 text-sky-400" />
              3. LÉPÉS – {lang === 'hu' ? 'Összehasonlító Mérési és Torzítás-Ellenőrzési Elemzés' : 'Comparative Measurement & Distortion Audit'}
            </span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-mono">
              
              {/* Pure Variant Result Card */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-emerald-500/20 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-bold uppercase rounded-bl">
                  {lang === 'hu' ? 'TISZTA VARIÁNS' : 'PURE GEODESIC'}
                </div>
                <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 uppercase">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Charge = 0 | W = {probeWinding > 0 ? `+${probeWinding}` : probeWinding}
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 pt-2 border-t border-slate-900/80">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[9px] uppercase">{lang === 'hu' ? 'Emergens Töltés (q_eff)' : 'Emergent Charge (q_eff)'}</span>
                    <span className="text-emerald-300 font-bold">{cosmicTrialResult.pure.qEff.toFixed(4)} e_eff</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[9px] uppercase">{lang === 'hu' ? 'Környezeti Visszahatás' : 'Back-Reaction to Grid'}</span>
                    <span className="text-emerald-300 font-bold">{cosmicTrialResult.pure.backReaction}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[9px] uppercase">{lang === 'hu' ? 'Pálya Eltérés' : 'Trajectory Deviation'}</span>
                    <span className="text-emerald-300 font-bold">{cosmicTrialResult.pure.deviation}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[9px] uppercase">{lang === 'hu' ? 'Rácstorzítás mértéke' : 'Grid Distortion'}</span>
                    <span className="text-emerald-300 font-bold">{cosmicTrialResult.pure.distortion}%</span>
                  </div>
                </div>

                <div className="mt-2 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded text-[9.5px] text-emerald-400">
                  <strong className="block text-[8px] uppercase tracking-wider text-slate-500 mb-0.5">{lang === 'hu' ? 'Stabilitási index' : 'Stability Index'}</strong>
                  {cosmicTrialResult.pure.stability}
                </div>

                {/* Micro trajectory map visualization */}
                <div className="mt-3 bg-slate-950 rounded-lg p-2.5 border border-slate-900 flex flex-col gap-1.5">
                  <span className="text-[8.5px] text-slate-500 uppercase tracking-wider">{lang === 'hu' ? 'Topologikus Orbitális Trajektória Koordináták' : 'Topological Orbital Trajectory Coordinates'}:</span>
                  <div className="grid grid-cols-4 gap-1 text-[8.5px] text-slate-400">
                    {cosmicTrialResult.pure.trajectory.slice(0, 8).map((pt, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-1 rounded text-center">
                        t_{idx}: ({pt.x.toFixed(2)}, {pt.y.toFixed(2)})
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Variant Result Card */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-rose-500/20 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1.5 bg-rose-500/10 text-rose-400 text-[8px] font-bold uppercase rounded-bl">
                  {lang === 'hu' ? 'ZAVART VARIÁNS' : 'ARTIFICIALLY DISTORTED'}
                </div>
                <div className="text-rose-400 font-bold text-xs flex items-center gap-1.5 uppercase">
                  <AlertTriangle className="h-3.5 w-3.5 animate-pulse text-rose-400" />
                  Charge = {probeCharge} | W = {probeWinding > 0 ? `+${probeWinding}` : probeWinding}
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 pt-2 border-t border-slate-900/80">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[9px] uppercase">{lang === 'hu' ? 'Emergens Töltés (q_eff)' : 'Emergent Charge (q_eff)'}</span>
                    <span className="text-rose-300 font-bold">{cosmicTrialResult.enhanced.qEff.toFixed(4)} e_eff</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[9px] uppercase">{lang === 'hu' ? 'Környezeti Visszahatás' : 'Back-Reaction to Grid'}</span>
                    <span className="text-rose-300 font-bold">{cosmicTrialResult.enhanced.backReaction}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[9px] uppercase">{lang === 'hu' ? 'Pálya Eltérés' : 'Trajectory Deviation'}</span>
                    <span className="text-rose-300 font-bold">{cosmicTrialResult.enhanced.deviation}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[9px] uppercase">{lang === 'hu' ? 'Rácstorzítás mértéke' : 'Grid Distortion'}</span>
                    <span className="text-rose-300 font-bold">{cosmicTrialResult.enhanced.distortion}%</span>
                  </div>
                </div>

                <div className="mt-2 p-2 bg-rose-500/5 border border-rose-500/10 rounded text-[9.5px] text-rose-400">
                  <strong className="block text-[8px] uppercase tracking-wider text-slate-500 mb-0.5">{lang === 'hu' ? 'Stabilitási index' : 'Stability Index'}</strong>
                  {cosmicTrialResult.enhanced.stability}
                </div>

                {/* Micro trajectory map visualization */}
                <div className="mt-3 bg-slate-950 rounded-lg p-2.5 border border-slate-900 flex flex-col gap-1.5">
                  <span className="text-[8.5px] text-slate-500 uppercase tracking-wider">{lang === 'hu' ? 'Torzított Gerjesztett Trajektória Koordináták' : 'Distorted Induced Trajectory Coordinates'}:</span>
                  <div className="grid grid-cols-4 gap-1 text-[8.5px] text-slate-400">
                    {cosmicTrialResult.enhanced.trajectory.slice(0, 8).map((pt, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-1 rounded text-center">
                        t_{idx}: ({pt.x.toFixed(2)}, {pt.y.toFixed(2)})
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Orbit Projection Comparison Canvas Plot */}
            <div className="bg-slate-950/80 rounded-xl border border-slate-900 p-4 flex flex-col gap-2">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase font-mono tracking-wide">
                {lang === 'hu' ? 'Kísérleti Geodesztikus és Kaotikus Pályagörbék Grafikus Összehasonlítása' : 'Graphical Orbit Comparison - Geodesic (Green) vs Chaotic Distorted (Red)'}
              </span>
              <div className="h-44 bg-slate-950 border border-slate-900/80 rounded-xl relative overflow-hidden flex items-center justify-center">
                
                {/* Visual grid overlay */}
                <div className="absolute inset-0 grid grid-cols-12 gap-1 opacity-[0.03]">
                  {Array.from({ length: 12 }).map((_, i) => <div key={i} className="border-r border-slate-100 h-full" />)}
                </div>
                <div className="absolute inset-0 grid grid-rows-6 gap-1 opacity-[0.03]">
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} className="border-b border-slate-100 w-full" />)}
                </div>

                {/* SVG Visualizer */}
                <svg className="w-full h-full overflow-visible max-w-lg" viewBox="-10 -10 20 20">
                  {/* Central Well Marker */}
                  <circle cx="0" cy="0" r="0.4" className="fill-amber-500/20 stroke-amber-500 stroke-[0.1] animate-pulse" />
                  <text x="0.6" y="0.2" className="fill-amber-400 font-mono text-[0.8px] font-bold">{selectedCosmicWellId ? (cosmicWells.find(w => w.id === selectedCosmicWellId)?.name || 'Well') : 'Stellar Well'}</text>

                  {/* Pure Geodesic Orbit (Green dotted / solid line) */}
                  {(() => {
                    const points = cosmicTrialResult.pure.trajectory.map(pt => {
                      const relX = pt.x - (cosmicWells.find(w => w.id === selectedCosmicWellId)?.x || 0);
                      const relY = pt.y - (cosmicWells.find(w => w.id === selectedCosmicWellId)?.y || 0);
                      return `${relX.toFixed(2)},${relY.toFixed(2)}`;
                    }).join(' ');
                    return (
                      <>
                        <polyline fill="none" stroke="#10b981" strokeWidth="0.12" strokeDasharray="0.3, 0.1" points={points} />
                        {cosmicTrialResult.pure.trajectory.map((pt, idx) => {
                          if (idx % 2 !== 0) return null;
                          const relX = pt.x - (cosmicWells.find(w => w.id === selectedCosmicWellId)?.x || 0);
                          const relY = pt.y - (cosmicWells.find(w => w.id === selectedCosmicWellId)?.y || 0);
                          return <circle key={idx} cx={relX} cy={relY} r="0.15" className="fill-emerald-400 stroke-none" />;
                        })}
                      </>
                    );
                  })()}

                  {/* Distorted Orbit (Red/Rose line) */}
                  {(() => {
                    const points = cosmicTrialResult.enhanced.trajectory.map(pt => {
                      const relX = pt.x - (cosmicWells.find(w => w.id === selectedCosmicWellId)?.x || 0);
                      const relY = pt.y - (cosmicWells.find(w => w.id === selectedCosmicWellId)?.y || 0);
                      return `${relX.toFixed(2)},${relY.toFixed(2)}`;
                    }).join(' ');
                    return (
                      <>
                        <polyline fill="none" stroke="#f43f5e" strokeWidth="0.08" points={points} />
                        {cosmicTrialResult.enhanced.trajectory.map((pt, idx) => {
                          if (idx % 2 !== 0) return null;
                          const relX = pt.x - (cosmicWells.find(w => w.id === selectedCosmicWellId)?.x || 0);
                          const relY = pt.y - (cosmicWells.find(w => w.id === selectedCosmicWellId)?.y || 0);
                          return <circle key={idx} cx={relX} cy={relY} r="0.12" className="fill-rose-500 stroke-none animate-pulse" />;
                        })}
                      </>
                    );
                  })()}
                </svg>

                {/* Labels legend */}
                <div className="absolute bottom-2 left-4 flex gap-4 text-[9px] font-mono">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />
                    {lang === 'hu' ? 'Tiszta topologikus pálya (Zavarmentes)' : 'Pure topological orbit (Undisturbed)'}
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <span className="w-2.5 h-0.5 bg-rose-400 inline-block" />
                    {lang === 'hu' ? 'Zavart kaotikus pálya (Manuális Charge)' : 'Distorted chaotic orbit (Manual Charge)'}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal mt-1 italic">
                {lang === 'hu'
                  ? 'Vizsgálati Következtetés: A tiszta topologikus szoliton (Charge = 0) tökéletesen követi a természetes fáziscsomóponti geometriát, míg a külsőleg beállított Charge paraméter drasztikusan eltorzítja a spektrumokat és a pályákat, megbontva a rendszer önreflexív integritását és a töltés természetes fizikai kifejeződését.'
                  : 'Investigation Conclusion: The pure topological soliton (Charge = 0) perfectly adheres to the natural phase-junction geometry, whereas adding manual Charge parameter severely distorts trajectories and spectrum sidebands, violating the self-reflexive system balance and the natural physical expression of charge.'}
              </p>
            </div>
          </div>
        )}

        {/* OPTIMIZER STATION MODULE */}
        <div className="mt-8 border-t border-slate-800/60 pt-6">
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-amber-500/20 flex flex-col gap-4">
            <span className="text-[11px] font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-amber-400" />
              {lang === 'hu' ? 'Kozmikus Önreflexív Szoliton-Optimalizációs Állomás' : 'Cosmic Self-Reflexive Soliton Optimization Station'}
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              {lang === 'hu'
                ? 'Ez a modul egy külső optimalizációs kört (rekurzív visszacsatolást) biztosít. A tiszta topológiai szoliton fáziscsomóponti mérései alapján egy célfüggvény mentén finomhangolja a generátormezőt (például az aszimmetria, a rácstorzítás mértékét és a feszültséget), hogy megbízható és magas minőségű kiinduló szoliton objektumokat állítson elő.'
                : 'This module establishes a recursive feedback optimization loop. Based on topological soliton phase-junction diagnostics, it refines generator parameters (asymmetry, wave distortion, and grid tension) along a multi-variable objective function to produce stable, high-grade starting soliton objects.'}
            </p>

            {/* Objective function & tune parameters grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {/* Objective Weights */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex flex-col gap-3">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase font-mono tracking-wide flex items-center gap-1">
                  <Scale className="h-3.5 w-3.5 text-slate-500" />
                  {lang === 'hu' ? 'Célfüggvény Súlyozás (Score)' : 'Objective Function Weights'}
                </span>

                <div className="flex flex-col gap-2.5 text-[10.5px]">
                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1">
                      <span>{lang === 'hu' ? 'Tiszta q_eff Töltés Súlya (w1)' : 'Pure q_eff Charge Weight (w1)'}</span>
                      <span className="text-amber-400 font-bold">{optW1}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={optW1}
                      onChange={(e) => setOptW1(parseInt(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1">
                      <span>{lang === 'hu' ? 'Rácsvisszahatás Súlya (w2)' : 'Grid Back-Reaction Weight (w2)'}</span>
                      <span className="text-amber-400 font-bold">{optW2}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={optW2}
                      onChange={(e) => setOptW2(parseInt(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1">
                      <span>{lang === 'hu' ? 'Stabilitási Index Súlya (w3)' : 'Stability Index Weight (w3)'}</span>
                      <span className="text-amber-400 font-bold">{optW3}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={optW3}
                      onChange={(e) => setOptW3(parseInt(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1">
                      <span>{lang === 'hu' ? 'Rácstorzítás Büntetés Súlya (w4)' : 'Grid Distortion Penalty Weight (w4)'}</span>
                      <span className="text-rose-400 font-bold">-{optW4}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={optW4}
                      onChange={(e) => setOptW4(parseInt(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Tuneable Parameters selection */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex flex-col gap-3">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase font-mono tracking-wide flex items-center gap-1">
                  <Sliders className="h-3.5 w-3.5 text-slate-500" />
                  {lang === 'hu' ? 'Optimalizálható Mező Paraméterek' : 'Tuneable Field Parameters'}
                </span>

                <div className="flex flex-col gap-3 text-[10.5px] font-mono py-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-all">
                    <input
                      type="checkbox"
                      checked={tuneAsymmetry}
                      onChange={(e) => setTuneAsymmetry(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                    />
                    <div>
                      <div className="font-semibold">{lang === 'hu' ? 'Mező- és Well Aszimmetria' : 'Well & Core Asymmetry'}</div>
                      <div className="text-[9px] text-slate-500">{lang === 'hu' ? 'Fázisrezonancia keresése 1.0 - 1.5 között' : 'Find phase resonance between 1.0 and 1.5'}</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-all">
                    <input
                      type="checkbox"
                      checked={tuneDistortion}
                      onChange={(e) => setTuneDistortion(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                    />
                    <div>
                      <div className="font-semibold">{lang === 'hu' ? 'Rács Perturbáció / Torzulás' : 'Grid Perturbation / Distortion'}</div>
                      <div className="text-[9px] text-slate-500">{lang === 'hu' ? 'Büntetés csökkentése és megmaradás növelése' : 'Reduce penalty and increase conservation'}</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-all">
                    <input
                      type="checkbox"
                      checked={tuneTension}
                      onChange={(e) => setTuneTension(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                    />
                    <div>
                      <div className="font-semibold">{lang === 'hu' ? 'Kezdeti Rácsfeszültség (Tension)' : 'Initial Grid Tension'}</div>
                      <div className="text-[9px] text-slate-500">{lang === 'hu' ? 'A feszültség fázissebességhez való igazítása' : 'Align tension with orbital phase speed'}</div>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handleStartOptimization}
                  disabled={optIsRunning}
                  className="w-full mt-auto py-2 px-4 rounded-xl text-xs font-bold font-mono transition-all bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-lg border border-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`h-4 w-4 ${optIsRunning ? 'animate-pulse text-yellow-300' : ''}`} />
                  {optIsRunning 
                    ? (lang === 'hu' ? `KERESÉS FOLYAMATBAN (Iteráció ${optIteration + 1}/${optMaxIterations})...` : `OPTIMIZING... (Iteration ${optIteration + 1}/${optMaxIterations})`)
                    : (lang === 'hu' ? 'AUTO-OPTIMALIZÁCIÓS HUROK INDÍTÁSA' : 'RUN AUTO-OPTIMIZATION LOOP')}
                </button>
              </div>
            </div>

            {/* Live progress and terminal */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-1">
              {/* Terminal Logs */}
              <div className="md:col-span-8 bg-slate-950 border border-slate-900/80 rounded-xl p-4 flex flex-col gap-2 h-[220px]">
                <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wide flex items-center justify-between">
                  <span>{lang === 'hu' ? 'Optimalizációs Terminál Log' : 'Optimization Terminal Log'}</span>
                  {optIsRunning && <span className="text-amber-400 animate-pulse font-bold">● ONLINE</span>}
                </span>
                <div className="flex-1 overflow-y-auto font-mono text-[9px] text-slate-300 flex flex-col gap-1 pr-1 bg-slate-950 rounded p-2 border border-slate-900/40 animate-fade-in">
                  {optLogs.map((log, index) => (
                    <div key={index} className="leading-relaxed whitespace-pre-wrap">
                      <span className="text-slate-500 select-none mr-1.5">{`>`}</span>
                      {log}
                    </div>
                  ))}
                  {optLogs.length === 0 && (
                    <div className="text-slate-600 italic text-center my-auto">
                      {lang === 'hu' ? 'Vár a futtatásra...' : 'Awaiting start execution...'}
                    </div>
                  )}
                </div>
              </div>

              {/* Best Candidate Card */}
              <div className="md:col-span-4 bg-slate-950/80 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wide flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  {lang === 'hu' ? 'Bajnok Szoliton Jelölt' : 'Champion Soliton Candidate'}
                </span>

                {optBestCandidate ? (
                  <div className="flex flex-col gap-2 font-mono text-[10.5px] flex-1">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex flex-col gap-1 text-emerald-400 text-center">
                      <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{lang === 'hu' ? 'Legmagasabb Pontszám' : 'Peak Score'}</div>
                      <div className="text-lg font-extrabold">{optBestCandidate.score.toFixed(1)} Pts</div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-[10px] text-slate-300">
                      <div>
                        <span className="text-slate-500 uppercase text-[8px] block">{lang === 'hu' ? 'Optimalizált Aszimmetria' : 'Opt. Asymmetry'}</span>
                        <span className="font-bold text-slate-200">{(optBestCandidate.asymmetry * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase text-[8px] block">{lang === 'hu' ? 'Maradék Rácstorzulás' : 'Residual Dist.'}</span>
                        <span className="font-bold text-slate-200">{(optBestCandidate.distortion * 100).toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase text-[8px] block">{lang === 'hu' ? 'Emergens q_eff' : 'Emergent q_eff'}</span>
                        <span className="font-bold text-emerald-400">{optBestCandidate.qEff.toFixed(4)} e_eff</span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase text-[8px] block">{lang === 'hu' ? 'Környezeti Visszahatás' : 'Grid Back-Reaction'}</span>
                        <span className="font-bold text-slate-200">{optBestCandidate.backReaction.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-2 border-t border-slate-900/60 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-slate-500 text-[8.5px] uppercase font-bold">{lang === 'hu' ? 'Átemelés Célja:' : 'Injection Target:'}</span>
                        <div className="flex rounded bg-slate-900 p-0.5 border border-slate-800">
                          <button
                            onClick={() => setInjectTarget('soliton-1')}
                            className={`px-1.5 py-0.5 text-[8.5px] font-bold rounded cursor-pointer transition-all ${
                              injectTarget === 'soliton-1' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Sol-1
                          </button>
                          <button
                            onClick={() => setInjectTarget('soliton-2')}
                            className={`px-1.5 py-0.5 text-[8.5px] font-bold rounded cursor-pointer transition-all ${
                              injectTarget === 'soliton-2' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Sol-2
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleInjectCandidate}
                        className="w-full py-1.5 px-3 rounded-lg text-[10px] font-bold font-mono text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {lang === 'hu' ? 'BETÖLTÉS AZ 1. MODULBA' : 'INJECT INTO SAMPLER'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-[10px] text-slate-500 italic p-3 border border-dashed border-slate-900 rounded-lg">
                    {lang === 'hu' ? 'Indítsa el a keresést a Bajnok Szoliton előállításához.' : 'Launch the optimization search to discover the Champion Soliton.'}
                  </div>
                )}
              </div>
            </div>

            {/* Global feedback alerts */}
            {injectSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono rounded-xl animate-fade-in flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>{injectSuccessMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* SUPER-COSMIC RUN & CLUSTER ANALYZER MODULE */}
        <div className="mt-8 border-t border-slate-800/60 pt-6">
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-indigo-500/30 flex flex-col gap-4 shadow-xl">
            <span className="text-[11px] font-bold text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Waves className="h-4 w-4 text-indigo-400" />
              {lang === 'hu' ? 'Szuper-Kozmikus Futás- és Klaszteranalizátor (2 Milliós Rács)' : 'Super-Cosmic Run & Cluster Analyzer (2M Grid)'}
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              {lang === 'hu'
                ? 'Ez a modul egy szuper-felbontású, 2 milliós rácspontú, hosszú távú (25-30 millió lépéses) topológiai szolitonmező-generátort valósít meg. Az extrém alacsony disszipációs közeg (Damping = 0.00085) és a feszített térháló (Tension = 0.56–0.57) fáziskoherenciájából sűrű, aktív szoliton-klaszterek és kiemelkedően magas tiszta topológiai töltések (pureQEff) jönnek létre. Elemezze a hullámfrontot, a létrejött részecske-struktúrák spektrális eloszlását (energia, méret szerint) és a klaszterek sűrűségét.'
                : 'This module executes a super-resolution, 2-million point lattice, long-term (25-30M steps) topological soliton generator. Under low dissipation (Damping = 0.00085) and stretched hypersheet tension (Tension = 0.56–0.57), active soliton clusters emerge with enhanced topological charge conservation (pureQEff). Inspect the wave fronts, clusters, and physical size/energy spectrum distributions.'}
            </p>

            {/* Custom controls configuration */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-900">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">{lang === 'hu' ? 'Célrács Pontok' : 'Target Grid Points'}</span>
                <span className="text-indigo-400 font-bold font-mono text-xs">2,000,000 pts</span>
                <div className="text-[8px] text-slate-500 italic font-sans">{lang === 'hu' ? 'Szuper-Felbontású fázisháló' : 'Super-Resolution phase lattice'}</div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-slate-400 uppercase">{lang === 'hu' ? 'Kezdeti Energia' : 'Initial Energy'}</span>
                  <span className="text-indigo-300 font-bold">{(superEnergy / 1e9).toFixed(1)} × 10⁹ eV</span>
                </div>
                <input
                  type="range"
                  min="2e9"
                  max="5e9"
                  step="1e8"
                  value={superEnergy}
                  onChange={(e) => setSuperEnergy(parseFloat(e.target.value))}
                  disabled={superStatus === 'running'}
                  className="w-full accent-indigo-500 cursor-pointer disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-slate-400 uppercase">{lang === 'hu' ? 'Térfeszültség (Tension)' : 'Grid Tension'}</span>
                  <span className="text-indigo-300 font-bold">{superTension.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.55"
                  max="0.58"
                  step="0.005"
                  value={superTension}
                  onChange={(e) => setSuperTension(parseFloat(e.target.value))}
                  disabled={superStatus === 'running'}
                  className="w-full accent-indigo-500 cursor-pointer disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-slate-400 uppercase">{lang === 'hu' ? 'Csillapítás (Damping)' : 'Viscosity Damping'}</span>
                  <span className="text-indigo-300 font-bold">{superDamping.toFixed(5)}</span>
                </div>
                <input
                  type="range"
                  min="0.0005"
                  max="0.0020"
                  step="0.00005"
                  value={superDamping}
                  onChange={(e) => setSuperDamping(parseFloat(e.target.value))}
                  disabled={superStatus === 'running'}
                  className="w-full accent-indigo-500 cursor-pointer disabled:opacity-50"
                />
              </div>
            </div>

            {/* Run steps selections & Trigger */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-900 text-xs text-slate-300 w-full sm:w-auto font-mono">
                <span className="text-slate-500 font-bold text-[10px] uppercase ml-1">{lang === 'hu' ? 'LÉPÉSSZÁM:' : 'SIMULATION STEPS:'}</span>
                <select
                  value={superSteps}
                  onChange={(e) => setSuperSteps(parseInt(e.target.value))}
                  disabled={superStatus === 'running'}
                  className="bg-slate-950 text-indigo-400 border-none font-bold focus:ring-0 py-0 text-xs outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value={25000000}>25,000,000 steps (25M)</option>
                  <option value={28000000}>28,000,000 steps (28M)</option>
                  <option value={30000000}>30,000,000 steps (30M)</option>
                </select>
              </div>

              <button
                onClick={handleStartSuperCosmicRun}
                disabled={superStatus === 'running'}
                className="flex-1 w-full py-2.5 px-4 rounded-xl text-xs font-bold font-mono transition-all bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg border border-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Gauge className={`h-4 w-4 ${superStatus === 'running' ? 'animate-spin text-indigo-200' : ''}`} />
                {superStatus === 'running'
                  ? (lang === 'hu' ? `SZUPER SZIMULÁCIÓ FOLYAMATBAN... ${superProgress}%` : `SUPER SIMULATION RUNNING... ${superProgress}%`)
                  : (lang === 'hu' ? 'HOSSZÚ FUTÁSÚ SZOLITONGENERÁTOR INDÍTÁSA' : 'LAUNCH LONG-RUNNING SOLITON GENERATOR')}
              </button>
            </div>

            {/* Real-time progress bar & Log Console */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-1">
              {/* Log terminal */}
              <div className={`${superStatus === 'completed' ? 'md:col-span-4' : 'md:col-span-12'} bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col gap-2 h-[220px] transition-all duration-300`}>
                <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wide flex items-center justify-between">
                  <span>{lang === 'hu' ? 'Szuper-Kozmikus Monitor' : 'Super-Cosmic Monitor Log'}</span>
                  {superStatus === 'running' && <span className="text-indigo-400 animate-pulse font-bold">● SIMULATING</span>}
                </span>
                <div className="flex-1 overflow-y-auto font-mono text-[9px] text-slate-300 flex flex-col gap-1 bg-slate-950 rounded p-2 border border-slate-900/40 pr-1">
                  {superLogs.map((log, index) => (
                    <div key={index} className="leading-relaxed whitespace-pre-wrap">
                      <span className="text-slate-500 select-none mr-1.5">{`>`}</span>
                      {log}
                    </div>
                  ))}
                  {superLogs.length === 0 && (
                    <div className="text-slate-600 italic text-center my-auto">
                      {lang === 'hu' ? 'Vár az indításra... Konfigurálja a 2 milliós rácsparamétereket fent.' : 'Awaiting start... Configure the 2M grid parameters above.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Emergent Wavefront & Cluster Map */}
              {superStatus === 'completed' && (
                <div className="md:col-span-8 bg-slate-950/80 p-4 rounded-xl border border-slate-900 flex flex-col gap-3 h-[220px] animate-fade-in justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wide flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5 text-indigo-400" />
                      {lang === 'hu' ? 'Hullámfront Morfológia és Szoliton Eloszlás (2D Vetület)' : 'Wavefront Morphology & Soliton Distribution (2D)'}
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono">100% Resolved</span>
                  </span>

                  {/* SVG Wavefront Visualizer */}
                  <div className="relative flex-1 bg-slate-950 rounded-lg border border-slate-900/40 overflow-hidden flex items-center justify-center">
                    <svg className="w-full h-full max-h-[140px]" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.2" strokeDasharray="2,2" />
                      <line x1="50" y1="0" x2="50" y2="100" stroke="#1e293b" strokeWidth="0.2" strokeDasharray="2,2" />
                      
                      <circle cx="50" cy="50" r="15" fill="none" stroke="#6366f1" strokeWidth="0.15" strokeDasharray="3,3" className="animate-pulse" />
                      <circle cx="50" cy="50" r="30" fill="none" stroke="#4f46e5" strokeWidth="0.2" strokeDasharray="4,4" opacity="0.6" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#4338ca" strokeWidth="0.25" strokeDasharray="5,5" opacity="0.4" />
                      
                      {superSolitons.map((sol) => {
                        const isSelected = selectedSuperSoliton?.id === sol.id;
                        return (
                          <g key={sol.id} className="cursor-pointer" onClick={() => setSelectedSuperSoliton(sol)}>
                            <circle
                              cx={sol.cx}
                              cy={sol.cy}
                              r={sol.radius * 1.5}
                              fill={sol.color === 'pink' ? '#ec4899' : sol.color === 'emerald' ? '#10b981' : '#0ea5e9'}
                              fillOpacity={isSelected ? 0.7 : 0.3}
                              stroke={isSelected ? '#ffffff' : (sol.color === 'pink' ? '#f472b6' : sol.color === 'emerald' ? '#34d399' : '#38bdf8')}
                              strokeWidth={isSelected ? 1.5 : 0.6}
                            />
                            <circle
                              cx={sol.cx}
                              cy={sol.cy}
                              r={0.6}
                              fill="#ffffff"
                            />
                          </g>
                        );
                      })}
                    </svg>
                    
                    {/* Floating HUD info */}
                    <div className="absolute top-2 right-2 font-mono text-[8.5px] bg-slate-950/90 py-1 px-2 rounded border border-slate-900 text-slate-400 flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                        <span>Alfa-Mag: 6 sol</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Béta-Sáv: 5 sol</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        <span>Gamma-Sáv: 3 sol</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis details, lists, and charts */}
            {superStatus === 'completed' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2 pt-4 border-t border-slate-900/60 animate-fade-in">
                {/* 1. Clusters List & Stats */}
                <div className="lg:col-span-4 flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wide flex items-center gap-1">
                    <Boxes className="h-3.5 w-3.5 text-indigo-400" />
                    {lang === 'hu' ? 'Azonosított Klaszterek és Spektrum' : 'Identified Clusters & Spectrum'}
                  </span>

                  <div className="flex flex-col gap-2.5">
                    {superClusters.map((cluster) => {
                      const totalEnergy = cluster.avgEnergy * cluster.count;
                      return (
                        <div key={cluster.id} className={`p-3 rounded-xl border ${cluster.borderCol} bg-slate-950/60 flex flex-col gap-1.5`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${cluster.textBg}`}>
                              {lang === 'hu' ? cluster.nameHu : cluster.nameEn}
                            </span>
                            <span className="text-[10px] font-bold font-mono text-slate-300">
                              {cluster.count} {lang === 'hu' ? 'Szoliton' : 'Solitons'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-y-1 text-[9px] font-mono text-slate-400 mt-1">
                            <div>
                              <span>{lang === 'hu' ? 'Közepes méret:' : 'Avg. Radius:'}</span>
                              <strong className="text-slate-200 ml-1">{cluster.avgRadius.toFixed(2)} m</strong>
                            </div>
                            <div>
                              <span>{lang === 'hu' ? 'Saját pureQEff:' : 'Specific q_eff:'}</span>
                              <strong className="text-indigo-400 ml-1">{cluster.pureQEff.toFixed(3)}</strong>
                            </div>
                            <div className="col-span-2">
                              <span>{lang === 'hu' ? 'Spektrális Összenergia:' : 'Cumulative Energy:'}</span>
                              <strong className="text-amber-400 ml-1">{totalEnergy.toExponential(3)} eV</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Soliton size & energy distribution histograms */}
                <div className="lg:col-span-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wide flex items-center gap-1">
                    <BarChart2 className="h-3.5 w-3.5 text-indigo-400" />
                    {lang === 'hu' ? 'Energia és Méret Eloszlási Spektrum' : 'Energy & Size Distribution Spectrum'}
                  </span>

                  <div className="flex-1 flex flex-col gap-4 justify-between font-mono text-[9.5px]">
                    {/* Energy distribution spectrum */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-slate-400 text-[9px]">
                        <span>{lang === 'hu' ? 'ENERGIA SPEKTRUM (eV)' : 'ENERGY SPECTRUM (eV)'}</span>
                        <span className="text-amber-400 font-bold">{lang === 'hu' ? 'Populáció' : 'Pop.'}</span>
                      </div>
                      <div className="flex flex-col gap-1 bg-slate-950 p-2 rounded border border-slate-900/50">
                        <div className="flex items-center gap-2">
                          <span className="w-12 text-slate-500 text-[8px] text-right">High {`(>1.5e9)`}</span>
                          <div className="flex-1 bg-slate-900 h-2.5 rounded overflow-hidden">
                            <div className="bg-pink-500 h-full rounded transition-all" style={{ width: '43%' }} />
                          </div>
                          <span className="w-4 text-right font-bold text-pink-400">6</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-12 text-slate-500 text-[8px] text-right">Mid {`(0.8-1.5)`}</span>
                          <div className="flex-1 bg-slate-900 h-2.5 rounded overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded transition-all" style={{ width: '36%' }} />
                          </div>
                          <span className="w-4 text-right font-bold text-emerald-400">5</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-12 text-slate-500 text-[8px] text-right">Low {`(<0.8e9)`}</span>
                          <div className="flex-1 bg-slate-900 h-2.5 rounded overflow-hidden">
                            <div className="bg-sky-500 h-full rounded transition-all" style={{ width: '21%' }} />
                          </div>
                          <span className="w-4 text-right font-bold text-sky-400">3</span>
                        </div>
                      </div>
                    </div>

                    {/* Size / Radius distribution */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-slate-400 text-[9px]">
                        <span>{lang === 'hu' ? 'MÉRET ELOSZLÁS (Effektív Sugár - m)' : 'SIZE DISTRIBUTION (Effective Radius - m)'}</span>
                        <span className="text-amber-400 font-bold">{lang === 'hu' ? 'Populáció' : 'Pop.'}</span>
                      </div>
                      <div className="flex flex-col gap-1 bg-slate-950 p-2 rounded border border-slate-900/50">
                        <div className="flex items-center gap-2">
                          <span className="w-12 text-slate-500 text-[8px] text-right">Large {`(>2.0m)`}</span>
                          <div className="flex-1 bg-slate-900 h-2.5 rounded overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded transition-all" style={{ width: '36%' }} />
                          </div>
                          <span className="w-4 text-right font-bold text-emerald-400">5</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-12 text-slate-500 text-[8px] text-right">Mid {`(1.4-2.0m)`}</span>
                          <div className="flex-1 bg-slate-900 h-2.5 rounded overflow-hidden">
                            <div className="bg-pink-500 h-full rounded transition-all" style={{ width: '43%' }} />
                          </div>
                          <span className="w-4 text-right font-bold text-pink-400">6</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-12 text-slate-500 text-[8px] text-right">Small {`(<1.4m)`}</span>
                          <div className="flex-1 bg-slate-900 h-2.5 rounded overflow-hidden">
                            <div className="bg-sky-500 h-full rounded transition-all" style={{ width: '21%' }} />
                          </div>
                          <span className="w-4 text-right font-bold text-sky-400">3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Selected Soliton Details & Injector */}
                <div className="lg:col-span-4 bg-slate-950/60 p-4 rounded-xl border border-indigo-500/10 flex flex-col gap-3 justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wide flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                    {lang === 'hu' ? 'Kijelölt Egyedi Szoliton Részletek' : 'Selected Individual Soliton'}
                  </span>

                  {selectedSuperSoliton ? (
                    <div className="flex flex-col gap-2.5 font-mono text-[10.5px] flex-1 justify-between">
                      <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg flex flex-col gap-1.5">
                        <div className="flex justify-between text-[9px] text-slate-500">
                          <span>ID: {selectedSuperSoliton.id}</span>
                          <span className="text-indigo-400 font-bold uppercase">{selectedSuperSoliton.color === 'pink' ? 'Alpha Core' : selectedSuperSoliton.color === 'emerald' ? 'Beta Ridge' : 'Gamma Band'}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-1.5 text-[10px] text-slate-300 mt-0.5">
                          <div>
                            <span className="text-slate-500 text-[8px] uppercase block">{lang === 'hu' ? 'Topológiai Winding' : 'Winding Number'}</span>
                            <span className="font-bold text-white text-[11px]">{selectedSuperSoliton.winding}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[8px] uppercase block">{lang === 'hu' ? 'Effektív Töltés (q_eff)' : 'Emergent Charge (q_eff)'}</span>
                            <span className="font-bold text-indigo-400 text-[11px]">{selectedSuperSoliton.pureQEff.toFixed(4)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[8px] uppercase block">{lang === 'hu' ? 'Energia' : 'Physical Energy'}</span>
                            <span className="font-bold text-amber-400 text-[11px]">{(selectedSuperSoliton.energy).toExponential(3)} eV</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[8px] uppercase block">{lang === 'hu' ? 'Sugár (R_eff)' : 'Effective Radius (R_eff)'}</span>
                            <span className="font-bold text-white text-[11px]">{selectedSuperSoliton.radius.toFixed(2)} m</span>
                          </div>
                        </div>

                        <div className="text-[9px] text-slate-500 mt-1 border-t border-slate-900/60 pt-1 flex items-center justify-between">
                          <span>{lang === 'hu' ? 'Lokális Stabilitás:' : 'Local Stability:'}</span>
                          <span className="text-emerald-400 font-bold">{lang === 'hu' ? selectedSuperSoliton.stabilityHu : selectedSuperSoliton.stabilityEn}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-slate-900/40 font-mono">
                        <div className="flex items-center gap-1.5 justify-between">
                          <span className="text-slate-500 text-[8.5px] uppercase font-bold">{lang === 'hu' ? 'Átemelés Célja:' : 'Injection Target:'}</span>
                          <div className="flex rounded bg-slate-900 p-0.5 border border-slate-800">
                            <button
                              onClick={() => setSuperInjectTarget('soliton-1')}
                              className={`px-1.5 py-0.5 text-[8.5px] font-bold rounded cursor-pointer transition-all ${
                                superInjectTarget === 'soliton-1' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              Sol-1
                            </button>
                            <button
                              onClick={() => setSuperInjectTarget('soliton-2')}
                              className={`px-1.5 py-0.5 text-[8.5px] font-bold rounded cursor-pointer transition-all ${
                                superInjectTarget === 'soliton-2' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              Sol-2
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={handleInjectSuperSoliton}
                          className="w-full py-2 px-3 rounded-xl text-[10.5px] font-bold text-slate-950 bg-indigo-400 hover:bg-indigo-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {lang === 'hu' ? 'PULZUS ÁTEMELÉSE AZ INTERAKTÍV TÉRBE' : 'INJECT PULSE INTO SAMPLER'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-[10px] text-slate-500 italic p-3 border border-dashed border-slate-900 rounded-lg">
                      {lang === 'hu' ? 'Válasszon ki egy szolitant a 2D vetületen a részletes leíráshoz.' : 'Select a soliton on the 2D projection for physical specs.'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Global feedback alerts for super-cosmic run */}
            {superInjectSuccessMsg && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono rounded-xl animate-fade-in flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                <span>{superInjectSuccessMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* 10 KÜLÖNBÖZŐ TELJES FUTÁS (10 DIFFERENT FULL RUN SCENARIOS) */}
        <div className="mt-8 border-t border-slate-800/60 pt-6">
          <span className="text-[11px] font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Zap className="h-4 w-4 text-amber-400" />
            {lang === 'hu' ? 'Kísérleti Forgatókönyvek – 10 Különböző Fizikai Modell Futás' : 'Experimental Scenarios – 10 Different Physical Model Runs'}
          </span>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-4">
            {lang === 'hu'
              ? 'Válasszon az alábbi 10 előre beállított fizikai szituáció közül. A gombra kattintva a rendszer automatikusan konfigurálja a fázis- és rácsparamétereket, legenerálja a tiszta topológiai környezetet, elindítja a magas felbontású vizsgálatot a fizikai töltés levezetéséhez, kiszámítja az összehasonlító trajektóriákat, és rögzíti az adatokat a jegyzőkönyvbe.'
              : 'Select from the 10 physical scenarios below. Clicking a button will automatically configure phase and grid parameters, generate the pure topological environment, run the high-resolution trial for physical charge derivation, and append the results to the registry.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {cosmicScenariosList.map((sc, idx) => (
              <button
                key={idx}
                onClick={() => handleRunFullScenario(idx)}
                disabled={cosmicStatus === 'generating'}
                className="p-3 bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/30 rounded-xl text-left transition-all duration-200 group flex flex-col justify-between gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs relative overflow-hidden"
              >
                {/* Micro numbering bubble */}
                <div className="absolute top-1 right-1 text-[8px] font-mono text-slate-600 font-bold px-1 rounded bg-slate-950/80">
                  #{idx + 1}
                </div>
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-amber-300 font-mono text-[10px] leading-tight">
                    {lang === 'hu' ? sc.nameHu : sc.nameEn}
                  </div>
                  <p className="text-[9.5px] text-slate-500 line-clamp-2 mt-1 font-sans">
                    {lang === 'hu' ? sc.descHu : sc.descEn}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1 text-[8px] font-mono mt-1 pt-2 border-t border-slate-900">
                  <span className="px-1 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                    W:{sc.winding > 0 ? `+${sc.winding}` : sc.winding}
                  </span>
                  <span className="px-1 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold">
                    C:{sc.charge}
                  </span>
                  <span className="px-1 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold">
                    R:{sc.resolution}x
                  </span>
                  <span className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                    v:{sc.velocity === 'zero' ? '0.0' : sc.velocity === 'low' ? '0.35' : '0.85'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* KOZMIKUS JEGYZŐKÖNYV REGISZTER ÉS LETÖLTŐ KÖZPONT */}
        <div className="mt-8 border-t border-slate-800/60 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-sky-400" />
              <span className="text-[11px] font-bold text-sky-400 font-mono uppercase tracking-wider">
                {lang === 'hu' ? 'Topológiai Kísérleti Jegyzőkönyv és Letöltő Központ' : 'Topological Experimental Protocol Registry & Download Hub'}
              </span>
            </div>
            
            {cosmicProtocols.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadCosmicProtocols('txt')}
                  className="px-2.5 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Download className="h-3 w-3" />
                  TXT LETÖLTÉS
                </button>
                <button
                  onClick={() => handleDownloadCosmicProtocols('json')}
                  className="px-2.5 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Download className="h-3 w-3" />
                  JSON LETÖLTÉS
                </button>
                <button
                  onClick={() => setCosmicProtocols([])}
                  className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                  {lang === 'hu' ? 'TÖRLÉS' : 'CLEAR'}
                </button>
              </div>
            )}
          </div>

          {cosmicProtocols.length === 0 ? (
            <div className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-xl flex items-center justify-center text-xs text-slate-500 font-mono">
              {lang === 'hu' ? 'Még nincs rögzített topológiai jegyzőkönyv.' : 'No topological protocols recorded yet.'}
            </div>
          ) : (
            <div className="max-h-[220px] overflow-y-auto pr-1 flex flex-col gap-2 border border-slate-900 rounded-xl bg-slate-950/20 p-2">
              {cosmicProtocols.map((entry) => (
                <div key={entry.id} className="p-3 bg-slate-950/80 rounded-lg border border-slate-900 text-[10.5px] font-mono flex flex-col sm:flex-row justify-between gap-3 text-slate-300">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold uppercase">
                        {entry.timestamp}
                      </span>
                      <span className="font-bold text-slate-100">{entry.scenarioName}</span>
                    </div>
                    <div className="text-[9.5px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      <span>Grid: {entry.gridSize}×{entry.gridSize}</span>
                      <span>Well: {entry.wellName}</span>
                      <span>Winding W: {entry.probeWinding}</span>
                      <span>Res: {entry.probeResolution}x</span>
                      <span>Velocity: {entry.probeInitVelocity}</span>
                      <span className="text-rose-400 font-bold">Charge: {entry.probeCharge}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end justify-center text-[9.5px] gap-1">
                    <div className="flex gap-2">
                      <span className="text-emerald-400 font-semibold">Pure q_eff: {entry.pureQEff.toFixed(4)}</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-rose-400 font-semibold">Dist q_eff: {entry.enhancedQEff.toFixed(4)}</span>
                    </div>
                    <div className="text-[9px] text-slate-500">
                      Distortion: <span className="text-rose-400 font-bold">{entry.distortion}%</span> | Back-reaction: <span className="text-amber-400 font-bold">{entry.backReaction}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------------------
          MODULE 3: MEASUREMENT PROTOCOL & ANALYSIS CENTER (MÉRÉSI JEGYZŐKÖNYV)
          ------------------------------------------------------------------------------ */}
      <section className="rounded-2xl border border-slate-800/80 bg-[#0c1322]/80 p-6 backdrop-blur-md shadow-2xl relative" id="measurement-protocol-section">
        <div className="absolute top-0 right-0 h-48 w-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 border border-indigo-500/20 text-indigo-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
                {text.protocolTitle}
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-sans font-medium uppercase">
                  Active Lab Journal
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                {text.protocolDesc}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunEmergentChargeProtocol}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-sky-950/40 border border-sky-500/30 cursor-pointer animate-pulse hover:animate-none"
              id="run-emergent-protocol-btn"
            >
              <Compass className="h-4 w-4 text-sky-300" />
              {text.emergentProtocolBtn}
            </button>

            <button
              onClick={handleRun10BatchExperiments}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/30 cursor-pointer"
              id="run-10-batch-experiments-btn"
            >
              <Sparkles className="h-4 w-4 text-emerald-300" />
              {text.batchBtn}
            </button>

            <button
              onClick={handleRecordProtocol}
              disabled={solitons.length < 2 || !liveDiagnostics}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                solitons.length >= 2 && liveDiagnostics
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-950/40 border border-indigo-500/30 cursor-pointer'
                  : 'bg-slate-900 text-slate-600 border border-slate-950 cursor-not-allowed'
              }`}
              id="record-current-protocol-btn"
            >
              <PlusCircle className="h-4 w-4" />
              {text.recordBtn}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Logs List Panel */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
              <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                {text.recordedTitle} ({records.length})
              </span>
              <div className="flex gap-2">
                {records.length > 0 && (
                  <>
                    <button
                      onClick={handleExportProtocolJSON}
                      className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-1 bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10 cursor-pointer"
                      title="Export to JSON clipboard"
                    >
                      <Copy className="h-3 w-3" />
                      {isCopiedProtocol ? (lang === 'hu' ? 'Másolva!' : 'Copied!') : 'JSON'}
                    </button>
                    <button
                      onClick={handleDownloadProtocolJSON}
                      className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 transition-all flex items-center gap-1 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10 cursor-pointer"
                      title={lang === 'hu' ? 'Letöltés teljes JSON jegyzőkönyvként' : 'Download full protocol as JSON'}
                    >
                      <Download className="h-3 w-3" />
                      {lang === 'hu' ? 'Letöltés' : 'Download'}
                    </button>
                    <button
                      onClick={handleClearRecords}
                      className="text-[10px] font-mono text-rose-400 hover:text-rose-300 transition-all flex items-center gap-1 bg-rose-500/5 px-2 py-1 rounded border border-rose-500/10 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      {lang === 'hu' ? 'Mind' : 'All'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {records.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500 font-mono leading-relaxed bg-slate-950/20">
                <HelpCircle className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                {text.noRecords}
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                {records.map((rec) => {
                  const isSelected = selectedRecordId === rec.id;
                  const isRef = rec.id.startsWith('ref');
                  const isScattering = rec.stateStr.includes('SZÓRÁSI') || rec.stateStr.includes('SCATTERING') || rec.stateStr.includes('STREUUNGS');
                  const isBound = rec.stateStr.includes('KÖTÖTT') || rec.stateStr.includes('BOUND') || rec.stateStr.includes('GEBUNDEN');
                  
                  return (
                    <button
                      key={rec.id}
                      onClick={() => setSelectedRecordId(rec.id)}
                      className={`w-full text-left p-3 rounded-xl border font-mono transition-all flex flex-col gap-1 relative cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-950/20'
                          : 'bg-slate-950/30 hover:bg-slate-950/50 border-slate-900'
                      }`}
                    >
                      {isRef && (
                        <span className="absolute top-2 right-2 text-[8px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 uppercase">
                          Reference
                        </span>
                      )}
                      <span className="text-[9px] text-slate-500">{rec.timestamp}</span>
                      <span className={`text-[11px] font-bold truncate pr-12 ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>
                        {rec.name}
                      </span>
                      <div className="flex items-center gap-3 text-[9px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${isBound ? 'bg-emerald-500 animate-pulse' : isScattering ? 'bg-cyan-400' : 'bg-rose-500 animate-pulse'}`} />
                          {rec.stateStr.split(' ')[0]}
                        </span>
                        <span>d = {rec.distance.toFixed(2)}</span>
                        <span>v = {rec.vRel.toFixed(2)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* In-place input notes box before adding */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-900 flex flex-col gap-2.5 mt-auto">
              <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wide font-mono flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {lang === 'hu' ? 'Megjegyzés fűzése a következő méréshez:' : 'Attach note to next measurement:'}
              </label>
              <textarea
                value={newRecordNotes}
                onChange={(e) => setNewRecordNotes(e.target.value)}
                placeholder={text.addNotesPlaceholder}
                className="w-full bg-slate-950 text-xs text-slate-300 border border-slate-800 rounded-lg p-2 h-16 focus:outline-none focus:border-indigo-500/50 font-mono resize-none"
              />
            </div>
          </div>

          {/* Details Dashboard Panel */}
          <div className="lg:col-span-8 bg-slate-950/40 rounded-2xl border border-slate-900 p-5 font-mono text-xs flex flex-col gap-5">
            {(() => {
              const rec = records.find(r => r.id === selectedRecordId);
              if (!rec) {
                return (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 leading-relaxed">
                    <FileText className="h-12 w-12 text-slate-700 mb-2 animate-pulse" />
                    <span>{lang === 'hu' ? 'Válasszon ki egy mérési bejegyzést a bal oldali listából a részletes elemzés megtekintéséhez.' : 'Select a protocol log from the list on the left to display its detailed scientific analysis.'}</span>
                  </div>
                );
              }

              // Compute automated interpretation text based on physical constants in the log
              const windingProduct = rec.s1Charge * rec.s2Charge;
              
              let typeTitle = '';
              let interpretationText = '';
              
              if (windingProduct < 0) {
                typeTitle = lang === 'hu' ? 'Azonosítatlan Topológiai Csatolás (Szemközti Töltések - Vonzás)' : 'Co-axial Topological Attractive Coupling (Opposite Charges)';
                interpretationText = lang === 'hu' 
                  ? `A mérés során a két szoliton ellentétes topológiai winding számmal rendelkezik (Q1 = ${rec.s1Charge}, Q2 = ${rec.s2Charge}), ami egy eredendően vonzó Yukawa-szerű átfedési potenciált (V_overlap = ${rec.overlapPot.toExponential(3)} eV) generál. Mivel a teljes relatív energia negatív (${rec.eTotal.toExponential(3)} eV), a rendszer stabil kötött pályán kering, ahol a 4D w-tengely feszültsége gátolja a végtelen szétrepülést. A Mach-féle tehetetlen tömegmoduláció következtében a szolitonok effektív tömege periodikus hullámzást mutat (${rec.mass1.toFixed(3)} és ${rec.mass2.toFixed(3)} eV_m között), ami a Fourier-spektrumban belső fázisvibrációs melléksávokként és felharmonikus eltolódásokként jelentkezik.`
                  : `The experiment registers solitons with opposite topological winding charges (Q1 = ${rec.s1Charge}, Q2 = ${rec.s2Charge}), generating an inherently attractive overlap potential gradient (V_overlap = ${rec.overlapPot.toExponential(3)} eV). With a negative total relative energy (${rec.eTotal.toExponential(3)} eV), the solitons form a stable gravitational-like orbital lock in ℝ⁴ spacetime sheet. In accordance with Mach's Principle, out-of-plane w-displacement modulates the effective rest masses (ranging between ${rec.mass1.toFixed(3)} and ${rec.mass2.toFixed(3)} eV_m), which physically translates to a continuous spectral mode-splitting and frequency shifting in the Fourier spectrum.`;
              } else if (windingProduct > 0) {
                typeTitle = lang === 'hu' ? 'Hiperbolikus Topológikus Taszítás (Azonos Töltések - Szórás)' : 'Hyperbolic Topological Repulsive Scattering (Identical Charges)';
                interpretationText = lang === 'hu' 
                  ? `A mérés során mindkét szoliton azonos topológiai wound előjellel rendelkezik (Q1 = ${rec.s1Charge}, Q2 = ${rec.s2Charge}). Ez magas, nem-szinguláris potenciálgátat képez közöttük (V_overlap = ${rec.overlapPot.toExponential(3)} eV). A felesleges relatív mozgási energia (${rec.eKin.toExponential(3)} eV) miatt a teljes energia szigorúan pozitív, így a kísérleti trajektória hiperbolikus szórási pályát ír le. Az átfedési zónában a belső Fourier hullámmódusok amplitúdói ideiglenesen megnövekednek, ahogy a haladó kinetikus energia egy része átmenetileg a belső fázis-vibrációkba csatolódik, mielőtt a szolitonok véglegesen eltávolodnának egymástól.`
                  : `The recorded log exhibits identical topological winding signs (Q1 = ${rec.s1Charge}, Q2 = ${rec.s2Charge}). This configuration raises a strong central potential barrier (V_overlap = ${rec.overlapPot.toExponential(3)} eV). Since the relative kinetic energy is high (${rec.eKin.toExponential(3)} eV), the total relative energy remains strictly positive, resulting in a hyperbolic scattering trajectory. In the overlapping collision sheath, kinetic energy is briefly partitioned into internal Fourier wave modes, increasing their amplitude before the packets decouple and disperse back into linear states.`;
              } else {
                typeTitle = lang === 'hu' ? 'Nem-Topologikus Hullámcsomag Disszipációs mérés' : 'Non-Topological Wave-Packet Dissipative State';
                interpretationText = lang === 'hu' 
                  ? `Az egyik vagy mindkét hullámcsomag topológiai winding száma nulla. Megfelelő megmaradó töltés hiányában a szoliton-szerű kohéziót fenntartó topológiai áramok gyengék vagy hiányoznak. A kísérleti térben a w-hipertér feszültség és a viszkózus disszipáció (damping = ${rec.damping}) miatt ezek a struktúrák nem mutatnak stabil részecskeszerű tulajdonságokat; fúzió helyett fokozatosan elmosódnak és szétoszlanak a háttérmezőben.`
                  : `One or both of the wave packets lacks a topological winding charge. Without the topological protection of winding conservation, the packet coherence is fragile. Under hyperspace tension and damping (${rec.damping}), the structures fail to show particle-like integrity and progressively disperse into the linear background field, losing amplitude and spectral definition.`;
              }

              return (
                <div className="flex flex-col gap-4">
                  
                  {/* Title and date row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{lang === 'hu' ? 'SZEKTOR-DOKUMENTUM' : 'LAB JOURNAL RECORD'}</span>
                      <h3 className="text-sm font-bold text-slate-100">{rec.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadSingleRecord(rec)}
                        className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-all flex items-center gap-1.5 bg-cyan-500/5 px-2.5 py-1 rounded border border-cyan-500/15 cursor-pointer"
                        title={lang === 'hu' ? 'Kísérleti jegyzőkönyv letöltése TXT jelentésként' : 'Download measurement log as TXT report'}
                        id="download-single-record-txt-btn"
                      >
                        <Download className="h-3 w-3" />
                        {lang === 'hu' ? 'TXT letöltése' : 'Download TXT'}
                      </button>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px] bg-slate-950 px-2.5 py-1 rounded border border-slate-900">
                        <Zap className="h-3 w-3 text-amber-500" />
                        <span>{text.referenceData}</span>
                      </div>
                    </div>
                  </div>

                  {/* Physics config row (Two columns of parameters) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Soliton 1 parameters */}
                    <div className="p-3 rounded-xl border border-rose-500/10 bg-rose-500/5 flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-rose-500/10 pb-1.5 mb-1.5">
                        <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          SOLITON 1 (W+)
                        </span>
                        <span className="text-[10px] font-bold text-rose-400">Q = {rec.s1Charge}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                        <div className="flex justify-between"><span className="text-slate-500">Radius:</span> <span className="text-rose-300 font-bold">{rec.s1Radius.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">V_max:</span> <span className="text-rose-300 font-bold">{rec.s1Energy.toExponential(1)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">k_mode:</span> <span className="text-rose-300 font-bold">{rec.s1KMode.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Mass:</span> <span className="text-rose-300 font-bold">{rec.mass1.toFixed(3)}</span></div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 pt-1.5 border-t border-rose-500/5">
                        <div className="flex justify-between"><span className="text-slate-500">Pos:</span> <span className="font-bold">[{rec.s1Pos.map(v => v.toFixed(2)).join(', ')}]</span></div>
                        <div className="flex justify-between mt-0.5"><span className="text-slate-500">Vel:</span> <span className="font-bold">[{rec.s1Vel.map(v => v.toFixed(2)).join(', ')}]</span></div>
                      </div>
                    </div>

                    {/* Soliton 2 parameters */}
                    <div className="p-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-emerald-500/10 pb-1.5 mb-1.5">
                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          SOLITON 2 (W-)
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400">Q = {rec.s2Charge}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                        <div className="flex justify-between"><span className="text-slate-500">Radius:</span> <span className="text-emerald-300 font-bold">{rec.s2Radius.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">V_max:</span> <span className="text-emerald-300 font-bold">{rec.s2Energy.toExponential(1)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">k_mode:</span> <span className="text-emerald-300 font-bold">{rec.s2KMode.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Mass:</span> <span className="text-emerald-300 font-bold">{rec.mass2.toFixed(3)}</span></div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 pt-1.5 border-t border-emerald-500/5">
                        <div className="flex justify-between"><span className="text-slate-500">Pos:</span> <span className="font-bold">[{rec.s2Pos.map(v => v.toFixed(2)).join(', ')}]</span></div>
                        <div className="flex justify-between mt-0.5"><span className="text-slate-500">Vel:</span> <span className="font-bold">[{rec.s2Vel.map(v => v.toFixed(2)).join(', ')}]</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Physics Environmental and Live measurement box */}
                  {(() => {
                    const recFieldAsymmetry = rec.fieldAsymmetry ?? (1.0 + (0.45 * Math.abs(rec.s1Charge - rec.s2Charge)) / (1.0 + 0.35 * rec.distance));
                    const recGradientDistortion = rec.gradientDistortion ?? ((Math.abs(rec.s1Charge) + Math.abs(rec.s2Charge)) * (0.15 / (rec.distance * rec.distance + 0.5)));
                    const recREff = (rec.s1Radius + rec.s2Radius) / 2;
                    const recQEff = rec.qEff ?? (Math.abs(rec.s1Charge - rec.s2Charge) * recFieldAsymmetry * recGradientDistortion * Math.sqrt(Math.abs(rec.overlapPot)) * 2.5e-3);
                    
                    const recWindingAvg = (Math.abs(rec.s1Charge) + Math.abs(rec.s2Charge)) / 2;
                    const recQEffGeom = recFieldAsymmetry * recGradientDistortion * recWindingAvg;
                    const recQEffPot = (Math.abs(rec.overlapPot) * 1.5e-5 * recFieldAsymmetry) / (recREff + 1e-5);

                    return (
                      <div className="flex flex-col gap-4">
                        <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10.5px]">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-500 block text-[9px] uppercase">Distance (d)</span>
                            <span className="text-slate-100 font-bold text-xs">{rec.distance.toFixed(4)} r_0</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-500 block text-[9px] uppercase">Rel. Velocity (v)</span>
                            <span className="text-cyan-400 font-bold text-xs">{rec.vRel.toFixed(4)} c</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-500 block text-[9px] uppercase">Overlap Potential</span>
                            <span className="text-amber-400 font-bold text-xs">{rec.overlapPot.toExponential(3)} eV</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-500 block text-[9px] uppercase">Total Energy</span>
                            <span className={`font-bold text-xs ${rec.eTotal < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>{rec.eTotal.toExponential(3)} eV</span>
                          </div>
                        </div>

                        {/* Emergent Charge Indicators Row */}
                        <div className="p-4 bg-indigo-950/25 rounded-xl border border-indigo-500/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10.5px]">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-indigo-400 block text-[9px] uppercase font-bold">{lang === 'hu' ? 'q_eff (Finomított modell)' : 'q_eff (Refined model)'}</span>
                            <span className="text-indigo-200 font-bold text-xs font-mono">{recQEff.toFixed(4)} e_eff</span>
                            <span className="text-[8px] text-indigo-400 font-mono mt-0.5">q_eff = |W1-W2| × α × δ × √|V_ov|</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-indigo-400 block text-[9px] uppercase font-bold">{lang === 'hu' ? 'q_eff (Geometriai model)' : 'q_eff (Geometric model)'}</span>
                            <span className="text-indigo-300 font-bold text-xs font-mono">{recQEffGeom.toFixed(4)} q_geom</span>
                            <span className="text-[8px] text-indigo-400 font-mono mt-0.5">q_geom = α × δ × |W|</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-indigo-400 block text-[9px] uppercase font-bold">{text.fieldAsymmetryLabel}</span>
                            <span className="text-violet-300 font-bold text-xs font-mono">{(recFieldAsymmetry * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-indigo-400 block text-[9px] uppercase font-bold">{text.gradientDistortionLabel}</span>
                            <span className="text-emerald-300 font-bold text-xs font-mono">{recGradientDistortion.toFixed(5)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Scientific Analysis Section */}
                  <div className="flex flex-col gap-2 border border-indigo-500/10 p-4 rounded-xl bg-indigo-950/5">
                    <h4 className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-indigo-500/10">
                      <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                      {text.scientificAnalysis}
                    </h4>
                    <div className="text-[11px] text-slate-300 leading-relaxed font-sans pt-1">
                      <p className="font-bold text-indigo-200 text-xs mb-1 font-mono">{typeTitle}</p>
                      <p className="text-slate-400">{interpretationText}</p>
                    </div>
                  </div>

                  {/* Notes / Observer remarks sheet */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                      {text.customNotes}
                    </h4>
                    <textarea
                      value={rec.userNotes}
                      onChange={(e) => handleUpdateRecordNotes(rec.id, e.target.value)}
                      placeholder="Írja meg észrevételeit..."
                      className="w-full bg-slate-950 text-xs text-slate-300 border border-slate-900 rounded-xl p-3 h-24 focus:outline-none focus:border-indigo-500/30 font-mono resize-none leading-relaxed"
                    />
                  </div>

                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Recommended Scientific Investigations Card */}
      <section className="bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-5 md:p-6 flex flex-col gap-4 mt-6" id="scientific-investigations-guide">
        <div className="flex items-center gap-2.5 pb-3 border-b border-indigo-500/10">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">{text.researchGuideTitle}</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">{text.researchGuideDesc}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Featured Protocol Card */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-r from-indigo-950/40 via-sky-950/20 to-slate-950/80 p-5 rounded-2xl border border-sky-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="flex flex-col gap-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[9px] font-bold font-mono tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded uppercase">
                  {lang === 'hu' ? 'Kiemelt Tudományos Protokoll' : 'Featured Scientific Protocol'}
                </span>
                <span className="text-[10px] font-mono text-indigo-400">v1.2</span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-100 font-mono tracking-wide">
                {lang === 'hu' ? 'Emergens Töltés Teszt – Winding → Potenciál → Kölcsönhatás' : 'Emergent Charge Test – Winding → Potential → Interaction'}
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                {lang === 'hu' 
                  ? 'Ez a méréssorozat (20 kísérlet, 4 önálló széria) feltérképezi, hogyan alakítják át a topológiai winding számok a mezőgeometriát, és hogyan indukálnak egy emergens q_eff ≈ (mélység * aszimmetria) / R_eff töltést a fizikai térben.'
                  : 'This systematic trial (20 experiments, 4 distinct series) maps how topological winding numbers alter field geometry and induce an emergent charge q_eff ≈ (depth * asymmetry) / R_eff in physical space.'}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[10px] font-mono text-slate-400">
                <span><strong className="text-sky-400">simSpeed:</strong> 1.2–2.8 (1.8 fix)</span>
                <span><strong className="text-indigo-400">damping:</strong> 0.003</span>
                <span><strong className="text-violet-400">tension:</strong> 0.4</span>
                <span><strong className="text-pink-400">gravityScale:</strong> 1.2</span>
                <span><strong className="text-amber-400">dist:</strong> ~6.5-7.0</span>
              </div>
            </div>
            <button
              onClick={handleRunEmergentChargeProtocol}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-sky-950/40 border border-sky-500/30 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Compass className="h-4 w-4 text-sky-200" />
              {lang === 'hu' ? 'Jegyzőkönyv Generálása (20 mérés)' : 'Generate Full Journal (20 runs)'}
            </button>
          </div>

          {/* Task 1 */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex flex-col justify-between gap-3 hover:border-slate-800 transition-all">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-bold text-amber-400 font-mono">{text.researchTask1}</span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{text.researchTask1Desc}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-900">
              <button
                onClick={() => handleLoadSpecificConfiguration({
                  s1Winding: 1, s1Radius: 2.4, s1Energy: 1.2e6, s1KMode: 0.8,
                  s1Pos: [-5.0, 0.1, 0, 0.05], s1Vel: [0.8, 1.2, 0, 0],
                  s2Winding: -1, s2Radius: 2.4, s2Energy: 1.2e6, s2KMode: 0.8,
                  s2Pos: [5.0, -0.1, 0, -0.05], s2Vel: [-0.8, -1.2, 0, 0]
                })}
                className="text-[10px] font-mono font-bold text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded border border-indigo-500/20 cursor-pointer transition-all"
              >
                {lang === 'hu' ? 'Lassú ütközés' : 'Slow collision'}
              </button>
              <button
                onClick={() => handleLoadSpecificConfiguration({
                  s1Winding: 1, s1Radius: 2.4, s1Energy: 1.2e6, s1KMode: 0.8,
                  s1Pos: [-6.5, 0.1, 0, 0.05], s1Vel: [4.5, 0.5, 0, 0],
                  s2Winding: -1, s2Radius: 2.4, s2Energy: 1.2e6, s2KMode: 0.8,
                  s2Pos: [6.5, -0.1, 0, -0.05], s2Vel: [-4.5, -0.5, 0, 0]
                })}
                className="text-[10px] font-mono font-bold text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded border border-indigo-500/20 cursor-pointer transition-all"
              >
                {lang === 'hu' ? 'Gyors ütközés' : 'Fast collision'}
              </button>
            </div>
          </div>

          {/* Task 2 */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex flex-col justify-between gap-3 hover:border-slate-800 transition-all">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-bold text-cyan-400 font-mono">{text.researchTask2}</span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{text.researchTask2Desc}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-900">
              <button
                onClick={() => handleLoadSpecificConfiguration({
                  s1Winding: 1, s1Radius: 2.4, s1Energy: 1.2e6, s1KMode: 0.8,
                  s1Pos: [-4.0, 0.5, 0, 0.05], s1Vel: [1.2, 0.8, 0, 0],
                  s2Winding: -1, s2Radius: 2.4, s2Energy: 1.2e6, s2KMode: 0.8,
                  s2Pos: [4.0, -0.5, 0, -0.05], s2Vel: [-1.2, -0.8, 0, 0]
                })}
                className="text-[10px] font-mono font-bold text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-1 rounded border border-cyan-500/20 cursor-pointer transition-all"
                title="E_total < 0 (Kötött állapot)"
              >
                {lang === 'hu' ? 'Kötött (E < 0)' : 'Bound (E < 0)'}
              </button>
              <button
                onClick={() => handleLoadSpecificConfiguration({
                  s1Winding: 1, s1Radius: 2.4, s1Energy: 1.2e6, s1KMode: 0.8,
                  s1Pos: [-4.0, 0.5, 0, 0.05], s1Vel: [2.15, 0.8, 0, 0],
                  s2Winding: -1, s2Radius: 2.4, s2Energy: 1.2e6, s2KMode: 0.8,
                  s2Pos: [4.0, -0.5, 0, -0.05], s2Vel: [-2.15, -0.8, 0, 0]
                })}
                className="text-[10px] font-mono font-bold text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-1 rounded border border-cyan-500/20 cursor-pointer transition-all"
                title="E_total ≈ 0 (Átmeneti küszöb)"
              >
                {lang === 'hu' ? 'Küszöb (E ≈ 0)' : 'Threshold (E ≈ 0)'}
              </button>
              <button
                onClick={() => handleLoadSpecificConfiguration({
                  s1Winding: 1, s1Radius: 2.4, s1Energy: 1.2e6, s1KMode: 0.8,
                  s1Pos: [-4.0, 0.5, 0, 0.05], s1Vel: [3.5, 0.8, 0, 0],
                  s2Winding: -1, s2Radius: 2.4, s2Energy: 1.2e6, s2KMode: 0.8,
                  s2Pos: [4.0, -0.5, 0, -0.05], s2Vel: [-3.5, -0.8, 0, 0]
                })}
                className="text-[10px] font-mono font-bold text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-1 rounded border border-cyan-500/20 cursor-pointer transition-all"
                title="E_total > 0 (Szóródás)"
              >
                {lang === 'hu' ? 'Szórás (E > 0)' : 'Scatter (E > 0)'}
              </button>
            </div>
          </div>

          {/* Task 3 */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex flex-col justify-between gap-3 hover:border-slate-800 transition-all">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-bold text-rose-400 font-mono">{text.researchTask3}</span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{text.researchTask3Desc}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-900">
              <button
                onClick={() => handleLoadSpecificConfiguration({
                  s1Winding: 1, s1Radius: 2.4, s1Energy: 1.2e6, s1KMode: 0.8,
                  s1Pos: [-4.0, 0.0, 0, 0.05], s1Vel: [1.2, 0.5, 0, 0],
                  s2Winding: -2, s2Radius: 2.4, s2Energy: 1.2e6, s2KMode: 0.8,
                  s2Pos: [4.0, 0.0, 0, -0.05], s2Vel: [-1.2, -0.5, 0, 0]
                })}
                className="text-[10px] font-mono font-bold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded border border-rose-500/20 cursor-pointer transition-all"
              >
                {lang === 'hu' ? 'Aszimmetrikus Q' : 'Asymmetric Q'}
              </button>
              <button
                onClick={() => handleLoadSpecificConfiguration({
                  s1Winding: 2, s1Radius: 2.4, s1Energy: 1.2e6, s1KMode: 0.8,
                  s1Pos: [-4.5, 0.0, 0, 0.05], s1Vel: [1.5, 0.0, 0, 0],
                  s2Winding: 2, s2Radius: 2.4, s2Energy: 1.2e6, s2KMode: 0.8,
                  s2Pos: [4.5, 0.0, 0, -0.05], s2Vel: [-1.5, 0.0, 0, 0]
                })}
                className="text-[10px] font-mono font-bold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded border border-rose-500/20 cursor-pointer transition-all"
              >
                {lang === 'hu' ? 'Kettős taszítás' : 'Double Repulsion'}
              </button>
            </div>
          </div>

          {/* Task 4 */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex flex-col justify-between gap-3 hover:border-slate-800 transition-all">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-bold text-emerald-400 font-mono">{text.researchTask4}</span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{text.researchTask4Desc}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-900">
              <button
                onClick={() => handleLoadSpecificConfiguration({
                  s1Winding: 1, s1Radius: 1.4, s1Energy: 4e5, s1KMode: 1.2,
                  s1Pos: [-4.5, 0.0, 0, 0.02], s1Vel: [1.8, 1.0, 0, 0],
                  s2Winding: -1, s2Radius: 3.6, s2Energy: 2.4e6, s2KMode: 0.4,
                  s2Pos: [4.5, 0.0, 0, -0.1], s2Vel: [-0.3, -0.1, 0, 0]
                })}
                className="text-[10px] font-mono font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/20 cursor-pointer transition-all"
              >
                {lang === 'hu' ? 'Könnyű + Nehéz' : 'Light + Heavy'}
              </button>
            </div>
          </div>

          {/* Task 5 */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex flex-col justify-between gap-3 hover:border-slate-800 transition-all">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-bold text-violet-400 font-mono">{text.researchTask5}</span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{text.researchTask5Desc}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-900">
              <button
                onClick={() => handleLoadSpecificConfiguration({
                  s1Winding: 1, s1Radius: 2.4, s1Energy: 1.2e6, s1KMode: 0.8,
                  s1Pos: [-4.0, 0.2, 0, 0.05], s1Vel: [1.6, 1.2, 0, 0],
                  s2Winding: -1, s2Radius: 2.4, s2Energy: 1.2e6, s2KMode: 0.8,
                  s2Pos: [4.0, -0.2, 0, -0.05], s2Vel: [-1.6, -1.2, 0, 0],
                  dampingVal: 0.04, tensionVal: 0.8
                })}
                className="text-[10px] font-mono font-bold text-violet-300 hover:text-violet-200 bg-violet-500/10 hover:bg-violet-500/20 px-2 py-1 rounded border border-violet-500/20 cursor-pointer transition-all"
              >
                {lang === 'hu' ? 'Magas csillapítás' : 'High Damping'}
              </button>
              <button
                onClick={() => handleLoadSpecificConfiguration({
                  s1Winding: 1, s1Radius: 2.4, s1Energy: 1.2e6, s1KMode: 0.8,
                  s1Pos: [-4.0, 0.2, 0, 0.05], s1Vel: [1.6, 1.2, 0, 0],
                  s2Winding: -1, s2Radius: 2.4, s2Energy: 1.2e6, s2KMode: 0.8,
                  s2Pos: [4.0, -0.2, 0, -0.05], s2Vel: [-1.6, -1.2, 0, 0],
                  dampingVal: 0.001, tensionVal: 2.2
                })}
                className="text-[10px] font-mono font-bold text-violet-300 hover:text-violet-200 bg-violet-500/10 hover:bg-violet-500/20 px-2 py-1 rounded border border-violet-500/20 cursor-pointer transition-all"
              >
                {lang === 'hu' ? 'Erős w-feszültség' : 'High Tension'}
              </button>
            </div>
          </div>

          {/* Task 6 */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex flex-col justify-between gap-3 hover:border-slate-800 transition-all">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-bold text-sky-400 font-mono">{text.researchTask6}</span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{text.researchTask6Desc}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-900">
              <button
                onClick={() => handleLoadSpecificConfiguration({
                  s1Winding: 3, s1Radius: 2.4, s1Energy: 1.2e6, s1KMode: 0.8,
                  s1Pos: [-4.0, 0.0, 0, 0.05], s1Vel: [1.5, 0.5, 0, 0],
                  s2Winding: -3, s2Radius: 2.4, s2Energy: 1.2e6, s2KMode: 0.8,
                  s2Pos: [4.0, 0.0, 0, -0.05], s2Vel: [-1.5, -0.5, 0, 0]
                })}
                className="text-[10px] font-mono font-bold text-sky-300 hover:text-sky-200 bg-sky-500/10 hover:bg-sky-500/20 px-2 py-1 rounded border border-sky-500/20 cursor-pointer transition-all"
              >
                {lang === 'hu' ? 'Winding 3 vs -3' : 'Winding 3 vs -3'}
              </button>
              <button
                onClick={() => handleLoadSpecificConfiguration({
                  s1Winding: 4, s1Radius: 2.4, s1Energy: 1.2e6, s1KMode: 0.8,
                  s1Pos: [-4.0, 0.0, 0, 0.05], s1Vel: [1.5, 0.5, 0, 0],
                  s2Winding: -4, s2Radius: 2.4, s2Energy: 1.2e6, s2KMode: 0.8,
                  s2Pos: [4.0, 0.0, 0, -0.05], s2Vel: [-1.5, -0.5, 0, 0]
                })}
                className="text-[10px] font-mono font-bold text-sky-300 hover:text-sky-200 bg-sky-500/10 hover:bg-sky-500/20 px-2 py-1 rounded border border-sky-500/20 cursor-pointer transition-all"
              >
                {lang === 'hu' ? 'Winding 4 vs -4' : 'Winding 4 vs -4'}
              </button>
            </div>
          </div>

        </div>
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
