/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Sparkles, 
  Activity, 
  Scale, 
  Orbit, 
  Zap, 
  Info, 
  HelpCircle,
  GitCommit
} from 'lucide-react';
import { Language } from '../i18n';

interface QuantizationSimulatorProps {
  lang?: Language;
}

export default function QuantizationSimulator({ lang = 'hu' }: QuantizationSimulatorProps) {
  // Translate labels locally for clean, self-contained multi-language support
  const text = {
    hu: {
      title: 'Kvantálás & Emergens Tömeg Szimulátor',
      subtitle: 'A határfeltételes kvantáltság és az Einstein-Mach-féle tömeg-emergencia numerikus laboratóriuma',
      tabA: '1. Hiperhéj-Kvantálás (Waveguide)',
      tabADesc: 'A 4D rácsot borító R³ hiperhéj vastagsága (L) mint rezonanciaüreg működik. A szoliton belső rezgési frekvenciái csak ezen vastagság egész számú többszörösei lehetnek, ami természetes kvantálást ad.',
      tabB: '2. Emergens Tömeg-Gödör (Einstein-Mach)',
      tabBDesc: 'A szolitonnak nincs beépített fix tömege. A térben való gerjedése egy önfókuszáló potenciálgödröt váj ki. A lokális tehetetlensége és tömege a teljes rendszer energiakoncepciójából és más tömegek eloszlásából emergál.',
      
      // Mode A Controls
      shellThickness: 'Hiperhéj Vastagsága (L):',
      modeNumber: 'Kvantumszám / Módus (n):',
      waveSpeed: 'Hullámterjedési Sebesség (c):',
      amplitude: 'Gerjesztés Amplitúdója (A):',
      wavePattern: 'Állóhullám-Minta a Hiperhéjban',
      spectrumTitle: 'Diszkrét Frekvencia Spektrum f_m',
      energyState: 'Kvantált Energiaszint (E_n):',
      frequencyLabel: 'Rezonancia Frekvencia (f_n):',
      wavelengthLabel: 'Rezonancia Hullámhossz (λ_n):',
      nodesLabel: 'Csomópontok száma:',

      // Mode B Controls
      couplingStrength: 'Önfókuszáló Csatolás (κ):',
      solitonMass: 'Szoliton Amplitúdó (A_sol):',
      extMassDist: 'Külső Test Távolsága (d):',
      extMassVal: 'Külső Test Tömege (M_ext):',
      etherNoise: 'Vákuum fluktuáció (Kvantumzaj):',
      simSpeed: 'Szimulációs Sebesség:',
      play: 'Lejátszás',
      pause: 'Szünet',
      reset: 'Visszaállítás',

      // Mode B Panel
      fieldPlotTitle: 'Önkonzisztens Mező- és Potenciáltér Eloszlás',
      envelopeLabel: 'Szoliton Hullám-Burok Φ(x)',
      potentialLabel: 'Emergens Potenciálgödör V(x)',
      extPotentialLabel: 'Külső Test Potenciálja',
      effectiveMass: 'Emergens Effektív Tömeg (M_eff):',
      wellDepth: 'Potenciálgödör Mélysége (V_min):',
      localCurvature: 'Lokális Téridő Krüvület (R_riemann):',
      solitonPos: 'Szoliton Koordinátája (x_s):',
      gravForce: 'Ráható feszültség-erő (F_tension):',
      gravityDesc: 'A szoliton mozgását a saját maga által kivájt és a külső test által torzított potenciáltér gradiense határozza meg. Ez a tehetetlenség és a gravitációs vonzás fizikai megfelelője!',
      
      // Explanatory
      noteTitle: 'Tudományos Magyarázat és Analógia',
      noteA: 'A klasszikus kvantummechanikában a részecske egy dobozban elmélet szerint a határoló falak szabnak kényszert a hullámfüggvényre, ami diszkrét energiaszintekhez vezet. Modellünkben ez a kényszer nem egy mesterséges doboz, hanem a 4D bulk tágulása által hátrahagyott R³ hiperfelület fizikai vastagsága (L). Ez azt jelenti, hogy a fizikai kvantáltság a hipertér geometriai kiterjedésének közvetlen, természetes következménye!',
      noteB: 'Az Általános Relativitáselméletben a téridőt az energia-lendület tenzor görbíti. Itt a szoliton Φ hullámmezője lokális öntömörítő feszültséget (κ) hoz létre, ami egy gravitációs gödörként jelenik meg. Mach elve szerint a tehetetlenség a mindenség tömegeloszlásából származik; a szimulációban látható, hogy a külső test jelenléte aszimmetrikussá teszi a potenciálteret, megváltoztatva a szoliton mozgását és belső szerkezetét.'
    },
    en: {
      title: 'Quantization & Emergent Mass Simulator',
      subtitle: 'Numerical laboratory of boundary-induced quantization and Einstein-Mach mass emergence',
      tabA: '1. Hypershell Quantization (Waveguide)',
      tabADesc: 'The thickness (L) of the R³ hypershell covering the 4D bulk acts as a resonant cavity. The soliton\'s internal vibrational frequencies can only be integer multiples of this thickness, giving rise to natural quantization.',
      tabB: '2. Emergent Mass-Well (Einstein-Mach)',
      tabBDesc: 'The soliton does not possess a hardcoded static mass. Its spatial excitation carves out a self-focusing potential well. Its local inertia and mass emerge from the global energy distribution and other mass configurations.',
      
      // Mode A Controls
      shellThickness: 'Hypershell Thickness (L):',
      modeNumber: 'Quantum Number / Mode (n):',
      waveSpeed: 'Wave Propagation Speed (c):',
      amplitude: 'Excitation Amplitude (A):',
      wavePattern: 'Standing Wave Pattern in Hypershell',
      spectrumTitle: 'Discrete Frequency Spectrum f_m',
      energyState: 'Quantized Energy Level (E_n):',
      frequencyLabel: 'Resonance Frequency (f_n):',
      wavelengthLabel: 'Resonance Wavelength (λ_n):',
      nodesLabel: 'Number of Nodes:',

      // Mode B Controls
      couplingStrength: 'Self-Focusing Coupling (κ):',
      solitonMass: 'Soliton Amplitude (A_sol):',
      extMassDist: 'External Body Distance (d):',
      extMassVal: 'External Body Mass (M_ext):',
      etherNoise: 'Vacuum fluctuation (Quantum Noise):',
      simSpeed: 'Simulation Speed:',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',

      // Mode B Panel
      fieldPlotTitle: 'Self-Consistent Field & Potential Distribution',
      envelopeLabel: 'Soliton Wave Envelope Φ(x)',
      potentialLabel: 'Emergent Potential Well V(x)',
      extPotentialLabel: 'External Potential Well',
      effectiveMass: 'Emergent Effective Mass (M_eff):',
      wellDepth: 'Potential Well Depth (V_min):',
      localCurvature: 'Local Spacetime Curvature (R_riemann):',
      solitonPos: 'Soliton Coordinate (x_s):',
      gravForce: 'Tension Force Acting (F_tension):',
      gravityDesc: 'The soliton\'s trajectory is governed by the gradient of the potential field, which is carved by itself and warped by the external mass. This is the physical equivalent of inertia and gravitational attraction!',
      
      // Explanatory
      noteTitle: 'Scientific Explanation and Analogy',
      noteA: 'In classical quantum mechanics, the particle-in-a-box theory imposes boundary constraints on the wave function, leading to discrete energy states. In our model, this constraint is not an artificial box, but the physical thickness (L) of the R³ hypersurface shell left behind by the expanding 4D bulk. This means physical quantization is a direct, natural geometric consequence of hyperspace dimensions!',
      noteB: 'In General Relativity, spacetime is curved by the stress-energy tensor. Here, the soliton\'s Φ wave field generates a local self-focusing tension (κ), appearing as a gravitational potential well. According to Mach\'s principle, inertia arises from the mass distribution of the universe; the simulation demonstrates how a nearby external body warps the potential landscape, altering both the soliton\'s motion and its internal profile.',
    },
    de: {
      title: 'Quantisierung & Emergente Masse Simulator',
      subtitle: 'Numerisches Labor für randwertgesteuerte Quantisierung und Einstein-Mach-Massenemergenz',
      tabA: '1. Hyperhüllen-Quantisierung (Waveguide)',
      tabADesc: 'Die Dicke (L) der R³-Hyperhülle über dem 4D-Bulk wirkt als Resonator. Die internen Schwingungsfrequenzen des Solitons können nur ganzzahlige Vielfache dieser Dicke sein, was zu einer natürlichen Quantisierung führt.',
      tabB: '2. Emergente Massen-Senke (Einstein-Mach)',
      tabBDesc: 'Das Soliton besitzt keine fest vorgegebene statische Masse. Seine räumliche Anregung gräbt eine selbstfokussierende Potenzialsenke. Seine lokale Trägheit und Masse resultieren aus der globalen Energieverteilung.',
      
      // Mode A Controls
      shellThickness: 'Hyperhüllendicke (L):',
      modeNumber: 'Quantenzahl / Modus (n):',
      waveSpeed: 'Wellengeschwindigkeit (c):',
      amplitude: 'Anregungsamplitude (A):',
      wavePattern: 'Stehendes Wellenmuster in der Hyperhülle',
      spectrumTitle: 'Diskretes Frequenzspektrum f_m',
      energyState: 'Quantisierte Energiestufe (E_n):',
      frequencyLabel: 'Resonanzfrequenz (f_n):',
      wavelengthLabel: 'Resonanzwellenlänge (λ_n):',
      nodesLabel: 'Anzahl der Knotenpunkte:',

      // Mode B Controls
      couplingStrength: 'Selbstfokussierende Kopplung (κ):',
      solitonMass: 'Soliton-Amplitude (A_sol):',
      extMassDist: 'Abstand des externen Körpers (d):',
      extMassVal: 'Masse des externen Körpers (M_ext):',
      etherNoise: 'Vakuumfluktuation (Quantenrauschen):',
      simSpeed: 'Simulationsgeschwindigkeit:',
      play: 'Abspielen',
      pause: 'Pause',
      reset: 'Zurücksetzen',

      // Mode B Panel
      fieldPlotTitle: 'Selbstkonsistente Feld- und Potenzialverteilung',
      envelopeLabel: 'Solitonen-Wellenhüllkurve Φ(x)',
      potentialLabel: 'Emergentes Potenzialtal V(x)',
      extPotentialLabel: 'Externes Potenzialtal',
      effectiveMass: 'Emergente effektive Masse (M_eff):',
      wellDepth: 'Potenzialtaltiefe (V_min):',
      localCurvature: 'Lokale Raumzeitkrümmung (R_riemann):',
      solitonPos: 'Soliton-Koordinate (x_s):',
      gravForce: 'Wirksame Spannungskraft (F_tension):',
      gravityDesc: 'Die Bewegung des Solitons wird durch den Gradienten des Potenzialfelds bestimmt, das von ihm selbst erzeugt und durch den externen Körper verzerrt wird. Dies entspricht Trägheit und Gravitationskraft!',
      
      // Explanatory
      noteTitle: 'Wissenschaftliche Erklärung und Analogie',
      noteA: 'In der klassischen Quantenmechanik schränkt die Teilchen-im-Kasten-Theorie die Wellenfunktion durch Grenzwände ein, was zu diskreten Energieniveaus führt. In unserem Modell ist diese Einschränkung kein künstlicher Kasten, sondern die physikalische Dicke (L) der R³-Hyperflächenhülle, die von der expandierenden 4D-Bulk zurückgelassen wird. Physikalische Quantisierung ist somit eine direkte geometrische Konsequenz der Hyperraumdimensionen!',
      noteB: 'In der Allgemeinen Relativitätstheorie wird die Raumzeit durch den Energie-Impuls-Tensor gekrümmt. Hier erzeugt das Φ-Wellenfeld des Solitons eine lokale selbstfokussierende Spannung (κ), die als Gravitationspotenzialtal erscheint. Nach Machs Prinzip resultiert Trägheit aus der Massenverteilung des Universums; die Simulation zeigt, wie ein naher externer Körper die Potenziallandschaft krümmt und so die Bewegung und Struktur des Solitons verändert.',
    }
  }[lang] || {
    title: 'Quantization & Emergent Mass Simulator',
    subtitle: 'Numerical laboratory of boundary-induced quantization and mass emergence',
    tabA: '1. Hypershell Quantization',
    tabADesc: 'The thickness (L) of the R³ hypershell acts as a resonant cavity. The soliton\'s frequencies can only be integer multiples of this thickness, giving natural quantization.',
    tabB: '2. Emergent Mass-Well',
    tabBDesc: 'The soliton has no static mass. Its excitation carves out a self-focusing potential well. Its local inertia and mass emerge from global energy.',
    shellThickness: 'Hypershell Thickness (L):',
    modeNumber: 'Quantum Number / Mode (n):',
    waveSpeed: 'Wave Propagation Speed (c):',
    amplitude: 'Excitation Amplitude (A):',
    wavePattern: 'Standing Wave Pattern in Hypershell',
    spectrumTitle: 'Discrete Frequency Spectrum f_m',
    energyState: 'Quantized Energy Level (E_n):',
    frequencyLabel: 'Resonance Frequency (f_n):',
    wavelengthLabel: 'Resonance Wavelength (λ_n):',
    nodesLabel: 'Number of Nodes:',
    couplingStrength: 'Self-Focusing Coupling (κ):',
    solitonMass: 'Soliton Amplitude (A_sol):',
    extMassDist: 'External Body Distance (d):',
    extMassVal: 'External Body Mass (M_ext):',
    etherNoise: 'Vacuum fluctuation (Quantum Noise):',
    simSpeed: 'Simulation Speed:',
    play: 'Play',
    pause: 'Pause',
    reset: 'Reset',
    fieldPlotTitle: 'Self-Consistent Field & Potential Distribution',
    envelopeLabel: 'Soliton Wave Envelope Φ(x)',
    potentialLabel: 'Emergent Potential Well V(x)',
    extPotentialLabel: 'External Potential Well',
    effectiveMass: 'Emergent Effective Mass (M_eff):',
    wellDepth: 'Potential Well Depth (V_min):',
    localCurvature: 'Local Spacetime Curvature (R_riemann):',
    solitonPos: 'Soliton Coordinate (x_s):',
    gravForce: 'Tension Force Acting (F_tension):',
    gravityDesc: 'The soliton\'s trajectory is governed by the gradient of the potential field, which is carved by itself and warped by the external mass.',
    noteTitle: 'Scientific Explanation and Analogy',
    noteA: 'In classical quantum mechanics, boundaries impose constraints on the wave function. In our model, this constraint is the physical thickness L of the R³ hypersurface shell.',
    noteB: 'In General Relativity, spacetime is curved by energy. Here, the soliton\'s wave field generates local self-focusing tension, appearing as a gravitational potential well.'
  };

  // State Management
  const [activeSubTab, setActiveSubTab] = useState<'quantization' | 'mass'>('quantization');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);

  // Mode A States (Quantization)
  const [shellL, setShellL] = useState<number>(4.0); // Shell thickness L
  const [modeN, setModeN] = useState<number>(2); // Active mode n
  const [waveC, setWaveC] = useState<number>(2.0); // Wave velocity c
  const [ampA, setAmpA] = useState<number>(1.2); // Amplitude A

  // Mode B States (Emergent Mass)
  const [couplingK, setCouplingK] = useState<number>(1.0); // self-focusing coupling kappa
  const [solitonA, setSolitonA] = useState<number>(1.5); // Soliton amplitude
  const [extDist, setExtDist] = useState<number>(8.0); // Distance of external body
  const [extM, setExtM] = useState<number>(2.5); // External body mass
  const [noiseE, setNoiseE] = useState<number>(0.1); // Vacuum fluctuation noise

  // Real-time Simulation Engine variables (stored in states and refs)
  const [time, setTime] = useState<number>(0);
  const [solitonX, setSolitonX] = useState<number>(0.0); // Soliton 1D center position
  const [solitonV, setSolitonV] = useState<number>(0.0); // Soliton velocity
  
  // Canvas refs
  const canvasRefA = useRef<HTMLCanvasElement | null>(null);
  const canvasRefB = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  
  // Reset Simulation values
  const handleReset = () => {
    setTime(0);
    setSolitonX(-3.5); // start slightly to the left of the center
    setSolitonV(0.02); // slight initial push
  };

  // Automatically reset coordinate when toggling tab
  useEffect(() => {
    handleReset();
  }, [activeSubTab]);

  // Derived Values for Mode A (Quantization)
  const wavelength = useMemo(() => {
    return (2 * shellL) / modeN;
  }, [shellL, modeN]);

  const frequency = useMemo(() => {
    return waveC / wavelength;
  }, [waveC, wavelength]);

  const energyLevel = useMemo(() => {
    // Energy in a box: E_n is proportional to (n/L)^2
    return 0.5 * Math.pow((modeN * Math.PI) / shellL, 2) * ampA;
  }, [shellL, modeN, ampA]);

  // Physics Simulation Loop for drawing and integration
  useEffect(() => {
    let lastTime = performance.now();
    let localX = solitonX;
    let localV = solitonV;
    let localT = time;

    const runLoop = () => {
      const now = performance.now();
      const dt = Math.min(0.03, (now - lastTime) / 1000) * simSpeed;
      lastTime = now;

      if (isPlaying) {
        localT += dt * 8; // speed up time visual slightly

        if (activeSubTab === 'mass') {
          // Solve equation of motion for the soliton in the potential well
          // Effective mass from integrated envelope energy: M_eff = A^2 * 1.5
          const mEff = Math.max(0.1, solitonA * solitonA * 1.2 * (1.0 + couplingK * 0.2));

          // Calculate potentials and their gradients at localX
          // External mass is located at +extDist (e.g. fixed at x = extDist / 2)
          const extX = extDist / 2;
          
          // Gravitational potential gradient from external body: F_ext = -dV_ext/dx
          // V_ext(x) = - extM / sqrt((x - extX)^2 + 1.5)
          // dV_ext/dx = extM * (x - extX) / ((x - extX)^2 + 1.5)^1.5
          const dxExt = localX - extX;
          const denomExt = Math.pow(dxExt * dxExt + 1.5, 1.5);
          const forceExt = -extM * dxExt / denomExt;

          // Boundary constraint potential: keep the particle inside the box [-10, 10]
          let forceWall = 0;
          if (localX < -10) {
            forceWall = 3.0 * (-10 - localX);
          } else if (localX > 10) {
            forceWall = 3.0 * (10 - localX);
          }

          // Random quantum vacuum fluctuation jitter (Machian noise)
          const jitter = (Math.random() - 0.5) * noiseE * 0.8;

          // Total force acting on the soliton
          const totalForce = forceExt + forceWall + jitter;

          // Euler-Cromer integration
          localV += (totalForce / mEff) * dt;
          
          // Damping to prevent infinite escape, modeling energy dissipation into the ether
          localV *= Math.exp(-0.15 * dt); 

          localX += localV * dt * 25; // scale up movement for visual smoothness

          // Boundary wrap or clamp
          if (localX < -11) { localX = -11; localV = -localV * 0.5; }
          if (localX > 11) { localX = 11; localV = -localV * 0.5; }

          setSolitonX(localX);
          setSolitonV(localV);
        }
        setTime(localT);
      }

      // Render Canvases
      if (activeSubTab === 'quantization' && canvasRefA.current) {
        drawQuantization(canvasRefA.current, localT);
      } else if (activeSubTab === 'mass' && canvasRefB.current) {
        drawEmergentMass(canvasRefB.current, localX, localV);
      }

      animationFrameId.current = requestAnimationFrame(runLoop);
    };

    animationFrameId.current = requestAnimationFrame(runLoop);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, activeSubTab, simSpeed, shellL, modeN, waveC, ampA, couplingK, solitonA, extDist, extM, noiseE]);

  // Draw Function for Mode A (Quantization)
  const drawQuantization = (canvas: HTMLCanvasElement, t: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Grid background
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Define physical shell boundaries on canvas
    const margin = 50;
    const shellWidth = W - 2 * margin;
    const midY = H / 2;

    // Boundary lines (hyper-walls of width L)
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#6366f1';
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;

    // Left wall
    ctx.beginPath();
    ctx.moveTo(margin, 20);
    ctx.lineTo(margin, H - 20);
    ctx.stroke();

    // Right wall
    ctx.beginPath();
    ctx.moveTo(margin + shellWidth, 20);
    ctx.lineTo(margin + shellWidth, H - 20);
    ctx.stroke();

    // Label boundaries
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px monospace';
    ctx.fillText('x = 0', margin - 12, H - 8);
    ctx.fillText(`x = L (${shellL.toFixed(1)})`, margin + shellWidth - 35, H - 8);

    // Draw Standing Wave Φ(x, t) = Amp * sin(n * pi * x / L) * cos(omega * t)
    const points: [number, number][] = [];
    const step = 2;
    const omega = 2 * Math.PI * frequency;

    ctx.shadowBlur = 15;
    ctx.shadowColor = '#06b6d4';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let px = 0; px <= shellWidth; px += step) {
      const normalizedX = px / shellWidth; // [0, 1]
      // Wave function spatial part
      const spatialPart = Math.sin(modeN * Math.PI * normalizedX);
      // Wave function temporal part
      const temporalPart = Math.cos(omega * t * 0.1);
      
      const waveVal = ampA * 45 * spatialPart * temporalPart;
      const cy = midY + waveVal;
      const cx = margin + px;

      if (px === 0) {
        ctx.moveTo(cx, cy);
      } else {
        ctx.lineTo(cx, cy);
      }
      points.push([cx, cy]);
    }
    ctx.stroke();

    // Draw Envelope line (dashed)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#38bdf844';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    points.forEach(([cx, cy], idx) => {
      const normalizedX = (cx - margin) / shellWidth;
      const envY = midY + ampA * 45 * Math.sin(modeN * Math.PI * normalizedX);
      if (idx === 0) ctx.moveTo(cx, envY);
      else ctx.lineTo(cx, envY);
    });
    ctx.stroke();

    ctx.beginPath();
    points.forEach(([cx, cy], idx) => {
      const normalizedX = (cx - margin) / shellWidth;
      const envY = midY - ampA * 45 * Math.sin(modeN * Math.PI * normalizedX);
      if (idx === 0) ctx.moveTo(cx, envY);
      else ctx.lineTo(cx, envY);
    });
    ctx.stroke();
    ctx.setLineDash([]); // restore solid lines

    // Draw Nodes (zeros of the wave) and Antinodes (maximums)
    ctx.fillStyle = '#f43f5e';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#f43f5e';
    for (let k = 0; k <= modeN; k++) {
      const nodeX = margin + (k / modeN) * shellWidth;
      ctx.beginPath();
      ctx.arc(nodeX, midY, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  };

  // Draw Function for Mode B (Emergent Mass Well)
  const drawEmergentMass = (canvas: HTMLCanvasElement, solX: number, solV: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Grid background
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    const midY = H / 2 - 20;
    const scaleX = W / 24; // map physics domain [-12, 12] to canvas width
    const toCanvasX = (rx: number) => W / 2 + rx * scaleX;
    const toCanvasY = (ry: number) => midY - ry * 60; // scale potential vertically

    // Position of external body
    const extX = extDist / 2;

    // Draw Potential Well V_total(x) = V_self(x) + V_ext(x)
    // and draw Soliton Envelope Phi(x)
    const step = 2;
    ctx.lineWidth = 2.5;

    // 1. Draw External potential well (dashed gold)
    if (extM > 0) {
      ctx.strokeStyle = '#fbbf2455';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      for (let px = 0; px < W; px += step) {
        const rx = (px - W / 2) / scaleX;
        // Gravitational potential: V_ext = - extM / sqrt((x - extX)^2 + 1.5)
        const vExt = -extM / Math.sqrt((rx - extX) * (rx - extX) + 1.5);
        const py = toCanvasY(vExt);
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Draw Total Combined Potential Well (Amber, Filled curve at the bottom)
    ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
    ctx.strokeStyle = '#f59e0b';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#f59e0b33';
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(0));

    for (let px = 0; px < W; px += step) {
      const rx = (px - W / 2) / scaleX;

      // Soliton wave profile: Phi(x) = A * sech(1.2 * (x - x_s))
      const diffS = rx - solX;
      const phiSelf = solitonA / Math.cosh(1.1 * diffS);

      // Self-focusing potential: V_self(x) = - couplingK * Phi(x)^2
      const vSelf = -couplingK * (phiSelf * phiSelf) * 0.4;

      // External potential: V_ext(x)
      const vExt = extM > 0 ? -extM / Math.sqrt((rx - extX) * (rx - extX) + 1.5) * 0.4 : 0;

      // Combined potential
      const vTotal = vSelf + vExt;
      const py = toCanvasY(vTotal);

      ctx.lineTo(px, py);
    }
    ctx.lineTo(W, toCanvasY(0));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Draw Soliton Wave Field Envelope Phi(x) (Cyan neon line)
    ctx.strokeStyle = '#06b6d4';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#06b6d4';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let px = 0; px < W; px += step) {
      const rx = (px - W / 2) / scaleX;
      const diffS = rx - solX;
      // sech(x) profile
      const phiSelf = solitonA / Math.cosh(1.1 * diffS);
      const py = toCanvasY(phiSelf * 0.7); // offset upward slightly or keep positive
      
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw External body locator (Amber circle)
    if (extM > 0) {
      const cx = toCanvasX(extX);
      const cy = toCanvasY(-extM / Math.sqrt(1.5) * 0.4);
      
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx, cy, 6 + extM * 2, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 12 + extM * 3, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = '9px monospace';
      ctx.fillText(`M_ext (${extM.toFixed(1)})`, cx - 30, cy - 12 - extM * 2);
    }

    // Draw Soliton particle-like core locator (Pulse indicator)
    const solCX = toCanvasX(solX);
    const solCY = toCanvasY(solitonA * 0.7);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(solCX, solCY, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Orbit/momentum vector
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(solCX, solCY);
    ctx.lineTo(solCX + solV * 400, solCY);
    ctx.stroke();

    // Particle details overlay
    ctx.fillStyle = '#06b6d4';
    ctx.font = '9px monospace';
    ctx.fillText(`x_s = ${solX.toFixed(2)}`, solCX - 30, solCY - 15);
  };

  // Spectrum bars logic
  const spectrumBars = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const n = i + 1;
      // Wavelength and frequency for each mode index
      const wl = (2 * shellL) / n;
      const freq = waveC / wl;
      const isActive = n === modeN;
      
      // Relative amplitude for visualization: active is high, others have decay
      const amp = isActive ? 0.95 : 0.05 + 0.1 / Math.abs(n - modeN);

      return { n, freq, wl, amp, isActive };
    });
  }, [shellL, modeN, waveC]);

  return (
    <div className="flex flex-col gap-5 bg-slate-950/60 border border-slate-850 p-6 rounded-2xl backdrop-blur-xl relative overflow-hidden">
      
      {/* Decorative vector background */}
      <div className="absolute top-0 right-0 h-40 w-40 bg-sky-500/5 rounded-full blur-[40px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-indigo-500/5 rounded-full blur-[30px] pointer-events-none" />

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-md font-bold tracking-wide text-white uppercase flex items-center gap-2">
            <Orbit className="h-5 w-5 text-sky-400 animate-spin-slow" />
            {text.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {text.subtitle}
          </p>
        </div>

        {/* Local Tab Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 font-mono">
          <button
            onClick={() => setActiveSubTab('quantization')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'quantization'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'hu' ? 'I. Kvantálás' : lang === 'de' ? 'I. Quantisierung' : 'I. Quantization'}
          </button>
          <button
            onClick={() => setActiveSubTab('mass')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'mass'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'hu' ? 'II. Emergens Tömeg' : lang === 'de' ? 'II. Emergente Masse' : 'II. Emergent Mass'}
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: Control Sliders (Col Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-850/80 font-mono text-xs">
          
          <div className="flex items-start gap-2 bg-slate-950/50 p-3 rounded-xl border border-slate-850 text-[11px] text-slate-300 leading-normal mb-1">
            <Info className="h-4 w-4 text-sky-400 flex-shrink-0 mt-0.5" />
            <p>
              {activeSubTab === 'quantization' ? text.tabADesc : text.tabBDesc}
            </p>
          </div>

          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-sky-400" />
            {lang === 'hu' ? 'A RENDSZER PARAMÉTEREI' : lang === 'de' ? 'SYSTEMPARAMETER' : 'SYSTEM CONFIGURATION'}
          </h3>

          {/* Render controls based on selected Tab */}
          {activeSubTab === 'quantization' ? (
            <div className="flex flex-col gap-4">
              {/* Shell Thickness L */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">{text.shellThickness}</span>
                  <span className="text-sky-400 font-bold">{shellL.toFixed(1)} {lang === 'hu' ? 'rács' : 'units'}</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="12.0"
                  step="0.5"
                  value={shellL}
                  onChange={(e) => setShellL(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 h-1 rounded bg-slate-950"
                />
              </div>

              {/* Mode index n */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">{text.modeNumber}</span>
                  <span className="text-sky-400 font-bold">n = {modeN}</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => setModeN(n)}
                      className={`flex-1 py-1 text-center font-bold border rounded-md text-[10px] cursor-pointer transition-all ${
                        modeN === n
                          ? 'bg-sky-500/10 border-sky-400/50 text-sky-400 shadow-md shadow-sky-500/5'
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      n={n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wave Speed c */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/40">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">{text.waveSpeed}</span>
                  <span className="text-indigo-400 font-bold">{waveC.toFixed(1)} c₀</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={waveC}
                  onChange={(e) => setWaveC(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1 rounded bg-slate-950"
                />
              </div>

              {/* Amplitude A */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/40">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">{text.amplitude}</span>
                  <span className="text-emerald-400 font-bold">{ampA.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={ampA}
                  onChange={(e) => setAmpA(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1 rounded bg-slate-950"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Coupling Strength kappa */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">{text.couplingStrength}</span>
                  <span className="text-amber-400 font-bold">κ = {couplingK.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="2.5"
                  step="0.05"
                  value={couplingK}
                  onChange={(e) => setCouplingK(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1 rounded bg-slate-950"
                />
              </div>

              {/* Soliton Amplitude */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">{text.solitonMass}</span>
                  <span className="text-sky-400 font-bold">A_sol = {solitonA.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.1"
                  value={solitonA}
                  onChange={(e) => setSolitonA(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 h-1 rounded bg-slate-950"
                />
              </div>

              {/* External distance */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/40">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">{text.extMassDist}</span>
                  <span className="text-indigo-400 font-bold">d = {extDist.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="14.0"
                  step="0.5"
                  value={extDist}
                  onChange={(e) => setExtDist(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1 rounded bg-slate-950"
                />
              </div>

              {/* External Mass val */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/40">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">{text.extMassVal}</span>
                  <span className="text-rose-400 font-bold">M_ext = {extM.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="5.0"
                  step="0.1"
                  value={extM}
                  onChange={(e) => setExtM(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 h-1 rounded bg-slate-950"
                />
              </div>

              {/* Ether quantum noise */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/40">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">{text.etherNoise}</span>
                  <span className="text-emerald-400 font-bold">ε = {noiseE.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.5"
                  step="0.05"
                  value={noiseE}
                  onChange={(e) => setNoiseE(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1 rounded bg-slate-950"
                />
              </div>
            </div>
          )}

          {/* Engine Controls */}
          <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">{text.simSpeed}</span>
              <div className="flex gap-1.5">
                {[0.5, 1, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimSpeed(speed)}
                    className={`px-2 py-0.5 font-bold rounded border text-[9px] cursor-pointer transition-all ${
                      simSpeed === speed
                        ? 'bg-slate-100 text-slate-950 border-slate-200'
                        : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-2 text-xs transition-all cursor-pointer ${
                  isPlaying 
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/15' 
                    : 'bg-emerald-500 hover:bg-emerald-450 text-slate-950'
                }`}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? text.pause : text.play}
              </button>

              <button
                onClick={handleReset}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-300 font-bold flex items-center justify-center cursor-pointer transition-all"
                title={text.reset}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: Visualizations (Col Span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Main Simulation Panel Canvas */}
          <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-5 relative flex flex-col gap-3">
            <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-sky-400" />
              {activeSubTab === 'quantization' ? text.wavePattern : text.fieldPlotTitle}
            </h3>

            {/* Canvas Block */}
            <div className="bg-slate-950 rounded-xl border border-slate-900 overflow-hidden relative">
              {activeSubTab === 'quantization' ? (
                <canvas 
                  ref={canvasRefA} 
                  width={520} 
                  height={220} 
                  className="w-full h-[220px] block"
                />
              ) : (
                <canvas 
                  ref={canvasRefB} 
                  width={520} 
                  height={220} 
                  className="w-full h-[220px] block"
                />
              )}

              {/* Status floating indicators */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-850 text-[10px] font-mono text-slate-400">
                <span className={`h-1.5 w-1.5 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                {isPlaying ? 'ACTIVE' : 'PAUSED'}
              </div>
            </div>

            {/* Live Stats Overlay and Legends */}
            {activeSubTab === 'quantization' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[10px] bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500">{text.nodesLabel}</span>
                  <span className="text-slate-200 font-bold text-xs">{modeN - 1}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500">{text.wavelengthLabel}</span>
                  <span className="text-sky-400 font-bold text-xs">{wavelength.toFixed(3)} λ₀</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500">{text.frequencyLabel}</span>
                  <span className="text-indigo-400 font-bold text-xs">{frequency.toFixed(3)} Hz</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500">{text.energyState}</span>
                  <span className="text-emerald-400 font-bold text-xs">{energyLevel.toFixed(3)} E₀</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[10px] bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500">{text.effectiveMass}</span>
                  <span className="text-sky-400 font-bold text-xs">
                    {(solitonA * solitonA * 1.2 * (1.0 + couplingK * 0.2)).toFixed(3)} m₀
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500">{text.wellDepth}</span>
                  <span className="text-amber-400 font-bold text-xs">
                    {(-couplingK * solitonA * solitonA * 0.4).toFixed(3)} V_pot
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500">{text.localCurvature}</span>
                  <span className="text-indigo-400 font-bold text-xs">
                    {(couplingK * solitonA * 2.5).toFixed(3)} R
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500">Mellék-hatások:</span>
                  <span className="text-emerald-400 font-bold text-xs">Mach-Effekt</span>
                </div>
              </div>
            )}
          </div>

          {/* SECONDARY CHART: Spectrum / Wave Explanation */}
          {activeSubTab === 'quantization' ? (
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3 font-mono text-xs">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-indigo-400" />
                {text.spectrumTitle}
              </h4>
              
              {/* Discrete Spectrum Visual Bars */}
              <div className="flex items-end justify-between h-32 bg-slate-950 p-4 rounded-xl border border-slate-900 gap-2 pt-8 relative">
                {/* Horizontal reference lines */}
                <div className="absolute left-0 right-0 top-1/4 border-t border-slate-900/60 pointer-events-none" />
                <div className="absolute left-0 right-0 top-2/4 border-t border-slate-900/60 pointer-events-none" />
                <div className="absolute left-0 right-0 top-3/4 border-t border-slate-900/60 pointer-events-none" />

                {spectrumBars.map((bar) => (
                  <div key={bar.n} className="flex-1 flex flex-col items-center gap-1.5 z-10">
                    <div className="w-full relative bg-slate-900 rounded-t overflow-hidden flex items-end" style={{ height: '70px' }}>
                      <div 
                        className={`w-full rounded-t transition-all duration-300 ${
                          bar.isActive 
                            ? 'bg-gradient-to-t from-sky-600 to-sky-400 shadow-lg shadow-sky-500/20' 
                            : 'bg-indigo-950/40'
                        }`}
                        style={{ height: `${bar.amp * 100}%` }}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-0.5 font-mono text-[9px]">
                      <span className={bar.isActive ? 'text-sky-400 font-bold' : 'text-slate-600'}>m={bar.n}</span>
                      <span className="text-[8px] text-slate-500">{bar.freq.toFixed(1)}Hz</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 flex flex-col gap-2 font-sans text-xs">
              <h4 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <GitCommit className="h-4 w-4 text-emerald-400" />
                {lang === 'hu' ? 'A Gravitációs Analógia' : 'The Gravitational Analogy'}
              </h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {text.gravityDesc}
              </p>
              
              <div className="grid grid-cols-3 gap-2 mt-2 font-mono text-[10px]">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 flex flex-col gap-1">
                  <span className="text-slate-500">Φ envelope</span>
                  <span className="text-sky-400 font-semibold flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    {lang === 'hu' ? 'Anyag-Góc' : 'Matter core'}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 flex flex-col gap-1">
                  <span className="text-slate-500">V_tot potential</span>
                  <span className="text-amber-500 font-semibold flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    {lang === 'hu' ? 'Grav. Mező' : 'Grav. Field'}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 flex flex-col gap-1">
                  <span className="text-slate-500">F_tension force</span>
                  <span className="text-indigo-400 font-semibold">
                    d(V_tot)/dx
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* FOOTER EXPLANATORY NOTES */}
      <div className="bg-slate-900/20 border border-slate-850/80 p-5 rounded-2xl flex flex-col gap-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4 text-amber-500" />
          {text.noteTitle}
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          {activeSubTab === 'quantization' ? text.noteA : text.noteB}
        </p>
      </div>

    </div>
  );
}
