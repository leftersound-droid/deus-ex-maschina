/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { parseCoord, GrowingR4Model } from '../model/toyModel';
import { Play, Pause, RotateCcw, Zap, HelpCircle, Activity, Settings, Info, Radio, Sparkles } from 'lucide-react';
import { Language } from '../i18n';

interface HypersurfaceLabProps {
  model: GrowingR4Model;
  lang?: Language;
}

export default function HypersurfaceLab({ model, lang = 'hu' }: HypersurfaceLabProps) {
  // --- Background R4 Parameters (Derived Dynamically) ---
  const V = model.V;
  const stepCount = model.stepCount;

  // 1. Calculate the Root-Mean-Square (RMS) Radius of the emergent R4 wave
  const r4Radius = useMemo(() => {
    const keys = Object.keys(V);
    if (keys.length === 0) return 1.0;
    
    let sumSqRadius = 0;
    let count = 0;
    
    keys.forEach((key) => {
      const val = V[key];
      if (val > 1e-3) {
        const [x0, x1, x2, x3] = parseCoord(key);
        const sqR = x0*x0 + x1*x1 + x2*x2 + x3*x3;
        sumSqRadius += sqR;
        count++;
      }
    });
    
    const rms = count > 0 ? Math.sqrt(sumSqRadius / count) : 1.0;
    // Add a tiny growth based on stepCount to keep it dynamic
    return Math.max(1.0, rms + stepCount * 0.1);
  }, [V, stepCount]);

  // 2. Calculate background total energy
  const r4Energy = useMemo(() => {
    let sum = 0;
    const vals = Object.values(V);
    for (let i = 0; i < vals.length; i++) {
      sum += vals[i];
    }
    return sum || 1e6;
  }, [V]);

  // --- Hypersurface Lab Parameters ---
  const [shellThickness, setShellThickness] = useState<number>(1.2); // Delta R of the hypershell
  const [couplingStrength, setCouplingStrength] = useState<number>(0.8); // Coupling of R4 energy to effective mass
  const [damping, setDamping] = useState<number>(0.02); // Friction coefficient
  const [modelType, setModelType] = useState<'sine-gordon' | 'phi4' | 'linear'>('sine-gordon');
  const [excitationType, setExcitationType] = useState<'single' | 'breather' | 'collision'>('single');
  
  // Simulation speed & play controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [localTime, setLocalTime] = useState<number>(0);

  // Grid dimensions for the local 2D R3 patch
  const L = 32; 
  
  // Field arrays stored in refs for maximum performance in animation frame loop
  const phiRef = useRef<number[][]>(Array.from({ length: L }, () => Array(L).fill(0)));
  const phiOldRef = useRef<number[][]>(Array.from({ length: L }, () => Array(L).fill(0)));
  const forceRef = useRef<number[][]>(Array.from({ length: L }, () => Array(L).fill(0)));

  // Force re-render for visualization
  const [tick, setTick] = useState<number>(0);

  // --- Physics Coupling Calculations ---
  const waveSpeed = useMemo(() => {
    return Math.sqrt(2.5 / Math.max(0.1, shellThickness));
  }, [shellThickness]);

  const energyDensity = useMemo(() => {
    return r4Energy / (1e5 * Math.max(0.1, shellThickness * shellThickness));
  }, [r4Energy, shellThickness]);

  const omega0Sq = useMemo(() => {
    return couplingStrength * 0.5 * (1.0 + Math.tanh(energyDensity - 1.0));
  }, [couplingStrength, energyDensity]);

  const dt = useMemo(() => {
    const maxDt = 1.0 / (waveSpeed * 1.5);
    return Math.min(0.08, maxDt);
  }, [waveSpeed]);

  // Initialize the field with chosen excitation
  const initializeField = (type: 'single' | 'breather' | 'collision', mType: typeof modelType) => {
    const phi = Array.from({ length: L }, () => Array(L).fill(0));
    const phiOld = Array.from({ length: L }, () => Array(L).fill(0));
    
    const mid = L / 2;
    
    if (mType === 'sine-gordon') {
      if (type === 'single') {
        for (let y = 0; y < L; y++) {
          for (let x = 0; x < L; x++) {
            const dist = x - mid;
            const kink = 4.0 * Math.atan(Math.exp(dist * 0.5));
            phi[y][x] = kink;
            phiOld[y][x] = kink;
          }
        }
      } else if (type === 'breather') {
        const vel = 0.35;
        const gamma = 1.0 / Math.sqrt(1.0 - vel * vel);
        const w0 = 1.0;
        const w = w0 * Math.sqrt(1.0 - vel * vel);
        for (let y = 0; y < L; y++) {
          for (let x = 0; x < L; x++) {
            const dx = x - mid;
            const dy = y - mid;
            const r = Math.sqrt(dx*dx + dy*dy);
            const val = 4.0 * Math.atan( (vel * Math.sin(w * 0.0)) / (w * Math.cosh(vel * r * gamma)) );
            phi[y][x] = val;
            phiOld[y][x] = val;
          }
        }
      } else if (type === 'collision') {
        const offset = 8;
        const vel = 0.4;
        const gamma = 1.0 / Math.sqrt(1.0 - vel * vel);
        for (let y = 0; y < L; y++) {
          for (let x = 0; x < L; x++) {
            const x1 = x - (mid - offset);
            const x2 = x - (mid + offset);
            const kink1 = 4.0 * Math.atan(Math.exp(x1 * gamma * 0.5));
            const kink2 = -4.0 * Math.atan(Math.exp(-x2 * gamma * 0.5));
            const val = kink1 + kink2;
            phi[y][x] = val;
            phiOld[y][x] = val;
          }
        }
      }
    } else if (mType === 'phi4') {
      if (type === 'single') {
        for (let y = 0; y < L; y++) {
          for (let x = 0; x < L; x++) {
            const dist = x - mid;
            const val = Math.tanh(dist * 0.4);
            phi[y][x] = val;
            phiOld[y][x] = val;
          }
        }
      } else if (type === 'breather') {
        for (let y = 0; y < L; y++) {
          for (let x = 0; x < L; x++) {
            const dx = x - mid;
            const dy = y - mid;
            const r = Math.sqrt(dx*dx + dy*dy);
            const val = Math.sin(r * 0.3) * Math.exp(-r * 0.08);
            phi[y][x] = val;
            phiOld[y][x] = val;
          }
        }
      } else if (type === 'collision') {
        const offset = 7;
        for (let y = 0; y < L; y++) {
          for (let x = 0; x < L; x++) {
            const x1 = x - (mid - offset);
            const x2 = x - (mid + offset);
            const val = Math.tanh(x1 * 0.5) - Math.tanh(x2 * 0.5) - 1.0;
            phi[y][x] = val;
            phiOld[y][x] = val;
          }
        }
      }
    } else {
      // Linear Klein-Gordon
      if (type === 'single') {
        for (let y = 0; y < L; y++) {
          for (let x = 0; x < L; x++) {
            const dx = x - mid;
            const dy = y - mid;
            const r = Math.sqrt(dx*dx + dy*dy);
            const val = Math.exp(-r*r * 0.06) * 3.0;
            phi[y][x] = val;
            phiOld[y][x] = val;
          }
        }
      } else if (type === 'breather') {
        for (let y = 0; y < L; y++) {
          for (let x = 0; x < L; x++) {
            const dx = x - mid;
            const dy = y - mid;
            const r = Math.sqrt(dx*dx + dy*dy);
            const val = Math.sin(r * 0.5) * Math.exp(-r * 0.06) * 3.0;
            phi[y][x] = val;
            phiOld[y][x] = val;
          }
        }
      } else if (type === 'collision') {
        const offset = 6;
        for (let y = 0; y < L; y++) {
          for (let x = 0; x < L; x++) {
            const dx1 = x - (mid - offset);
            const dx2 = x - (mid + offset);
            const dy = y - mid;
            const r1 = Math.sqrt(dx1*dx1 + dy*dy);
            const r2 = Math.sqrt(dx2*dx2 + dy*dy);
            const val = Math.exp(-r1*r1 * 0.08) * 2.5 + Math.exp(-r2*r2 * 0.08) * 2.5;
            phi[y][x] = val;
            phiOld[y][x] = val;
          }
        }
      }
    }

    phiRef.current = phi;
    phiOldRef.current = phiOld;
    setTick((prev) => prev + 1);
  };

  // Run on mount or when parameters change
  useEffect(() => {
    initializeField(excitationType, modelType);
  }, [excitationType, modelType]);

  // Main simulation integration loop
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    const runStep = () => {
      const phi = phiRef.current;
      const phiOld = phiOldRef.current;
      const force = forceRef.current;
      
      const nextPhi = Array.from({ length: L }, () => Array(L).fill(0));
      const nextForce = Array.from({ length: L }, () => Array(L).fill(0));

      const cSq = waveSpeed * waveSpeed;
      const mSq = omega0Sq;

      // Integrate 2D Wave equation with damping and potential forces
      for (let y = 0; y < L; y++) {
        for (let x = 0; x < L; x++) {
          const val = phi[y][x];
          const valOld = phiOld[y][x];

          // 2D discrete Laplacian (with reflective boundaries)
          const left = x > 0 ? phi[y][x - 1] : val;
          const right = x < L - 1 ? phi[y][x + 1] : val;
          const up = y > 0 ? phi[y - 1][x] : val;
          const down = y < L - 1 ? phi[y + 1][x] : val;
          const laplacian = left + right + up + down - 4 * val;

          // Non-linear Force Term depending on model
          let forceTerm = 0;
          if (modelType === 'sine-gordon') {
            forceTerm = -mSq * Math.sin(val);
          } else if (modelType === 'phi4') {
            forceTerm = -mSq * val * (val * val - 1.0);
          } else {
            forceTerm = -mSq * val; // linear Klein Gordon
          }

          // Finite difference integration with damping friction (Verlet-like)
          // u_new = 2*u - u_old + dt^2 * (c^2 * Lap(u) + Force(u)) - dt * Gamma * (u - u_old)
          const accel = cSq * laplacian + forceTerm;
          const dampingTerm = damping * (val - valOld) / dt;
          
          let nextVal = 2 * val - valOld + dt * dt * accel - dt * dampingTerm;

          // Numerical stabilization clamp to prevent runaway infinity
          if (isNaN(nextVal) || !isFinite(nextVal)) {
            nextVal = 0.0;
          }
          nextPhi[y][x] = nextVal;
        }
      }

      phiOldRef.current = phi;
      phiRef.current = nextPhi;
      forceRef.current = nextForce;
      
      setLocalTime((prev) => prev + dt);
      setTick((prev) => prev + 1);

      animId = requestAnimationFrame(runStep);
    };

    animId = requestAnimationFrame(runStep);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, waveSpeed, omega0Sq, damping, dt, modelType]);

  // Click on grid to induce a perturbation pulse (localized energy wave)
  const handleGridClick = (targetX: number, targetY: number) => {
    const phi = phiRef.current;
    const size = 3;
    const copy = phi.map((row, y) =>
      row.map((val, x) => {
        const dx = x - targetX;
        const dy = y - targetY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist <= size) {
          const strength = modelType === 'sine-gordon' ? Math.PI : 3.0;
          return val + (1.0 - dist / (size + 1)) * strength;
        }
        return val;
      })
    );
    phiRef.current = copy;
    setTick((prev) => prev + 1);
  };

  // Real-time analysis of the wave package
  const analysis = useMemo(() => {
    const phi = phiRef.current;
    let maxAmp = 0;
    let mainX = L/2;
    let mainY = L/2;
    let totalHamiltonian = 0;

    // Find the peak of the soliton and integrate energy density
    const cSq = waveSpeed * waveSpeed;
    const mSq = omega0Sq;

    for (let y = 0; y < L; y++) {
      for (let x = 0; x < L; x++) {
        const val = phi[y][x];
        const valOld = phiOldRef.current[y][x];
        
        const absVal = Math.abs(val);
        if (absVal > maxAmp) {
          maxAmp = absVal;
          mainX = x;
          mainY = y;
        }

        // Numerical derivative for Hamilton energy
        const dtdt = dt * dt;
        const timeDerivative = (val - valOld) / (dt || 0.01);
        
        const left = x > 0 ? phi[y][x - 1] : val;
        const up = y > 0 ? phi[y - 1][x] : val;
        const dx = val - left;
        const dy = val - up;

        let potentialEnergy = 0;
        if (modelType === 'sine-gordon') {
          potentialEnergy = mSq * (1.0 - Math.cos(val));
        } else if (modelType === 'phi4') {
          potentialEnergy = mSq * 0.25 * Math.pow(val * val - 1.0, 2);
        } else {
          potentialEnergy = 0.5 * mSq * val * val;
        }

        const kineticEnergy = 0.5 * timeDerivative * timeDerivative;
        const gradientEnergy = 0.5 * cSq * (dx*dx + dy*dy);

        totalHamiltonian += kineticEnergy + gradientEnergy + potentialEnergy;
      }
    }

    // Measure Full-Width at Half-Maximum (FWHM) of peak
    let fwhmWidth = 0.0;
    if (maxAmp > 0.1) {
      let count = 0;
      const row = phi[mainY];
      const halfMax = maxAmp * 0.5;
      for (let x = 0; x < L; x++) {
        if (Math.abs(row[x]) >= halfMax) {
          count++;
        }
      }
      fwhmWidth = count * 0.6; // Scale down to virtual physical meters
    }

    const solitonWavelength = maxAmp > 0.1 ? fwhmWidth : 4.0 * shellThickness;
    const solitonFrequency = waveSpeed / Math.max(0.2, solitonWavelength);

    return {
      totalEnergy: totalHamiltonian,
      solitonWidth: solitonWavelength,
      solitonFrequency: solitonFrequency,
      peakAmplitude: maxAmp,
      mainX,
      mainY
    };
  }, [tick, waveSpeed, omega0Sq, modelType, shellThickness]);

  // Color mapping for local wave field rendering (gorgeous cyan-rose potential mapping)
  const getFieldColor = (val: number) => {
    const limit = modelType === 'sine-gordon' ? 2 * Math.PI : 2.5;
    const ratio = Math.max(-1, Math.min(1, val / limit)); // Normalize to [-1, 1]
    
    if (ratio >= 0) {
      const r = Math.round(15 + ratio * (244 - 15));
      const g = Math.round(23 + ratio * (63 - 23));
      const b = Math.round(42 + ratio * (94 - 42));
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const absR = Math.abs(ratio);
      const r = Math.round(15 + absR * (14 - 15));
      const g = Math.round(23 + absR * (165 - 23));
      const b = Math.round(42 + absR * (233 - 42));
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Get cross-section array for the 1D chart
  const crossSectionData = useMemo(() => {
    const phi = phiRef.current;
    const midY = Math.min(L - 1, Math.max(0, analysis.mainY));
    const result: { x: number; val: number }[] = [];
    for (let x = 0; x < L; x++) {
      result.push({ x, val: phi[midY][x] });
    }
    return result;
  }, [tick, analysis.mainY]);

  // Translation dictionary for HypersurfaceLab
  const trans = {
    hu: {
      title: 'Hiperfelületi Kísérleti Laboratórium (R³ Szolitonok)',
      subtitle: 'Végezzen lokális fizikai méréseket a táguló 4D gömb R³ határfelületén. Vizsgálja meg a dimenziócsökkenés hatását a hullámcsomagokra!',
      r4Rad: 'Háttér R⁴ Sugár (R):',
      r4En: 'Hiperszféra Energia (E):',
      localC: 'Helyi Fénysebesség (c):',
      effM: 'Effektív tömeg (ω₀²):',
      setup: 'Fizikai Beállítások',
      theoryType: 'Dinamikai Térelmélet:',
      exType: 'Gerjesztési Profil:',
      shellTh: 'Hipertér Héj Vastagság (ΔR):',
      shellDesc: '* Kisebb ΔR → Sűrített hipertér héj, megnövekedett lokális térgörbület & magasabb frekvencia!',
      coupling: 'R⁴ Csatolási Állandó:',
      damping: 'Térsúrlódás / Csillapítás (Γ):',
      instrument: 'Műszeres Leolvasás',
      solitonWl: 'Szoliton Hullámhossz (λ):',
      solitonFr: 'Szoliton Frekvencia (f):',
      peakAmp: 'Lokális Csúcs Amplitúdó:',
      localEn: 'Lokális Térerő Energia (H):',
      gridSlice: 'R³ Térbeli Szelet',
      btnPause: 'SZÜNET',
      btnStart: 'INDÍTÁS',
      btnReset: 'ALAPHELYZET',
      btnPulse: 'IMPULZUS',
      waveProf: '1D Hullámprofil Ψ(x)',
      waveSlice: 'szelet',
      expObs: 'Fizikai megfigyelés:',
      expObsDesc: 'Kattintson a 2D rácsra, hogy tágulási lökéshullámokat seedeljen! Figyelje meg, hogy a táguló magányos csúcsok (szolitonok) nem esnek szét a non-linearitás miatt.',
      scTitle: 'Tudományos Összefüggés: Dimenziócsökkentés & Hullám-Sűrítés',
      scIntro: 'Ebben a laboratóriumban az R⁴ tágulás peremét alkotó vékony R³ héjba zárt fizikai térelméletet szimulálunk. Az elmélet paramétereit közvetlenül a 4D háttér geometriája és feszültsége határozza meg:',
      scTh1: '1. Héjvastagság (ΔR) vs Hullámhossz:',
      scTh1Desc: 'Minél vékonyabb a héj (alacsonyabb ΔR), a lokális térbeli diszperzió annál jobban korlátozódik. A szoliton csomagok sűrűsödnek (hullámhosszuk λ lecsökken), a lokális hullámterjedési sebesség pedig felgyorsul!',
      scTh2: '2. Kozmológiai Idő (t_local):',
      scTh2Desc: 'A lokális időnk nem egy külső paraméter, hanem a háttér R⁴ sugárnövekedésének (R) folyománya. Amikor a 4D rács tágul, az R³ héjban lévő szolitonok hullámfázisa az óramutatóhoz hasonlóun pörög előre!',
      scExp: 'A kísérlet lényege:',
      scExpDesc: 'A nemlineáris Sine-Gordon egyenlet topologikus magányos hullámait (szolitonokat) használja a stabil részecskék modellezésére. A kísérlet szemlélteti és modellezi, hogy a háttérdimenziók fizikai vastagságának manipulálása (például a 4D feszültség által okozott vékonyodás) közvetlenül megváltoztatja ezen hipotetikus részecskék tömegét, rezgési frekvenciáját és fizikai méretét!',
      
      optSG: 'Sine-Gordon (Topologikus Kinkek)',
      optP4: 'Phi-4 (Szimmetriasértő Falak)',
      optKG: 'Lineáris Klein-Gordon (Diszperzív)',
      optSingle: 'Magányos Szoliton Kink',
      optBreather: 'Lüktető Breather (Kötött Állapot)',
      optCollision: 'Kink-Antikink Ütközés'
    },
    en: {
      title: 'Hypersurface Experimental Laboratory (R³ Solitons)',
      subtitle: 'Perform local physical measurements on the R³ boundary of the expanding 4D sphere. Explore the impact of dimensional reduction on wave packets!',
      r4Rad: 'Background R⁴ Radius (R):',
      r4En: 'Hypersphere Energy (E):',
      localC: 'Local Speed of Light (c):',
      effM: 'Effective Mass (ω₀²):',
      setup: 'Physical Parameters',
      theoryType: 'Field Theory Dynamics:',
      exType: 'Excitation Profile:',
      shellTh: 'Hyperspace Shell Thickness (ΔR):',
      shellDesc: '* Smaller ΔR → Compressed hyperspace shell, increased local spatial curvature & higher frequency!',
      coupling: 'R⁴ Coupling Constant:',
      damping: 'Space Friction / Damping (Γ):',
      instrument: 'Instrument Readouts',
      solitonWl: 'Soliton Wavelength (λ):',
      solitonFr: 'Soliton Frequency (f):',
      peakAmp: 'Local Peak Amplitude:',
      localEn: 'Local Field Energy (H):',
      gridSlice: 'R³ Spatial Patch',
      btnPause: 'PAUSE',
      btnStart: 'START',
      btnReset: 'RESET',
      btnPulse: 'PULSE',
      waveProf: '1D Wave Profile Ψ(x)',
      waveSlice: 'slice',
      expObs: 'Physical observation:',
      expObsDesc: 'Click on the 2D grid to seed expansion shockwaves! Observe how the expanding solitary peaks (solitons) do not disperse due to non-linearity.',
      scTitle: 'Scientific Link: Dimension Reduction & Wave Compression',
      scIntro: 'In this laboratory, we simulate a physical field theory confined within the thin R³ boundary shell of the expanding R⁴ space. The parameters are directly determined by the geometry and tension of the 4D bulk:',
      scTh1: '1. Shell Thickness (ΔR) vs Wavelength:',
      scTh1Desc: 'The thinner the shell (lower ΔR), the more localized spatial dispersion is restricted. Soliton packets compress (their wavelength λ decreases), and local wave propagation speed increases!',
      scTh2: '2. Cosmological Time (t_local):',
      scTh2Desc: 'Our local time is not an external parameter, but a consequence of the background R⁴ radius growth (R). As the 4D lattice expands, the wave phase of solitons in the R³ shell ticks forward!',
      scExp: 'Core of the Experiment:',
      scExpDesc: 'The non-linear Sine-Gordon equation uses topological solitary waves (solitons) to model stable particles. The experiment demonstrates and models how manipulating the physical thickness of the background dimensions directly alters their hypothetical mass, oscillation frequency, and physical size!',

      optSG: 'Sine-Gordon (Topological Kinks)',
      optP4: 'Phi-4 (Symmetry-Breaking Walls)',
      optKG: 'Linear Klein-Gordon (Dispersive)',
      optSingle: 'Solitary Soliton Kink',
      optBreather: 'Oscillating Breather (Bound State)',
      optCollision: 'Kink-Antikink Collision'
    },
    de: {
      title: 'Hyperflächen-Versuchslaboratorium (R³-Solitonen)',
      subtitle: 'Führen Sie lokale physikalische Messungen an der R³-Grenzfläche der expandierenden 4D-Kugel durch. Untersuchen Sie den Einfluss der Dimensionsreduktion auf Wellenpakete!',
      r4Rad: 'Hintergrund R⁴-Radius (R):',
      r4En: 'Hypersphären-Energie (E):',
      localC: 'Lokale Lichtgeschwindigkeit (c):',
      effM: 'Effektive Masse (ω₀²):',
      setup: 'Physikalische Parameter',
      theoryType: 'Dynamik der Feldtheorie:',
      exType: 'Anregungsprofil:',
      shellTh: 'Hyperraum-Schalendicke (ΔR):',
      shellDesc: '* Kleineres ΔR → Komprimierte Hyperraumschale, erhöhte lokale Krümmung & höhere Frequenz!',
      coupling: 'R⁴-Kopplungskonstante:',
      damping: 'Raumreibung / Dämpfung (Γ):',
      instrument: 'Instrumentelle Ablesung',
      solitonWl: 'Soliton-Wellenlänge (λ):',
      solitonFr: 'Soliton-Frequenz (f):',
      peakAmp: 'Lokale Spitzenamplitude:',
      localEn: 'Lokale Feldenergie (H):',
      gridSlice: 'R³ Räumliches Gitter',
      btnPause: 'PAUSE',
      btnStart: 'START',
      btnReset: 'RESET',
      btnPulse: 'PULS',
      waveProf: '1D Wellenprofil Ψ(x)',
      waveSlice: 'Schnitt',
      expObs: 'Physikalische Beobachtung:',
      expObsDesc: 'Klicken Sie auf das 2D-Gitter, um Stoßwellen zu erzeugen! Beobachten Sie, wie die expandierenden Solitonen aufgrund der Nichtlinearität stabil bleiben.',
      scTitle: 'Wissenschaftlicher Zusammenhang: Dimensionsreduktion & Wellenkompression',
      scIntro: 'In diesem Labor simulieren wir eine physikalische Feldtheorie, die in der dünnen R³-Grenzschale des expandierenden R⁴-Raums eingeschlossen ist. Die Parameter werden direkt von der Geometrie des 4D-Bulk bestimmt:',
      scTh1: '1. Schalendicke (ΔR) vs. Wellenlänge:',
      scTh1Desc: 'Je dünner die Schale (geringeres ΔR), desto stärker ist die lokale räumliche Dispersion eingeschränkt. Solitonenpakete komprimieren sich (ihre Wellenlänge λ nimmt ab) und die lokale Wellengeschwindigkeit steigt!',
      scTh2: '2. Kosmologische Zeit (t_local):',
      scTh2Desc: 'Unsere lokale Zeit ist kein externer Parameter, sondern eine Folge des R⁴-Radiuswachstums (R). Wenn das 4D-Gitter expandiert, dreht sich die Phase der Solitonen in der R³-Schale vorwärts!',
      scExp: 'Kern des Experiments:',
      scExpDesc: 'Die nichtlineare Sine-Gordon-Gleichung nutzt topologische Solitonen, um stabile Teilchen zu modellieren. Das Experiment veranschaulicht und modelliert, wie eine Manipulation der Dicke der Hintergrunddimensionen direkt Masse, Frequenz und Größe dieser hypothetischen Teilchen verändert!',

      optSG: 'Sine-Gordon (Topologische Kinks)',
      optP4: 'Phi-4 (Symmetriebrechende Wände)',
      optKG: 'Lineares Klein-Gordon (Dispersiv)',
      optSingle: 'Einzelner Solitonen-Kink',
      optBreather: 'Oszillierender Breather (Gebundener Zustand)',
      optCollision: 'Kink-Antikink-Kollision'
    }
  };

  const t = trans[lang] || trans.hu;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-md font-semibold text-slate-100 flex items-center gap-2">
            <Radio className="h-4 w-4 text-sky-400 animate-pulse" />
            {t.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Overview stats derived from R4 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60 text-xs font-mono">
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 uppercase text-[9px] tracking-wider">{t.r4Rad}</span>
          <span className="text-sky-400 font-bold text-sm">
            {r4Radius.toFixed(4)} {lang === 'hu' ? 'rács' : lang === 'de' ? 'Gitter' : 'lattice'}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 uppercase text-[9px] tracking-wider">{t.r4En}</span>
          <span className="text-amber-400 font-bold text-sm">
            {r4Energy.toLocaleString(undefined, { maximumFractionDigits: 0 })} eV
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 uppercase text-[9px] tracking-wider">{t.localC}</span>
          <span className="text-rose-400 font-bold text-sm">
            {waveSpeed.toFixed(4)} c₀
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 uppercase text-[9px] tracking-wider">{t.effM}</span>
          <span className="text-emerald-400 font-bold text-sm">
            {omega0Sq.toFixed(4)} m₀²
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sidebar Controls */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          {/* Simulation setup */}
          <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80 flex flex-col gap-3">
            <h3 className="font-semibold text-slate-200 text-xs mb-1 flex items-center gap-1.5 uppercase tracking-wider">
              <Settings className="h-3.5 w-3.5 text-sky-400" />
              {t.setup}
            </h3>

            {/* Model equation type */}
            <div>
              <label className="text-slate-400 block mb-1 text-[11px]">{t.theoryType}</label>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value as any)}
                className="w-full text-xs font-mono bg-slate-900 border border-slate-800 text-slate-200 py-1.5 px-2.5 rounded focus:outline-none focus:border-sky-500"
              >
                <option value="sine-gordon">{t.optSG}</option>
                <option value="phi4">{t.optP4}</option>
                <option value="linear">{t.optKG}</option>
              </select>
            </div>

            {/* Excitation patterns */}
            <div>
              <label className="text-slate-400 block mb-1 text-[11px]">{t.exType}</label>
              <select
                value={excitationType}
                onChange={(e) => setExcitationType(e.target.value as any)}
                className="w-full text-xs font-mono bg-slate-900 border border-slate-800 text-slate-200 py-1.5 px-2.5 rounded focus:outline-none focus:border-sky-500"
              >
                <option value="single">{t.optSingle}</option>
                <option value="breather">{t.optBreather}</option>
                <option value="collision">{t.optCollision}</option>
              </select>
            </div>

            {/* Thickness slider */}
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-slate-400">{t.shellTh}</span>
                <span className="text-sky-400 font-mono font-bold">{shellThickness.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={shellThickness}
                onChange={(e) => setShellThickness(parseFloat(e.target.value))}
                className="w-full accent-sky-400 bg-slate-900 h-1 rounded shadow-inner"
              />
              <span className="text-[9px] text-slate-500 leading-normal block mt-1">
                {t.shellDesc}
              </span>
            </div>

            {/* Coupling slider */}
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-slate-400">{t.coupling}</span>
                <span className="text-amber-400 font-mono font-bold">{couplingStrength.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.05"
                value={couplingStrength}
                onChange={(e) => setCouplingStrength(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-slate-900 h-1 rounded"
              />
            </div>

            {/* Damping slider */}
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-slate-400">{t.damping}</span>
                <span className="text-rose-400 font-mono font-bold">{damping.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.001"
                max="0.15"
                step="0.005"
                value={damping}
                onChange={(e) => setDamping(parseFloat(e.target.value))}
                className="w-full accent-rose-400 bg-slate-900 h-1 rounded"
              />
            </div>
          </div>

          {/* Real-time measurement readout */}
          <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80 flex flex-col gap-3 text-xs">
            <h3 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              {t.instrument}
            </h3>

            <div className="flex flex-col gap-2.5 font-mono">
              <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                <span className="text-slate-400">{t.solitonWl}</span>
                <span className="font-bold text-sky-400">
                  {analysis.solitonWidth > 0 
                    ? `${analysis.solitonWidth.toFixed(3)} ${lang === 'hu' ? 'rács' : lang === 'de' ? 'Gitter' : 'lattice'}` 
                    : (lang === 'hu' ? 'Nincs stabil csúcs' : lang === 'de' ? 'Kein stabiler Peak' : 'No stable peak')}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                <span className="text-slate-400">{t.solitonFr}</span>
                <span className="font-bold text-rose-400">
                  {analysis.peakAmplitude > 0.05 ? `${analysis.solitonFrequency.toFixed(3)} Hz` : '0.000 Hz'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                <span className="text-slate-400">{t.peakAmp}</span>
                <span className="font-bold text-amber-400">
                  {analysis.peakAmplitude.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-0.5">
                <span className="text-slate-400">{t.localEn}</span>
                <span className="font-bold text-emerald-400">
                  {analysis.totalEnergy.toFixed(4)} J
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Canvas / Visualizer */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            
            {/* 2D Grid Representation */}
            <div className="sm:col-span-3 flex flex-col bg-slate-950/80 rounded-xl border border-slate-800 p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  {t.gridSlice} ({L}×{L})
                </span>
                <span className="text-[10px] font-mono text-slate-500">t_local: {localTime.toFixed(2)}</span>
              </div>

              {/* Main Interactive Canvas Grid */}
              <div className="flex-1 flex items-center justify-center py-2">
                <div 
                  className="grid bg-slate-950 p-1.5 rounded-lg border border-slate-800/80 cursor-crosshair gap-[1px]"
                  style={{
                    gridTemplateColumns: `repeat(${L}, minmax(0, 1fr))`,
                  }}
                >
                  {phiRef.current.map((row, yIdx) =>
                    row.map((val, xIdx) => {
                      const bg = getFieldColor(val);
                      const isCenterOfSoliton = yIdx === analysis.mainY && xIdx === analysis.mainX && analysis.peakAmplitude > 0.1;
                      
                      return (
                        <div
                          key={`${yIdx}-${xIdx}`}
                          onClick={() => handleGridClick(xIdx, yIdx)}
                          className={`w-[7px] h-[7px] sm:w-[9px] sm:h-[9px] rounded-[1px] transition-all hover:scale-125 hover:z-10 ${
                            isCenterOfSoliton ? 'ring-1 ring-white scale-110' : ''
                          }`}
                          style={{ backgroundColor: bg }}
                          title={
                            lang === 'hu'
                              ? `Pozíció x: ${xIdx}, y: ${yIdx}\nTérerő feszültség: ${val.toFixed(3)}`
                              : lang === 'de'
                                ? `Position x: ${xIdx}, y: ${yIdx}\nFeldspannung: ${val.toFixed(3)}`
                                : `Position x: ${xIdx}, y: ${yIdx}\nField tension: ${val.toFixed(3)}`
                          }
                        />
                      );
                    })
                  )}
                </div>
              </div>

              {/* Controls bar */}
              <div className="flex items-center justify-center gap-2.5 mt-3 border-t border-slate-850 pt-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    isPlaying 
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                      : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  }`}
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  {isPlaying ? t.btnPause : t.btnStart}
                </button>

                <button
                  onClick={() => initializeField(excitationType, modelType)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  {t.btnReset}
                </button>

                <button
                  onClick={() => handleGridClick(Math.floor(L/2), Math.floor(L/2))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
                >
                  <Zap className="h-3 w-3" />
                  {t.btnPulse}
                </button>
              </div>
            </div>

            {/* 1D Cross-section Profile */}
            <div className="sm:col-span-2 flex flex-col bg-slate-950/80 rounded-xl border border-slate-800 p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-rose-500" />
                  {t.waveProf}
                </span>
                <span className="text-[9px] font-mono text-slate-500">y = {analysis.mainY} {t.waveSlice}</span>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <svg className="w-full h-[150px] bg-slate-900/30 rounded-lg border border-slate-850 p-1" viewBox="0 0 200 100">
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#334155" strokeDasharray="2,2" />
                  <line x1="0" y1="20" x2="200" y2="20" stroke="#1e293b" strokeWidth="0.5" />
                  <line x1="0" y1="80" x2="200" y2="80" stroke="#1e293b" strokeWidth="0.5" />

                  {(() => {
                    const limit = modelType === 'sine-gordon' ? 2 * Math.PI : 2.5;
                    let path = '';
                    crossSectionData.forEach((d, idx) => {
                      const posX = (d.x / (L - 1)) * 200;
                      const posY = 50 - (d.val / limit) * 40;
                      const boundedY = Math.max(5, Math.min(95, posY));
                      if (idx === 0) {
                        path = `M ${posX} ${boundedY}`;
                      } else {
                        path += ` L ${posX} ${boundedY}`;
                      }
                    });

                    return (
                      <path
                        d={path}
                        fill="none"
                        stroke={modelType === 'sine-gordon' ? '#22d3ee' : '#f43f5e'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    );
                  })()}
                </svg>
              </div>

              <div className="text-[10px] text-slate-400 leading-normal bg-slate-900/40 p-2.5 rounded-lg border border-slate-850 mt-3 font-mono">
                <span className="text-rose-400 font-bold block mb-0.5">{t.expObs}</span>
                {t.expObsDesc}
              </div>
            </div>
          </div>

          {/* Theoretical Breakdown of Solitons on R3 Boundary */}
          <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
              {t.scTitle}
            </h4>
            
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {t.scIntro}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed">
              <div className="bg-slate-900/30 p-2.5 rounded border border-slate-800/40">
                <div className="font-bold text-sky-400 mb-0.5">
                  {t.scTh1}
                </div>
                <p className="text-slate-400">
                  {t.scTh1Desc}
                </p>
              </div>

              <div className="bg-slate-900/30 p-2.5 rounded border border-slate-800/40">
                <div className="font-bold text-emerald-400 mb-0.5">
                  {t.scTh2}
                </div>
                <p className="text-slate-400">
                  {t.scTh2Desc}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-indigo-500/5 p-2.5 rounded-lg border border-indigo-500/10 text-[10px] text-slate-400 leading-normal">
              <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>{t.scExp}</strong> {t.scExpDesc}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
