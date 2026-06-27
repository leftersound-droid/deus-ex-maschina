/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Sparkles, 
  Zap, 
  Scale, 
  Layers, 
  Sliders, 
  Info,
  HelpCircle
} from 'lucide-react';
import { Language } from '../i18n';

interface ThreeBodySimulatorProps {
  lang?: Language;
}

// 3D Vector helpers
interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface BodyState {
  pos: Vec3;
  vel: Vec3;
  w: number;    // 4th dimension for Deus Ex Machina model
  wVel: number; // 4D velocity
  mass: number;
  color: string;
}

type PresetType = 'figure8' | 'lagrange' | 'binary' | 'chaotic';

export default function ThreeBodySimulator({ lang = 'hu' }: ThreeBodySimulatorProps) {
  // Translations inside the component for perfect encapsulation
  const text = {
    hu: {
      title: '3-Test Probléma Összehasonlító Szimulátor',
      subtitle: 'Különböző gravitációs törvények és téridő-modellek összehasonlítása azonos kezdeti feltételek mellett',
      modelNewton: 'Newtoni Gravitáció',
      modelNewtonDesc: 'Klasszikus 1/r² erő. Stabil, determinisztikus pályák, zárt ellipszisek és végtelen ciklusok (pl. Figure-8).',
      modelGR: 'Általános Relativitás (1PN)',
      modelGRDesc: 'Post-Newtoni korrekció. Az elgörbült téridő miatti pálya-precessziót (merkúr-szerű elfordulás) és instabilitást szimulál.',
      modelDEM: 'Deus Ex Machina (ℝ⁴)',
      modelDEMDesc: 'An ℝ⁴ emergent potential model. The bodies are solitons carving out local potential wells. Attraction is not an artificial action-at-a-distance force, but emerges directly from the gradient of the overlapping wave fields and Mach\'s principle.',
      
      preset: 'Pálya preset:',
      presetFigure8: 'Stabil Figure-8 (Nyolcas pálya)',
      presetLagrange: 'Lagrange L4/L5 Háromszög',
      presetBinary: 'Kettőscsillag + Bolygó',
      presetChaotic: 'Káosz Tánc',
      
      paramsTitle: 'Fizikai Paraméterek',
      paramG: 'Gravitációs állandó (G):',
      paramGR: 'Relativisztikus korrekció (α_GR):',
      paramDEMTension: 'Hipertér feszültség (k_tension):',
      paramDEMJitter: 'Kvantum-szerű fluktuáció (ε):',
      
      trailLength: 'Pályavonal hossza:',
      simSpeed: 'Szimulációs sebesség:',
      resetBtn: 'Újraindítás',
      infoTitle: 'Miért térnek el a pályák?',
      infoText: 'Azonos indítási sebességek és koordináták mellett a három fizikai modell drámaian eltérő jövőt eredményez: A Newtoni stabilan kering; az Általános Relativitás (GR) a téridő torzulása miatt precesszál, majd a szoros közelítéseknél kaotikussá válik; a Deus Ex Machina modellben pedig a vonzás nem távolsági erő, hanem az egymás potenciálgödrében való csúszás (potenciálgradiens) eredménye, miközben a w-oszcilláció és a Mach-elv alapján változó tömeg egyedi pálya-rezgéseket okoz.',
      limitationsTitle: 'Elméleti Határok és Lépték-Analógia (Szoliton-Skála)',
      limitationsText: 'Teljesen igaz és kiváló fizikai meglátás: mikroszkopikus méretben egyetlen elemi szoliton önmagában nem képes kimutatható gravitációs térgörbületet létrehozni (nincs elegendő tehetetlen tömeg a klasszikus dinamikai egyenletekhez). Ez a modul egy elméleti spekuláció, egy makroszkopikus lépték-invariáns analógia. Úgy vizsgálja a 3-test problémát, mintha a nagy tömegű kozmikus égitestek maguk is kiterjedt hullámcsomagok (szolitonok) lennének, amelyek az ℝ³ hiperszeleten egymás potenciálgödreibe csúsznak bele, megvalósítva az emergens mezővonzást.',

      ctrlTitle: 'Vezérlők & Időfejlődés',
      btnStop: 'Megállítás',
      btnPlay: 'Indítás',
      pointUnit: 'pont',
      presetStatus: 'Preset állapot:',
      descG: 'Minden modell alapvető gravitációs állandója.',
      descGR: 'A téridő görbületéből adódó relativisztikus precesszió mértéke.',
      descTension: 'A 4. dimenzióból (w) az ℝ³ hiperszeletbe visszahúzó rugalmas erő állandója.',
      descJitter: 'A hipertér hullámfront és az éter fluktuációinak csatolási amplitúdója.'
    },
    en: {
      title: '3-Body Problem Comparison Simulator',
      subtitle: 'Comparing different gravitational laws and spacetime models under identical initial conditions',
      modelNewton: 'Newtonian Gravity',
      modelNewtonDesc: 'Classical 1/r² force. Stable, deterministic orbits, closed ellipses, and infinite loops (e.g., Figure-8).',
      modelGR: 'General Relativity (1PN)',
      modelGRDesc: 'Post-Newtonian correction. Simulates orbital precession (Mercury-like perihelion shift) and spacetime warping instabilities.',
      modelDEM: 'Deus Ex Machina (ℝ⁴)',
      modelDEMDesc: 'An ℝ⁴ emergent potential model. The bodies are solitons carving out local potential wells. Attraction is not an artificial action-at-a-distance force, but emerges directly from the gradient of the overlapping wave fields and Mach\'s principle.',
      
      preset: 'Orbit Preset:',
      presetFigure8: 'Stable Figure-8 Orbit',
      presetLagrange: 'Lagrange L4/L5 Triangle',
      presetBinary: 'Binary Star + Planet',
      presetChaotic: 'Chaotic Dance',
      
      paramsTitle: 'Physical Parameters',
      paramG: 'Gravitational Constant (G):',
      paramGR: 'Relativistic Precession (α_GR):',
      paramDEMTension: 'Hyperspace Tension (k_tension):',
      paramDEMJitter: 'Quantum-like Jitter (ε):',
      
      trailLength: 'Trajectory Trail:',
      simSpeed: 'Simulation Speed:',
      resetBtn: 'Reset Orbit',
      infoTitle: 'Why do the trajectories diverge?',
      infoText: 'Starting with identical velocities and positions, the three physical models produce vastly different futures: Newton orbits eternally; General Relativity (GR) precesses and decays due to spacetime warping; and in our Deus Ex Machina model, attraction is not a hardcoded force, but emerges from solitons sliding down each other\'s potential wells, experiencing dynamic mass scaling via Mach\'s principle.',
      limitationsTitle: 'Theoretical Limitations & Scale Analogy (Soliton-Scale)',
      limitationsText: 'An excellent and physically precise insight: at microscopic/quantum scales, a single elementary soliton does not possess enough mass to carve out a detectable spacetime curvature or govern classic gravitational 3-body dynamics. This module serves as a speculative, macroscopic scale-invariant analogy. It models celestial bodies as extended wave-packet solitons sliding down each other\'s overlapping potential wells in the ℝ³ hypersurface.',

      ctrlTitle: 'Controls & Time Evolution',
      btnStop: 'Pause',
      btnPlay: 'Start',
      pointUnit: 'points',
      presetStatus: 'Preset status:',
      descG: 'Fundamental gravitational constant of all models.',
      descGR: 'Relativistic orbital precession rate due to spacetime curvature.',
      descTension: 'Elastic return force pulling from the 4th dimension (w) back into the ℝ³ hypersurface.',
      descJitter: 'Coupling amplitude of ether and hypersurface wavefront fluctuations.'
    },
    de: {
      title: '3-Körper-Problem Vergleichs-Simulator',
      subtitle: 'Vergleich verschiedener Gravitationsgesetze und Raumzeitmodelle unter identischen Anfangsbedingungen',
      modelNewton: 'Newtonsche Gravitation',
      modelNewtonDesc: 'Klassische 1/r² Kraft. Stabile, deterministische Orbits, geschlossene Ellipsen und unendliche Schleifen (z. B. Figure-8).',
      modelGR: 'Allgemeine Relativität (1PN)',
      modelGRDesc: 'Post-Newtonsche Korrektur. Simuliert Bahnpräzession (Merkur-ähnliche Periheldrehung) und Instabilitäten durch Raumzeit-Krümmung.',
      modelDEM: 'Deus Ex Machina (ℝ⁴)',
      modelDEMDesc: 'An ℝ⁴ emergent potential model. The bodies are solitons carving out local potential wells. Attraction is not an artificial action-at-a-distance force, but emerges directly from the gradient of the overlapping wave fields and Mach\'s principle.',
      
      preset: 'Bahn-Preset:',
      presetFigure8: 'Stabile Figure-8 (Achterbahn)',
      presetLagrange: 'Lagrange L4/L5 Dreieck',
      presetBinary: 'Doppelstern + Planet',
      presetChaotic: 'Chaotischer Tanz',
      
      paramsTitle: 'Physikalische Parameter',
      paramG: 'Gravitationskonstante (G):',
      paramGR: 'Relativistische Korrektur (α_GR):',
      paramDEMTension: 'Hyperraum-Spannung (k_tension):',
      paramDEMJitter: 'Quanten-Fluktuation (ε):',
      
      trailLength: 'Spurlänge:',
      simSpeed: 'Simulations-Geschwindigkeit:',
      resetBtn: 'Zurücksetzen',
      infoTitle: 'Warum weichen die Bahnen ab?',
      infoText: 'Trotz identischer Startgeschwindigkeiten führen die drei physikalischen Modelle zu völlig unterschiedlichen Schicksalen: Newton kreist ewig stabil; die Allgemeine Relativitätstheorie (GR) zeigt Präzession; und das Deus Ex Machina-Modell lässt die Kraft aus dem Gradienten überlappender Solitonen-Potenziale hervorgehen, während die Trägheit dem Machschen Prinzip folgt.',
      limitationsTitle: 'Theoretische Grenzen & Skalenanalogie (Solitonen-Skala)',
      limitationsText: 'Eine hervorragende und physikalisch präzise Erkenntnis: Auf mikroskopischer Ebene besitzt ein einzelnes Elementarsoliton nicht genügend träge Masse, um eine nachweisbare Raumzeitkrümmung zu erzeugen oder klassische Dreikörperdynamiken zu bestimmen. Dieses Modul dient als spekulative, makroskopisch skaleninvariante Analogie. Es modelliert Himmelskörper als ausgedehnte Wellenpaket-Solitonen, die auf der ℝ³-Hyperfläche ineinandergleiten.',

      ctrlTitle: 'Steuerung & Zeitentwicklung',
      btnStop: 'Pause',
      btnPlay: 'Start',
      pointUnit: 'Punkte',
      presetStatus: 'Preset-Status:',
      descG: 'Fundamentale Gravitationskonstante für alle Modelle.',
      descGR: 'Relativistische Bahnpräzessionsrate aufgrund der Raumzeitkrümmung.',
      descTension: 'Elastische Rückholkraft aus der 4. Dimension (w) zurück in die ℝ³-Hyperfläche.',
      descJitter: 'Kopplungsamplitude von Äther- und Hyperflächen-Wellenfrontfluktuationen.'
    }
  }[lang];

  // Simulation parameters
  const [activePreset, setActivePreset] = useState<PresetType>('figure8');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  
  // Physical parameters
  const [G, setG] = useState<number>(1.0);
  const [alphaGR, setAlphaGR] = useState<number>(0.15); // Precession coefficient
  const [kTension, setKTension] = useState<number>(4.0); // 4D return force
  const [epsilonDEM, setEpsilonDEM] = useState<number>(0.12); // Quantum jitter amplitude
  
  // View options
  const [trailLength, setTrailLength] = useState<number>(300);
  const [simSpeed, setSimSpeed] = useState<number>(3); // steps per frame

  // Three models states
  const [newtonianBodies, setNewtonianBodies] = useState<BodyState[]>([]);
  const [grBodies, setGrBodies] = useState<BodyState[]>([]);
  const [demBodies, setDemBodies] = useState<BodyState[]>([]);

  // Trails histories
  const newtonianTrails = useRef<Vec3[][]>([[], [], []]);
  const grTrails = useRef<Vec3[][]>([[], [], []]);
  const demTrails = useRef<Vec3[][]>([[], [], []]);

  // Viewports canvas references
  const canvasNewtonRef = useRef<HTMLCanvasElement | null>(null);
  const canvasGrRef = useRef<HTMLCanvasElement | null>(null);
  const canvasDemRef = useRef<HTMLCanvasElement | null>(null);

  // Define Preset orbits generator
  const getPresetBodies = (preset: PresetType): BodyState[] => {
    const bodies: BodyState[] = [];
    
    // Aesthetic colors
    const colors = ['#38bdf8', '#fb7185', '#34d399']; // Sky blue, Rose, Emerald green

    if (preset === 'figure8') {
      // Classic three body figure-8 parameters
      const m = 1.0;
      // Position parameters
      const x1 = -0.97000436;
      const y1 = 0.24308753;
      // Velocity parameters
      const vx1 = 0.46620531;
      const vy1 = 0.43236573;

      bodies.push({
        pos: { x: x1, y: y1, z: 0 },
        vel: { x: vx1, y: vy1, z: 0 },
        w: 0, wVel: 0, mass: m, color: colors[0]
      });
      bodies.push({
        pos: { x: -x1, y: -y1, z: 0 },
        vel: { x: vx1, y: vy1, z: 0 },
        w: 0.1, wVel: 0.05, mass: m, color: colors[1] // slight w displacement for 4D model
      });
      bodies.push({
        pos: { x: 0, y: 0, z: 0 },
        vel: { x: -2 * vx1, y: -2 * vy1, z: 0 },
        w: -0.1, wVel: -0.05, mass: m, color: colors[2]
      });
    } else if (preset === 'lagrange') {
      // Massive sun (center), heavy planet, small trojan asteroid
      bodies.push({ // Sun
        pos: { x: 0, y: 0, z: 0 },
        vel: { x: 0, y: -0.05, z: 0 },
        w: 0, wVel: 0, mass: 10.0, color: '#f59e0b' // Gold
      });
      bodies.push({ // Jupiter
        pos: { x: 1.8, y: 0, z: 0 },
        vel: { x: 0, y: 2.3, z: 0 },
        w: 0.05, wVel: 0.02, mass: 1.0, color: colors[0]
      });
      const angle = Math.PI / 3; // 60 deg
      const dist = 1.8;
      bodies.push({
        pos: { x: dist * Math.cos(angle), y: dist * Math.sin(angle), z: 0 },
        // circular orbit velocity vector
        vel: { x: -2.3 * Math.sin(angle) * 1.03, y: 2.3 * Math.cos(angle) * 1.03, z: 0 },
        w: -0.05, wVel: -0.02, mass: 0.01, color: colors[1]
      });
    } else if (preset === 'binary') {
      // Two massive stars orbiting each other, and a lighter planet orbiting further away
      bodies.push({
        pos: { x: -0.7, y: 0, z: 0 },
        vel: { x: 0, y: -1.2, z: 0 },
        w: 0.02, wVel: 0.01, mass: 3.0, color: '#f43f5e'
      });
      bodies.push({
        pos: { x: 0.7, y: 0, z: 0 },
        vel: { x: 0, y: 1.2, z: 0 },
        w: -0.02, wVel: -0.01, mass: 3.0, color: '#ec4899'
      });
      bodies.push({
        pos: { x: 2.2, y: 0, z: 0 },
        vel: { x: 0, y: 2.1, z: 0 },
        w: 0.1, wVel: 0.08, mass: 0.05, color: colors[0]
      });
    } else {
      // Chaotic Dance
      bodies.push({
        pos: { x: -0.8, y: 0.5, z: 0 },
        vel: { x: 0.5, y: -0.5, z: 0 },
        w: 0.05, wVel: 0.02, mass: 2.0, color: colors[0]
      });
      bodies.push({
        pos: { x: 0.8, y: 0.3, z: 0 },
        vel: { x: -0.4, y: 0.8, z: 0 },
        w: -0.05, wVel: -0.02, mass: 1.5, color: colors[1]
      });
      bodies.push({
        pos: { x: 0.1, y: -0.8, z: 0 },
        vel: { x: -0.1, y: -0.3, z: 0 },
        w: 0, wVel: 0, mass: 1.8, color: colors[2]
      });
    }

    return bodies;
  };

  // Re-initialize all three simulations
  const initializeAllModels = (preset: PresetType) => {
    const fresh = getPresetBodies(preset);
    
    // Deep clone for all models
    setNewtonianBodies(JSON.parse(JSON.stringify(fresh)));
    setGrBodies(JSON.parse(JSON.stringify(fresh)));
    setDemBodies(JSON.parse(JSON.stringify(fresh)));

    // Clear trails
    newtonianTrails.current = [[], [], []];
    grTrails.current = [[], [], []];
    demTrails.current = [[], [], []];
  };

  // Trigger init on preset change
  useEffect(() => {
    initializeAllModels(activePreset);
  }, [activePreset]);

  // Run physical update loop
  useEffect(() => {
    if (!isPlaying) return;

    let animFrame: number;
    const dt = 0.005; // integrator step size

    const runPhysicsStep = () => {
      // We run several sub-steps per animation frame to keep it smooth and physically accurate
      for (let step = 0; step < simSpeed; step++) {
        // --- 1. NEWTONIAN UPDATE ---
        setNewtonianBodies((prev) => {
          const next = prev.map(b => ({ ...b, pos: { ...b.pos }, vel: { ...b.vel } }));
          // Calculate accelerations
          const accs: Vec3[] = next.map(() => ({ x: 0, y: 0, z: 0 }));
          
          for (let i = 0; i < next.length; i++) {
            for (let j = 0; j < next.length; j++) {
              if (i === j) continue;
              const dx = next[j].pos.x - next[i].pos.x;
              const dy = next[j].pos.y - next[i].pos.y;
              const dz = next[j].pos.z - next[i].pos.z;
              const distSq = dx*dx + dy*dy + dz*dz + 1e-4;
              const dist = Math.sqrt(distSq);
              // Newtonian F = G*m1*m2 / r^2
              const forceMag = (G * next[j].mass) / (distSq * dist);
              
              accs[i].x += forceMag * dx;
              accs[i].y += forceMag * dy;
              accs[i].z += forceMag * dz;
            }
          }

          // Apply updates (Symplectic Euler)
          for (let i = 0; i < next.length; i++) {
            next[i].vel.x += accs[i].x * dt;
            next[i].vel.y += accs[i].y * dt;
            next[i].vel.z += accs[i].z * dt;
            
            next[i].pos.x += next[i].vel.x * dt;
            next[i].pos.y += next[i].vel.y * dt;
            next[i].pos.z += next[i].vel.z * dt;

            // Record trail
            if (step === 0) {
              const trail = newtonianTrails.current[i];
              trail.push({ x: next[i].pos.x, y: next[i].pos.y, z: next[i].pos.z });
              if (trail.length > trailLength) trail.shift();
            }
          }
          return next;
        });

        // --- 2. GENERAL RELATIVITY (1PN Precession) UPDATE ---
        setGrBodies((prev) => {
          const next = prev.map(b => ({ ...b, pos: { ...b.pos }, vel: { ...b.vel } }));
          const accs: Vec3[] = next.map(() => ({ x: 0, y: 0, z: 0 }));

          for (let i = 0; i < next.length; i++) {
            for (let j = 0; j < next.length; j++) {
              if (i === j) continue;
              const dx = next[j].pos.x - next[i].pos.x;
              const dy = next[j].pos.y - next[i].pos.y;
              const dz = next[j].pos.z - next[i].pos.z;
              const distSq = dx*dx + dy*dy + dz*dz + 1e-4;
              const dist = Math.sqrt(distSq);
              
              // Post-Newtonian correction multiplier: (1 + 3 * alpha / r^2)
              // It models the general relativistic Schwarzschild precession elegantly
              const grMultiplier = 1.0 + (3.0 * alphaGR) / distSq;
              const forceMag = (G * next[j].mass * grMultiplier) / (distSq * dist);
              
              accs[i].x += forceMag * dx;
              accs[i].y += forceMag * dy;
              accs[i].z += forceMag * dz;
            }
          }

          for (let i = 0; i < next.length; i++) {
            next[i].vel.x += accs[i].x * dt;
            next[i].vel.y += accs[i].y * dt;
            next[i].vel.z += accs[i].z * dt;
            
            next[i].pos.x += next[i].vel.x * dt;
            next[i].pos.y += next[i].vel.y * dt;
            next[i].pos.z += next[i].vel.z * dt;

            if (step === 0) {
              const trail = grTrails.current[i];
              trail.push({ x: next[i].pos.x, y: next[i].pos.y, z: next[i].pos.z });
              if (trail.length > trailLength) trail.shift();
            }
          }
          return next;
        });

        // --- 3. DEUS EX MACHINA (ℝ⁴ / Cosmic Tension) UPDATE ---
        setDemBodies((prev) => {
          const next = prev.map(b => ({ 
            ...b, 
            pos: { ...b.pos }, 
            vel: { ...b.vel },
            w: b.w,
            wVel: b.wVel
          }));
          const accs: Vec3[] = next.map(() => ({ x: 0, y: 0, z: 0 }));
          const wAccs: number[] = next.map(() => 0);

          for (let i = 0; i < next.length; i++) {
            // Apply cosmic tension pulling back to the r3 hypersurface (w = 0)
            wAccs[i] -= kTension * next[i].w;

            for (let j = 0; j < next.length; j++) {
              if (i === j) continue;
              const dx = next[j].pos.x - next[i].pos.x;
              const dy = next[j].pos.y - next[i].pos.y;
              const dz = next[j].pos.z - next[i].pos.z;
              const dw = next[j].w - next[i].w;

              // 4D distance
              const distSq4D = dx*dx + dy*dy + dz*dz + dw*dw + 1e-4;
              const dist4D = Math.sqrt(distSq4D);

              // Gravitational interaction in ℝ⁴ arises from the gradient of the overlapping potential field:
              // V_j(r) = -G * m_eff_j * sech^2(beta * r)
              // The negative gradient of this potential gives the force:
              // force_magnitude = 2 * beta * G * m_eff_j * sech^2(beta * r) * tanh(beta * r) / r
              // Soliton inverse width parameter
              const beta = 0.45;
              const u = beta * dist4D;
              const coshU = Math.cosh(u);
              const sech = 1.0 / coshU;
              const sechSq = sech * sech;
              const tanh = Math.tanh(u);

              // Mass fluctuates with w-position (wave coupling to the hypersurface)
              const massOscillationJ = 1.0 + epsilonDEM * Math.sin(5.0 * next[j].w);
              const mEffJ = next[j].mass * massOscillationJ;

              // We introduce a scaling factor of 2.2 to align the typical force strength with Newtonian
              // gravity at orbital scales, enabling semi-stable and beautiful comparative trajectories.
              const scaleFactor = 2.2;
              const forceMag = (scaleFactor * 2.0 * beta * G * mEffJ * sechSq * tanh) / dist4D;

              accs[i].x += forceMag * dx;
              accs[i].y += forceMag * dy;
              accs[i].z += forceMag * dz;
              wAccs[i] += forceMag * dw;
            }
          }

          for (let i = 0; i < next.length; i++) {
            // Update 3D coordinates
            next[i].vel.x += accs[i].x * dt;
            next[i].vel.y += accs[i].y * dt;
            next[i].vel.z += accs[i].z * dt;
            
            next[i].pos.x += next[i].vel.x * dt;
            next[i].pos.y += next[i].vel.y * dt;
            next[i].pos.z += next[i].vel.z * dt;

            // Update 4D coordinate (w)
            next[i].wVel += wAccs[i] * dt;
            // slight damping in the 4th dimension representing cosmic friction/relaxation
            next[i].wVel *= 0.995; 
            next[i].w += next[i].wVel * dt;

            if (step === 0) {
              const trail = demTrails.current[i];
              trail.push({ x: next[i].pos.x, y: next[i].pos.y, z: next[i].pos.z });
              if (trail.length > trailLength) trail.shift();
            }
          }
          return next;
        });
      }

      // Draw the viewports
      drawViewports();
      animFrame = requestAnimationFrame(runPhysicsStep);
    };

    // Main render function for canvas
    const drawViewports = () => {
      // 1. Draw Newton
      drawCanvas(canvasNewtonRef.current, newtonianBodies, newtonianTrails.current, 'Newtonian');
      // 2. Draw GR
      drawCanvas(canvasGrRef.current, grBodies, grTrails.current, 'GR');
      // 3. Draw DEM
      drawCanvas(canvasDemRef.current, demBodies, demTrails.current, 'DeusExMachina');
    };

    const drawCanvas = (
      canvas: HTMLCanvasElement | null, 
      bodies: BodyState[], 
      trails: Vec3[][],
      modelName: string
    ) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear with slight alpha to leave a tiny glow
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Draw starry ambient background grid
      ctx.strokeStyle = '#1e293b50';
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Origin center
      const cx = width / 2;
      const cy = height / 2;
      
      // Determine viewport scale based on preset to keep everything visible
      let scale = 110;
      if (activePreset === 'lagrange') scale = 80;
      if (activePreset === 'binary') scale = 75;
      if (activePreset === 'chaotic') scale = 100;

      // Draw trails
      for (let i = 0; i < trails.length; i++) {
        const trail = trails[i];
        if (trail.length < 2) continue;

        ctx.beginPath();
        ctx.strokeStyle = bodies[i]?.color || '#ffffff';
        ctx.lineWidth = 1.5;
        
        // Dynamic fading trail
        for (let j = 0; j < trail.length; j++) {
          const pt = trail[j];
          const px = cx + pt.x * scale;
          const py = cy + pt.y * scale;

          if (j === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        
        // Add glowing gradient alpha to trail
        ctx.globalAlpha = 0.45;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // Draw 4th dimension (w) waves ripple overlay for Deus Ex Machina model
      if (modelName === 'DeusExMachina') {
        ctx.save();
        ctx.strokeStyle = '#6366f115';
        ctx.lineWidth = 1.0;
        bodies.forEach((b) => {
          // Draw expanding wave representing the 4D potential disturbance
          const radius = Math.abs(b.w) * scale * 4.0;
          if (radius > 1) {
            ctx.beginPath();
            ctx.arc(cx + b.pos.x * scale, cy + b.pos.y * scale, radius, 0, Math.PI * 2);
            ctx.stroke();
          }
        });
        ctx.restore();
      }

      // Draw Bodies
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        const px = cx + b.pos.x * scale;
        const py = cy + b.pos.y * scale;

        // Draw body glow
        const gradient = ctx.createRadialGradient(px, py, 1, px, py, 18);
        gradient.addColorStop(0, b.color);
        gradient.addColorStop(0.2, b.color + '50');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, 18, 0, Math.PI * 2);
        ctx.fill();

        // Draw body core
        ctx.fillStyle = b.color;
        ctx.beginPath();
        // Mass-proportional size, bounded
        const r = Math.max(3.5, Math.min(10, 3 + Math.sqrt(b.mass) * 1.5));
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();

        // Add white inner highlight for massive objects
        if (b.mass > 2.0) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(px - r/3, py - r/3, r/3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    animFrame = requestAnimationFrame(runPhysicsStep);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, G, alphaGR, kTension, epsilonDEM, trailLength, simSpeed, activePreset, newtonianBodies, grBodies, demBodies]);

  // Adjust canvas dimension for retina displays on mount
  useEffect(() => {
    const handleResize = () => {
      [canvasNewtonRef, canvasGrRef, canvasDemRef].forEach((ref) => {
        if (ref.current) {
          ref.current.width = ref.current.clientWidth;
          ref.current.height = 240;
        }
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div id="three-body-comparison" className="flex flex-col gap-6 bg-slate-900/10 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
      
      {/* Title & Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            {text.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            {text.subtitle}
          </p>
        </div>

        {/* Orbit Preset Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 rounded-xl p-1 text-xs font-mono">
          <span className="text-[10px] text-slate-500 px-2 font-bold uppercase">{text.preset}</span>
          {(['figure8', 'lagrange', 'binary', 'chaotic'] as const).map((pr) => (
            <button
              key={pr}
              onClick={() => setActivePreset(pr)}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                activePreset === pr
                  ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/15'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {pr === 'figure8' ? text.presetFigure8.split(' ')[1] || 'Figure-8' : pr === 'lagrange' ? 'Lagrange' : pr === 'binary' ? 'Binary' : text.presetChaotic.split(' ')[1] || 'Chaos'}
            </button>
          ))}
        </div>
      </div>

      {/* Viewport Canvas Grid (3 side-by-side viewports) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Newton Viewport */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 flex flex-col gap-2 relative group overflow-hidden">
          <div className="absolute top-3 left-3 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 z-10 flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-sky-400">
            <Scale className="h-3.5 w-3.5 text-sky-400" />
            {text.modelNewton}
          </div>
          <canvas 
            ref={canvasNewtonRef}
            className="w-full h-[240px] rounded-lg bg-[#050811] border border-slate-900 shadow-inner cursor-crosshair"
          />
          <div className="text-[10px] text-slate-400 leading-relaxed font-mono p-1 bg-slate-950/40 rounded border border-slate-900/60 min-h-[44px]">
            {text.modelNewtonDesc}
          </div>
        </div>

        {/* General Relativity Viewport */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 flex flex-col gap-2 relative group overflow-hidden">
          <div className="absolute top-3 left-3 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 z-10 flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-rose-400">
            <Zap className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
            {text.modelGR}
          </div>
          <canvas 
            ref={canvasGrRef}
            className="w-full h-[240px] rounded-lg bg-[#050811] border border-slate-900 shadow-inner cursor-crosshair"
          />
          <div className="text-[10px] text-slate-400 leading-relaxed font-mono p-1 bg-slate-950/40 rounded border border-slate-900/60 min-h-[44px]">
            {text.modelGRDesc}
          </div>
        </div>

        {/* Deus Ex Machina Viewport */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 flex flex-col gap-2 relative group overflow-hidden">
          <div className="absolute top-3 left-3 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 z-10 flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            {text.modelDEM}
          </div>
          <canvas 
            ref={canvasDemRef}
            className="w-full h-[240px] rounded-lg bg-[#050811] border border-slate-900 shadow-inner cursor-crosshair"
          />
          <div className="text-[10px] text-slate-400 leading-relaxed font-mono p-1 bg-slate-950/40 rounded border border-slate-900/60 min-h-[44px]">
            {text.modelDEMDesc}
          </div>
        </div>

      </div>

      {/* Control Panels & Adjustable Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Side: General Controls (Col 4) */}
        <div className="md:col-span-4 bg-slate-950/40 rounded-xl border border-slate-850 p-4 flex flex-col gap-3 justify-between">
          <div className="flex flex-col gap-3 text-xs font-mono">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
              <Sliders className="h-3.5 w-3.5 text-indigo-400" />
              {text.ctrlTitle}
            </h3>

            {/* Play/Pause & Reset Row */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-semibold text-xs shadow-md transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-indigo-500 text-white hover:bg-indigo-400'
                }`}
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-slate-950" /> : <Play className="h-4 w-4 fill-white" />}
                {isPlaying ? text.btnStop : text.btnPlay}
              </button>

              <button
                onClick={() => initializeAllModels(activePreset)}
                className="flex items-center justify-center p-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300 transition-colors cursor-pointer"
                title={text.resetBtn}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Sim Speed Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{text.simSpeed}</span>
                <span className="text-indigo-400 font-bold">{simSpeed}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={simSpeed}
                onChange={(e) => setSimSpeed(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1 rounded-lg bg-slate-900"
              />
            </div>

            {/* Trail Length Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{text.trailLength}</span>
                <span className="text-indigo-400 font-bold">{trailLength} {text.pointUnit}</span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                step="50"
                value={trailLength}
                onChange={(e) => setTrailLength(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1 rounded-lg bg-slate-900"
              />
            </div>
          </div>
          
          <div className="text-[10px] text-slate-500 font-mono bg-slate-950/80 p-2 border border-slate-900 rounded">
            <strong>{text.presetStatus}</strong> {
              activePreset === 'figure8' ? text.presetFigure8 :
              activePreset === 'lagrange' ? text.presetLagrange :
              activePreset === 'binary' ? text.presetBinary :
              text.presetChaotic
            }
          </div>
        </div>

        {/* Right Side: Physical Constants (Col 8) */}
        <div className="md:col-span-8 bg-slate-950/40 rounded-xl border border-slate-850 p-4 flex flex-col gap-3 font-mono text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
            <Settings className="h-3.5 w-3.5 text-indigo-400" />
            {text.paramsTitle}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Constant G */}
            <div className="flex flex-col gap-1.5 bg-slate-950/50 p-3 rounded-lg border border-slate-900">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-bold">{text.paramG}</span>
                <span className="text-sky-400 font-bold">{G.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.05"
                value={G}
                onChange={(e) => setG(parseFloat(e.target.value))}
                className="w-full accent-sky-400 h-1 rounded-lg bg-slate-900"
              />
              <span className="text-[9px] text-slate-500">{text.descG}</span>
            </div>

            {/* Relativistic Alpha */}
            <div className="flex flex-col gap-1.5 bg-slate-950/50 p-3 rounded-lg border border-slate-900">
              <div className="flex justify-between text-[11px]">
                <span className="text-rose-400 font-bold">{text.paramGR}</span>
                <span className="text-rose-400 font-bold">{alphaGR.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.80"
                step="0.01"
                value={alphaGR}
                onChange={(e) => setAlphaGR(parseFloat(e.target.value))}
                className="w-full accent-rose-500 h-1 rounded-lg bg-slate-900"
              />
              <span className="text-[9px] text-slate-500">{text.descGR}</span>
            </div>

            {/* DEM Tension (k_tension) */}
            <div className="flex flex-col gap-1.5 bg-slate-950/50 p-3 rounded-lg border border-slate-900">
              <div className="flex justify-between text-[11px]">
                <span className="text-emerald-400 font-bold">{text.paramDEMTension}</span>
                <span className="text-emerald-400 font-bold">{kTension.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.5"
                value={kTension}
                onChange={(e) => setKTension(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1 rounded-lg bg-slate-900"
              />
              <span className="text-[9px] text-slate-500">{text.descTension}</span>
            </div>

            {/* DEM Jitter (epsilon) */}
            <div className="flex flex-col gap-1.5 bg-slate-950/50 p-3 rounded-lg border border-slate-900">
              <div className="flex justify-between text-[11px]">
                <span className="text-amber-400 font-bold">{text.paramDEMJitter}</span>
                <span className="text-amber-400 font-bold">{(epsilonDEM * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.50"
                step="0.02"
                value={epsilonDEM}
                onChange={(e) => setEpsilonDEM(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1 rounded-lg bg-slate-900"
              />
              <span className="text-[9px] text-slate-500">{text.descJitter}</span>
            </div>

          </div>
        </div>

      </div>

      {/* Explanatory Callout Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-indigo-300">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-indigo-400" />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-slate-200">{text.infoTitle}</span>
            <span>{text.infoText}</span>
          </div>
        </section>

        <section className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-amber-300">
          <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-400" />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-slate-200">{text.limitationsTitle}</span>
            <span>{text.limitationsText}</span>
          </div>
        </section>
      </div>

    </div>
  );
}
