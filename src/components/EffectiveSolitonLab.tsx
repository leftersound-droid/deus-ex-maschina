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
  AlertTriangle
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
        recordedTitle: 'Jegyzőkönyvi Bejegyzések',
        noRecords: 'Még nincs rögzített mérés. Kattintson a fenti gombra az aktuális fizikai állapot rögzítéséhez!',
        clearRecords: 'Mérések törlése',
        exportReport: 'Jegyzőkönyv másolása (JSON)',
        customNotes: 'Kutatói észrevételek:',
        addNotesPlaceholder: 'Írja ide a kísérleti megfigyeléseit...',
        scientificAnalysis: 'Automatizált Elméleti Fizikai Elemzés',
        interpretation: 'Interpretáció és Fizikai Következtetések',
        referenceData: 'Jegyzőkönyvi adatok'
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
        recordedTitle: 'Protocol Logs',
        noRecords: 'No recorded measurements yet. Click the button above to log the active physical state!',
        clearRecords: 'Clear Logs',
        exportReport: 'Copy Protocol (JSON)',
        customNotes: 'Observer Notes:',
        addNotesPlaceholder: 'Write your experimental observations here...',
        scientificAnalysis: 'Automated Theoretical Physics Analysis',
        interpretation: 'Interpretation & Physical Conclusions',
        referenceData: 'Protocol Data'
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
        recordedTitle: 'Protokolleinträge',
        noRecords: 'Noch keine Messungen aufgezeichnet. Klicken Sie auf die Schaltfläche oben, um den Zustand zu speichern!',
        clearRecords: 'Einträge löschen',
        exportReport: 'Protokoll kopieren (JSON)',
        customNotes: 'Beobachtungen des Forschers:',
        addNotesPlaceholder: 'Schreiben Sie hier Ihre experimentellen Beobachtungen...',
        scientificAnalysis: 'Automatisierte theoretisch-physikalische Analyse',
        interpretation: 'Interpretation & physikalische Schlussfolgerungen',
        referenceData: 'Protokolldaten'
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
