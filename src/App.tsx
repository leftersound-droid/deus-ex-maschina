/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  GrowingR4Model,
  ModelStats,
  neighbors4,
  makeKey,
  parseCoord,
  getNeighborsStr,
  Coord4D
} from './model/toyModel';
import Visualizer4D from './components/Visualizer4D';
import SliceView from './components/SliceView';
import CustomChart from './components/CustomChart';
import StatsPanel from './components/StatsPanel';
import FourierAnalysis from './components/FourierAnalysis';
import HypersurfaceLab from './components/HypersurfaceLab';
import Manuscript from './components/Manuscript';
import QuantizationSimulator from './components/QuantizationSimulator';
import EffectiveSolitonLab from './components/EffectiveSolitonLab';
import SolitonComparisonLab from './components/SolitonComparisonLab';
import GlobalLocalHologramLab from './components/GlobalLocalHologramLab';
import MeasurementProtocolLab from './components/MeasurementProtocolLab';
import IndependentAtomicLab from './components/IndependentAtomicLab';
import { i18n, Language } from './i18n';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sliders,
  Download,
  Info,
  X,
  Radio,
  TrendingUp,
  Grid3X3,
  Dna,
  Database,
  ShieldAlert,
  Flame,
  Activity,
  FlaskConical,
  BookOpen,
  Sparkles,
  Scale,
  Boxes,
  FileText,
  Atom
} from 'lucide-react';

