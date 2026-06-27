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
  Download,
  Upload,
  Activity,
  Compass,
  Cpu,
  HelpCircle,
  Info,
  Layers,
  Settings,
  Boxes,
  Maximize2
} from 'lucide-react';
import { GrowingR4Model, Coord4D } from '../model/toyModel';
import { EffectiveSoliton, SolitonObstacle } from '../model/EffectiveSoliton';
import { extractSolitonParameters, SolitonAnalysisParams } from '../analysis/solitonAnalyzer';

interface EffectiveSolitonLabProps {
  model: GrowingR4Model;
  lang: 'hu' | 'en' | 'de';
}

export const EffectiveSolitonLab: React.FC<EffectiveSolitonLabProps> = ({ model, lang }) => {
  // Simulator state
  const [solitons, setSolitons] = useState<EffectiveSoliton[]>([]);
  const [obstacles, setObstacles] = useState<SolitonObstacle[]>([]);
  const [selectedSolitonId, setSelectedSolitonId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  
  // Physics parameters
  const [simSpeed, setSimSpeed] = useState<number>(1.2);
  const [damping, setDamping] = useState<number>(0.005);
  const [tension, setTension] = useState<number>(0.4);
  const [gravityScale, setGravityScale] = useState<number>(1.2);
  const [activePreset, setActivePreset] = useState<string>('dual');

  // Analyzer / Parameter state
  const [analysisResult, setAnalysisResult] = useState<SolitonAnalysisParams | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [showJsonPanel, setShowJsonPanel] = useState<boolean>(false);

  // Canvas and interaction controls
  const [placeMode, setPlaceMode] = useState<'none' | 'soliton_pos' | 'soliton_neg' | 'well' | 'barrier'>('none');
  const xyCanvasRef = useRef<HTMLCanvasElement>(null);
  const zwCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Localization labels
  const text = useMemo(() => {
    const translations = {
      hu: {
        title: 'Effektív Szoliton Laboratórium',
        subtitle: 'Lokalizált ℝ⁴ hullámcsomagok, emergens vonzás és topológiai megmaradás',
        extractBtn: 'Paraméterek kinyerése a fő rácsból',
        extractDesc: 'Meghívja a solitonAnalyzer-t a futó 4D rács aktuális állapotára a szoliton belső profiljának és hullámmódusainak letapogatásához.',
        noAnalysis: 'Még nincs kinyert adat. Nyomd meg a fenti gombot az R⁴ rács analizálásához!',
        radialProfile: 'Radiális Potenciálprofil V(r)',
        fourierSpectrum: 'Frekvencia Spektrum (Belső rezgés)',
        applyParams: 'Átültetés a szimulációba',
        applyParamsDesc: 'A kinyert valós rácsparamétereket betölti az aktív szolitonba.',
        effectiveRadius: 'Effektív sugár (R_eff):',
        maxPotential: 'Középponti feszültség (V_max):',
        wavefrontGini: 'Wavefront fluktuáció (Gini):',
        stepMeasured: 'Mért lépésnél:',
        exportJson: 'JSON paraméterek másolása',
        importJson: 'Paraméterek Importálása / Betöltése',
        simSettings: 'Fizikai Konstansok',
        simSpeed: 'Szimulációs sebesség:',
        dampingLabel: 'Közegellenállás (Damping):',
        tensionLabel: 'Hipertér feszülés (Tension):',
        gravityScaleLabel: 'Emergens vonzási erő:',
        presetLabel: 'Kísérleti Presetek:',
        presetDual: 'Dual Szoliton Keringés',
        presetDualDesc: 'Két ellentétes topológiai töltésű szoliton egymás körüli stabil pályája.',
        presetScattering: 'Hullám-Részecske Elhajlás',
        presetScatteringDesc: 'Egy szoliton elhajlása akadályok és potenciálgödrök mellett.',
        presetChaos: 'Kaotikus Kozmikus Hullámzás',
        presetChaosDesc: 'Erős 4. dimenziós w-oszcilláció és Mach-féle tömegfluktuáció okozta kaotikus pálya.',
        presetLoaded: 'Kinyert Rács-Szoliton',
        presetLoadedDesc: 'A fő R⁴ rácsból mért adatok alapján felépített egyedi szoliton viselkedése.',
        canvasXYTitle: 'ℝ² Vetületi Sík (X-Y dimenziók)',
        canvasZWTitle: 'ℝ² Hipersík Oszcilláció (Z-W dimenziók)',
        canvasClickDesc: 'Kattints a bal oldali koordinátarendszerbe új objektum elhelyezéséhez.',
        placeSolitonPos: 'Szoliton elhelyezése (+ Winding)',
        placeSolitonNeg: 'Szoliton elhelyezése (- Winding)',
        placeWell: 'Vonzó potenciálgödör lehelyezése',
        placeBarrier: 'Taszító potenciálgát lehelyezése',
        placeClear: 'Interakció leállítása',
        clearBtn: 'Minden törlése',
        pulseBtn: 'Perturbációs lökés indítása',
        selectedSoliton: 'Kiválasztott Szoliton adatai',
        pos: 'Pozíció (X, Y, Z, w):',
        vel: 'Sebesség (Vx, Vy, Vz, Vw):',
        mass: 'Dinamikus tehetetlen tömeg (Mach):',
        charge: 'Topológiai winding szám:',
        limitsTitle: 'Fizikai Magyarázat és Korlátok',
        limitsText: 'A szolitonok (magános hullámok) nem pontszerű tömegek, hanem kiterjedt hullámcsomagok. Az egyenletben a vonzás nem távolsági erő, hanem az egymás potenciálterén való elmozdulás gradienséből fakad. A 4. dimenziós w-tengely menti kitérés feszültséget generál, és a Mach-elv alapján a szoliton belső fázis-oszcillációival együtt folyamatosan modulálja a szoliton effektív tömegét (tehetetlenségét).'
      },
      en: {
        title: 'Effective Soliton Laboratory',
        subtitle: 'Localized ℝ⁴ wave packets, emergent attraction and topological conservation',
        extractBtn: 'Extract Parameters from Main Grid',
        extractDesc: 'Invokes the solitonAnalyzer on the active 4D lattice state to scan the internal profile and wave modes of the soliton.',
        noAnalysis: 'No analysis data extracted yet. Click the button above to scan the running R⁴ lattice!',
        radialProfile: 'Radial Potential Profile V(r)',
        fourierSpectrum: 'Frequency Spectrum (Internal vibration)',
        applyParams: 'Transplant to Lab Simulation',
        applyParamsDesc: 'Loads the extracted real lattice parameters into the active laboratory soliton.',
        effectiveRadius: 'Effective Radius (R_eff):',
        maxPotential: 'Central potential (V_max):',
        wavefrontGini: 'Wavefront fluctuation (Gini):',
        stepMeasured: 'Measured at step:',
        exportJson: 'Copy JSON Parameters',
        importJson: 'Import / Load Parameters',
        simSettings: 'Physical Constants',
        simSpeed: 'Simulation speed:',
        dampingLabel: 'Viscosity (Damping):',
        tensionLabel: 'Hyperspace Tension:',
        gravityScaleLabel: 'Emergent Gravity Scale:',
        presetLabel: 'Experimental Presets:',
        presetDual: 'Dual Soliton Orbit',
        presetDualDesc: 'A stable orbital dance of two solitons with opposite topological winding charges.',
        presetScattering: 'Wave-Particle Scattering',
        presetScatteringDesc: 'A soliton scattering and deflecting around attractive wells and potential barriers.',
        presetChaos: 'Chaotic Cosmic Wave',
        presetChaosDesc: 'Chaotic trajectory induced by strong 4D w-oscillations and Machian mass fluctuations.',
        presetLoaded: 'Extracted Lattice Soliton',
        presetLoadedDesc: 'Custom soliton behavior constructed purely from parameters scanned in the main R⁴ grid.',
        canvasXYTitle: 'ℝ² Projected Plane (X-Y dimensions)',
        canvasZWTitle: 'ℝ² Hypersheet Oscillation (Z-W dimensions)',
        canvasClickDesc: 'Click on the left canvas to place objects into the space.',
        placeSolitonPos: 'Place Soliton (+ Winding)',
        placeSolitonNeg: 'Place Soliton (- Winding)',
        placeWell: 'Place Attractive Potential Well',
        placeBarrier: 'Place Repulsive Potential Barrier',
        placeClear: 'Cancel Interaction',
        clearBtn: 'Clear All',
        pulseBtn: 'Inject Perturbation Pulse',
        selectedSoliton: 'Selected Soliton Telemetry',
        pos: 'Position (X, Y, Z, w):',
        vel: 'Velocity (Vx, Vy, Vz, Vw):',
        mass: 'Dynamic inertial mass (Mach):',
        charge: 'Topological winding number:',
        limitsTitle: 'Physical Intuition & Limitations',
        limitsText: 'Solitons are extended wave packets rather than point masses. In this emergent model, attraction is not an artificial force but arises from solitons sliding down each other\'s overlapping potential slopes. Movement in the 4th dimension (w-axis) creates tension, which dynamically scales the inertial mass based on Mach\'s principle and internal phase-wave ripples.'
      },
      de: {
        title: 'Effektives Soliton-Laboratorium',
        subtitle: 'Lokalisierte ℝ⁴-Wellenpakete, emergente Anziehung und topologische Erhaltung',
        extractBtn: 'Parameter aus Hauptgitter extrahieren',
        extractDesc: 'Ruft den solitonAnalyzer für den aktiven 4D-Gitterzustand auf, um das interne Profil und die Wellenmoden des Solitons zu scannen.',
        noAnalysis: 'Noch keine Analysedaten extrahiert. Klicken Sie oben, um das laufende R⁴-Gitter zu analysieren!',
        radialProfile: 'Radiales Potenzialprofil V(r)',
        fourierSpectrum: 'Frequenzspektrum (Interne Schwingung)',
        applyParams: 'In Laborsimulation einsetzen',
        applyParamsDesc: 'Lädt die extrahierten realen Gitterparameter in das aktive Labor-Soliton.',
        effectiveRadius: 'Effektiver Radius (R_eff):',
        maxPotential: 'Zentrales Potenzial (V_max):',
        wavefrontGini: 'Wellenfront-Fluktuation (Gini):',
        stepMeasured: 'Gemessen bei Schritt:',
        exportJson: 'JSON-Parameter kopieren',
        importJson: 'Parameter importieren / laden',
        simSettings: 'Physikalische Konstanten',
        simSpeed: 'Simulationsgeschwindigkeit:',
        dampingLabel: 'Medium-Dämpfung (Viskosität):',
        tensionLabel: 'Hyperraum-Spannung:',
        gravityScaleLabel: 'Emergenter Gravitationsmaßstab:',
        presetLabel: 'Experimentelle Presets:',
        presetDual: 'Duales Soliton-Orbit',
        presetDualDesc: 'Ein stabiles Orbital-Tanzverhalten zweier Solitonen mit entgegengesetzten topologischen Ladungen.',
        presetScattering: 'Welle-Teilchen-Streuung',
        presetScatteringDesc: 'Streuung und Ablenkung eines Solitons an Potenzialbarrieren und -trichtern.',
        presetChaos: 'Chaotische kosmische Welle',
        presetChaosDesc: 'Chaotische Flugbahn, verursacht durch starke 4D-w-Oszillationen und Machsche Massenfluktuationen.',
        presetLoaded: 'Extrahiertes Gitter-Soliton',
        presetLoadedDesc: 'Spezifisches Soliton-Verhalten, das rein aus den im R⁴-Gitter gemessenen Parametern rekonstruiert wurde.',
        canvasXYTitle: 'ℝ² Projektionsebene (X-Y-Dimensionen)',
        canvasZWTitle: 'ℝ² Hyperflächen-Oszillation (Z-W-Dimensionen)',
        canvasClickDesc: 'Klicken Sie auf das linke Gitter, um Objekte im Raum zu platzieren.',
        placeSolitonPos: 'Soliton platzieren (+ Winding)',
        placeSolitonNeg: 'Soliton platzieren (- Winding)',
        placeWell: 'Anziehenden Potenzialtrichter platzieren',
        placeBarrier: 'Abstoßende Potenzialbarriere platzieren',
        placeClear: 'Interaktion abbrechen',
        clearBtn: 'Alles löschen',
        pulseBtn: 'Störungsimpuls injizieren',
        selectedSoliton: 'Ausgewählte Solitonen-Telemetrie',
        pos: 'Position (X, Y, Z, w):',
        vel: 'Geschwindigkeit (Vx, Vy, Vz, Vw):',
        mass: 'Dynamische träge Masse (Mach):',
        charge: 'Topologische Winding-Zahl:',
        limitsTitle: 'Physikalische Erklärung & Grenzen',
        limitsText: 'Solitonen sind ausgedehnte Wellenpakete statt Punktmassen. In diesem emergenten Modell ist die Anziehung keine Fernwirkungskraft, sondern resultiert daraus, dass Solitonen die Potenzialhänge des anderen hinabgleiten. Die Auslenkung in der 4. Dimension (w-Achse) erzeugt eine kosmische Spannung, die die träge Masse basierend auf dem Machschen Prinzip und internen Wellenmodulationen skaliert.'
      }
    };
    return translations[lang] || translations.en;
  }, [lang]);

  // Initializing active presets
  const applyPreset = (presetId: string, params?: SolitonAnalysisParams) => {
    setActivePreset(presetId);
    setSelectedSolitonId(null);
    setObstacles([]);

    const defProfile = [1.0, 0.85, 0.6, 0.4, 0.22, 0.1, 0.04, 0.01];
    const defFourier = [0.12, 0.06, 0.03, 0.01];

    if (presetId === 'dual') {
      const s1 = new EffectiveSoliton('soliton-1', [-3.0, 0, 0, 0.05], [0, 1.8, 0, 0.2], 2.4, 1e6, defProfile, defFourier, 1);
      const s2 = new EffectiveSoliton('soliton-2', [3.0, 0, 0, -0.05], [0, -1.8, 0, -0.2], 2.4, 1e6, defProfile, defFourier, -1);
      setSolitons([s1, s2]);
      setSelectedSolitonId('soliton-1');
      setDamping(0.002);
      setTension(0.3);
      setGravityScale(1.1);
    } else if (presetId === 'scattering') {
      const s1 = new EffectiveSoliton('soliton-scatter', [-7.0, -1.0, 0, 0], [4.5, 0.5, 0, 0], 2.0, 8e5, defProfile, defFourier, 1);
      
      const obs1: SolitonObstacle = {
        id: 'barrier-1',
        position: [0.0, 1.5, 0, 0],
        potential: 1.5e6, // Barrier (Repulsive)
        radius: 1.8,
        type: 'barrier'
      };
      const obs2: SolitonObstacle = {
        id: 'well-1',
        position: [1.0, -2.5, 0, 0],
        potential: -1.2e6, // Well (Attractive)
        radius: 2.2,
        type: 'well'
      };

      setSolitons([s1]);
      setObstacles([obs1, obs2]);
      setSelectedSolitonId('soliton-scatter');
      setDamping(0.0);
      setTension(0.1);
      setGravityScale(1.0);
    } else if (presetId === 'chaos') {
      const s1 = new EffectiveSoliton('soliton-chaos', [-2.0, 1.0, 0, 0.8], [1.0, -1.5, 0, 2.5], 2.2, 1.2e6, defProfile, defFourier, 1);
      setSolitons([s1]);
      setSelectedSolitonId('soliton-chaos');
      setDamping(0.001);
      setTension(1.5); // High tension triggers crazy w oscillations!
      setGravityScale(1.0);
    } else if (presetId === 'loaded' && params) {
      const profile = params.radialProfile.length > 0 ? params.radialProfile : defProfile;
      const fourier = params.fourierAmplitudes.length > 0 ? params.fourierAmplitudes : defFourier;
      const radius = params.effectiveRadius > 0.5 ? params.effectiveRadius : 2.5;
      const maxPot = params.maxPotential > 0 ? params.maxPotential : 1e6;

      const s1 = new EffectiveSoliton(
        'soliton-loaded',
        [-2.0, 0.0, 0, 0.1],
        [0.5, 2.0, 0, 0.1],
        radius,
        maxPot,
        profile,
        fourier,
        params.wavefrontGini > 0.5 ? -1 : 1
      );
      setSolitons([s1]);
      setSelectedSolitonId('soliton-loaded');
      setDamping(0.004);
      setTension(0.4);
      setGravityScale(1.2);
    }
  };

  // Run on mount
  useEffect(() => {
    applyPreset('dual');
  }, []);

  // Extraction trigger
  const handleExtract = () => {
    const params = extractSolitonParameters(model);
    if (params) {
      setAnalysisResult(params);
      setJsonInput(JSON.stringify(params, null, 2));
      
      // Auto blink the visual copy
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Transplant parameters
  const handleTransplant = () => {
    if (analysisResult) {
      applyPreset('loaded', analysisResult);
    }
  };

  // Import custom JSON
  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonInput) as SolitonAnalysisParams;
      if (parsed && typeof parsed.effectiveRadius === 'number' && typeof parsed.maxPotential === 'number') {
        setAnalysisResult(parsed);
        applyPreset('loaded', parsed);
        setShowJsonPanel(false);
      } else {
        alert(lang === 'hu' ? 'Hibás JSON struktúra!' : 'Invalid JSON structure!');
      }
    } catch (e) {
      alert(lang === 'hu' ? 'Nem sikerült beolvasni a JSON-t. Kérlek ellenőrizd a szintaxist!' : 'Failed to parse JSON. Please check syntax!');
    }
  };

  // Push perturbation
  const handlePulse = () => {
    if (selectedSolitonId) {
      setSolitons(prev => prev.map(s => {
        if (s.id === selectedSolitonId) {
          const cloned = s.clone();
          // Apply a randomized impulse in 4D
          const impulse: Coord4D = [
            (Math.random() - 0.5) * 3.5,
            (Math.random() - 0.5) * 3.5,
            0,
            (Math.random() - 0.5) * 2.0
          ];
          cloned.applyPulse(impulse);
          return cloned;
        }
        return s;
      }));
    }
  };

  // Click on XY canvas to place objects
  const handleXYCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (placeMode === 'none') return;
    const canvas = xyCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel coordinates back to simulation units (-10 to 10 range)
    const simX = ((clickX / canvas.width) * 20) - 10;
    const simY = (10 - (clickY / canvas.height) * 20); // inverted Y axis for math correctness

    if (placeMode === 'soliton_pos' || placeMode === 'soliton_neg') {
      const charge = placeMode === 'soliton_pos' ? 1 : -1;
      const newId = `soliton-${Date.now()}`;
      const newSoliton = new EffectiveSoliton(
        newId,
        [simX, simY, 0, 0.02],
        [(Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 0, 0.05],
        2.2,
        1e6,
        analysisResult?.radialProfile || [1.0, 0.8, 0.5, 0.2, 0.05],
        analysisResult?.fourierAmplitudes || [0.1, 0.04],
        charge
      );

      setSolitons(prev => [...prev, newSoliton]);
      setSelectedSolitonId(newId);
    } else if (placeMode === 'well' || placeMode === 'barrier') {
      const pot = placeMode === 'barrier' ? 1.5e6 : -1.2e6;
      const newObstacle: SolitonObstacle = {
        id: `obs-${Date.now()}`,
        position: [simX, simY, 0, 0],
        potential: pot,
        radius: placeMode === 'barrier' ? 1.5 : 2.0,
        type: placeMode === 'barrier' ? 'barrier' : 'well'
      };
      setObstacles(prev => [...prev, newObstacle]);
    }

    setPlaceMode('none');
  };

  // Main Loop logic using requestAnimationFrame for smooth 60fps renders
  useEffect(() => {
    const updatePhysics = (timestamp: number) => {
      if (!lastUpdateTimeRef.current) lastUpdateTimeRef.current = timestamp;
      const elapsed = (timestamp - lastUpdateTimeRef.current) / 1000;
      lastUpdateTimeRef.current = timestamp;

      if (isRunning && elapsed > 0) {
        // Limit dt to avoid massive leaps on frame drop
        const dt = Math.min(0.03, elapsed) * simSpeed;

        setSolitons(prev => {
          return prev.map(s => {
            const cloned = s.clone();
            cloned.step(obstacles, prev, dt, tension, damping, gravityScale);
            return cloned;
          });
        });
      }

      // Draw frames
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

  // Drawing the XY projected plane
  const drawXYCanvas = () => {
    const canvas = xyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and background
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // Grid coordinates helper: map [-10, 10] to [0, w]
    const mapX = (x: number) => ((x + 10) / 20) * w;
    const mapY = (y: number) => ((10 - y) / 20) * h;
    const mapRadius = (r: number) => (r / 20) * w;

    // Draw coordinate grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let i = -10; i <= 10; i += 2) {
      if (i === 0) continue;
      // vertical
      ctx.beginPath();
      ctx.moveTo(mapX(i), 0);
      ctx.lineTo(mapX(i), h);
      ctx.stroke();

      // horizontal
      ctx.beginPath();
      ctx.moveTo(0, mapY(i));
      ctx.lineTo(w, mapY(i));
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(mapX(0), 0); ctx.lineTo(mapX(0), h);
    ctx.moveTo(0, mapY(0)); ctx.lineTo(w, mapY(0));
    ctx.stroke();

    // Draw Obstacles
    obstacles.forEach(obs => {
      const x = mapX(obs.position[0]);
      const y = mapY(obs.position[1]);
      const r = mapRadius(obs.radius);

      // Gradient representing the potential field well or barrier
      const radGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
      if (obs.type === 'barrier') {
        radGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        radGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.15)');
        radGrad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      } else {
        radGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        radGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
        radGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      }

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fill();

      // Border ring
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(x, y, r * 0.8, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = obs.type === 'barrier' ? '#f87171' : '#38bdf8';
      ctx.font = '8px monospace';
      ctx.fillText(obs.type === 'barrier' ? 'BARRIER' : 'WELL', x - 18, y + 3);
    });

    // Draw Solitons
    solitons.forEach(sol => {
      const x = mapX(sol.position[0]);
      const y = mapY(sol.position[1]);
      const r = mapRadius(sol.radius);
      const isSelected = sol.id === selectedSolitonId;

      // Draw trajectory history (Tail)
      if (sol.history.length > 1) {
        ctx.lineWidth = isSelected ? 2.0 : 1.2;
        ctx.beginPath();
        ctx.moveTo(mapX(sol.history[0][0]), mapY(sol.history[0][1]));
        for (let i = 1; i < sol.history.length; i++) {
          const hX = mapX(sol.history[i][0]);
          const hY = mapY(sol.history[i][1]);
          ctx.lineTo(hX, hY);
        }
        
        // Dynamic glowing tail gradient
        const tailGrad = ctx.createLinearGradient(
          mapX(sol.history[0][0]), mapY(sol.history[0][1]),
          x, y
        );
        const col = sol.topologicalCharge > 0 ? 'rgba(244, 63, 94, ' : 'rgba(16, 185, 129, ';
        tailGrad.addColorStop(0, col + '0.01)');
        tailGrad.addColorStop(0.5, col + '0.15)');
        tailGrad.addColorStop(1, col + '0.65)');
        
        ctx.strokeStyle = tailGrad;
        ctx.stroke();
      }

      // Draw soliton envelope (Glowing Radial Profile)
      const solGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 1.5);
      const colorHex = sol.topologicalCharge > 0 ? '244, 63, 94' : '16, 185, 129'; // Rose vs Emerald

      solGrad.addColorStop(0, `rgba(${colorHex}, 0.7)`);
      solGrad.addColorStop(0.3, `rgba(${colorHex}, 0.3)`);
      solGrad.addColorStop(0.7, `rgba(${colorHex}, 0.08)`);
      solGrad.addColorStop(1, `rgba(${colorHex}, 0.0)`);

      ctx.fillStyle = solGrad;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.5, 0, 2 * Math.PI);
      ctx.fill();

      // Sharp central core
      ctx.fillStyle = sol.topologicalCharge > 0 ? '#f43f5e' : '#10b981';
      ctx.beginPath();
      ctx.arc(x, y, Math.max(2, r * 0.12), 0, 2 * Math.PI);
      ctx.fill();

      // Selection indicator circle
      if (isSelected) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.0;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(x, y, r * 1.8, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Compass crosshairs
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x - r * 2.5, y); ctx.lineTo(x + r * 2.5, y);
        ctx.moveTo(x, y - r * 2.5); ctx.lineTo(x, y + r * 2.5);
        ctx.stroke();
      }

      // Topological winding symbol (+ / -) in center
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sol.topologicalCharge > 0 ? 'W+' : 'W-', x, y - r * 0.6);
    });
  };

  // Drawing the Z-W hypersheet canvas
  const drawZWCanvas = () => {
    const canvas = zwCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // Coordinates mapping: Z range [-10, 10] -> X-pixel, W range [-2, 2] -> Y-pixel
    const mapZ = (z: number) => ((z + 10) / 20) * w;
    const mapW = (wv: number) => ((2 - wv) / 4) * h;

    // Draw central flat membrane (w = 0)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, mapW(0));
    ctx.lineTo(w, mapW(0));
    ctx.stroke();

    // Horizontal helper dotted lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(0, mapW(1)); ctx.lineTo(w, mapW(1));
    ctx.moveTo(0, mapW(-1)); ctx.lineTo(w, mapW(-1));
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Solitons in Z-W slice
    solitons.forEach(sol => {
      const zVal = sol.position[2]; // Z coord (usually close to 0 or fluctuating)
      const wVal = sol.position[3]; // W coord (hyperspace fluctuation!)

      const x = mapZ(sol.position[0]); // projection: using X position as lateral coordinate for clarity
      const y = mapW(wVal);
      const isSelected = sol.id === selectedSolitonId;

      // Glowing vertical connector to membrane (Gravity attraction source)
      ctx.strokeStyle = sol.topologicalCharge > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(x, mapW(0));
      ctx.lineTo(x, y);
      ctx.stroke();

      // Trajectory in Z-W
      if (sol.history.length > 1) {
        ctx.beginPath();
        ctx.moveTo(mapZ(sol.history[0][0]), mapW(sol.history[0][3]));
        for (let i = 1; i < sol.history.length; i++) {
          ctx.lineTo(mapZ(sol.history[i][0]), mapW(sol.history[i][3]));
        }
        ctx.strokeStyle = sol.topologicalCharge > 0 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)';
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }

      // Soliton sphere representing its 4D mass and thickness
      const rPx = Math.max(4, (sol.radius / 20) * w);
      
      const zwGrad = ctx.createRadialGradient(x, y, 0, x, y, rPx * 1.5);
      const col = sol.topologicalCharge > 0 ? '244, 63, 94' : '16, 185, 129';
      zwGrad.addColorStop(0, `rgba(${col}, 0.85)`);
      zwGrad.addColorStop(0.4, `rgba(${col}, 0.3)`);
      zwGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = zwGrad;
      ctx.beginPath();
      ctx.arc(x, y, rPx * 1.5, 0, 2 * Math.PI);
      ctx.fill();

      // Selected glow
      if (isSelected) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x, y, rPx * 1.8, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  };

  const selectedSoliton = solitons.find(s => s.id === selectedSolitonId);

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
                  SOLITON WAVEFRONT
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {text.subtitle}
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleExtract}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                isCopied 
                  ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400' 
                  : 'bg-sky-600 hover:bg-sky-500 text-slate-950 border-sky-500'
              }`}
            >
              <Cpu className="h-4 w-4" />
              {text.extractBtn}
            </button>
            <button
              onClick={() => setShowJsonPanel(!showJsonPanel)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 cursor-pointer"
              title="JSON Parameters Console"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* JSON Import/Export Console */}
        {showJsonPanel && (
          <div className="mt-4 border-t border-slate-800 pt-4 flex flex-col gap-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{text.importJson}</span>
              <button
                onClick={handleImportJson}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition-all"
              >
                Load JSON
              </button>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='Paste Soliton parameters JSON here...'
              className="w-full h-32 bg-slate-950 text-sky-400 text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        )}

        {/* Dynamic Scan Result Display */}
        {analysisResult ? (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 border-t border-slate-800/60 pt-4 animate-fade-in">
            {/* Measured Numeric telemetry */}
            <div className="lg:col-span-4 flex flex-col justify-center gap-2 text-xs font-mono bg-slate-950/40 p-3.5 rounded-xl border border-slate-900">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{text.stepMeasured} <span className="text-slate-400 font-bold">#{analysisResult.stepCount}</span></div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">{text.effectiveRadius}</span>
                <span className="text-sky-400 font-bold text-sm">{analysisResult.effectiveRadius.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-900/50">
                <span className="text-slate-400">{text.maxPotential}</span>
                <span className="text-amber-400 font-bold">{analysisResult.maxPotential.toLocaleString(lang === 'hu' ? 'hu-HU' : 'en-US')}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-900/50">
                <span className="text-slate-400">{text.wavefrontGini}</span>
                <span className="text-rose-400 font-bold">{(analysisResult.wavefrontGini * 100).toFixed(2)}%</span>
              </div>
              <button
                onClick={handleTransplant}
                className="mt-3 w-full py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white border border-indigo-500/25 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="h-3.5 w-3.5" />
                {text.applyParams}
              </button>
            </div>

            {/* Radial profile vector graph */}
            <div className="lg:col-span-4 bg-slate-950/40 p-3.5 rounded-xl border border-slate-900">
              <span className="text-[10px] text-slate-400 font-bold font-mono block uppercase mb-3 flex items-center gap-1.5 text-sky-400">
                <Layers className="h-3.5 w-3.5" /> {text.radialProfile}
              </span>
              <div className="h-24 flex items-end gap-1.5 pb-1">
                {analysisResult.radialProfile.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 bg-slate-950 border border-slate-800 text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-mono text-amber-400">
                      {(v * 100).toFixed(1)}%
                    </div>
                    <div 
                      className="w-full rounded-t bg-sky-500/20 group-hover:bg-sky-400/30 border-t border-sky-400/40 transition-all"
                      style={{ height: `${v * 100}%` }}
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
                {analysisResult.fourierAmplitudes.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 bg-slate-950 border border-slate-800 text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-mono text-pink-400">
                      {v.toFixed(5)}
                    </div>
                    <div 
                      className="w-full rounded-t bg-pink-500/20 group-hover:bg-pink-400/30 border-t border-pink-400/40 transition-all"
                      style={{ height: `${Math.min(100, v * 350)}%` }} // Scaled for visibility
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

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Rendering Stage (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Canvas 1: XY Projection */}
            <div className="flex flex-col bg-slate-950/80 border border-slate-900 rounded-2xl p-4 overflow-hidden relative group">
              <div className="absolute top-4 right-4 text-[9px] font-mono text-slate-500 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                XY MEMBRANE
              </div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-sky-400" /> {text.canvasXYTitle}
              </h3>
              
              <canvas
                ref={xyCanvasRef}
                width={500}
                height={380}
                onClick={handleXYCanvasClick}
                className={`w-full aspect-[5/3.8] rounded-xl border border-slate-900 bg-[#020409] shadow-inner transition-all ${
                  placeMode !== 'none' ? 'cursor-crosshair border-amber-500/40' : 'cursor-pointer'
                }`}
              />
              <span className="text-[10px] text-slate-500 mt-2 font-mono">{text.canvasClickDesc}</span>
            </div>

            {/* Canvas 2: ZW Projection (4D extra dimensions) */}
            <div className="flex flex-col bg-slate-950/80 border border-slate-900 rounded-2xl p-4 overflow-hidden relative group">
              <div className="absolute top-4 right-4 text-[9px] font-mono text-slate-500 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                ZW HYPERSPACE
              </div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-400" /> {text.canvasZWTitle}
              </h3>
              
              <canvas
                ref={zwCanvasRef}
                width={500}
                height={380}
                className="w-full aspect-[5/3.8] rounded-xl border border-slate-900 bg-[#020409] shadow-inner"
              />
              <span className="text-[10px] text-slate-500 mt-2 font-mono">X0 vs X3 (lateral coordinate mapped to hyperspace elevation)</span>
            </div>
          </div>

          {/* Placement Toolbar */}
          <div className="flex flex-wrap gap-2 p-3 bg-slate-900/20 border border-slate-850/80 rounded-2xl">
            <button
              onClick={() => setPlaceMode(placeMode === 'soliton_pos' ? 'none' : 'soliton_pos')}
              className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                placeMode === 'soliton_pos' 
                  ? 'bg-rose-500/20 border-rose-400/50 text-rose-300 shadow-md shadow-rose-500/5' 
                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Plus className="h-3.5 w-3.5 text-rose-500" /> {text.placeSolitonPos}
            </button>
            <button
              onClick={() => setPlaceMode(placeMode === 'soliton_neg' ? 'none' : 'soliton_neg')}
              className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                placeMode === 'soliton_neg' 
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-md shadow-emerald-500/5' 
                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Plus className="h-3.5 w-3.5 text-emerald-500" /> {text.placeSolitonNeg}
            </button>
            <button
              onClick={() => setPlaceMode(placeMode === 'well' ? 'none' : 'well')}
              className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                placeMode === 'well' 
                  ? 'bg-sky-500/20 border-sky-400/50 text-sky-300 shadow-md shadow-sky-500/5' 
                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Plus className="h-3.5 w-3.5 text-sky-500" /> {text.placeWell}
            </button>
            <button
              onClick={() => setPlaceMode(placeMode === 'barrier' ? 'none' : 'barrier')}
              className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                placeMode === 'barrier' 
                  ? 'bg-red-500/20 border-red-400/50 text-red-300 shadow-md shadow-red-500/5' 
                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Plus className="h-3.5 w-3.5 text-red-500" /> {text.placeBarrier}
            </button>
            
            {placeMode !== 'none' && (
              <button
                onClick={() => setPlaceMode('none')}
                className="px-3 py-2 rounded-xl bg-slate-950 text-amber-500 hover:text-amber-400 border border-amber-500/20 text-[11px] font-mono cursor-pointer ml-auto"
              >
                {text.placeClear}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Physics Controller & Presets (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Main Controls Card */}
          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/20 p-5 backdrop-blur-md">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between font-mono">
              <span className="flex items-center gap-2">
                <Settings className="h-3.5 w-3.5 text-sky-500" />
                {text.simSettings}
              </span>
            </h2>

            <div className="flex flex-col gap-4 text-xs font-mono">
              {/* Simulator state play button */}
              <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800/50">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isRunning 
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {isRunning ? 'PAUSE' : 'RUN'}
                </button>
                <button
                  onClick={() => applyPreset(activePreset, analysisResult || undefined)}
                  className="py-2 px-3 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-850 transition-all border border-slate-800 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  RESET
                </button>
              </div>

              {/* Damping Rate Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>{text.dampingLabel}</span>
                  <span className="text-sky-400 font-bold">{(damping * 100).toFixed(2)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.05"
                  step="0.001"
                  value={damping}
                  onChange={(e) => setDamping(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Hyperspace Tension Slider */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-900/40">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>{text.tensionLabel}</span>
                  <span className="text-indigo-400 font-bold">{tension.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.05"
                  value={tension}
                  onChange={(e) => setTension(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Emergent Gravity Force scale */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-900/40">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>{text.gravityScaleLabel}</span>
                  <span className="text-pink-400 font-bold">{gravityScale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="3.0"
                  step="0.1"
                  value={gravityScale}
                  onChange={(e) => setGravityScale(parseFloat(e.target.value))}
                  className="w-full accent-pink-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Speed Slider */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-900/40">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>{text.simSpeed}</span>
                  <span className="text-amber-400 font-bold">{simSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="4.0"
                  step="0.1"
                  value={simSpeed}
                  onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* Presets Selector Card */}
          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/20 p-5 backdrop-blur-md flex flex-col gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2 font-mono">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              {text.presetLabel}
            </h2>

            <div className="flex flex-col gap-2 text-xs">
              {[
                { id: 'dual', label: text.presetDual, desc: text.presetDualDesc },
                { id: 'scattering', label: text.presetScattering, desc: text.presetScatteringDesc },
                { id: 'chaos', label: text.presetChaos, desc: text.presetChaosDesc },
                { id: 'loaded', label: text.presetLoaded, desc: text.presetLoadedDesc, disabled: !analysisResult },
              ].map((preset) => (
                <button
                  key={preset.id}
                  disabled={preset.disabled}
                  onClick={() => applyPreset(preset.id, analysisResult || undefined)}
                  className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                    preset.disabled ? 'opacity-30 cursor-not-allowed border-transparent bg-slate-950/20 text-slate-600' : 'cursor-pointer'
                  } ${
                    activePreset === preset.id
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400'
                      : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-750'
                  }`}
                >
                  <span className="font-semibold block">{preset.label}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 leading-snug">{preset.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Active Soliton Telemetry Panel */}
          {selectedSoliton && (
            <section className="rounded-2xl border border-slate-800/80 bg-[#070b14] p-5 backdrop-blur-md flex flex-col gap-3 font-mono">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-xs font-bold uppercase text-slate-300 flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-amber-500" />
                  {text.selectedSoliton}
                </span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wide">ID: {selectedSoliton.id.slice(0, 10)}</span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs">
                {/* Position */}
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">{text.pos}</span>
                  <span className="text-slate-300">
                    X: <span className="text-sky-400 font-bold">{selectedSoliton.position[0].toFixed(3)}</span>, 
                    Y: <span className="text-sky-400 font-bold">{selectedSoliton.position[1].toFixed(3)}</span>, 
                    Z: <span className="text-slate-500">{selectedSoliton.position[2].toFixed(3)}</span>, 
                    w: <span className="text-indigo-400 font-bold">{selectedSoliton.position[3].toFixed(3)}</span>
                  </span>
                </div>

                {/* Velocity */}
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">{text.vel}</span>
                  <span className="text-slate-300">
                    Vx: <span className="text-sky-400 font-bold">{selectedSoliton.velocity[0].toFixed(3)}</span>, 
                    Vy: <span className="text-sky-400 font-bold">{selectedSoliton.velocity[1].toFixed(3)}</span>, 
                    Vw: <span className="text-indigo-400 font-bold">{selectedSoliton.velocity[3].toFixed(3)}</span>
                  </span>
                </div>

                {/* Mass / Mach */}
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">{text.mass}</span>
                  <span className="text-rose-400 font-bold text-sm">
                    {selectedSoliton.mass.toFixed(4)} <span className="text-[10px] text-slate-500">eV (norm)</span>
                  </span>
                </div>

                {/* Charge */}
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">{text.charge}</span>
                  <span className="text-amber-400 font-bold">
                    {selectedSoliton.topologicalCharge > 0 ? '+1 (Clockwise Phase)' : '-1 (Counter-Clockwise Phase)'}
                  </span>
                </div>

                {/* Impulse perturbation trigger */}
                <button
                  onClick={handlePulse}
                  className="mt-2 w-full py-2 bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="h-3.5 w-3.5" />
                  {text.pulseBtn}
                </button>
              </div>
            </section>
          )}

          {/* Clean Slate Button */}
          <button
            onClick={() => { setSolitons([]); setObstacles([]); setSelectedSolitonId(null); }}
            className="w-full py-2 bg-slate-950 hover:bg-red-950/20 text-slate-500 hover:text-red-400 border border-slate-900 hover:border-red-950/40 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {text.clearBtn}
          </button>
        </div>
      </div>

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
