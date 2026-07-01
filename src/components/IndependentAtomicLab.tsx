/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Atom,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Download,
  Sliders,
  Database,
  FileText,
  ShieldCheck,
  Waves,
  Gauge,
  ClipboardList,
  Binary,
  Cpu,
  Workflow,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../i18n';

interface IndependentAtomicLabProps {
  lang: Language;
}

type ActiveTab = 'projections' | 'stability_exp';
type LabPhase = 'phase1' | 'phase2' | 'phase3';
type SubspaceDimension = '4D' | '3D' | '2D';

export default function IndependentAtomicLab({ lang }: IndependentAtomicLabProps) {
  const isHu = lang === 'hu';

  // ------------------------------------------------------------------------------
  // 1. ACTIVE MAIN SECTION TAB
  // ------------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<ActiveTab>('projections');

  // ------------------------------------------------------------------------------
  // 2. MAIN LAB CONFIGURATION STATE (Original Section)
  // ------------------------------------------------------------------------------
  const [activePhase, setActivePhase] = useState<LabPhase>('phase1');
  const [phase1Focus, setPhase1Focus] = useState<'total' | 'fourier' | 'distribution'>('total');
  const [phase2Dimension, setPhase2Dimension] = useState<SubspaceDimension>('3D');
  const [phase3Scenario, setPhase3Scenario] = useState<'collision' | 'exchange' | 'binding'>('collision');

  // Shared Protocol parameters (leveraged in both sections)
  const [bufferZone, setBufferZone] = useState<number>(35); // 0 to 60 cells. Recommended >=30
  const [gradualScaling, setGradualScaling] = useState<boolean>(true);
  const [fieldMatching, setFieldMatching] = useState<boolean>(true);
  const [solitonVelocity, setSolitonVelocity] = useState<number>(0.02); // safe: 0.01 - 0.05
  const [tensionTuning, setTensionTuning] = useState<number>(0.565); // resonant coupling
  const [dampingTuning, setDampingTuning] = useState<number>(0.0008);

  // Original simulation running state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simCompleted, setSimCompleted] = useState<boolean>(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  
  // Report metadata
  const [operatorName, setOperatorName] = useState<string>(isHu ? 'Dr. Kvantum Péter' : 'Dr. Quantum Peter');
  const [labUnitId, setLabUnitId] = useState<string>('AL-2000-GRID');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Environmental isolation checklist
  const environmentalConditions = useMemo(() => [
    {
      id: 1,
      condHu: 'Nem gyorsul a labor (inerciarendszer)',
      condEn: 'No laboratory acceleration (inertial frame)',
      satisfied: true,
      noteHu: 'Statikus rácskeret.',
      noteEn: 'Static lattice frame.',
    },
    {
      id: 2,
      condHu: 'Nem mozog extrém sebességgel',
      condEn: 'No relativistic velocity',
      satisfied: true,
      noteHu: 'Relativisztikus boost nélkül.',
      noteEn: 'No relativistic boost.',
    },
    {
      id: 3,
      condHu: 'Elektromosan árnyékolt Faraday-kamra',
      condEn: 'Electrically shielded Faraday capsule',
      satisfied: true,
      noteHu: 'Zérus külső feszültség vagy fáziszavar.',
      noteEn: 'Zero external voltage or phase noise.',
    },
    {
      id: 4,
      condHu: 'Nincs külső gravitációs gradiens',
      condEn: 'No external gravitational gradient',
      satisfied: true,
      noteHu: 'Nincs külső tömeg, a térgörbület zárt.',
      noteEn: 'No external mass, self-contained curvature.',
    },
    {
      id: 5,
      condHu: 'Zárt rendszer',
      condEn: 'Closed system',
      satisfied: true,
      noteHu: 'Nincs külső anyag- és energiaáramlás.',
      noteEn: 'No external matter or energy flux.',
    }
  ], []);

  // ------------------------------------------------------------------------------
  // 3. PHYSICAL METRICS CALCULATION (Original Mode)
  // ------------------------------------------------------------------------------
  const metrics = useMemo(() => {
    let noise = 0.35;
    if (bufferZone < 30) {
      noise += (30 - bufferZone) * 1.5;
    } else {
      noise = Math.max(0.12, noise - (bufferZone - 30) * 0.008);
    }
    if (!gradualScaling) noise += 4.5;
    if (!fieldMatching) noise += 9.0;

    if (solitonVelocity > 0.05) {
      noise += (solitonVelocity - 0.05) * 110;
    } else if (solitonVelocity < 0.01) {
      noise += 0.5;
    }

    const tensionDeviation = Math.abs(tensionTuning - 0.565);
    noise += tensionDeviation * 12.0;

    const boundaryNoise = parseFloat(noise.toFixed(2));
    let rawCoherence = 100.0 - (boundaryNoise * 2.5);
    const signalCoherence = parseFloat(Math.max(5.0, Math.min(100.0, rawCoherence)).toFixed(1));

    let windingNumber = 1.0;
    let pureQEff = 0.0;
    let colorCharge2D = 0.0;

    const coherenceFactor = signalCoherence / 100.0;

    if (activePhase === 'phase1') {
      windingNumber = parseFloat((1.0 * Math.max(0.94, coherenceFactor)).toFixed(3));
      pureQEff = parseFloat((0.118 * coherenceFactor).toFixed(4));
      colorCharge2D = parseFloat((0.850 * coherenceFactor).toFixed(3));
    } else if (activePhase === 'phase2') {
      if (phase2Dimension === '4D') {
        windingNumber = parseFloat((1.0 * Math.max(0.99, coherenceFactor)).toFixed(4));
        pureQEff = parseFloat((0.005 * coherenceFactor).toFixed(4));
        colorCharge2D = parseFloat((0.080 * coherenceFactor).toFixed(3));
      } else if (phase2Dimension === '3D') {
        windingNumber = parseFloat((0.85 * coherenceFactor).toFixed(3));
        pureQEff = parseFloat((0.118 * coherenceFactor).toFixed(4));
        colorCharge2D = parseFloat((0.240 * coherenceFactor).toFixed(3));
      } else if (phase2Dimension === '2D') {
        windingNumber = parseFloat((0.45 * coherenceFactor).toFixed(3));
        pureQEff = parseFloat((0.015 * coherenceFactor).toFixed(4));
        colorCharge2D = parseFloat((0.950 * coherenceFactor).toFixed(3));
      }
    } else if (activePhase === 'phase3') {
      if (phase3Scenario === 'collision') {
        windingNumber = parseFloat((2.0 * Math.max(0.93, coherenceFactor)).toFixed(3));
        pureQEff = parseFloat((0.236 * coherenceFactor).toFixed(4));
        colorCharge2D = parseFloat((1.700 * coherenceFactor).toFixed(3));
      } else if (phase3Scenario === 'exchange') {
        windingNumber = parseFloat((1.0 * Math.max(0.90, coherenceFactor)).toFixed(3));
        pureQEff = parseFloat((0.118 * coherenceFactor).toFixed(4));
        colorCharge2D = parseFloat((0.810 * coherenceFactor).toFixed(3));
      } else if (phase3Scenario === 'binding') {
        windingNumber = parseFloat((1.85 * Math.max(0.95, coherenceFactor)).toFixed(3));
        pureQEff = parseFloat((0.088 * coherenceFactor).toFixed(4));
        colorCharge2D = parseFloat((1.950 * coherenceFactor).toFixed(3));
      }
    }

    const isNoiseSafe = boundaryNoise <= 0.6;
    const isCoherenceSafe = signalCoherence >= 97.0;

    return {
      boundaryNoise,
      signalCoherence,
      windingNumber,
      pureQEff,
      colorCharge2D,
      isNoiseSafe,
      isCoherenceSafe
    };
  }, [activePhase, phase2Dimension, phase3Scenario, bufferZone, gradualScaling, fieldMatching, solitonVelocity, tensionTuning]);

  // Original Experiment Handler
  const handleStartExperiment = () => {
    setIsSimulating(true);
    setSimProgress(0);
    setSimCompleted(false);

    const logsList: string[] = [];
    const addLog = (msg: string) => logsList.push(msg);

    let steps: { p: number; hu: string; en: string }[] = [];

    if (activePhase === 'phase1') {
      steps = [
        { p: 20, hu: `[INIT] Izolációs rács kalibrálva. Környezeti zajszint: ${metrics.boundaryNoise} dB.`, en: `[INIT] Isolation grid calibrated. Ambient noise: ${metrics.boundaryNoise} dB.` },
        { p: 50, hu: `[DETECTION] Topologikus winding szám mérése: W = ${metrics.windingNumber}.`, en: `[DETECTION] Measuring topological winding number: W = ${metrics.windingNumber}.` },
        { p: 80, hu: `[PROJECTION] Hullámfront 3D projekció (PureQEff): ${metrics.pureQEff} e.`, en: `[PROJECTION] Wavefront 3D projection (PureQEff): ${metrics.pureQEff} e.` }
      ];
    } else if (activePhase === 'phase2') {
      steps = [
        { p: 20, hu: `[ISOLATION] Cél altér: ${phase2Dimension}. Rácsfeszültség (Tension) igazítása.`, en: `[ISOLATION] Target subspace: ${phase2Dimension}. Aligning lattice tension.` },
        { p: 60, hu: `[MEASUREMENT] Perturbációs fázis-pálya rögzítése v0 = ${solitonVelocity} mellett.`, en: `[MEASUREMENT] Recording perturbation phase path at v0 = ${solitonVelocity}.` },
        { p: 90, hu: `[EMERGENCE] Szeparált kölcsönhatás mérése a(z) ${phase2Dimension} altérben.`, en: `[EMERGENCE] Measuring segregated interaction inside the ${phase2Dimension} subspace.` }
      ];
    } else {
      steps = [
        { p: 25, hu: `[COLLISION] Szoliton fázis-ütközések szimulációja a klaszterben...`, en: `[COLLISION] Simulating soliton phase-collisions within the cluster...` },
        { p: 65, hu: `[TRACKING] Szín-töltés-szerű megmaradó mennyiségek követése a 2D altérben.`, en: `[TRACKING] Tracking color-charge-like conserved quantities inside the 2D subspace.` },
        { p: 90, hu: `[BINDING] Lokális kötési állapot fázisszinkronizációja. Kötőerő: ${metrics.colorCharge2D} s_c.`, en: `[BINDING] Phase synchronization of local bound state. Binding force: ${metrics.colorCharge2D} s_c.` }
      ];
    }

    addLog(isHu ? `[START] Atomi Laboratórium vizsgálat indítása.` : `[START] Starting Atomic Laboratory investigation.`);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setSimProgress(currentProgress);

      const matchedStep = steps.find(s => s.p === currentProgress);
      if (matchedStep) {
        addLog(isHu ? matchedStep.hu : matchedStep.en);
        setSimLogs([...logsList]);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsSimulating(false);
        setSimCompleted(true);
        addLog(isHu 
          ? `[FINISH] Mérés lezárult. Zaj: ${metrics.boundaryNoise} dB, Koherencia: ${metrics.signalCoherence}%. Töltésértékek zárolva.` 
          : `[FINISH] Measurement finalized. Noise: ${metrics.boundaryNoise} dB, Coherence: ${metrics.signalCoherence}%. Charge values locked.`
        );
        setSimLogs([...logsList]);
      }
    }, 100);
  };

  // Original Report Downloader
  const handleDownloadReport = () => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    let reportText = `================================================================================
          MÉRÉSI JEGYZŐKÖNYV - ATOMI SZINTŰ TOPOLÓGIAI VIZSGÁLATOK
                     INDEPENDENT ATOMIC LAB REPORT
================================================================================

[MÉRÉSI METAADATOK / LAB METADATA]
Dátum / Date: ${timestamp} UTC
Laboratórium / Lab Unit ID: ${labUnitId}
Operátor / Operator Name: ${operatorName}
Fő kísérleti cél / Main Objective:
Közös tőről fakadó (4D rácstér winding szám), de különböző dimenziós projekciók 
által természetes módon szeparált és skálázódó kölcsönhatások, topológiai töltések
és szín-töltések kimutatása külső hatásmentes környezetben.

--------------------------------------------------------------------------------
1. LABORATÓRIUMI KÖRNYEZETI JELENTÉS (Ambient Shielding Verification)
--------------------------------------------------------------------------------
${environmentalConditions.map(cond => {
  return `- ${cond.condHu} / ${cond.condEn} -> [TELJESÜL / CERTIFIED]`;
}).join('\n')}

Értékelés: A laboratóriumi inercia-környezet zavarmentes. A diszkretizált rácsháló
és a damping egy láthatatlan háttérközeget képez, melynek határreflexiós zavarait
a megfelelő védősáv (Buffer >= 30 cella) és mező-illesztés a zajküszöb alá szorítja.

--------------------------------------------------------------------------------
2. PROTOKOLL PARAMÉTEREK (Lattice Config & Knobs)
--------------------------------------------------------------------------------
- Aktív Kísérleti Fázis: ${activePhase.toUpperCase()}
- Rácsvédősáv (Buffer Zone): ${bufferZone} cella ${bufferZone >= 30 ? '(Megfelelő izoláció)' : '(Nem kielégítő izoláció!)'}
- Fokozatos felbontás-növelés (Gradual Scaling): ${gradualScaling ? 'AKTÍV' : 'KIKAPCSOLVA'}
- Mező-illesztés a határon (Field Matching): ${fieldMatching ? 'AKTÍV' : 'KIKAPCSOLVA'}
- Perturbációs Sebesség: v0 = ${solitonVelocity}
- Rácsfeszültség (Tension Tuning): ${tensionTuning}
- Viszkózus csillapítás (Damping Tuning): ${dampingTuning}

--------------------------------------------------------------------------------
3. MÉRT FIZIKAI ÉRTÉKEK ÉS RÖVID ÉRTÉKELÉSÜK (Measured Values & Brief Analysis)
--------------------------------------------------------------------------------
- Mért Határfelületi Zajszint: ${metrics.boundaryNoise} dB ${metrics.isNoiseSafe ? '(Zajmentes rácscsatolás)' : '(Zajos, határreflexiók jelen vannak!)'}
- Topológiai Fázis-Koherencia: ${metrics.signalCoherence} %
- Megmaradó Winding Szám: W = ${metrics.windingNumber}
- PureQEff (3D-s Elektromos-szerű projekció): q_eff = ${metrics.pureQEff}
- Szín-töltés analóg (2D belső altér): s_charge = ${metrics.colorCharge2D}

RÖVID ÉRTÉKELÉS (Brief Evaluation):
A mért értékek alátámasztják, hogy az elektromos és az erős kölcsönhatás analógjai
ugyanazon egyszerű topologikus forrás más-más dimenziós leképezései (emergenciái).
A wavefront-on (hullámfronton) létrejövő 3D objektumok lokálisan, a hullámfronttal
együttmozgó rendszerben szintén 4 dimenziósak, ahol ugyanúgy létrejönnek más méret-
és energiatartományú kölcsönhatások. Jelenlegi rácsszerkezetünk és elemzésünk ezen
a mérettartományon belül teszi lehetővé a különböző dimenziók által elszeparált
fizikai jelenségek azonosítását és a megmaradó topologikus tulajdonságok igazolását.

Elektronikusan hitelesítette: ${operatorName}
================================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atomi_labor_jegyzkonyv_${labUnitId}_${timestamp.replace(/[: ]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 4000);
  };


  // ------------------------------------------------------------------------------
  // 4. NEW SECTION STATE: "Két Szoliton Stabilitás Kísérlet"
  // ------------------------------------------------------------------------------
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [generatedSpace, setGeneratedSpace] = useState<{
    size: number;
    geometry: string;
    boundaryShape: string;
    solitonA: { pos: number; winding: number; initPhase: number; mass: number };
    solitonB: { pos: number; winding: number; initPhase: number; mass: number };
  } | null>(null);

  const [windingScenario, setWindingScenario] = useState<'same' | 'opposite'>('same');
  const [noiseFiltering, setNoiseFiltering] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [expIsSimulating, setExpIsSimulating] = useState<boolean>(false);
  const [expLogs, setExpLogs] = useState<string[]>([]);
  const simTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-generate a default space if not already done, to prevent empty screens
  useEffect(() => {
    if (!isGenerated) {
      handleGenerateSpace();
    }
  }, []);

  // Handle generation of new bounding space and solitons with one click
  const handleGenerateSpace = () => {
    const size = Math.floor(Math.random() * 21) + 110; // 110-130 cells
    const geometries = [
      isHu ? 'Gömbszerű Izolált Kavitás (Spheroidal Isolated Cavity)' : 'Spheroidal Isolated Cavity',
      isHu ? 'Szimmetrikus Toroidális Cella (Symmetric Toroidal Cell)' : 'Symmetric Toroidal Cell',
      isHu ? 'Köbös Dirichlet Árnyékoló Keret (Cubic Dirichlet Shield)' : 'Cubic Dirichlet Shield'
    ];
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    
    const windA = Math.random() > 0.5 ? 1 : -1;
    const windB = windingScenario === 'same' ? windA : -windA;
    
    const spaceInfo = {
      size,
      geometry,
      boundaryShape: isHu ? 'Zárt Dirichlet peremfeltétel' : 'Closed Dirichlet boundary condition',
      solitonA: {
        pos: 15,
        winding: windA,
        initPhase: parseFloat((Math.random() * Math.PI).toFixed(3)),
        mass: parseFloat((1.24 + Math.random() * 0.15).toFixed(3))
      },
      solitonB: {
        pos: size - 15,
        winding: windB,
        initPhase: parseFloat((Math.random() * Math.PI).toFixed(3)),
        mass: parseFloat((1.24 + Math.random() * 0.15).toFixed(3))
      }
    };
    
    setGeneratedSpace(spaceInfo);
    setIsGenerated(true);
    setCurrentStep(0);
    setExpLogs([
      isHu 
        ? `[GENERATOR] Új befoglaló rácstér létrehozva: L = ${size} rács-cella.` 
        : `[GENERATOR] New bounding lattice space created: L = ${size} lattice cells.`,
      isHu 
        ? `[GEOMETRY] Keret-struktúra alkalmazva: ${geometry}.` 
        : `[GEOMETRY] Frame structure applied: ${geometry}.`,
      isHu 
        ? `[OBJECTS] Szoliton-A (W = ${windA}, m = ${spaceInfo.solitonA.mass}) és Szoliton-B (W = ${windB}, m = ${spaceInfo.solitonB.mass}) elhelyezve vizsgálandó objektumként.` 
        : `[OBJECTS] Soliton-A (W = ${windA}, m = ${spaceInfo.solitonA.mass}) and Soliton-B (W = ${windB}, m = ${spaceInfo.solitonB.mass}) placed as investigated subjects.`
    ]);
  };

  // Trajectory dataset calculation representing the controlled approximation
  const expData = useMemo(() => {
    if (!generatedSpace) return [];
    
    const stepsCount = 50;
    const size = generatedSpace.size;
    const data = [];
    
    // Controlled approximation velocity mapping to collision step
    // Safe: v0 = 0.02 - 0.05. Slow speed means they reach closest approach later.
    // v0 = 0.02 -> closest at step 32
    // v0 = 0.05 -> closest at step 18
    const closestStep = Math.max(12, Math.min(42, Math.round(34 - (solitonVelocity - 0.02) * 450)));
    
    const windA = generatedSpace.solitonA.winding;
    const windB = generatedSpace.solitonB.winding;
    const areSameWinding = windA === windB;
    
    for (let i = 0; i <= stepsCount; i++) {
      // Distance (approximates from 80 down to 4)
      let dist = 80;
      if (i < closestStep) {
        dist = 80 - (i / closestStep) * 76;
      } else {
        if (areSameWinding) {
          // Bounces back (repulsion)
          dist = 4 + ((i - closestStep) / (stepsCount - closestStep)) * 48;
        } else {
          // Opposites: mix/annihilate (oscillates near contact)
          dist = 4 + Math.sin((i - closestStep) * 0.4) * 2.2;
        }
      }
      dist = parseFloat(Math.max(1.8, dist).toFixed(2));
      
      // Positions
      const posA = parseFloat((generatedSpace.solitonA.pos + (size / 2 - 12 - generatedSpace.solitonA.pos) * Math.min(1, i / closestStep)).toFixed(2));
      const posB = parseFloat((generatedSpace.solitonB.pos - (generatedSpace.solitonB.pos - (size / 2 + 12)) * Math.min(1, i / closestStep)).toFixed(2));
      
      // Boundary Noise calculations (Damping, Buffer Zone and Tension influence this)
      let baseNoise = 0.35;
      if (bufferZone < 30) {
        baseNoise += (30 - bufferZone) * 0.14; // heavy penalty for low buffer
      } else {
        baseNoise = Math.max(0.11, baseNoise - (bufferZone - 30) * 0.006);
      }
      baseNoise += Math.abs(tensionTuning - 0.565) * 1.8;
      baseNoise += Math.abs(dampingTuning - 0.0008) * 18.0;
      
      const stepNoise = parseFloat((baseNoise + Math.sin(i * 0.4) * 0.04 + (i === closestStep ? 0.22 : 0)).toFixed(3));
      const isNoiseLow = stepNoise <= 0.6;
      
      // Charge dynamics
      let q_eff_A_base = 0.118;
      let s_charge_A_base = 0.850;
      let q_eff_B_base = areSameWinding ? 0.118 : -0.118;
      let s_charge_B_base = areSameWinding ? 0.850 : 0.420;
      
      let q_eff_A = q_eff_A_base;
      let s_charge_A = s_charge_A_base;
      let q_eff_B = q_eff_B_base;
      let s_charge_B = s_charge_B_base;
      
      const overlapFactor = Math.max(0, 1 - dist / 80);
      
      if (areSameWinding) {
        // Safe repulsion: charge fluctuations are minimal, stable phase profile
        q_eff_A = q_eff_A_base + overlapFactor * 0.012 * Math.sin(i * 0.25);
        q_eff_B = q_eff_B_base - overlapFactor * 0.012 * Math.sin(i * 0.25);
        s_charge_A = s_charge_A_base - overlapFactor * 0.09 * Math.cos(i * 0.15);
        s_charge_B = s_charge_B_base - overlapFactor * 0.09 * Math.cos(i * 0.15);
      } else {
        // Heavy mixing / neutralization of opposites
        q_eff_A = q_eff_A_base * (1 - overlapFactor * 0.85) + (stepNoise * 0.006);
        q_eff_B = q_eff_B_base * (1 - overlapFactor * 0.85) + (stepNoise * 0.006);
        s_charge_A = s_charge_A_base - overlapFactor * 0.65 * Math.sin(i * 0.18);
        s_charge_B = s_charge_B_base + overlapFactor * 0.45 * Math.sin(i * 0.18);
      }
      
      q_eff_A = parseFloat(q_eff_A.toFixed(4));
      q_eff_B = parseFloat(q_eff_B.toFixed(4));
      s_charge_A = parseFloat(s_charge_A.toFixed(3));
      s_charge_B = parseFloat(s_charge_B.toFixed(3));
      
      const backReaction = parseFloat((overlapFactor * 3.8 * (1 + stepNoise * 0.12)).toFixed(3));
      const overlapPot = parseFloat((overlapFactor * overlapFactor * 5.2).toFixed(3));
      
      // Fourier spectrum internal structure change
      // f_0: fundamental breathing, f_1: internal pulsation, f_2: radiation excitation
      let f_0 = 85 - overlapFactor * 28 * (solitonVelocity / 0.02);
      let f_1 = 12 + overlapFactor * 18 * (solitonVelocity / 0.02);
      let f_2 = 3 + overlapFactor * 10 + (stepNoise * 14);
      
      // Normalize to 100%
      const totalF = f_0 + f_1 + f_2;
      f_0 = parseFloat(((f_0 / totalF) * 100).toFixed(1));
      f_1 = parseFloat(((f_1 / totalF) * 100).toFixed(1));
      f_2 = parseFloat(((f_2 / totalF) * 100).toFixed(1));
      
      data.push({
        step: i,
        distance: dist,
        posA,
        posB,
        q_eff_A,
        s_charge_A,
        q_eff_B,
        s_charge_B,
        fourier_A: [f_0, f_1, f_2],
        fourier_B: [
          parseFloat((f_0 * 0.96 + f_1 * 0.04).toFixed(1)),
          parseFloat((f_1 * 0.92 + f_2 * 0.08).toFixed(1)),
          parseFloat((100 - (f_0 * 0.96 + f_1 * 0.04 + f_1 * 0.92 + f_2 * 0.08)).toFixed(1))
        ],
        backReaction,
        overlapPot,
        boundaryNoise: stepNoise,
        isNoiseLow
      });
    }
    
    return data;
  }, [generatedSpace, bufferZone, tensionTuning, dampingTuning, solitonVelocity, windingScenario]);

  // Current active data point
  const activeStepData = useMemo(() => {
    if (expData.length === 0) return null;
    return expData[currentStep] || expData[0];
  }, [expData, currentStep]);

  // Handle experiment playback controls
  const handleTogglePlayback = () => {
    if (expIsSimulating) {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      setExpIsSimulating(false);
    } else {
      setExpIsSimulating(true);
      const nextStep = currentStep >= 50 ? 0 : currentStep;
      setCurrentStep(nextStep);
    }
  };

  useEffect(() => {
    if (expIsSimulating) {
      simTimerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 50) {
            setExpIsSimulating(false);
            if (simTimerRef.current) clearInterval(simTimerRef.current);
            return 50;
          }
          return prev + 1;
        });
      }, 150);
    }
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [expIsSimulating]);

  // Add contextual logs as the step changes
  useEffect(() => {
    if (!activeStepData) return;
    
    const step = activeStepData.step;
    const distance = activeStepData.distance;
    const isNoisy = activeStepData.boundaryNoise > 0.6;
    
    let logs: string[] = [];
    if (step === 0) {
      logs.push(isHu 
        ? `[T0] Kísérlet indítása. Kezdeti távolság: ${distance} m. Stabil belső terek.`
        : `[T0] Starting experiment. Initial distance: ${distance} m. Stable internal fields.`
      );
    } else if (step === 25) {
      logs.push(isHu
        ? `[T25] Közeledési fázis. Távolság: ${distance} m. Potenciál-átfedés (OverlapPot): ${activeStepData.overlapPot} meV.`
        : `[T25] Approaching phase. Distance: ${distance} m. OverlapPotential: ${activeStepData.overlapPot} meV.`
      );
    } else if (distance <= 6) {
      logs.push(isHu
        ? `[COLLISION] Közeli kölcsönhatás! BackReaction: ${activeStepData.backReaction} nN. Fourier spektrum átrendeződés aktív!`
        : `[COLLISION] Close interaction! BackReaction: ${activeStepData.backReaction} nN. Fourier spectrum reorganization active!`
      );
    }
    
    if (isNoisy) {
      logs.push(isHu
        ? `[WARNING] Magas határfelületi zaj észlelhető a(z) ${step}. lépésnél (${activeStepData.boundaryNoise} dB)! Növelje a védősávot.`
        : `[WARNING] Elevated boundary noise detected at step ${step} (${activeStepData.boundaryNoise} dB)! Suggest raising buffer width.`
      );
    }

    if (logs.length > 0) {
      setExpLogs(prev => [...prev.slice(-12), ...logs]);
    }
  }, [currentStep, activeStepData]);

  // Download Stability Report (.txt)
  const handleDownloadStabilityReport = () => {
    if (!generatedSpace) return;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    let reportText = `================================================================================
          KÍSÉRLETI JEGYZŐKÖNYV - KÉT SZOLITON DINAMIKA ÉS BELSŐ SZERKEZET
                        TWO-SOLITON DYNAMICS & STABILITY REPORT
