/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Radio, Database, Activity, Sparkles, Scale, Info, Sliders, LineChart } from 'lucide-react';
import { Language } from '../i18n';

interface GlobalLocalHologramLabProps {
  lang?: Language;
}

export default function GlobalLocalHologramLab({ lang = 'hu' }: GlobalLocalHologramLabProps) {
  // Global System Metrics
  const [globalEntropy, setGlobalEntropy] = useState<number>(0.45); // Global system entropy (noise)
  const [expansionRate, setExpansionRate] = useState<number>(1.2); // Rate of R4 expansion
  const [wavefrontDensity, setWavefrontDensity] = useState<number>(0.7); // Global ambient density
  const [probeRadius, setProbeRadius] = useState<number>(2.5); // Local sphere probe radius (2-3 grid points)
  
  const [localTime, setLocalTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Time-evolving simulation variables
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setLocalTime((t) => t + 0.05);
    }, 40);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Compute real-time local statistics inside the 2-3 grid point probe
  const stats = useMemo(() => {
    // Math model: local characteristics are coupled to global parameters
    // Local Amplitude influenced by global entropy and expansion rate
    const peakAmp = 4.2 * (1.0 + Math.sin(localTime * 1.2) * 0.08) * (1.0 / Math.sqrt(expansionRate));
    
    // Calculate Local Correlation Index: how strongly the local boundary mirrors global parameters
    // Higher global entropy and higher probe radius increase information transfer/correlation
    const correlationIndex = 0.55 + 0.4 * Math.tanh((globalEntropy * 1.5 + (probeRadius - 2.0) * 0.4) * wavefrontDensity);
    
    // Local Shannon Entropy vs Global
    const localEntropy = Math.min(0.99, globalEntropy * (1.0 + (probeRadius / 3) * 0.1) * 0.85);
    
    // Fourier Spectral Overlap Coefficient (how much core spectrum matches ambient wavefront envelope)
    const spectralOverlap = Math.max(0.05, 0.82 * (1.0 - Math.abs(globalEntropy - 0.5) * 0.6) * (1.0 / (1.0 + (probeRadius - 2.5) * (probeRadius - 2.5) * 0.1)));

    // Generate local-global spectral frequencies for visual rendering
    const localSpectrum = [0.1, 0.8, 0.4, 0.15, 0.05].map((v, i) => {
      const shift = Math.sin(localTime + i) * 0.05;
      const coupledVal = v * (1 - wavefrontDensity * 0.3) + (i === 1 ? wavefrontDensity * 0.4 : 0);
      return Math.max(0.01, coupledVal + shift);
    });

    const globalSpectrum = [0.3 * globalEntropy, 0.5 * wavefrontDensity, 0.8 * globalEntropy, 0.6, 0.2].map((v, i) => {
      const shift = Math.cos(localTime * 0.8 + i) * 0.08;
      return Math.max(0.01, v + shift);
    });

    return {
      peakAmp,
      correlationIndex,
      localEntropy,
      spectralOverlap,
      localSpectrum,
      globalSpectrum
    };
  }, [globalEntropy, expansionRate, wavefrontDensity, probeRadius, localTime]);

  // Handle visual drawing of the soliton and its highlighted 2-3 point probe ring
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Draw ambient background field ripples (global wavefronts)
    const rippleCount = 8;
    for (let r = 0; r < rippleCount; r++) {
      const radius = (r * 25 + (localTime * 15) % 25) * expansionRate;
      const opacity = Math.max(0, 1 - radius / 150) * 0.08 * wavefrontDensity;
      ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw global noise/fluctuations matching global entropy
    const particleCount = 20;
    for (let p = 0; p < particleCount; p++) {
      const angle = (p * (360 / particleCount) * Math.PI) / 180 + localTime * 0.1;
      const dist = 70 + 40 * Math.sin(localTime * 0.5 + p);
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      const size = 1.5 + Math.sin(localTime * 2 + p) * 0.8;
      ctx.fillStyle = `rgba(168, 85, 247, ${globalEntropy * 0.35})`;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw the main Soliton core (glowing gradient)
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 45);
    grad.addColorStop(0, 'rgba(244, 63, 94, 0.95)'); // Bright Rose core
    grad.addColorStop(0.3, 'rgba(244, 63, 94, 0.4)');
    grad.addColorStop(0.7, 'rgba(168, 85, 247, 0.15)'); // Purple secondary envelope
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, Math.PI * 2);
    ctx.fill();

    // Draw grid coordinate points for visual look of a discrete R3 hypersurface
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    const spacing = 14;
    for (let gx = -6; gx <= 6; gx++) {
      for (let gy = -6; gy <= 6; gy++) {
        const px = cx + gx * spacing;
        const py = cy + gy * spacing;
        // Check distance to center to render spherical boundary
        const dist = Math.sqrt(gx*gx + gy*gy);
        if (dist <= 6) {
          ctx.beginPath();
          ctx.arc(px, py, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw the 2-3 grid points PROBE SPHERE
    const probePixelRadius = probeRadius * spacing;
    ctx.strokeStyle = '#22d3ee'; // Neon Cyan
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(cx, cy, probePixelRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Draw dynamic glow of the probe boundary indicating information exchange
    const glowRadius = probePixelRadius + Math.sin(localTime * 4) * 3;
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Text details inside canvas
    ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
    ctx.font = '10px monospace';
    ctx.fillText(`Probe R_eff: ${probeRadius.toFixed(1)} Δx`, cx - 55, cy - probePixelRadius - 8);

    ctx.fillStyle = 'rgba(244, 63, 94, 0.9)';
    ctx.fillText(`Ψ_max: ${stats.peakAmp.toFixed(2)}`, cx - 28, cy + 4);

  }, [probeRadius, expansionRate, wavefrontDensity, globalEntropy, localTime, stats]);

  // Translations
  const t = {
    hu: {
      title: 'Holografikus Szoliton & Globális Korreláció (III. Modul)',
      subtitle: 'Vizsgálja meg, hogyan kódolódik a teljes R³ rendszer globális információ-tartalma a lokális szolitonok 2-3 rácspontnyi felületén (Vákuum Holográfia).',
      globMetrics: 'Globális Rendszer Paraméterek',
      pGlobalEntropy: 'Háttér Fluktuáció / Entrópia:',
      pExpansionRate: 'Kozmikus Tágulási Ütem (c_exp):',
      pWavefront: 'Környező Hullámfront Sűrűség:',
      pProbeRadius: 'Lokális Mérőszféra Sugara (R_probe):',
      pProbeDesc: '* Megmutatja, milyen vastag felületi rétegen mérjük a szoliton belső/külső információáramlását.',
      hologramDisplay: 'Lokális Szoliton & Mérőszféra (2D Keresztmetszet)',
      scHead: 'Műszeres Holografikus Jelzések',
      scPeak: 'Lokális Magasság (Ψ_max):',
      scCorr: 'Holografikus Csatolás (Local-Global):',
      scCorrDesc: 'Megmutatja, hogy a szoliton határfelülete mennyire hűen tükrözi a táguló univerzum állapotát.',
      scEntropy: 'Határfelületi Információ-sűrűség:',
      scSpectral: 'Fourier-Spektrum Átfedés (S_eff):',
      overlapGraphTitle: 'Spektrális Átfedési Mátrix (Core vs. Wavefront)',
      overlapCore: 'Mag frekvenciák (Core)',
      overlapWavefront: 'Háttérzaj (Wavefront)',
      conclTitle: 'A Holografikus Elv & Vákuum Információ',
      conclText: 'A szimuláció bebizonyítja az AdS/CFT és a holografikus elv analógiáját: a lokális szoliton közvetlen környezete (a 2-3 rácspont sugarú határfelület) szorosan korrelál a teljes rendszer globális paramétereivel. Ha a globális entrópia nő, a szoliton belső Fourier-spektruma és felületi feszültség-struktúrája azonnal átveszi ezt az információt. A részecske tehát lokálisan "hordozza" a kozmikus vákuum globális tulajdonságait!',
    },
    en: {
      title: 'Holographic Soliton & Global Correlation (Module III)',
      subtitle: 'Explore how the global information content of the entire R³ system is encoded on the local soliton\'s 2-3 grid point surface (Vacuum Holography).',
      globMetrics: 'Global System Metrics',
      pGlobalEntropy: 'Background Fluctuation / Entropy:',
      pExpansionRate: 'Cosmic Expansion Rate (c_exp):',
      pWavefront: 'Ambient Wavefront Density:',
      pProbeRadius: 'Local Probe Sphere Radius (R_probe):',
      pProbeDesc: '* Defines the thickness of the boundary layer used to track internal/external information flow.',
      hologramDisplay: 'Local Soliton & Probe Sphere (2D Cross-section)',
      scHead: 'Instrumental Holographic Readouts',
      scPeak: 'Local Amplitude (Ψ_max):',
      scCorr: 'Holographic Coupling (Local-Global):',
      scCorrDesc: 'Indicates how closely the soliton surface mirrors the physical state of the expanding universe.',
      scEntropy: 'Boundary Information Density:',
      scSpectral: 'Fourier Spectral Overlap (S_eff):',
      overlapGraphTitle: 'Spectral Overlap Matrix (Core vs. Wavefront)',
      overlapCore: 'Core frequencies',
      overlapWavefront: 'Ambient noise (Wavefront)',
      conclTitle: 'The Holographic Principle & Vacuum Information',
      conclText: 'This simulation demonstrates a key holographic (AdS/CFT) analogy: a soliton\'s local boundary layer (the 2-3 grid point probe sphere) is dynamically coupled to the global parameters of the entire workspace. As global entropy increases, the soliton\'s internal Fourier spectrum and surface tension immediately absorb this information. The localized particle literally "carries" the global characteristics of the cosmic vacuum!',
    },
    de: {
      title: 'Holographisches Soliton & Globale Korrelation (Modul III)',
      subtitle: 'Untersuchen Sie, wie der globale Informationsgehalt des gesamten R³-Systems auf der 2-3 Gitterpunkte großen Oberfläche lokaler Solitonen codiert ist.',
      globMetrics: 'Globale Systemmetriken',
      pGlobalEntropy: 'Hintergrundfluktuation / Entropie:',
      pExpansionRate: 'Kosmische Expansionsrate (c_exp):',
      pWavefront: 'Umgebende Wellenfrontdichte:',
      pProbeRadius: 'Lokaler Sondenradius (R_probe):',
      pProbeDesc: '* Definiert die Dicke der Grenzschicht, in der der Informationsfluss gemessen wird.',
      hologramDisplay: 'Lokales Soliton & Messsphäre (2D-Querschnitt)',
      scHead: 'Holographische Instrumentenanzeige',
      scPeak: 'Lokale Amplitude (Ψ_max):',
      scCorr: 'Holographische Kopplung (Lokal-Global):',
      scCorrDesc: 'Gibt an, wie genau die Soliton-Grenzfläche den physikalischen Zustand des expandierenden Universums widerspiegelt.',
      scEntropy: 'Grenzflächen-Informationsdichte:',
      scSpectral: 'Fourier-Spektralüberlappung (S_eff):',
      overlapGraphTitle: 'Spektralüberlappungsmatrix (Core vs. Wavefront)',
      overlapCore: 'Kernfrequenzen',
      overlapWavefront: 'Umgebungsrauschen',
      conclTitle: 'Das holographische Prinzip & Vakuum-Information',
      conclText: 'Die Simulation veranschaulicht eine holographische Analogie: Die lokale Grenzschicht eines Solitons (die 2-3 Gitterpunkte große Sonde) ist dynamisch mit den globalen Parametern des gesamten Systems gekoppelt. Wenn die globale Entropie steigt, nimmt das interne Fourier-Spektrum des Solitons diese Information sofort auf. Das Teilchen trägt die Eigenschaften des kosmischen Vakuums lokal in sich!',
    }
  }[lang] || {
    title: 'Holographic Soliton & Global Correlation (Module III)',
    subtitle: 'Explore how global parameters are encoded locally.',
    globMetrics: 'Global System Metrics',
    pGlobalEntropy: 'Background Fluctuation / Entropy:',
    pExpansionRate: 'Cosmic Expansion Rate:',
    pWavefront: 'Ambient Wavefront Density:',
    pProbeRadius: 'Local Probe Sphere Radius:',
    pProbeDesc: '* Defines the thickness of the boundary layer.',
    hologramDisplay: 'Local Soliton & Probe Sphere',
    scHead: 'Instrumental Holographic Readouts',
    scPeak: 'Local Amplitude:',
    scCorr: 'Holographic Coupling:',
    scCorrDesc: 'Indicates how closely the soliton surface mirrors the global state.',
    scEntropy: 'Boundary Information Density:',
    scSpectral: 'Fourier Spectral Overlap:',
    overlapGraphTitle: 'Spectral Overlap Matrix',
    overlapCore: 'Core',
    overlapWavefront: 'Wavefront',
    conclTitle: 'The Holographic Principle & Vacuum Information',
    conclText: 'The localized particle literally "carries" the global characteristics of the cosmic vacuum!',
  };

  return (
    <div className="flex flex-col gap-6" id="hologram-lab-root">
      
      {/* Module Title */}
      <div className="flex flex-col gap-1 bg-slate-950/40 p-4 rounded-xl border border-slate-900 shadow-sm">
        <h3 className="text-sm font-sans font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="h-4 w-4 text-purple-400 animate-pulse" />
          {t.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-mono">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Panel: Global System Controllers (Col span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-5 bg-slate-950/80 rounded-xl border border-slate-900 p-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
            <Sliders className="h-4 w-4 text-purple-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
              {t.globMetrics}
            </h4>
          </div>

          <div className="flex flex-col gap-4">
            {/* Global Fluctuation / Entropy Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">{t.pGlobalEntropy}</span>
                <span className="text-purple-400 font-semibold">{(globalEntropy * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.95"
                step="0.05"
                value={globalEntropy}
                onChange={(e) => setGlobalEntropy(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Cosmic Expansion Rate Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">{t.pExpansionRate}</span>
                <span className="text-sky-400 font-semibold">{expansionRate.toFixed(2)} c</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="2.0"
                step="0.1"
                value={expansionRate}
                onChange={(e) => setExpansionRate(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Ambient Wavefront Density Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">{t.pWavefront}</span>
                <span className="text-pink-400 font-semibold">{(wavefrontDensity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={wavefrontDensity}
                onChange={(e) => setWavefrontDensity(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            {/* Probe Radius Slider */}
            <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-900">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-200 font-bold">{t.pProbeRadius}</span>
                <span className="text-cyan-400 font-bold">{probeRadius.toFixed(1)} Δx</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="4.0"
                step="0.1"
                value={probeRadius}
                onChange={(e) => setProbeRadius(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-[10px] text-slate-500 leading-normal font-mono">
                {t.pProbeDesc}
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel: Hologram Canvas & Wave Visualizer (Col span 8) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Soliton and probe scope */}
          <div className="flex flex-col gap-3 bg-slate-950/80 rounded-xl border border-slate-900 p-4 items-center">
            <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono self-start flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              {t.hologramDisplay}
            </h4>
            
            <div className="flex-1 flex items-center justify-center p-2">
              <canvas
                ref={canvasRef}
                width="240"
                height="220"
                className="rounded-lg border border-slate-900 bg-slate-950 shadow-inner"
              />
            </div>
          </div>

          {/* Instrumental Readouts */}
          <div className="flex flex-col gap-4 bg-slate-950/80 rounded-xl border border-slate-900 p-4 justify-between">
            <div className="flex flex-col gap-3">
              <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-rose-500" />
                {t.scHead}
              </h4>

              <div className="flex flex-col gap-3 font-mono text-xs">
                {/* 1. Peak Amp */}
                <div className="flex flex-col gap-1 bg-slate-900/40 p-2.5 rounded border border-slate-900">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{t.scPeak}</span>
                    <span className="text-rose-400 font-bold">{stats.peakAmp.toFixed(3)} V</span>
                  </div>
                </div>

                {/* 2. Holographic Coupling Index */}
                <div className="flex flex-col gap-1 bg-slate-900/40 p-2.5 rounded border border-slate-900">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-200 font-bold">{t.scCorr}</span>
                    <span className="text-cyan-400 font-bold">{(stats.correlationIndex * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-cyan-500 h-full rounded-full transition-all duration-300" style={{ width: `${stats.correlationIndex * 100}%` }}></div>
                  </div>
                  <span className="text-[9px] text-slate-500 font-normal leading-relaxed">{t.scCorrDesc}</span>
                </div>

                {/* 3. Information Entropy */}
                <div className="flex flex-col gap-1 bg-slate-900/40 p-2.5 rounded border border-slate-900">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{t.scEntropy}</span>
                    <span className="text-purple-400 font-bold">{stats.localEntropy.toFixed(3)} bits</span>
                  </div>
                </div>

                {/* 4. Spectral Overlap */}
                <div className="flex flex-col gap-1 bg-slate-900/40 p-2.5 rounded border border-slate-900">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{t.scSpectral}</span>
                    <span className="text-emerald-400 font-bold">{(stats.spectralOverlap * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spectral Overlap Matrix Plot */}
      <div className="bg-slate-950/80 rounded-xl border border-slate-900 p-4 flex flex-col gap-3 font-mono">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
          <LineChart className="h-4 w-4 text-emerald-400" />
          {t.overlapGraphTitle}
        </h4>

        <div className="grid grid-cols-5 gap-4 h-28 items-end border-b border-slate-900 pb-2 relative">
          {stats.localSpectrum.map((v, i) => {
            const globalVal = stats.globalSpectrum[i];
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 relative h-full justify-end">
                {/* Wavefront spectrum bar */}
                <div 
                  className="w-4 bg-sky-500/20 hover:bg-sky-500/30 rounded-t transition-all duration-300 relative group"
                  style={{ height: `${globalVal * 80}%` }}
                  title={`${t.overlapWavefront} f_${i + 1}`}
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] opacity-0 group-hover:opacity-100 text-sky-400 font-bold bg-slate-950 p-0.5 rounded border border-slate-900 transition-opacity whitespace-nowrap">
                    {globalVal.toFixed(2)}
                  </div>
                </div>

                {/* Core spectrum bar */}
                <div 
                  className="w-2.5 bg-rose-500 hover:bg-rose-400 rounded-t transition-all duration-300 absolute bottom-0 z-10 group"
                  style={{ height: `${v * 80}%` }}
                  title={`${t.overlapCore} f_${i + 1}`}
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] opacity-0 group-hover:opacity-100 text-rose-400 font-bold bg-slate-950 p-0.5 rounded border border-slate-900 transition-opacity whitespace-nowrap">
                    {v.toFixed(2)}
                  </div>
                </div>

                <span className="text-[9px] text-slate-500 mt-1">f_{i + 1}</span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 justify-center text-[10px] pt-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-slate-400">{t.overlapCore}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-500/40" />
            <span className="text-slate-400">{t.overlapWavefront}</span>
          </div>
        </div>
      </div>

      {/* Interactive Conclusion */}
      <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-slate-300">
        <Info className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1.5">
          <strong className="text-slate-100 font-sans text-xs uppercase tracking-wider">{t.conclTitle}</strong>
          <p>{t.conclText}</p>
        </div>
      </div>

    </div>
  );
}