export default function App() {
  // Language selection state
  const [lang, setLang] = useState<Language>('hu');
  const t = i18n[lang];

  // Model state
  const [model, setModel] = useState<GrowingR4Model>(() => new GrowingR4Model([3, 3, 3, 3], 1000000, 42, true, true, 2, 10, 0.25, 0.5, 0.0));
  const [stats, setStats] = useState<ModelStats>(() => model.getStats(0.0));
  const [history, setHistory] = useState<ModelStats[]>([]);
  const [selectedCoord, setSelectedCoord] = useState<string | null>(null);

  // Simulation play state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [delay, setDelay] = useState<number>(60); // ms between frames
  const [stepsPerFrame, setStepsPerFrame] = useState<number>(1);

  // Initial parameters state
  const [initX0, setInitX0] = useState<number>(3);
  const [initX1, setInitX1] = useState<number>(3);
  const [initX2, setInitX2] = useState<number>(3);
  const [initX3, setInitX3] = useState<number>(3);
  const [initTotalPotential, setInitTotalPotential] = useState<number>(1000000);
  const [seed, setSeed] = useState<number>(42);
  const [maxSites, setMaxSites] = useState<number>(15000); // safe cap to avoid browser freeze
  const [stopTol, setStopTol] = useState<number>(1e-5);

  // Dynamic growth and feedback parameters
  const [startFromOrigin, setStartFromOrigin] = useState<boolean>(true);
  const [perturbationStartStep, setPerturbationStartStep] = useState<number>(2);
  const [tensionCoupling, setTensionCoupling] = useState<number>(0.5);
  const [dampingRate, setDampingRate] = useState<number>(0.0);

  // Perturbation settings state
  const [perturbationActive, setPerturbationActive] = useState<boolean>(true);
  const [perturbationDuration, setPerturbationDuration] = useState<number>(10);
  const [perturbedSitesRatio, setPerturbedSitesRatio] = useState<number>(0.25);

  // Presets and Alerts
  const [currentPreset, setCurrentPreset] = useState<'random' | 'singularity' | 'dipole' | 'boundary'>('random');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // UI Tabs
  const [activeTab, setActiveTab] = useState<'visualization' | 'slice' | 'fourier' | 'lab' | 'comparison' | 'hologram' | 'protocol' | 'quantization' | 'effectivelab' | 'atomiclab' | 'charts' | 'manuscript'>('visualization');

  // Initialize simulation with specific parameters
  const initializeSimulation = useCallback(
    (
      preset: 'random' | 'singularity' | 'dipole' | 'boundary',
      shape: [number, number, number, number],
      totalPot: number,
      rSeed: number,
      sFromOrigin: boolean,
      pActive: boolean,
      pStartStep: number,
      pDuration: number,
      pRatio: number,
      tCoupling: number,
      dRate: number
    ) => {
      setIsPlaying(false);
      setAlertMessage(null);
      setSelectedCoord(null);

      const newModel = new GrowingR4Model(
        shape,
        totalPot,
        rSeed,
        sFromOrigin,
        pActive,
        pStartStep,
        pDuration,
        pRatio,
        tCoupling,
        dRate
      );

      // Apply preset values manually
      if (preset === 'singularity') {
        const keys = Object.keys(newModel.V);
        if (sFromOrigin) {
          keys.forEach((k) => {
            newModel.V[k] = k === "0,0,0,0" ? totalPot : 0.0;
          });
        } else {
          // Find center node
          const [sx, sy, sz, sw] = shape;
          const cx = Math.floor(sx / 2);
          const cy = Math.floor(sy / 2);
          const cz = Math.floor(sz / 2);
          const cw = Math.floor(sw / 2);
          const centerKey = makeKey([cx, cy, cz, cw]);

          keys.forEach((k) => {
            newModel.V[k] = k === centerKey ? totalPot : 0.0;
          });
        }
      } else if (preset === 'dipole') {
        const keys = Object.keys(newModel.V);
        if (sFromOrigin) {
          keys.forEach((k) => {
            newModel.V[k] = k === "0,0,0,0" ? totalPot : 0.0;
          });
        } else {
          const [sx, sy, sz, sw] = shape;
          const dipolePlusKey = makeKey([0, 0, 0, 0]);
          const dipoleMinusKey = makeKey([sx - 1, sy - 1, sz - 1, sw - 1]);

          keys.forEach((k) => {
            if (k === dipolePlusKey) {
              newModel.V[k] = totalPot * 0.75;
            } else if (k === dipoleMinusKey) {
              newModel.V[k] = totalPot * 0.25;
            } else {
              newModel.V[k] = 0.0;
            }
          });
        }
      } else if (preset === 'boundary') {
        const keys = Object.keys(newModel.V);
        if (sFromOrigin) {
          keys.forEach((k) => {
            newModel.V[k] = k === "0,0,0,0" ? totalPot : 0.0;
          });
        } else {
          const [sx, sy, sz, sw] = shape;
          let boundaryCount = 0;

          const isBoundary = (c: Coord4D) => {
            return (
              c[0] === 0 || c[0] === sx - 1 ||
              c[1] === 0 || c[1] === sy - 1 ||
              c[2] === 0 || c[2] === sz - 1 ||
              c[3] === 0 || c[3] === sw - 1
            );
          };

          const keyCoords = keys.map(k => ({ key: k, coord: parseCoord(k) }));
          keyCoords.forEach((kc) => {
            if (isBoundary(kc.coord)) {
              boundaryCount++;
            }
          });

          keyCoords.forEach((kc) => {
            if (isBoundary(kc.coord)) {
              newModel.V[kc.key] = totalPot / boundaryCount;
            } else {
              newModel.V[kc.key] = 0.0;
            }
          });
        }
      }

      const initialStats = newModel.getStats(0.0);
      setModel(newModel);
      setStats(initialStats);
      setHistory([initialStats]);
      setCurrentPreset(preset);
    },
    []
  );

  // Initialize once on mount
  useEffect(() => {
    initializeSimulation('random', [3, 3, 3, 3], 1000000, 42, true, true, 2, 10, 0.25, 0.5, 0.0);
  }, [initializeSimulation]);

  // Run simulation steps
  const runSteps = useCallback(
    (count: number) => {
      let currentModel = model;
      let lastMaxAbsChange = 0.0;
      let stopEarly = false;
      let stopReason = '';

      for (let s = 0; s < count; s++) {
        const { maxAbsChange, totalPotential } = currentModel.step();
        lastMaxAbsChange = maxAbsChange;

        const currentSites = Object.keys(currentModel.V).length;

        // Check safety constraints
        if (currentSites >= maxSites) {
          stopEarly = true;
          stopReason = `Rácspont korlát elért: ${currentSites} rácspont (biztonsági megállítás a böngésző lassulásának elkerülésére).`;
          break;
        }

        // Check convergence
        if (maxAbsChange < stopTol && currentModel.stepCount > 10) {
          stopEarly = true;
          stopReason = `A szimuláció konvergált: Maximális változás (${maxAbsChange.toExponential(3)}) < tolerancia (${stopTol.toExponential(3)}).`;
          break;
        }
      }

      const newStats = currentModel.getStats(lastMaxAbsChange);
      
      setModel(currentModel.clone());
      setStats(newStats);
      setHistory((prev) => [...prev, newStats]);

      if (stopEarly) {
        setIsPlaying(false);
        setAlertMessage(stopReason);
      }
    },
    [model, maxSites, stopTol]
  );

  // Simulation ticks loop
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      runSteps(stepsPerFrame);
    }, delay);

    return () => clearInterval(timer);
  }, [isPlaying, delay, stepsPerFrame, runSteps]);

  // Handle Preset quick setups
  const applyPreset = (presetName: typeof currentPreset) => {
    initializeSimulation(presetName, [initX0, initX1, initX2, initX3], initTotalPotential, seed, startFromOrigin, perturbationActive, perturbationStartStep, perturbationDuration, perturbedSitesRatio, tensionCoupling, dampingRate);
  };

  const handleReset = () => {
    initializeSimulation(currentPreset, [initX0, initX1, initX2, initX3], initTotalPotential, seed, startFromOrigin, perturbationActive, perturbationStartStep, perturbationDuration, perturbedSitesRatio, tensionCoupling, dampingRate);
  };

  const handleStep = () => {
    runSteps(1);
  };

  // CSV Data Exporter
  const exportToCSV = () => {
    if (history.length === 0) return;
    
    const headers = [
      'step',
      'num_sites',
      'total_potential',
      'mean_potential',
      'variance',
      'max_potential',
      'min_potential',
      'gini_coefficient',
      'shannon_entropy',
      'neighbor_correlation',
      'num_clusters',
      'largest_cluster_size',
      'max_abs_change',
      'core_potential_pct',
      'wavefront_potential_pct',
      'core_sites_count',
      'wavefront_sites_count',
      'wavefront_gini',
      'wavefront_shannon_entropy',
      'wavefront_num_clusters',
      'wavefront_largest_cluster'
    ].join(',');

    const rows = history.map((r) =>
      [
        r.step,
        r.num_sites,
        r.sum,
        r.mean,
        r.var,
        r.max,
        r.min,
        r.gini,
        r.entropy,
        r.neighbor_corr,
        r.num_clusters,
        r.largest_cluster,
        r.max_abs_change,
        r.core_potential_pct,
        r.wavefront_potential_pct,
        r.core_sites_count,
        r.wavefront_sites_count,
        r.wavefront_gini,
        r.wavefront_shannon_entropy,
        r.wavefront_num_clusters,
        r.wavefront_largest_cluster
      ].join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `r4_szimulacio_${currentPreset}_lepes_${stats.step}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Inspector detailed information for the selected coord
  const selectedInfo = useMemo(() => {
    if (!selectedCoord) return null;

    const coord = parseCoord(selectedCoord);
    const potential = model.V[selectedCoord] || 0.0;
    const nbs = neighbors4(coord);

    // Calculate details for each of the 8 neighbors
    // Rule: if oldVi > oldVj, transfer is (Vi - Vj) / nRecv
    // First we must find the total nRecv for this node (if Vi > Vj)
    const activeNeighborsKeys = getNeighborsStr(selectedCoord);
    const recvsKeys: string[] = [];
    activeNeighborsKeys.forEach((nbK) => {
      const nbV = model.V[nbK] !== undefined ? model.V[nbK] : 0.0;
      if (potential > nbV) {
        recvsKeys.push(nbK);
      }
    });
    const nRecvThis = recvsKeys.length;

    const neighborFlows = nbs.map((nb) => {
      const nbKey = makeKey(nb);
      const nbPot = model.V[nbKey] !== undefined ? model.V[nbKey] : null;

      let flowVal = 0.0;
      let flowDir: 'out' | 'in' | 'none' = 'none';

      if (nbPot !== null) {
        if (potential > nbPot) {
          // Flow OUT from selected node to this neighbor
          flowVal = (potential - nbPot) / (nRecvThis || 1);
          flowDir = 'out';
        } else if (nbPot > potential) {
          // Flow IN from this neighbor to selected node
          // We need neighbor's receiving count
          const nbNbs = neighbors4(nb);
          const nbRecvs: string[] = [];
          nbNbs.forEach((nn) => {
            const nnK = makeKey(nn);
            const nnV = model.V[nnK] !== undefined ? model.V[nnK] : 0.0;
            if (nbPot > nnV) {
              nbRecvs.push(nnK);
            }
          });
          const nRecvNb = nbRecvs.length;
          flowVal = (nbPot - potential) / (nRecvNb || 1);
          flowDir = 'in';
        }
      }

      return {
        coord: nb,
        key: nbKey,
        potential: nbPot,
        flowVal,
        flowDir,
      };
    });

    return {
      coord,
      potential,
      neighborFlows,
    };
  }, [selectedCoord, model]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-sky-500/30 selection:text-sky-300">
      
      {/* Top ambient decorative glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-80 bg-gradient-to-b from-sky-900/15 to-transparent blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6 relative z-10">
        
        {/* Navigation & Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-2.5 shadow-md shadow-sky-500/10">
              <Dna className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {t.title}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium tracking-wide">v2.0.0</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Language Selector */}
            <div id="language-selector" className="flex items-center gap-1 bg-slate-950 border border-slate-850 rounded-lg p-1 font-mono mr-1">
              {(['hu', 'en', 'de'] as const).map((l) => (
                <button
                  id={`lang-btn-${l}`}
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                    lang === l
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={exportToCSV}
              disabled={history.length === 0}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-300 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> {t.exportCsv}
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all shadow-md shadow-sky-500/10"
            >
              {t.documentation}
            </a>
          </div>
        </header>

        {/* Nav Tabs - directly below the download button / header */}
        <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-850 bg-slate-950/40 p-1.5 rounded-xl border border-slate-850 gap-1.5 my-4">
          {[
            { id: 'visualization', label: t.tab4D, icon: <Radio className="h-4 w-4" /> },
            { id: 'slice', label: t.tabSlice, icon: <Grid3X3 className="h-4 w-4" /> },
            { id: 'fourier', label: t.tabFourier, icon: <Activity className="h-4 w-4" /> },
            { id: 'lab', label: t.tabLab, icon: <FlaskConical className="h-4 w-4" /> },
            { id: 'effectivelab', label: t.tabEffectiveLab, icon: <Boxes className="h-4 w-4 text-amber-400" /> },
            { id: 'comparison', label: lang === 'hu' ? 'Összehasonlítás' : lang === 'de' ? 'Soliton-Vergleich' : 'Soliton Comparison', icon: <Scale className="h-4 w-4 text-sky-400" /> },
            { id: 'hologram', label: lang === 'hu' ? 'Holografikus Csatolás' : lang === 'de' ? 'Holographische Kopplung' : 'Holographic Coupling', icon: <Database className="h-4 w-4 text-purple-400" /> },
            { id: 'protocol', label: lang === 'hu' ? 'Mérések & kísérlet' : lang === 'de' ? 'Messungen & Experiment' : 'Measurements & experiment', icon: <FileText className="h-4 w-4 text-emerald-400" /> },
            { id: 'atomiclab', label: lang === 'hu' ? 'Független Atomi Labor' : lang === 'de' ? 'Atomi Labor' : 'Atomic Lab', icon: <Atom className="h-4 w-4 text-emerald-400 animate-pulse" /> },
            { id: 'quantization', label: lang === 'hu' ? 'Kvantálás & Tömeg' : lang === 'de' ? 'Quantisierung & Masse' : 'Quantization & Mass', icon: <Scale className="h-4 w-4 text-emerald-400" /> },
            { id: 'charts', label: t.tabCharts, icon: <TrendingUp className="h-4 w-4" /> },
            { id: 'manuscript', label: t.tabManuscript, icon: <BookOpen className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              id={`tab-btn-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-sky-500/10 border border-sky-500/30 text-sky-400 shadow-md shadow-sky-500/5 font-bold'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {alertMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-xs leading-relaxed text-sky-400">
            <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0 text-sky-400" />
            <div className="flex-1">
              <span className="font-bold">{t.alertNotice}</span>
              {alertMessage}
            </div>
            <button
              onClick={() => setAlertMessage(null)}
              className="text-sky-400/60 hover:text-sky-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Dashboard Grid Layout / Comparison view */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: Setup, Presets & Controls (Col span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Presets Card */}
            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/20 p-5 backdrop-blur-md">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-2 font-mono">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                {t.presetsTitle}
              </h2>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'random', label: t.presetRandom, desc: t.presetRandomDesc },
                  { id: 'singularity', label: t.presetSingularity, desc: t.presetSingularityDesc },
                  { id: 'dipole', label: t.presetDipole, desc: t.presetDipoleDesc },
                  { id: 'boundary', label: t.presetBoundary, desc: t.presetBoundaryDesc },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id as any)}
                    className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      currentPreset === preset.id
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700/80'
                    }`}
                  >
                    <span className="font-semibold block">{preset.label}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 leading-snug">{preset.desc}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Simulation Controls Panel */}
            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/20 p-5 backdrop-blur-md">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2 font-mono">
                <Sliders className="h-3.5 w-3.5 text-sky-400" />
                {t.controllerTitle}
              </h2>

              <div className="flex flex-col gap-4">
                {/* Control Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs shadow-md transition-all cursor-pointer ${
                      isPlaying
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/10'
                        : 'bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-sky-500/10'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4 fill-slate-950" /> {t.btnStop}
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-slate-950" /> {t.btnStart}
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleStep}
                    disabled={isPlaying}
                    className="flex items-center justify-center p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 disabled:opacity-45 disabled:hover:bg-slate-950 transition-colors cursor-pointer"
                    title={t.btnStep}
                  >
                    <SkipForward className="h-4 w-4 fill-current" />
                  </button>

                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 transition-colors cursor-pointer"
                    title={t.btnReset}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                {/* Speed Controls */}
                <div className="flex flex-col gap-3 border-t border-slate-800/60 pt-4 text-xs font-mono">
                  {/* Steps per frame */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>{t.speedLabel}</span>
                      <span className="text-sky-400 font-bold">
                        {stepsPerFrame} {lang === 'hu' ? 'lépés' : lang === 'de' ? 'Schritte' : 'steps'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={stepsPerFrame}
                      onChange={(e) => setStepsPerFrame(parseInt(e.target.value))}
                      className="w-full accent-sky-400 h-1 rounded-lg bg-slate-950"
                    />
                  </div>

                  {/* Delay (ms) */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>{t.delayLabel}</span>
                      <span className="text-sky-400 font-bold">{delay} ms</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="10"
                      value={delay}
                      onChange={(e) => setDelay(parseInt(e.target.value))}
                      className="w-full accent-sky-400 h-1 rounded-lg bg-slate-950"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Shape and Initial Parameters config */}
            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/20 p-5 backdrop-blur-md">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2 font-mono">
                <Database className="h-3.5 w-3.5 text-indigo-400" />
                {t.configTitle}
              </h2>

              <div className="flex flex-col gap-4 text-xs font-mono">
                {/* Start from Origin Toggle */}
                <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-200">{t.configOrigin}</span>
                    <span className="text-[10px] text-slate-500">{t.configOriginDesc}</span>
                  </div>
                  <button
                    onClick={() => setStartFromOrigin(!startFromOrigin)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                      startFromOrigin ? 'bg-indigo-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                        startFromOrigin ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Initial shape inputs */}
                <div className={startFromOrigin ? 'opacity-40 pointer-events-none transition-all' : 'transition-all'}>
                  <label className="text-slate-400 block mb-1.5 text-[11px]">
                    {t.configSize}
                    {startFromOrigin && <span className="text-[10px] text-indigo-400 ml-1.5">({t.configSizeInactive})</span>}
                    {!startFromOrigin && <span className="text-[10px] text-emerald-400 ml-1.5">(Max: 10 - {lang === 'hu' ? 'Dupla méret!' : lang === 'de' ? 'Doppelte Größe!' : 'Double size!'})</span>}
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { val: initX0, set: setInitX0 },
                      { val: initX1, set: setInitX1 },
                      { val: initX2, set: setInitX2 },
                      { val: initX3, set: setInitX3 },
                    ].map((inp, idx) => (
                      <div key={idx} className="flex flex-col items-center bg-slate-950 rounded-lg p-1 border border-slate-850">
                        <span className="text-[9px] text-slate-500 mb-0.5">X{idx}</span>
                        <input
                          type="number"
                          min="2"
                          max="10"
                          value={inp.val}
                          onChange={(e) => inp.set(Math.max(2, Math.min(10, parseInt(e.target.value) || 2)))}
                          disabled={startFromOrigin}
                          className="w-full text-center bg-transparent focus:outline-none font-bold text-sky-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total initial potential */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 text-[11px]">{t.configPotential}</label>
                  <input
                    type="number"
                    value={initTotalPotential}
                    onChange={(e) => setInitTotalPotential(Math.max(1, parseInt(e.target.value) || 1000))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-sky-400 font-bold focus:outline-none focus:border-sky-500/50"
                  />
                </div>

                {/* Random Seed */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 text-[11px]">{t.configSeed}</label>
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-sky-400 font-bold focus:outline-none focus:border-sky-500/50"
                  />
                </div>

                {/* Safety Cap slider */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/60">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>{t.configSafety}</span>
                    <span className="text-sky-400 font-bold">
                      {maxSites.toLocaleString(lang === 'hu' ? 'hu-HU' : lang === 'de' ? 'de-DE' : 'en-US')} {lang === 'hu' ? 'pont' : lang === 'de' ? 'Punkte' : 'points'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="60000"
                    step="1000"
                    value={maxSites}
                    onChange={(e) => setMaxSites(parseInt(e.target.value))}
                    className="w-full accent-sky-400 h-1 rounded-lg bg-slate-950"
                  />
                  {maxSites > 10000 && (
                    <span className="text-[10px] text-amber-500 font-semibold leading-normal">
                      {t.configSafetyWarning}
                    </span>
                  )}
                </div>

                {/* Stop tol */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 text-[11px]">{t.configTolerance}</label>
                  <select
                    value={stopTol}
                    onChange={(e) => setStopTol(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-sky-400 font-bold focus:outline-none focus:border-sky-500/50"
                  >
                    <option value={1e-3}>{t.configToleranceQuick}</option>
                    <option value={1e-5}>{t.configToleranceMed}</option>
                    <option value={1e-7}>{t.configToleranceHigh}</option>
                  </select>
                </div>

                {/* Reset Apply button */}
                <button
                  onClick={handleReset}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all cursor-pointer mt-1 text-center"
                >
                  {t.configApply}
                </button>
              </div>
            </section>

            {/* Perturbation Section */}
            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/20 p-5 backdrop-blur-md">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between font-mono">
                <span className="flex items-center gap-2">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  {t.perturbTitle}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${model.perturbationActive && model.stepCount >= model.perturbationStartStep && model.stepCount < (model.perturbationStartStep + model.perturbationDuration) ? 'bg-amber-500/10 text-amber-400 animate-pulse border border-amber-500/20' : 'bg-slate-950 text-slate-600 border border-slate-800'}`}>
                  {model.perturbationActive && model.stepCount >= model.perturbationStartStep && model.stepCount < (model.perturbationStartStep + model.perturbationDuration) ? t.perturbActive : t.perturbInactive}
                </span>
              </h2>

              <div className="flex flex-col gap-4 text-xs font-mono">
                {/* Active Toggle Switch */}
                <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-200">{t.perturbSystem}</span>
                    <span className="text-[10px] text-slate-500">{t.perturbSystemDesc}</span>
                  </div>
                  <button
                    onClick={() => setPerturbationActive(!perturbationActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                      perturbationActive ? 'bg-amber-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                        perturbationActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Perturbation Start Step Delay */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/40">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>{t.perturbStart}</span>
                    <span className="text-amber-400 font-bold">
                      {lang === 'hu' ? `${perturbationStartStep}. lépéstől` : lang === 'de' ? `Ab Schritt ${perturbationStartStep}` : `From step ${perturbationStartStep}`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={perturbationStartStep}
                    onChange={(e) => setPerturbationStartStep(parseInt(e.target.value))}
                    disabled={!perturbationActive}
                    className="w-full accent-amber-500 h-1 rounded-lg bg-slate-950 disabled:opacity-30"
                  />
                  <span className="text-[10px] text-slate-500 leading-snug">
                    {t.perturbStartDesc}
                  </span>
                </div>

                {/* Perturbation Duration */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/40">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>{t.perturbDuration}</span>
                    <span className="text-amber-400 font-bold">
                      {lang === 'hu' ? `${perturbationDuration} lépés` : lang === 'de' ? `${perturbationDuration} Schritte` : `${perturbationDuration} steps`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={perturbationDuration}
                    onChange={(e) => setPerturbationDuration(parseInt(e.target.value))}
                    disabled={!perturbationActive}
                    className="w-full accent-amber-500 h-1 rounded-lg bg-slate-950 disabled:opacity-30"
                  />
                  <span className="text-[10px] text-slate-500 leading-snug">
                    {t.perturbDurationDesc}
                  </span>
                </div>

                {/* Perturbation Ratio */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/40">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>{t.perturbRatio}</span>
                    <span className="text-amber-400 font-bold">{Math.round(perturbedSitesRatio * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.80"
                    step="0.05"
                    value={perturbedSitesRatio}
                    onChange={(e) => setPerturbedSitesRatio(parseFloat(e.target.value))}
                    disabled={!perturbationActive}
                    className="w-full accent-amber-500 h-1 rounded-lg bg-slate-950 disabled:opacity-30"
                  />
                  <span className="text-[10px] text-slate-500 leading-snug">
                    {t.perturbRatioDesc}
                  </span>
                </div>

                {/* Environmental Tension Speed Modulation Coupling */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/40">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>{t.perturbTension}</span>
                    <span className={`font-bold ${tensionCoupling > 0 ? 'text-emerald-400' : tensionCoupling < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {tensionCoupling > 0 ? `+${tensionCoupling.toFixed(1)} (${lang === 'hu' ? 'Squeeze / Gyorsítás' : lang === 'de' ? 'Beschleunigung' : 'Squeeze / Accel'})` : tensionCoupling < 0 ? `${tensionCoupling.toFixed(1)} (${lang === 'hu' ? 'Resistance / Dugulás' : lang === 'de' ? 'Widerstand' : 'Resistance / Block'})` : (lang === 'hu' ? '0.0 (Kikapcsolva)' : lang === 'de' ? '0.0 (Deaktiviert)' : '0.0 (Disabled)')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-15.0"
                    max="15.0"
                    step="0.5"
                    value={tensionCoupling}
                    onChange={(e) => setTensionCoupling(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 h-1 rounded-lg bg-slate-950"
                  />
                  <span className="text-[10px] text-slate-500 leading-snug">
                    {t.perturbTensionDesc}
                  </span>
                </div>

                {/* Damping / Energy Dissipation */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/40">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>{t.perturbDamping}</span>
                    <span className={`font-bold ${dampingRate > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {dampingRate > 0 ? `${(dampingRate * 100).toFixed(1)}% / ${lang === 'hu' ? 'lépés' : lang === 'de' ? 'Schritt' : 'step'}` : (lang === 'hu' ? '0.0% (Megmaradó rendszer)' : lang === 'de' ? '0.0% (Konserviertes System)' : '0.0% (Conserved System)')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.30"
                    step="0.005"
                    value={dampingRate}
                    onChange={(e) => setDampingRate(parseFloat(e.target.value))}
                    className="w-full accent-rose-500 h-1 rounded-lg bg-slate-950"
                  />
                  <span className="text-[10px] text-slate-500 leading-snug">
                    {t.perturbDampingDesc}
                  </span>
                </div>

                {/* Apply Settings button */}
                <button
                  onClick={handleReset}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-450 text-slate-950 font-bold rounded-xl transition-all cursor-pointer mt-1 text-center"
                >
                  {t.perturbApplyReset}
                </button>
              </div>
            </section>

          </div>

          {/* RIGHT PANEL: Tab view of visualizers, slice, charts, and Stats (Col span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Tab Contents */}
            <div className="min-h-[460px]">
              {activeTab === 'visualization' && (
                <Visualizer4D
                  model={model}
                  selectedCoord={selectedCoord}
                  onSelectCoord={setSelectedCoord}
                />
              )}

              {activeTab === 'slice' && (
                <SliceView
                  model={model}
                  selectedCoord={selectedCoord}
                  onSelectCoord={setSelectedCoord}
                />
              )}

              {activeTab === 'fourier' && (
                <FourierAnalysis model={model} />
              )}

              {activeTab === 'lab' && (
                <HypersurfaceLab model={model} lang={lang} />
              )}

              {activeTab === 'charts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomChart
                    data={history}
                    xKey="step"
                    yKey="num_sites"
                    color="#38bdf8"
                    title={lang === 'hu' ? 'Rácsméret alakulása' : lang === 'de' ? 'Gittergröße Entwicklung' : 'Lattice Size Evolution'}
                    valueFormatter={(v) => `${v.toFixed(0)} ${lang === 'hu' ? 'pont' : lang === 'de' ? 'Punkte' : 'points'}`}
                  />
                  <CustomChart
                    data={history}
                    xKey="step"
                    yKey="gini"
                    color="#818cf8"
                    title={lang === 'hu' ? 'Teljes Rendszer Gini' : lang === 'de' ? 'Gesamtsystem Gini' : 'Total System Gini'}
                    valueFormatter={(v) => v.toFixed(4)}
                  />
                  <CustomChart
                    data={history}
                    xKey="step"
                    yKey="wavefront_potential_pct"
                    color="#06b6d4"
                    title={lang === 'hu' ? '3D Hiperfelület (Wavefront) Potenciálarány' : lang === 'de' ? '3D-Hyperfläche (Wellenfront) Potenzialanteil' : '3D Hypersurface (Wavefront) Potential Ratio'}
                    valueFormatter={(v) => `${v.toFixed(2)}%`}
                  />
                  <CustomChart
                    data={history}
                    xKey="step"
                    yKey="core_potential_pct"
                    color="#10b981"
                    title={lang === 'hu' ? 'Belső Mag (Core) Potenciálarány' : lang === 'de' ? 'Innerer Kern (Core) Potenzialanteil' : 'Inner Core (Core) Potential Ratio'}
                    valueFormatter={(v) => `${v.toFixed(2)}%`}
                  />
                  <CustomChart
                    data={history}
                    xKey="step"
                    yKey="wavefront_gini"
                    color="#f43f5e"
                    title={lang === 'hu' ? 'Hullámfront Klaszterizáció (Gini)' : lang === 'de' ? 'Wellenfront-Clusterung (Gini)' : 'Wavefront Clustering (Gini)'}
                    valueFormatter={(v) => v.toFixed(4)}
                  />
                  <CustomChart
                    data={history}
                    xKey="step"
                    yKey="wavefront_num_clusters"
                    color="#d946ef"
                    title={lang === 'hu' ? 'Hullámfront Sűrűsödési Pontok (Klaszterek)' : lang === 'de' ? 'Wellenfront-Verdichtungspunkte (Cluster)' : 'Wavefront Condensation Points (Clusters)'}
                    valueFormatter={(v) => `${v.toFixed(0)} ${lang === 'hu' ? 'db' : lang === 'de' ? 'Stk' : 'qty'}`}
                  />
                  <CustomChart
                    data={history}
                    xKey="step"
                    yKey="neighbor_corr"
                    color="#ec4899"
                    title={lang === 'hu' ? 'Szomszédsági korreláció' : lang === 'de' ? 'Nachbarschaftskorrelation' : 'Neighborhood Correlation'}
                    valueFormatter={(v) => v.toFixed(4)}
                  />
                  <CustomChart
                    data={history}
                    xKey="step"
                    yKey="sum"
                    color="#f59e0b"
                    title={lang === 'hu' ? 'Rendszer Összpotenciálja' : lang === 'de' ? 'Systemgesamtpotenzial' : 'System Total Potential'}
                    valueFormatter={(v) => v.toLocaleString(lang === 'hu' ? 'hu-HU' : lang === 'de' ? 'de-DE' : 'en-US')}
                  />
                </div>
              )}

              {activeTab === 'quantization' && (
                <QuantizationSimulator lang={lang} />
              )}

              {activeTab === 'effectivelab' && (
                <EffectiveSolitonLab model={model} lang={lang} />
              )}

              {activeTab === 'comparison' && (
                <SolitonComparisonLab lang={lang} />
              )}

              {activeTab === 'hologram' && (
                <GlobalLocalHologramLab lang={lang} />
              )}

              {activeTab === 'protocol' && (
                <MeasurementProtocolLab lang={lang} />
              )}

              {activeTab === 'atomiclab' && (
                <IndependentAtomicLab lang={lang} />
              )}

              {activeTab === 'manuscript' && (
                <Manuscript lang={lang} />
              )}
            </div>

            {/* Quick stats grid */}
            <StatsPanel stats={stats} lang={lang} />

            {/* Bottom detailed node inspector */}
            {selectedInfo && (
              <section className="rounded-2xl border border-sky-500/20 bg-slate-900/30 p-5 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-sky-500/5 rounded-full blur-[40px] pointer-events-none" />

                <button
                  onClick={() => setSelectedCoord(null)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 p-1 bg-slate-950/60 rounded-full border border-slate-800 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-3.5">
                  <div className="rounded-lg bg-sky-500/10 p-2 border border-sky-500/20 text-sky-400 mt-0.5">
                    <Grid3X3 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
                      {t.inspectorTitle}
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-1">
                      {t.inspectorCoord} <span className="text-sky-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">[ {selectedInfo.coord.join(', ')} ]</span>
                    </p>
                    <p className="text-xs font-mono text-slate-400 mt-2">
                      {t.inspectorPotential} <span className="text-amber-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-850">{selectedInfo.potential.toFixed(5)}</span>
                    </p>
                  </div>
                </div>

                {/* Neighbor details list */}
                <div className="mt-5 border-t border-slate-800/80 pt-4">
                  <h4 className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <span>{t.inspectorNeighbors}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                    {selectedInfo.neighborFlows.map((nb, idx) => {
                      const exists = nb.potential !== null;
                      
                      let flowLabel = t.inspectorNoFlow;
                      let flowColor = 'text-slate-500 bg-slate-950/20 border-slate-850';
                      
                      if (exists) {
                        if (nb.flowDir === 'out') {
                          flowLabel = `${t.inspectorOutflow}${nb.flowVal.toFixed(3)}`;
                          flowColor = 'text-red-400 bg-red-950/10 border-red-900/20';
                        } else if (nb.flowDir === 'in') {
                          flowLabel = `${t.inspectorInflow}${nb.flowVal.toFixed(3)}`;
                          flowColor = 'text-emerald-400 bg-emerald-950/10 border-emerald-900/20';
                        }
                      }

                      return (
                        <div
                          key={idx}
                          className="flex flex-col p-3 rounded-xl border bg-slate-950/40 border-slate-850 hover:border-slate-800 transition-colors"
                        >
                          <div className="flex justify-between items-center text-[11px] mb-1.5">
                            <span className="text-slate-400">{t.inspectorDirection} d{idx + 1}</span>
                            <span className="text-slate-300 font-semibold">[ {nb.coord.join(', ')} ]</span>
                          </div>

                          <div className="flex justify-between items-baseline mb-2">
                            <span className="text-slate-500 text-[10px]">{t.inspectorPotentialShort}</span>
                            <span className={exists ? 'text-slate-200 font-semibold' : 'text-slate-600'}>
                              {exists ? nb.potential!.toFixed(3) : t.inspectorNotExist}
                            </span>
                          </div>

                          <div className={`px-2.5 py-1 text-center rounded border text-[10px] font-bold ${flowColor}`}>
                            {flowLabel}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Explanatory notes */}
            <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 text-xs text-slate-400 leading-relaxed flex flex-col gap-2">
              <h3 className="font-semibold text-slate-200 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider">
                <Info className="h-4 w-4 text-sky-400" />
                {t.summaryTitle}
              </h3>
              <p>
                {t.summaryPara1}
              </p>
              <p>
                {t.summaryPara2}
              </p>
            </section>

          </div>

        </div>

        {/* Footer with Madách Quote */}
        <footer className="mt-12 border-t border-slate-900/60 pt-8 pb-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="relative py-5 px-8 max-w-lg rounded-2xl bg-slate-950/40 border border-slate-850 shadow-2xl backdrop-blur-md overflow-hidden">
            <div className="absolute -top-10 -left-10 h-28 w-28 bg-sky-500/5 rounded-full blur-[30px] pointer-events-none" />
            <p className="text-sm font-serif italic text-slate-200 tracking-wide leading-relaxed">
              "A gép forog, az alkotó pihen."
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-2">
              — Madách Imre: Az ember tragédiája
            </p>
          </div>
          <p className="text-[10px] font-mono text-slate-600 tracking-wider">
            Deus Ex Machina Model Laboratory • Built with ❤️
          </p>
        </footer>

      </div>
    </div>
  );
}