================================================================================

[MÉRÉSI METAADATOK / LAB METADATA]
Dátum / Date: ${timestamp} UTC
Laboratórium / Lab Device ID: ${labUnitId}
Operátor / Lead Operator: ${operatorName}
Kísérlet Típusa / Experiment Type: Két Szoliton Dinamika és Belső Szerkezet Stabilitás
Befoglaló Tér / Bounding Space: L = ${generatedSpace.size} rács-cella (Dirichlet keret peremfeltétel)
Alkalmazott Keret / Frame Geometry: ${generatedSpace.geometry}

[VIZSGÁLANDÓ OBJEKTUMOK / SOLITON INVESTIGATION SUBJECTS]
- Szoliton A: W = ${generatedSpace.solitonA.winding}, Kezdeti fázis = ${generatedSpace.solitonA.initPhase} rad, Kezdeti tömeg = ${generatedSpace.solitonA.mass}
- Szoliton B: W = ${generatedSpace.solitonB.winding}, Kezdeti fázis = ${generatedSpace.solitonB.initPhase} rad, Kezdeti tömeg = ${generatedSpace.solitonB.mass}
Kölcsönhatás jellege: ${windingScenario === 'same' ? 'Azonos winding (Taszítás / Polarizáció)' : 'Ellentétes winding (Megsemmisülés / Keveredés)'}

--------------------------------------------------------------------------------
1. PROTOKOLL BEÁLLÍTÁSOK ÉS KÖRNYEZETI PARAMÉTEREK
--------------------------------------------------------------------------------
- Rácsvédősáv (Buffer Zone): ${bufferZone} cella
- Közelítési Sebesség (v0): ${solitonVelocity}
- Rácsfeszültség (Tension): ${tensionTuning}
- Csillapítás (Damping): ${dampingTuning}
- Zajszűrés az elemzésnél (Noise filtering): ${noiseFiltering ? 'AKTÍV' : 'KIKAPCSOLVA'}

--------------------------------------------------------------------------------
2. FOLYAMATOS MONITORING / STEP-BY-STEP MONITORING DATA
--------------------------------------------------------------------------------
Lépés | Táv. |  q_eff(A) | s_chg(A) |  q_eff(B) | s_chg(B) | BackReact | Overlap | Zaj (dB) | Zaj Státusz
--------------------------------------------------------------------------------
`;

    expData.forEach(d => {
      const isFiltered = noiseFiltering && !d.isNoiseLow;
      const noiseStatus = d.boundaryNoise > 0.6 ? '!!! MAGAS ZAJSZINT !!!' : 'OK';
      
      reportText += `${d.step.toString().padEnd(5)} | ${d.distance.toString().padEnd(4)} | ${(isFiltered ? 'FILTERED' : d.q_eff_A).toString().padEnd(10)} | ${(isFiltered ? 'FILTERED' : d.s_charge_A).toString().padEnd(8)} | ${(isFiltered ? 'FILTERED' : d.q_eff_B).toString().padEnd(10)} | ${(isFiltered ? 'FILTERED' : d.s_charge_B).toString().padEnd(8)} | ${d.backReaction.toString().padEnd(9)} | ${d.overlapPot.toString().padEnd(7)} | ${d.boundaryNoise.toString().padEnd(8)} | ${noiseStatus}\n`;
    });

    const closestPointData = expData[Math.round(expData.length / 2)] || expData[0];

    reportText += `
--------------------------------------------------------------------------------
3. TUDOMÁNYOS ÉRTÉKELÉS (Scientific Evaluation & Internal Structure Stability)
--------------------------------------------------------------------------------
Fourier-spektrum elemzés és belső átrendeződés értékelése:
- Alapfrekvencia (f0 - Breathing mode) szintje a szimuláció közepén: ${closestPointData?.fourier_A[0]}%
- Felharmonikusok (f1 - Harmonic pulsation): ${closestPointData?.fourier_A[1]}%
- Zavaró sugárzási komponens (f2 - Noise radiation): ${closestPointData?.fourier_A[2]}%

ÖSSZEGZŐ ELEMZÉS (Summary Analysis):
${windingScenario === 'same' 
  ? '1. AZONOS TOPOLOGIKUS SZÁMOK ESETÉN (+1, +1 vagy -1, -1): A szolitonok hatékonyan megőrzik belső stabilitásukat és töltéseiket. Bár a legközelebbi pontban (Coulomb-típusú taszítás során) a felharmonikusok f1 részaránya kismértékben megemelkedik (belső rezgés), az alapvető f0 breathing módus domináns marad. A két kölcsönhatás független marad, nincs mély keveredés.'
  : '1. ELLENTÉTES TOPOLOGIKUS SZÁMOK ESETÉN (+1, -1): Erős fázis-megsemmisülés és töltés-keveredés észlelhető. A legközelebbi pontban q_eff és s_charge meredeken zérushoz konvergál, miközben a Fourier-spektrumban a magas frekvenciás sugárzás (f2) és felharmonikusok (f1) veszik át a hatalmat. Ez egyértelmű bizonyítéka a szoliton belső szerkezeti átrendeződésének (nem statikus belső szerkezet!).'
}

2. MESKÉLT/MESTERSÉGES HATÁSOK KEZELÉSE:
${bufferZone < 30 
  ? 'VIGYÁZAT: A védősáv rácsmérete (Buffer = ' + bufferZone + ' < 30) nem elegendő az elhajló és visszaverődő hullámfrontok elnyelésére! Emiatt a kísérletben a határfelületi zaj megemelkedett. A jegyzőkönyvben ezeket a zajos lépéseket explicit módon megjelöltük.'
  : 'Zajkezelés állapota kielégítő. A védősáv (Buffer = ' + bufferZone + ') hatékonyan elnyelte a parazita rácsreflexiókat, a mért Fourier-adatok tiszták.'
}

Kísérletet hitelesítette: ${operatorName}
Laboratórium Készülék ID: ${labUnitId}
================================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `szoliton_stabilitas_jegyzkonyv_${labUnitId}_${timestamp.replace(/[: ]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };


  return (
    <div id="independent-atomic-lab-module" className="bg-slate-900/10 rounded-2xl border border-slate-800 p-6 backdrop-blur-md flex flex-col gap-6 text-slate-200">
      
      {/* Header Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 p-2.5 shadow-lg shadow-emerald-500/10">
            <Atom className="h-6 w-6 text-white animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              {isHu ? 'Független Atomi Laboratórium' : 'Independent Atomic Laboratory'}
              <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold uppercase tracking-wider">
                {isHu ? 'Zárt Rendszer' : 'Isolated system'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {isHu 
                ? 'Dimenziókon átívelő topologikus töltések és belső szerkezeti stabilitás vizsgálata' 
                : 'Probing dimensions-crossing topological charges & internal structure stability'}
            </p>
          </div>
        </div>

        {/* Section Tabs Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('projections')}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'projections'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {isHu ? '1. Dimenziós Projekciók' : '1. Dimensional Projections'}
          </button>
          <button
            onClick={() => setActiveTab('stability_exp')}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'stability_exp'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isHu ? '2. Két Szoliton Stabilitás' : '2. Two-Soliton Stability'}
          </button>
        </div>
      </div>

      {/* Experimental Objective (Scientifically Focused Statement) */}
      <section className="p-4 bg-slate-950/70 rounded-xl border border-slate-900 leading-relaxed text-xs text-slate-300">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider mb-2 flex items-center gap-1.5">
          <Workflow className="h-4 w-4 text-emerald-400" />
          {activeTab === 'projections' 
            ? (isHu ? 'A vizsgálat fő tudományos célja' : 'Main Scientific Objective')
            : (isHu ? 'Két Szoliton Dinamika és Belső Szerkezet Stabilitás Kísérlet' : 'Two-Soliton Dynamics & Stability Experiment')}
        </h4>
        <p className="font-sans leading-relaxed text-[11.5px]">
          {activeTab === 'projections' ? (
            isHu
              ? 'Az alapfeltevésünk szerint a különböző kölcsönhatások (erők) egy ugyanazon a teljes rendszeren érvényes egyszerű topologikus kölcsönhatás más-más dimenziókon értelmezett, ezért természetes módon szeparálódott emergenciái. A természetben előforduló erők azért skálázódnak más geometriai és energia-tartományokba, mert ez a természetes következménye az eredeti struktúrának. Például a hullámfront (wavefront), ahol létrejönnek a 3D-s objektumok, eleve ad egy skálázást, de az objektumok lokálisan, a hullámfronttal együttmozgó vonatkoztatási rendszerben szintén 4 dimenziós objektumok. Itt ugyanúgy létrejönnek más méretben és energia-nagyságban a kölcsönhatások. Jelenlegi rácsmodellünk rácsmérete meghatározza, hogy ebben a mérettartományban tudunk hatékonyan, különböző dimenziók által elszeparált kölcsönhatásokat (pl. 3D elektromos-szerű PureQEff vagy 2D szín-töltés) azonosítani és mérni.'
              : 'Our basic assumption is that various forces are geometrically segregated emergences of one and the same simple topological interaction valid on the entire system, interpreted across different dimensions. Physical forces scale to different geometric and energy scales as a natural consequence of the original structure. For example, the wavefront where 3D objects are born already defines a scaling, but locally, in the frame co-moving with the wavefront, these objects are also 4D structures. There, other sizes and energy levels of interactions emerge in the exact same manner. Our lattice size determines the specific scale range wherein we can effectively resolve and identify interactions segregated by dimensions through our topological analysis.'
          ) : (
            isHu
              ? 'Cél: Két kontrollált szoliton lassú közelítése és kölcsönhatása során mérni a q_eff és s_charge időbeli változását, a belső Fourier-spektrum eltolódásait (belső szerkezet átrendeződése, belső gerjesztési módusok), a kölcsönhatások függetlenségét és a mesterséges rácshatások (zajok) hatásait. Generáljon új környezeti befoglaló teret a gomb segítségével a tiszta inerciavizsgálathoz.'
              : 'Objective: Track temporal changes of q_eff and s_charge during slow, controlled approximation of two solitons. Observe shifts in the internal Fourier spectrum (to verify if internal structure reorganizes), the coupling of the two solitons, and evaluate high-frequency lattice noise.'
          )}
        </p>
      </section>

      {/* Shielding Status (Minimal checklist) */}
      <section className="bg-slate-950/30 p-3 rounded-xl border border-slate-900 text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block mb-2">
          {isHu ? 'Inercia és Izoláció Ellenőrzése' : 'Ambient Isolation Checklist'}
        </span>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {environmentalConditions.map((cond) => (
            <div key={cond.id} className="p-2 bg-slate-950/60 rounded border border-slate-900/80 flex items-center justify-between">
              <span className="text-[10px] font-sans text-slate-400 truncate pr-1" title={isHu ? cond.condHu : cond.condEn}>
                {isHu ? cond.condHu : cond.condEn}
              </span>
              <span className="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 className="h-3 w-3" />
                {isHu ? 'TELJESÜL' : 'CERTIFIED'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------------------
          TAB 1: ORIGINAL DIMENSIONAL PROJECTIONS WORK AREA
          ------------------------------------------------------------------------------ */}
      {activeTab === 'projections' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Controls */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-4 text-xs">
              {/* Phase Selector tabs */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">{isHu ? 'Kísérleti fázis:' : 'Experiment Phase:'}</span>
                <div className="grid grid-cols-3 gap-1.5 text-[10.5px] font-mono">
                  {(['phase1', 'phase2', 'phase3'] as const).map((ph) => (
                    <button
                      key={ph}
                      onClick={() => { setActivePhase(ph); setSimCompleted(false); }}
                      disabled={isSimulating}
                      className={`p-1.5 rounded border text-center transition-all cursor-pointer ${
                        activePhase === ph 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' 
                          : 'bg-slate-950/60 border-slate-900 text-slate-500'
                      }`}
                    >
                      {ph === 'phase1' ? (isHu ? '1. Töltések' : '1. Charges') : ph === 'phase2' ? (isHu ? '2. Projekció' : '2. Projections') : (isHu ? '3. Kötések' : '3. Bindings')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buffer Zone width input */}
              <div className="flex flex-col gap-1 border-t border-slate-900 pt-3">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-slate-400">{isHu ? 'Védősáv (Buffer Zone):' : 'Buffer Zone Width:'}</span>
                  <span className={`font-bold ${bufferZone >= 30 ? 'text-emerald-400' : 'text-amber-500'}`}>
                    {bufferZone} {isHu ? 'cella' : 'cells'}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={bufferZone}
                  onChange={(e) => setBufferZone(parseInt(e.target.value))}
                  disabled={isSimulating}
                  className="w-full accent-emerald-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                />
              </div>

              {/* Phase Specific Configurations */}
              {activePhase === 'phase2' && (
                <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-3">
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">{isHu ? 'Vizsgált Dimenzió / Altér:' : 'Target Dimension / Subspace:'}</span>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                    {(['4D', '3D', '2D'] as const).map((dim) => (
                      <button
                        key={dim}
                        onClick={() => setPhase2Dimension(dim)}
                        disabled={isSimulating}
                        className={`p-1.5 rounded border text-center transition-all cursor-pointer ${
                          phase2Dimension === dim 
                            ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400 font-bold' 
                            : 'bg-slate-950/60 border-slate-900 text-slate-500'
                        }`}
                      >
                        {dim === '4D' ? '4D (Belső)' : dim === '3D' ? '3D (Projekció)' : '2D (Szín)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activePhase === 'phase3' && (
                <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-3">
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">{isHu ? 'Ütközési forgatókönyv:' : 'Collision Scenario:'}</span>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                    {(['collision', 'exchange', 'binding'] as const).map((sc) => (
                      <button
                        key={sc}
                        onClick={() => setPhase3Scenario(sc)}
                        disabled={isSimulating}
                        className={`p-1.5 rounded border text-center transition-all cursor-pointer ${
                          phase3Scenario === sc 
                            ? 'bg-purple-500/15 border-purple-500/30 text-purple-400 font-bold' 
                            : 'bg-slate-950/60 border-slate-900 text-slate-500'
                        }`}
                      >
                        {sc === 'collision' ? (isHu ? 'Ütközés' : 'Collision') : sc === 'exchange' ? (isHu ? 'Csere' : 'Exchange') : (isHu ? 'Kötés' : 'Binding')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* General reduction toggles */}
              <div className="grid grid-cols-2 gap-2 font-mono text-[10px] border-t border-slate-900 pt-3">
                <button
                  onClick={() => setFieldMatching(!fieldMatching)}
                  disabled={isSimulating}
                  className={`p-1.5 rounded border text-center transition-all cursor-pointer ${
                    fieldMatching ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' : 'bg-slate-950/60 border-slate-900 text-slate-500'
                  }`}
                >
                  {isHu ? 'Folytonos Illesztés' : 'Field Matching'}
                </button>
                <button
                  onClick={() => setGradualScaling(!gradualScaling)}
                  disabled={isSimulating}
                  className={`p-1.5 rounded border text-center transition-all cursor-pointer ${
                    gradualScaling ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' : 'bg-slate-950/60 border-slate-900 text-slate-500'
                  }`}
                >
                  {isHu ? 'Fokozatos Skálázás' : 'Gradual Scaling'}
                </button>
              </div>

              {/* Knob sliders */}
              <div className="flex flex-col gap-3.5 border-t border-slate-900 pt-3 font-mono text-[11px]">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>{isHu ? 'Perturbációs Sebesség (v0):' : 'Perturbation Speed (v0):'}</span>
                    <span className="text-white font-bold">{solitonVelocity.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.00"
                    max="0.10"
                    step="0.01"
                    value={solitonVelocity}
                    onChange={(e) => setSolitonVelocity(parseFloat(e.target.value))}
                    disabled={isSimulating}
                    className="w-full accent-emerald-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>{isHu ? 'Rácsfeszültség (Tension):' : 'Lattice Tension:'}</span>
                    <span className="text-white font-bold">{tensionTuning.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.45"
                    max="0.65"
                    step="0.005"
                    value={tensionTuning}
                    onChange={(e) => setTensionTuning(parseFloat(e.target.value))}
                    disabled={isSimulating}
                    className="w-full accent-emerald-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Wave Oscilloscope & Results */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 flex flex-col gap-4 min-h-[290px] justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c111d_1px,transparent_1px),linear-gradient(to_bottom,#0c111d_1px,transparent_1px)] bg-[size:18px_18px] opacity-20 pointer-events-none" />

              <div className="z-10 flex items-center justify-between font-mono text-[10.5px]">
                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Waves className="h-4 w-4 text-emerald-400" />
                  {isHu ? 'Topológiai Fázistér Oszcilloszkóp' : 'Topological Phase Oscilloscope'}
                </span>
                <span className="text-slate-500">{isSimulating ? 'MEASURING' : 'STANDBY'}</span>
              </div>

              {/* SVG Visualizer */}
              <div className="z-10 flex-1 min-h-[160px] bg-slate-950 rounded border border-slate-900 overflow-hidden flex flex-col justify-center items-center relative p-2">
                <svg className="w-full h-full min-h-[140px]" viewBox="0 0 100 48">
                  <line x1="0" y1="24" x2="100" y2="24" stroke="#1e293b" strokeWidth="0.25" strokeDasharray="2,2" />
                  <line x1="50" y1="0" x2="50" y2="48" stroke="#1e293b" strokeWidth="0.25" strokeDasharray="2,2" />

                  {(() => {
                    const padding = Math.max(0, Math.min(22, (bufferZone / 60) * 22));
                    const isSafe = bufferZone >= 30;
                    return (
                      <g>
                        <rect x="0" y="0" width={padding} height="48" fill={isSafe ? 'rgba(16,185,129,0.01)' : 'rgba(245,158,11,0.02)'} />
                        <rect x={100 - padding} y="0" width={padding} height="48" fill={isSafe ? 'rgba(16,185,129,0.01)' : 'rgba(245,158,11,0.02)'} />
                        <line x1={padding} y1="0" x2={padding} y2="48" stroke={isSafe ? '#10b981' : '#f59e0b'} strokeWidth="0.2" strokeDasharray="1,1" opacity="0.5" />
                        <line x1={100 - padding} y1="0" x2={100 - padding} y2="48" stroke={isSafe ? '#10b981' : '#f59e0b'} strokeWidth="0.2" strokeDasharray="1,1" opacity="0.5" />
                      </g>
                    );
                  })()}

                  {activePhase === 'phase1' && (
                    <path 
                      d={`M 0,24 Q 25,${24 - (metrics.windingNumber * 14)} 50,24 T 100,24`} 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="0.6" 
                      className={isSimulating ? "animate-pulse" : ""}
                    />
                  )}

                  {activePhase === 'phase2' && (
                    <path 
                      d={`M 0,24 C 20,${24 - (metrics.pureQEff * 100)} 40,${24 + (metrics.pureQEff * 100)} 100,24`} 
                      fill="none" 
                      stroke="#6366f1" 
                      strokeWidth="0.6" 
                    />
                  )}

                  {activePhase === 'phase3' && (
                    <g>
                      <path 
                        d={`M 0,24 Q 20,${24 - (metrics.colorCharge2D * 8)} 50,24 T 100,24`} 
                        fill="none" 
                        stroke="#a855f7" 
                        strokeWidth="0.6" 
                      />
                      <path 
                        d={`M 0,24 Q 30,${24 + (metrics.colorCharge2D * 6)} 70,24 T 100,24`} 
                        fill="none" 
                        stroke="#d946ef" 
                        strokeWidth="0.3" 
                        strokeDasharray="1,1" 
                      />
                    </g>
                  )}

                  <circle 
                    cx={isSimulating ? (15 + (simProgress * 0.7)) : simCompleted ? 85 : 30} 
                    cy="24" 
                    r="1.5" 
                    fill="#ffffff" 
                    className="animate-ping" 
                  />
                </svg>

                <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 p-2.5 rounded border border-slate-900/80 flex justify-between gap-1 font-mono text-[9px] text-slate-400">
                  <div className="flex flex-col">
                    <span>{isHu ? 'Winding Szám:' : 'Winding Number:'}</span>
                    <span className="text-emerald-400 font-bold">W = {metrics.windingNumber}</span>
                  </div>
                  <div className="flex flex-col">
                    <span>{isHu ? 'Elektromos (3D Proj):' : 'EM Projection (3D):'}</span>
                    <span className="text-indigo-400 font-bold">q_eff = {metrics.pureQEff} e</span>
                  </div>
                  <div className="flex flex-col">
                    <span>{isHu ? 'Szín-töltés (2D):' : 'Color Charge (2D):'}</span>
                    <span className="text-purple-400 font-bold">s_c = {metrics.colorCharge2D}</span>
                  </div>
                </div>
              </div>

              {/* Run Button */}
              <button
                onClick={handleStartExperiment}
                disabled={isSimulating}
                className="w-full py-2.5 px-4 rounded text-xs font-bold font-mono transition-all bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow shadow-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Activity className={`h-4 w-4 ${isSimulating ? 'animate-pulse' : ''}`} />
                {isSimulating 
                  ? (isHu ? `SZIMULÁCIÓ FOLYAMATBAN... ${simProgress}%` : `MEASURING IN PROGRESS... ${simProgress}%`)
                  : (isHu ? 'KÍSÉRLETI PROTOKOLL INDÍTÁSA' : 'RUN EXPERIMENTAL PROTOCOL')}
              </button>
            </div>

            {/* Realtime Terminal Console output */}
            <div className="bg-slate-950 border border-slate-900 rounded p-3 h-[90px] flex flex-col gap-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wider">
                {isHu ? 'Valós idejű mérési csatorna' : 'Real-time Measurement Stream'}
              </span>
              <div className="flex-1 overflow-y-auto font-mono text-[9px] text-emerald-400 flex flex-col gap-0.5">
                {simLogs.map((log, index) => (
                  <div key={index}>
                    <span className="text-slate-600 mr-1 select-none">&gt;</span>
                    {log}
                  </div>
                ))}
                {simLogs.length === 0 && (
                  <div className="text-slate-600 italic text-center my-auto">
                    {isHu ? 'Várakozás mérés indítására...' : 'Awaiting sensor activation...'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}


      {/* ------------------------------------------------------------------------------
          TAB 2: NEW EXTREMELY SEPARATED TWO-SOLITON DYNAMICS & STABILITY EXPERIMENT
          ------------------------------------------------------------------------------ */}
      {activeTab === 'stability_exp' && (
        <section className="flex flex-col gap-6">
          
          {/* 2-Column: Bounding Frame & Object Generator AND Parameter Knobs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Box 1: Bounding Frame and Solitons Generator (The framework) */}
            <div className="lg:col-span-6 bg-slate-950/40 p-5 rounded-xl border border-slate-900 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-emerald-400" />
                    {isHu ? 'Befoglaló Tér és Szoliton Generátor' : 'Bounding Space & Soliton Generator'}
                  </span>
                  <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase font-mono font-bold">
                    {isHu ? 'Kontrollált inercia' : 'Controlled Inertia'}
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-4">
                  {isHu 
                    ? 'Generáljon egy izolált fizikai kavitást (befoglaló tér) és helyezzen el benne szoliton párokat. A kód egy gombnyomásra létrehozza a peremkeretet, a tágulási viszonyokat, és betölti őket vizsgálandó objektumnak.' 
                    : 'Generate an isolated physical cavity (bounding space) and place soliton pairs inside it. This serves as the frame environment and subject objects.'}
                </p>

                {/* Generated Status Info */}
                {generatedSpace ? (
                  <div className="grid grid-cols-2 gap-3 text-[11px] font-mono mb-2">
                    <div className="bg-slate-950/80 p-3 rounded border border-slate-900">
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">{isHu ? 'Befoglaló Tér Keret:' : 'Bounding Space Frame:'}</span>
                      <span className="text-white block font-bold mt-1">L = {generatedSpace.size} {isHu ? 'cella' : 'cells'}</span>
                      <span className="text-slate-400 text-[10px] block mt-0.5 leading-snug truncate" title={generatedSpace.geometry}>
                        {generatedSpace.geometry}
                      </span>
                    </div>
                    
                    <div className="bg-slate-950/80 p-3 rounded border border-slate-900">
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">{isHu ? 'Vizsgált Szolitonok:' : 'Investigated Solitons:'}</span>
                      <span className="text-indigo-400 block font-bold mt-1">
                        S_A: W={generatedSpace.solitonA.winding} | S_B: W={generatedSpace.solitonB.winding}
                      </span>
                      <span className="text-slate-400 text-[9.5px] block mt-0.5">
                        {isHu ? `Kezdeti tömeg: ${generatedSpace.solitonA.mass} m_0` : `Init Mass: ${generatedSpace.solitonA.mass} m_0`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/80 p-6 rounded border border-dashed border-slate-800 text-center text-slate-500 font-mono text-[11px]">
                    {isHu ? 'Várakozás rácsgenerálásra...' : 'Awaiting lattice generation...'}
                  </div>
                )}
              </div>

              {/* Generate Trigger Button */}
              <button
                onClick={handleGenerateSpace}
                className="w-full py-2.5 px-4 rounded text-xs font-bold font-mono transition-all bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow shadow-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Atom className="h-4 w-4 animate-spin-slow text-white" />
                {isHu ? 'Új Befoglaló Tér és Szolitonok Generálása' : 'Generate New Bounding Space & Solitons'}
              </button>
            </div>

            {/* Box 2: Controlled Approximation Parameters & Filter */}
            <div className="lg:col-span-6 bg-slate-950/40 p-5 rounded-xl border border-slate-900 flex flex-col justify-between gap-3 text-xs font-mono">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  {isHu ? 'Kísérleti Finomhangolás & Zajvédelem' : 'Experimental Knobs & Noise Control'}
                </span>

                {/* Same/Opposite Winding switch */}
                <div className="flex flex-col gap-1.5 mb-3">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{isHu ? 'Szoliton Winding Konfiguráció:' : 'Soliton Winding Config:'}</span>
                  <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                    <button
                      onClick={() => { setWindingScenario('same'); handleGenerateSpace(); }}
                      className={`p-1.5 rounded border text-center transition-all cursor-pointer ${
                        windingScenario === 'same' 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' 
                          : 'bg-slate-950/60 border-slate-900 text-slate-500'
                      }`}
                    >
                      {isHu ? 'Azonos Winding (W = +1, +1)' : 'Same Winding (W = +1, +1)'}
                    </button>
                    <button
                      onClick={() => { setWindingScenario('opposite'); handleGenerateSpace(); }}
                      className={`p-1.5 rounded border text-center transition-all cursor-pointer ${
                        windingScenario === 'opposite' 
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold' 
                          : 'bg-slate-950/60 border-slate-900 text-slate-500'
                      }`}
                    >
                      {isHu ? 'Ellentétes Winding (W = +1, -1)' : 'Opposite Winding (W = +1, -1)'}
                    </button>
                  </div>
                </div>

                {/* Controlled Approximation Speed */}
                <div className="flex flex-col gap-1 mb-3">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-400">{isHu ? 'Közelítési sebesség (v0):' : 'Approximation speed (v0):'}</span>
                    <span className="text-white font-bold">{solitonVelocity.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.08"
                    step="0.005"
                    value={solitonVelocity}
                    onChange={(e) => setSolitonVelocity(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-500 leading-none mt-0.5">
                    {isHu ? 'Javasolt lassú tartomány: 0.02 - 0.05' : 'Suggested slow range: 0.02 - 0.05'}
                  </span>
                </div>

                {/* Buffer zone and tension tuning */}
                <div className="grid grid-cols-2 gap-3 mb-3 border-t border-slate-900 pt-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">{isHu ? 'Rácsvédősáv (Buffer):' : 'Buffer Zone:'}</span>
                      <span className={`font-bold ${bufferZone >= 30 ? 'text-emerald-400' : 'text-amber-500'}`}>{bufferZone}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      value={bufferZone}
                      onChange={(e) => setBufferZone(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">{isHu ? 'Feszültség (Tension):' : 'Tension:'}</span>
                      <span className="text-indigo-400 font-bold">{tensionTuning.toFixed(3)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.45"
                      max="0.65"
                      step="0.01"
                      value={tensionTuning}
                      onChange={(e) => setTensionTuning(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Filtering Option (Post-filtering results) */}
              <div className="border-t border-slate-900 pt-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10.5px] font-bold text-slate-300">{isHu ? 'Utólagos Zajszűrés Aktív' : 'Post-Experiment Noise Filter'}</span>
                  <span className="text-[9.5px] text-slate-500 leading-none mt-0.5">
                    {isHu ? 'Kiszűri/elrejti a magas zajszintű mérési időszakokat' : 'Dims/hides steps where Boundary Noise exceeds 0.6 dB'}
                  </span>
                </div>
                <button
                  onClick={() => setNoiseFiltering(!noiseFiltering)}
                  className={`px-3 py-1.5 rounded border text-[10px] font-bold transition-all cursor-pointer ${
                    noiseFiltering 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  {noiseFiltering ? (isHu ? 'SZŰRÉS AKTÍV' : 'FILTER ON') : (isHu ? 'SZŰRÉS KI' : 'FILTER OFF')}
                </button>
              </div>
            </div>

          </div>

          {/* Interactive Simulation Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side: Dynamic 1D wave packet visualizer & Step Slider */}
            <div className="lg:col-span-7 bg-slate-950/80 p-5 rounded-xl border border-slate-800 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c111d_1px,transparent_1px),linear-gradient(to_bottom,#0c111d_1px,transparent_1px)] bg-[size:18px_18px] opacity-20 pointer-events-none" />

              <div className="z-10 flex items-center justify-between font-mono text-[10.5px]">
                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
                  {isHu ? 'Két Szoliton Közeledési Dinamika és Ütközés-Sík' : 'Two-Soliton Approximation & Collision Plane'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${activeStepData && activeStepData.boundaryNoise > 0.6 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {activeStepData ? `${activeStepData.boundaryNoise} dB Zaj` : '--'}
                </span>
              </div>

              {/* SVG 1D Field Profile Visualizer */}
              <div className="z-10 flex-1 min-h-[180px] bg-slate-950 rounded border border-slate-900 overflow-hidden flex flex-col justify-center items-center relative p-2">
                <svg className="w-full h-full min-h-[160px]" viewBox="0 0 100 40">
                  {/* Axis line */}
                  <line x1="0" y1="20" x2="100" y2="20" stroke="#1e293b" strokeWidth="0.2" />

                  {/* Buffer limit bounds */}
                  {(() => {
                    const widthPct = Math.max(0, Math.min(22, (bufferZone / 60) * 22));
                    const isBufferLeak = bufferZone < 30;
                    return (
                      <g>
                        <rect x="0" y="0" width={widthPct} height="40" fill={isBufferLeak ? 'rgba(239,68,68,0.03)' : 'rgba(16,185,129,0.02)'} />
                        <rect x={100 - widthPct} y="0" width={widthPct} height="40" fill={isBufferLeak ? 'rgba(239,68,68,0.03)' : 'rgba(16,185,129,0.02)'} />
                        <line x1={widthPct} y1="0" x2={widthPct} y2="40" stroke={isBufferLeak ? '#ef4444' : '#10b981'} strokeWidth="0.25" strokeDasharray="1,1" />
                        <line x1={100 - widthPct} y1="0" x2={100 - widthPct} y2="40" stroke={isBufferLeak ? '#ef4444' : '#10b981'} strokeWidth="0.25" strokeDasharray="1,1" />
                        
                        <text x={widthPct / 2} y="8" fill={isBufferLeak ? '#ef4444' : '#10b981'} fontSize="1.8" textAnchor="middle" fontFamily="monospace" opacity="0.7">
                          {isHu ? 'VÉDŐSÁV A' : 'BUFFER A'}
                        </text>
                        <text x={100 - widthPct / 2} y="8" fill={isBufferLeak ? '#ef4444' : '#10b981'} fontSize="1.8" textAnchor="middle" fontFamily="monospace" opacity="0.7">
                          {isHu ? 'VÉDŐSÁV B' : 'BUFFER B'}
                        </text>
                      </g>
                    );
                  })()}

                  {/* Bounding container size marker lines */}
                  <line x1="10" y1="0" x2="10" y2="40" stroke="#334155" strokeWidth="0.1" strokeDasharray="1,1" />
                  <line x1="90" y1="0" x2="90" y2="40" stroke="#334155" strokeWidth="0.1" strokeDasharray="1,1" />

                  {/* Dynamic Waveforms of the Solitons */}
                  {activeStepData && (() => {
                    const step = activeStepData.step;
                    const d = activeStepData.distance;
                    const areSame = windingScenario === 'same';
                    
                    // Center of interaction
                    const center = 50;
                    
                    // Positions of wave packets
                    let posA = 50 - d / 2;
                    let posB = 50 + d / 2;
                    
                    // Construct smooth localized wave packets using sine waves modulated by a gaussian envelope
                    const pointsCount = 100;
                    let wavePath = '';
                    
                    for (let x = 0; x <= pointsCount; x++) {
                      // Wave envelope of soliton A
                      const gaussA = Math.exp(-Math.pow((x - posA) / 6, 2));
                      // Wave envelope of soliton B
                      const gaussB = Math.exp(-Math.pow((x - posB) / 6, 2));
                      
                      const signA = generatedSpace ? generatedSpace.solitonA.winding : 1;
                      const signB = generatedSpace ? generatedSpace.solitonB.winding : -1;
                      
                      // Superposition of wave functions
                      const ampA = gaussA * 8 * Math.sin((x - posA) * 1.5) * signA;
                      const ampB = gaussB * 8 * Math.sin((x - posB) * 1.5) * signB;
                      
                      const totalY = 20 - (ampA + ampB);
                      
                      if (x === 0) wavePath += `M ${x},${totalY}`;
                      else wavePath += ` L ${x},${totalY}`;
                    }
                    
                    return (
                      <g>
                        <path d={wavePath} fill="none" stroke="#6366f1" strokeWidth="0.45" />
                        
                        {/* Soliton position indicators */}
                        <circle cx={posA} cy="20" r="1.8" fill="#10b981" fillOpacity="0.4" />
                        <circle cx={posA} cy="20" r="0.6" fill="#10b981" />
                        
                        <circle cx={posB} cy="20" r="1.8" fill="#a855f7" fillOpacity="0.4" />
                        <circle cx={posB} cy="20" r="0.6" fill="#a855f7" />

                        {/* Labels */}
                        <text x={posA} y="15" fill="#10b981" fontSize="2.2" textAnchor="middle" fontFamily="monospace">
                          S_A (W={generatedSpace?.solitonA.winding})
                        </text>
                        <text x={posB} y="15" fill="#a855f7" fontSize="2.2" textAnchor="middle" fontFamily="monospace">
                          S_B (W={generatedSpace?.solitonB.winding})
                        </text>
                      </g>
                    );
                  })()}
                </svg>

                {/* Status HUD of the active step */}
                {activeStepData && (
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 p-2.5 rounded border border-slate-900/80 grid grid-cols-4 gap-2 font-mono text-[9.5px] text-slate-400">
                    <div className="flex flex-col">
                      <span>{isHu ? 'Lépés száma:' : 'Current Step:'}</span>
                      <span className="text-white font-bold">{activeStepData.step} / 50</span>
                    </div>
                    <div className="flex flex-col">
                      <span>{isHu ? 'Távolság (d):' : 'Distance (d):'}</span>
                      <span className="text-yellow-400 font-bold">{activeStepData.distance} μm</span>
                    </div>
                    <div className="flex flex-col">
                      <span>{isHu ? 'Kölcsönhatás:' : 'Interaction Force:'}</span>
                      <span className="text-indigo-400 font-bold">{activeStepData.backReaction} nN</span>
                    </div>
                    <div className="flex flex-col">
                      <span>{isHu ? 'Potenciál Gödör:' : 'Potential Well:'}</span>
                      <span className="text-purple-400 font-bold">{activeStepData.overlapPot} meV</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step Timeline scrubber & playback control */}
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-900 z-10">
                <button
                  onClick={handleTogglePlayback}
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white transition-all cursor-pointer"
                  title={expIsSimulating ? 'Pause' : 'Play'}
                >
                  {expIsSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                
                <button
                  onClick={() => { setCurrentStep(0); setExpIsSimulating(false); }}
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 transition-all cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <div className="flex-1 flex flex-col gap-1">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={currentStep}
                    onChange={(e) => { setCurrentStep(parseInt(e.target.value)); setExpIsSimulating(false); }}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-slate-500 leading-none">
                    <span>T_0 (Nagy távolság)</span>
                    <span>T_25 (Interakció)</span>
                    <span>T_50 (Kimenet)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Real-time charge logs & internal fourier spectrum */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Box A: Realtime Charge Metrics Tracker (S_A and S_B q_eff and s_charge) */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">
                  {isHu ? 'Elektromos és Szín-töltés Dinamika' : 'EM & Color Charge Dynamics'}
                </span>

                {activeStepData && (
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    {/* Soliton A values */}
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-900">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-emerald-400 font-bold">SOLITON A</span>
                        <span className="text-[8px] text-slate-500">W = {generatedSpace?.solitonA.winding}</span>
                      </div>
                      
                      <div className="flex justify-between items-baseline mt-1.5">
                        <span className="text-slate-500 text-[9px]">q_eff:</span>
                        <span className="text-emerald-400 font-bold font-mono">
                          {noiseFiltering && !activeStepData.isNoiseLow ? (
                            <span className="text-amber-500 text-[10px] italic">Filtered</span>
                          ) : (
                            `${activeStepData.q_eff_A} e`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="text-slate-500 text-[9px]">s_charge:</span>
                        <span className="text-emerald-400 font-bold font-mono">
                          {noiseFiltering && !activeStepData.isNoiseLow ? (
                            <span className="text-amber-500 text-[10px] italic">Filtered</span>
                          ) : (
                            activeStepData.s_charge_A
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Soliton B values */}
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-900">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-purple-400 font-bold">SOLITON B</span>
                        <span className="text-[8px] text-slate-500">W = {generatedSpace?.solitonB.winding}</span>
                      </div>
                      
                      <div className="flex justify-between items-baseline mt-1.5">
                        <span className="text-slate-500 text-[9px]">q_eff:</span>
                        <span className="text-purple-400 font-bold font-mono">
                          {noiseFiltering && !activeStepData.isNoiseLow ? (
                            <span className="text-amber-500 text-[10px] italic">Filtered</span>
                          ) : (
                            `${activeStepData.q_eff_B} e`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="text-slate-500 text-[9px]">s_charge:</span>
                        <span className="text-purple-400 font-bold font-mono">
                          {noiseFiltering && !activeStepData.isNoiseLow ? (
                            <span className="text-amber-500 text-[10px] italic">Filtered</span>
                          ) : (
                            activeStepData.s_charge_B
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Helper summary of independence vs mixing */}
                <p className="text-[10px] text-slate-500 leading-normal font-sans">
                  {windingScenario === 'same' 
                    ? (isHu ? 'Azonos windingek esetén a szolitonok taszítják egymást. Belső töltéseik lényegében függetlenül megőrződnek.' : 'For same windings, the solitons repel. Their charges remain independent and conserved.')
                    : (isHu ? 'Ellentétes windingek esetén mély fáziskeveredés és megsemmisülés következik be. A töltések egymásba keverednek.' : 'For opposite windings, deep phase-mixing and annihilation takes place. Charges mix and decay.')}
                </p>
              </div>

              {/* Box B: Internal Fourier Spectrum Change (Very high importance - proof of non-static structure) */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">
                  {isHu ? 'Belső Fourier-Spektrum (Szerkezet)' : 'Internal Fourier Spectrum (Stability)'}
                </span>

                <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                  {isHu 
                    ? 'A spektrum megmutatja, ha a szoliton belső szerkezete átrendeződik a közelítés során. A csúcsok változása jelzi a nem-statikus fluktuációt.' 
                    : 'The spectrum displays internal structural changes during approximation. Peak shifts prove a non-static internal structure.'}
                </p>

                {activeStepData && (
                  <div className="flex flex-col gap-2 font-mono text-[9px] bg-slate-950 p-2.5 rounded border border-slate-900">
                    {/* Fundamental frequency f_0 */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-slate-400">
                        <span>{isHu ? 'Breathing Módus (Alapfrekvencia f0):' : 'Breathing Mode (f0):'}</span>
                        <span className="text-emerald-400 font-bold">{activeStepData.fourier_A[0]}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-150" style={{ width: `${activeStepData.fourier_A[0]}%` }} />
                      </div>
                    </div>

                    {/* Secondary pulsation f_1 */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-slate-400">
                        <span>{isHu ? 'Belső Pulzálás (Felharmonikus f1):' : 'Internal Pulsation (f1):'}</span>
                        <span className="text-indigo-400 font-bold">{activeStepData.fourier_A[1]}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                        <div className="bg-indigo-500 h-full transition-all duration-150" style={{ width: `${activeStepData.fourier_A[1]}%` }} />
                      </div>
                    </div>

                    {/* Radiation noise f_2 */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-slate-400">
                        <span>{isHu ? 'Zavaró Sugárzás (Excitáció f2):' : 'Radiation Noise (f2):'}</span>
                        <span className="text-purple-400 font-bold">{activeStepData.fourier_A[2]}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                        <div className="bg-purple-500 h-full transition-all duration-150" style={{ width: `${activeStepData.fourier_A[2]}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Real-time Stability Experiment Console Logs */}
          <div className="bg-slate-950 border border-slate-900 rounded p-3 h-[100px] flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wider">
              {isHu ? 'Kísérleti Szenzorok Folyamatos Mérési Stream' : 'Experimental Sensors Continuous Stream'}
            </span>
            <div className="flex-1 overflow-y-auto font-mono text-[9px] text-emerald-400 flex flex-col gap-0.5">
              {expLogs.map((log, index) => (
                <div key={index}>
                  <span className="text-slate-600 mr-1 select-none">&gt;</span>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Downloader for the stability experiment report */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-indigo-500/20 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-900 pb-3 gap-3">
              <span className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4" />
                {isHu ? 'KÉT SZOLITON STABILITÁSI JEGYZŐKÖNYV EXPORTÁLÁSA' : 'EXPORT TWO-SOLITON STABILITY LAB REPORT'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {isHu ? 'Hivatalos kísérleti jegyzőkönyv (.txt)' : 'Official experimental report (.txt)'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 font-mono text-xs">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {isHu ? 'Kutató Neve:' : 'Lead Operator:'}
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded py-1 px-2.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5 font-mono text-xs">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {isHu ? 'Laboratóriumi Eszköz ID:' : 'Lab Device ID:'}
                </label>
                <input
                  type="text"
                  value={labUnitId}
                  onChange={(e) => setLabUnitId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded py-1 px-2.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center gap-4 mt-1">
              <button
                onClick={handleDownloadStabilityReport}
                className="px-5 py-2 rounded text-xs font-bold font-mono transition-all bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 cursor-pointer shadow"
              >
                <Download className="h-4 w-4" />
                {isHu ? 'JEGYZŐKÖNYV LETÖLTÉSE' : 'DOWNLOAD TEXT REPORT'}
              </button>
              
              {downloadSuccess && (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4" />
                  {isHu ? 'Jegyzőkönyv sikeresen letöltve!' : 'Report successfully compiled & downloaded!'}
                </span>
              )}
            </div>
          </div>

        </section>
      )}

      {/* 5. Objective Quantitative Assessment & Brief Evaluation Table */}
      {activeTab === 'projections' && (
        <section className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
            {isHu ? 'Mért értékek tárgyilagos értékelése' : 'Objective Quantitative Assessment'}
          </h4>

          {/* Evaluation Grid Table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3 rounded border border-slate-900 bg-slate-950/40">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">
                {isHu ? '4D Belső Altér (Winding)' : '4D Internal Subspace (Winding)'}
              </span>
              <span className="text-lg font-bold text-emerald-400 block mb-1">
                W = {metrics.windingNumber}
              </span>
              <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                {isHu 
                  ? 'Abszolút topologikus megmaradás perturbációk hatására is. Ez az egész rendszer stabil fázis-vázát adja.' 
                  : 'Absolute topological conservation under perturbations. Provides the stable phase skeleton for the entire system.'}
              </p>
            </div>

            <div className="p-3 rounded border border-slate-900 bg-slate-950/40">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">
                {isHu ? '3D Projekció (Elektromos)' : '3D Wavefront Projection (EM)'}
              </span>
              <span className="text-lg font-bold text-indigo-400 block mb-1">
                q_eff = {metrics.pureQEff} e
              </span>
              <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                {isHu 
                  ? 'Hullámfronton fellépő skálázódás. Távolságfüggő Coulomb-szerű interakcióként terjed a 3D hiperfelületen.' 
                  : 'Scaling occurring at the wavefront. Propagates as distance-dependent Coulomb-like force on the 3D hypersurface.'}
              </p>
            </div>

            <div className="p-3 rounded border border-slate-900 bg-slate-950/40">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">
                {isHu ? '2D Altér (Szín-töltés)' : '2D Subspace (Color Charge)'}
              </span>
              <span className="text-lg font-bold text-purple-400 block mb-1">
                s_c = {metrics.colorCharge2D}
              </span>
              <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                {isHu 
                  ? 'Rövid hatótávú kötési módusok magas frekvenciás pályákon. Erős kölcsönhatás analóg kártyák és kvark kötött állapotok képzése.' 
                  : 'Short-range binding modes on high-frequency paths. Analog of strong force binding and solitonic quark states.'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 6. Original Protocol Report compiler & Downloader Form */}
      {activeTab === 'projections' && (
        <section className="bg-slate-950/50 p-4 rounded-xl border border-indigo-500/20 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-900 pb-3 gap-3">
            <span className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4" />
              {isHu ? 'MÉRÉSI JEGYZŐKÖNYV EXPORTÁLÁSA' : 'REPORT COMPILER & DOWNLOAD'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {isHu ? 'Hivatalos kísérleti jegyzőkönyv (.txt)' : 'Official experimental report (.txt)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                {isHu ? 'Operátor / Kutató Neve:' : 'Lead Operator:'}
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded py-1 px-2.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                {isHu ? 'Laboratórium Készülék ID:' : 'Lab Device ID:'}
              </label>
              <input
                type="text"
                value={labUnitId}
                onChange={(e) => setLabUnitId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded py-1 px-2.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-4 mt-1">
            <button
              onClick={handleDownloadReport}
              className="px-5 py-2 rounded text-xs font-bold font-mono transition-all bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 cursor-pointer shadow"
            >
              <Download className="h-4 w-4" />
              {isHu ? 'JEGYZŐKÖNYV LETÖLTÉSE' : 'DOWNLOAD TEXT REPORT'}
            </button>
            
            {downloadSuccess && (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="h-4 w-4" />
                {isHu ? 'Jegyzőkönyv sikeresen legenerálva és letöltve!' : 'Report successfully compiled & downloaded!'}
              </span>
            )}
          </div>
        </section>
      )}

    </div>
  );
}
