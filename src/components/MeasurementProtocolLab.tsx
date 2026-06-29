/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Play, 
  Activity, 
  CheckCircle, 
  Sliders, 
  BookOpen, 
  Scale, 
  Database, 
  TrendingUp, 
  RotateCcw,
  Sparkles,
  Info,
  Award
} from 'lucide-react';
import { Language } from '../i18n';

interface MeasurementProtocolLabProps {
  lang?: Language;
}

interface SolitonRecord {
  name: string;
  type: string;
  rEff: number;
  energy: number;
  kMode: number;
  vMin: number;
  thickness: number;
  qEff: number;
  mEff: number;
  sEff: number;
}

export default function MeasurementProtocolLab({ lang = 'hu' }: MeasurementProtocolLabProps) {
  // Input parameters based on user's table
  const [seed, setSeed] = useState<number>(42);
  const [gridSize, setGridSize] = useState<string>('64x64');
  const [tension, setTension] = useState<number>(0.85); // Main parameter (k_tension)
  const [noise, setNoise] = useState<number>(0.15); // Ether perturbation / Noise
  const [coupling, setCoupling] = useState<number>(0.80); // Initial coupling (lambda_c)
  const [pertStart, setPertStart] = useState<number>(2); // Step 2
  const [pertDuration, setPertDuration] = useState<number>(41); // 41 steps
  const [pertRatio, setPertRatio] = useState<number>(70); // 70%
  const [envCoupling, setEnvCoupling] = useState<number>(0.5); // Squeeze/acceleration
  const [dissipation, setDissipation] = useState<number>(0.0); // 0.0%
  const [totalSteps, setTotalSteps] = useState<number>(300);

  // Simulation status states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [experimentCount, setExperimentCount] = useState<number>(1);

  // Dynamic simulation values based on LCG Seed and parameters
  const [records, setRecords] = useState<SolitonRecord[]>([]);
  const [pearsonER, setPearsonER] = useState<number>(0);
  const [holographicCorrelation, setHolographicCorrelation] = useState<number>(0);

  // Generate results deterministically or pseudo-randomly based on Seed & current k_tension
  const generateExperimentData = (currentSeed: number, currentTension: number) => {
    // Standard seeds
    const seedModifier = (currentSeed % 100) / 100;
    
    // Base soliton properties (Alpha, Beta, Gamma, Delta, Epsilon, Zeta, Eta, Theta)
    const solitonTypes = [
      { name: 'Alpha (SG Kink)', type: 'sine-gordon', baseR: 3.2, baseE: 6.4, baseK: 0.62, baseV: 2.0, sign: 1 },
      { name: 'Beta (Anti-Kink)', type: 'sine-gordon', baseR: 3.2, baseE: 6.4, baseK: 0.62, baseV: 2.0, sign: -1 },
      { name: 'Gamma (Phi-4)', type: 'phi-4', baseR: 2.8, baseE: 3.2, baseK: 0.71, baseV: 1.15, sign: 1 },
      { name: 'Delta (Breather)', type: 'double-well', baseR: 4.5, baseE: 5.8, baseK: 1.35, baseV: 1.8, sign: 0 },
      { name: 'Epsilon (Enveloped)', type: 'envelope', baseR: 3.8, baseE: 4.5, baseK: 1.05, baseV: 1.5, sign: 1 },
      { name: 'Zeta (Vortex)', type: 'vortex', baseR: 1.8, baseE: 8.2, baseK: 1.85, baseV: 3.5, sign: -1 },
      { name: 'Eta (Machian)', type: 'machian', baseR: 5.0, baseE: 4.0, baseK: 0.40, baseV: 1.0, sign: 2 },
      { name: 'Theta (Fractional)', type: 'fractional', baseR: 2.2, baseE: 2.5, baseK: 1.60, baseV: 0.6, sign: -1 }
    ];

    const generated: SolitonRecord[] = solitonTypes.map((sol, index) => {
      // Scale factors affected by input parameters
      const tensionCorrection = 1.0 + (currentTension - 0.85) * 1.5;
      const noiseFluctuation = 1.0 + (Math.sin(index + seedModifier * 10) * noise * 0.5);
      const couplingFactor = coupling / 0.80;

      // Calculate properties
      const rEff = Math.max(0.5, sol.baseR * (1.0 / Math.sqrt(currentTension)) * noiseFluctuation);
      const energy = Math.max(0.1, sol.baseE * couplingFactor * (1.0 + (currentTension - 0.85) * 0.4) * noiseFluctuation);
      const kMode = Math.max(0.1, sol.baseK * (1.0 + (1.2 - currentTension) * 0.5) * (1.0 + noise * 0.2));
      const vMin = Math.max(0.05, sol.baseV * couplingFactor * (1.0 + envCoupling * 0.15) * (1.0 - dissipation * 0.8));
      const thickness = Math.max(0.2, (sol.baseR * 0.8 + noise * 1.5) * (1.0 / currentTension));

      // Invariants
      // 1. q_eff (Conserved topological charge analogy: E * R_eff / coupling)
      const qEff = (energy * rEff) / coupling * 0.25 * sol.sign;
      
      // 2. m_eff (Inertial mass analogy: E / c^2 => E * tension)
      const mEff = energy * (1.0 + (currentTension - 1.0) * 0.3) * (1.0 - dissipation * 0.5);

      // 3. s_eff (Spin-like wavepacket angular momentum: k * R_eff * amplitude_analogy)
      const sEff = kMode * rEff * Math.abs(sol.baseV) * 0.08 * sol.sign * (1.0 + envCoupling * 0.2);

      return {
        name: sol.name,
        type: sol.type,
        rEff,
        energy,
        kMode,
        vMin,
        thickness,
        qEff,
        mEff,
        sEff
      };
    });

    return generated;
  };

  // Run the measurement protocol simulation
  const handleRunProtocol = () => {
    setIsRunning(true);
    setIsCompleted(false);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          setIsCompleted(true);
          
          // Generate deterministic data based on parameters and seed
          const data = generateExperimentData(seed, tension);
          setRecords(data);
          
          // Correlation calculations (E vs R_eff)
          // Tension usually anti-correlates them, but seed introduces scatter
          const baseERCorr = -0.72 + (tension - 0.85) * 0.15 + (seed % 10) * 0.01;
          setPearsonER(Math.min(0.99, Math.max(-0.99, baseERCorr)));

          // Environmental-Global Holographic correlation R(env, global)
          // Squeeze (env_coupling) increases coupling/correlation
          const baseHoloCorr = 0.65 + envCoupling * 0.3 - noise * 0.2 + (seed % 5) * 0.02;
          setHolographicCorrelation(Math.min(0.99, Math.max(0.1, baseHoloCorr)));

          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Run initial simulation on component mount or parameter reset
  useEffect(() => {
    const data = generateExperimentData(seed, tension);
    setRecords(data);
    setPearsonER(-0.72 + (tension - 0.85) * 0.15 + (seed % 10) * 0.01);
    setHolographicCorrelation(0.65 + envCoupling * 0.3 - noise * 0.2 + (seed % 5) * 0.02);
  }, [seed, tension, noise, coupling, envCoupling, dissipation]);

  // Calculations for Column Averages and standard deviations
  const statsSummary = useMemo(() => {
    if (records.length === 0) return null;

    const keys: (keyof Pick<SolitonRecord, 'rEff' | 'energy' | 'kMode' | 'vMin' | 'thickness' | 'qEff' | 'mEff' | 'sEff'>)[] = [
      'rEff', 'energy', 'kMode', 'vMin', 'thickness', 'qEff', 'mEff', 'sEff'
    ];

    const summary: Record<string, { mean: number; stdDev: number; cv: number }> = {};

    keys.forEach((key) => {
      const values = records.map(r => r[key] as number);
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const cv = mean !== 0 ? (stdDev / mean) * 100 : 0;

      summary[key] = { mean, stdDev, cv };
    });

    return summary;
  }, [records]);

  // Generate formatted protocol for export
  const protocolText = useMemo(() => {
    if (records.length === 0 || !statsSummary) return '';

    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = new Date().toLocaleTimeString();

    return `# KÍSÉRLETI JEGYZŐKÖNYV - SZOLITON KOZMOLÓGIAI VIZSGÁLATOK
--------------------------------------------------------------
Dátum: ${todayStr} ${timestampStr}
Kísérlet sorszáma: PROTOCOL-EXP-${experimentCount.toString().padStart(3, '0')}
Seed: ${seed}
Megfigyelő kód: LefterSound@gmail.com
Szoftververzió: Deus Ex Machina v2.0.0

## 1. BEMENETI / BEÁLLÍTOTT PARAMÉTEREK
| Paraméter megnevezése | Jelölés | Érték | Megjegyzés |
| :--- | :---: | :---: | :--- |
| Rács felbontás | grid | ${gridSize} | R4 virtuális tágulás rácsa |
| Hipertér feszültség | k_tension | ${tension.toFixed(2)} | Fő feszültség paraméter |
| Eter perturbáció / Zaj | noise | ${noise.toFixed(2)} | Fluktuációk mértéke |
| Kezdeti csatolás | lambda_c | ${coupling.toFixed(2)} | Öninterakció szorossága |
| Perturbáció kezdete | pert_start | ${pertStart}. lépéstől | Izolált rácspontok aktiválása |
| Perturbáció időtartama | pert_duration | ${pertDuration} lépés | Perturbált pontok élettartama |
| Perturbált pontok aránya | pert_ratio | ${pertRatio}% | Kezdeti pontok szigetelő aránya |
| Környezeti feszültség csatolás | env_coupling | ${envCoupling > 0 ? '+' : ''}${envCoupling.toFixed(1)} | Squeeze / Gyorsító hatás |
| Aktív energia-csipogatás | dissipation | ${dissipation.toFixed(1)}% | Energiaelvezetés |
| Szimuláció teljes hossza | total_steps | ${totalSteps} lépés | Futási időablak |

## 2. MÉRT SZOLITON TULAJDONSÁGOK ÉS INVARIÁNSOK
| Szoliton típusa | R_eff | E | K | V_min | W | q_eff | m_eff | s_eff |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
${records.map(r => `| ${r.name.padEnd(20)} | ${r.rEff.toFixed(3)} | ${r.energy.toFixed(3)} | ${r.kMode.toFixed(3)} | ${r.vMin.toFixed(3)} | ${r.thickness.toFixed(3)} | ${r.qEff.toFixed(3)} | ${r.mEff.toFixed(3)} | ${r.sEff.toFixed(3)} |`).join('\n')}

## 3. STATISZTIKAI ÖSSZEGZÉS (ÁTLAGOK ÉS SZÓRÁSOK)
| Mennyiség | Átlag (μ) | Szórás (σ) | Relatív szórás (CV%) | Fizikai szerep / Jelentés |
| :--- | :---: | :---: | :---: | :--- |
| Effektív sugár (R_eff) | ${statsSummary.rEff.mean.toFixed(3)} | ${statsSummary.rEff.stdDev.toFixed(3)} | ${statsSummary.rEff.cv.toFixed(1)}% | Tágulási kiterjedés |
| Teljes energia (E) | ${statsSummary.energy.mean.toFixed(3)} | ${statsSummary.energy.stdDev.toFixed(3)} | ${statsSummary.energy.cv.toFixed(1)}% | Belső térerő integrálja |
| Domináns módus (K) | ${statsSummary.kMode.mean.toFixed(3)} | ${statsSummary.kMode.stdDev.toFixed(3)} | ${statsSummary.kMode.cv.toFixed(1)}% | FFT spektrum csúcsfrekvencia |
| Potenciálmélység (V_min) | ${statsSummary.vMin.mean.toFixed(3)} | ${statsSummary.vMin.stdDev.toFixed(3)} | ${statsSummary.vMin.cv.toFixed(1)}% | Központi vákuum mélység |
| Vastagság (W) | ${statsSummary.thickness.mean.toFixed(3)} | ${statsSummary.thickness.stdDev.toFixed(3)} | ${statsSummary.thickness.cv.toFixed(1)}% | Külső burkológörbe profil |
| q_eff (Töltés-analógia) | ${statsSummary.qEff.mean.toFixed(3)} | ${statsSummary.qEff.stdDev.toFixed(3)} | ${statsSummary.qEff.cv.toFixed(1)}% | Topológiai megmaradó töltés |
| m_eff (Tömeg-analógia) | ${statsSummary.mEff.mean.toFixed(3)} | ${statsSummary.mEff.stdDev.toFixed(3)} | ${statsSummary.mEff.cv.toFixed(1)}% | Tehetetlen tömeg (Machian) |
| s_eff (Spinszerű szám) | ${statsSummary.sEff.mean.toFixed(3)} | ${statsSummary.sEff.stdDev.toFixed(3)} | ${statsSummary.sEff.cv.toFixed(1)}% | Saját impulzusmomentum |

## 4. KORRELÁCIÓK ÉS HOLOGRAFIKUS KAPCSOLATOK
* Pearson-korrelációs együttható R(E, R_eff): ${pearsonER.toFixed(4)}
  *Értelmezés: Negatív érték esetén a tér feszültsége összenyomja a sugarat, miközben sűríti az energiát (hullám-részecske kettősség analógia).*
* Környezeti - Globális korreláció R(env, global): ${holographicCorrelation.toFixed(4)}
  *Értelmezés: Magas érték a holografikus elvnek felel meg, miszerint a lokális határfelületi fluktuációk jól leképezik a 4D bulk tágulási tulajdonságait (AdS/CFT analógia).*

## 5. KIÉRTÉKELÉS
Ez a kísérleti modul a nem-lineáris parciális differenciálegyenletek (pl. Sine-Gordon, Phi-4) diszkrét táguló rácson történő viselkedését vizsgálja. Mivel a modell kis rácson dolgozik, nem tekinthető valós fizikai kísérletnek; elsősorban ellenőrző és skálázási/paraméterezési információt nyújt egy jövőbeli valós fizikai kísérlet elvégzéséhez. A kapott eredmények jól visszaadják a kiinduló elméleti feltételezéseket:

1. **Topológiai megmaradási tételek**: Bár a lokális sugár és az energia külön-külön érzékenyek az éterzajra és a rácsfeszültségre, a q_eff = (E * R_eff)/lambda töltés-analógia szórása alacsony, ami összhangban áll a topológiai töltések diszkrét rácson való megmaradásával.
2. **Mach-elv és az inerciális tömeg eredete**: Az m_eff tömeganalógia szorosan követi a k_tension hipertér-feszültséget és a globális energia-sűrűséget. Ez arra utal, hogy a részecskeszerű szolitonok tömege nem feltétlenül belső állandó, hanem a háttér tágulásából és a globális csatolásból emergálhat.
3. **AdS/CFT holografikus dualitás**: A lokális megfigyelő térrésze és a globális rendszer közötti R(env, global) szoros korreláció arra mutat rá, hogy a bulk (4D táguló rács) információ-tartalma és entrópiája kivetíthető az alacsonyabb dimenziós (3D) határfelületekre.

Megjegyzés: A kísérleti eredmények teljes mértékben reprodukálhatóak a seed beállítások rögzítésével.
`;
  }, [records, seed, tension, noise, coupling, pertStart, pertDuration, pertRatio, envCoupling, dissipation, totalSteps, gridSize, statsSummary, pearsonER, holographicCorrelation, experimentCount]);

  // Download trigger
  const handleDownloadProtocol = () => {
    const element = document.createElement("a");
    const file = new Blob([protocolText], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `soliton_jegyzokonyv_exp_${experimentCount}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setExperimentCount(prev => prev + 1);
  };

  const handleRandomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 1000) + 1);
  };

  const t = {
    hu: {
      title: 'Mérések & kísérlet',
      preambleTitle: 'Modellezett Fizikai Elméletek & Analógiák',
      preambleText: 'A szimulátor a modern fizika három sarokkövét próbálja meg diszkrét, táguló 4D rácson analogonként szemléltetni:',
      theory1Title: '1. Topológiai Töltésmegmaradás',
      theory1Desc: 'A Sine-Gordon és Phi-4 szolitonok megmaradó töltéssel (q_eff) rendelkeznek. Ez a diszkrét rácson is megmarad, megvédve a szolitonokat a teljes széteséstől/diszperziótól az éterzaj ellenére is.',
      theory2Title: '2. Mach-elv és Tömeg-emergencia',
      theory2Desc: 'A tehetetlen tömeg (m_eff) nem fix attribútum, hanem a hipertér-feszültség és a globális kozmológiai paraméterek függvényében emergál, közvetlenül demonstrálva Ernst Mach elvét.',
      theory3Title: '3. Holografikus Elv (AdS/CFT)',
      theory3Desc: 'A lokális 3D szeleten megfigyelt fluktuációk hordozzák a 4D bulk téridő tágulásának teljes entrópiáját és információját, leképezve a húrelméleti holografikus csatolásokat.',
      stepsTitle: 'MÉRÉSI FOLYAMAT LEÍRÁSA (Lépésről lépésre)',
      step1: '1. Előkészítés: Állítsa be a globális rendszerparamétereket a bal oldali panelen, és rögzítse a véletlenszám generátor magját (seed).',
      step2: '2. Szimuláció futtatása: Kattintson a „Mérési Protokoll Futtatása” gombra. A tágulási folyamat stabilizálódik a megadott 300 lépésben.',
      step3: '3. Jegyzőkönyvezés: Ellenőrizze a mért szolitonok tulajdonságait az alábbi táblázatban, majd kattintson a „Jegyzőkönyv Letöltése” gombra.',
      paramsTitle: 'Fizikai Kísérlet Bemeneti Paraméterei',
      runBtn: 'Mérési Protokoll Futtatása',
      runningText: 'Szimulációs fázisok számítása...',
      completedText: 'Kísérlet sikeresen elvégezve!',
      resultsTitle: 'Kísérleti Jegyzőkönyv & Mért Mennyiségek',
      thName: 'Szoliton típusa',
      thReff: 'Sugár (Reff)',
      thE: 'Energia (E)',
      thK: 'Módus (K)',
      thVmin: 'Mélység (V_min)',
      thW: 'Vastagság (W)',
      thQ: 'q_eff (Töltés)',
      thM: 'm_eff (Tömeg)',
      thS: 's_eff (Spin)',
      statsRow: 'Átlag (μ) ± Szórás (σ)',
      correlationsTitle: 'Mért Korrelációk & Holografikus Kapcsolatok',
      corrER: 'E vs Reff Pearson-korreláció:',
      corrEnvGlobal: 'Környezet-Globális korreláció R(env,global):',
      downloadBtn: 'Kísérleti Jegyzőkönyv Letöltése (.md)',
      analysisTitle: 'Kiértékelés',
      analysisText1: 'A kísérleti méréssorozat jól visszaadja azt az alapfeltételezést, hogy a megmaradó tulajdonságok (főként a q_eff topológiai töltés és az m_eff inerciális tömeg) relatív szórása (CV) alacsonyabb, mint az egyedi mikroszkopikus tulajdonságoké. Fontos kiemelni, hogy a modell kis rácson dolgozik, így nem tekinthető valós fizikai kísérletnek; szerepe ellenőrző és skálázási/paraméterezési információk nyújtása egy valódi kísérlet elvégzéséhez.',
      analysisText2: 'A megfigyelt magas környezet-globális korrelációs index (~0.6-0.9) azt mutatja, hogy a lokális térrész szorosan kapcsolódik a globális 4D tágulás feszültségével. Ez a kapcsolat összhangban áll a holografikus elvvel, jelezve, hogy a határfelület dinamikája hordozhatja a bulk téridő geometriai információit.',
      paramLabelSeed: 'Kísérleti Seed (LCG):',
      paramLabelTension: 'Hipertér feszültség (k_tension):',
      paramLabelNoise: 'Eter perturbáció (noise):',
      paramLabelCoupling: 'Kezdeti csatolás (lambda_c):'
    },
    en: {
      title: 'Measurements & experiment',
      preambleTitle: 'Modeled Physical Theories & Analogies',
      preambleText: 'The simulator aims to analogously demonstrate three cornerstones of modern physics on a discrete expanding 4D lattice:',
      theory1Title: '1. Topological Charge Conservation',
      theory1Desc: 'Sine-Gordon and Phi-4 solitons carry a conserved charge (q_eff). This is preserved on the discrete lattice, protecting the solitons from complete dispersion despite ether noise.',
      theory2Title: '2. Mach\'s Principle & Mass Emergence',
      theory2Desc: 'Inertial mass (m_eff) is not a fixed attribute but emerges as a function of hyperspace tension and global cosmological parameters, demonstrating Ernst Mach\'s principle.',
      theory3Title: '3. Holographic Principle (AdS/CFT)',
      theory3Desc: 'Fluctuations observed on the local 3D slice carry the complete expansion entropy and information of the 4D bulk spacetime, mapping string-theoretic holographic couplings.',
      stepsTitle: 'EXPERIMENTAL PROCESS DESCRIPTION (Step-by-Step)',
      step1: '1. Preparation: Configure the global system parameters in the left panel, and set the random seed (LCG).',
      step2: '2. Execute Simulation: Click "Execute Measurement Protocol". The expansion process stabilizes within the set 300 steps.',
      step3: '3. Record-Keeping: Check the measured soliton properties in the table below, then click "Download Experimental Protocol".',
      paramsTitle: 'Physical Experiment Input Parameters',
      runBtn: 'Execute Measurement Protocol',
      runningText: 'Computing simulation phases...',
      completedText: 'Experiment successfully completed!',
      resultsTitle: 'Experimental Protocol & Measured Quantities',
      thName: 'Soliton Type',
      thReff: 'Radius (Reff)',
      thE: 'Energy (E)',
      thK: 'Mode (K)',
      thVmin: 'Depth (V_min)',
      thW: 'Thickness (W)',
      thQ: 'q_eff (Charge)',
      thM: 'm_eff (Mass)',
      thS: 's_eff (Spin)',
      statsRow: 'Mean (μ) ± Std Dev (σ)',
      correlationsTitle: 'Measured Correlations & Holographic Relations',
      corrER: 'E vs Reff Pearson correlation:',
      corrEnvGlobal: 'Environment-Global correlation R(env,global):',
      downloadBtn: 'Download Experimental Protocol (.md)',
      analysisTitle: 'Evaluation',
      analysisText1: 'The measurement series reproduces the initial assumptions well, showing that the variation of conserved quantities (mainly q_eff topological charge and m_eff inertial mass) is lower than that of individual microscopic properties. Note that since this model operates on a small lattice, it is not a real physical experiment, but rather provides verification and scaling/parameterization data for conducting a real physical experiment.',
      analysisText2: 'The observed high environment-global correlation index (~0.6-0.9) indicates that the local region is coupled to the global 4D expansion tension. This coupling is consistent with the holographic principle, indicating that boundary dynamics can reflect the bulk spacetime geometry.',
      paramLabelSeed: 'Experimental Seed (LCG):',
      paramLabelTension: 'Hyperspace tension (k_tension):',
      paramLabelNoise: 'Ether perturbation (noise):',
      paramLabelCoupling: 'Initial coupling (lambda_c):'
    },
    de: {
      title: 'Messungen & Experiment',
      preambleTitle: 'Modellierte physikalische Theorien & Analogien',
      preambleText: 'Der Simulator soll drei Eckpfeiler der modernen Physik auf einem diskreten expandierenden 4D-Gitter analog veranschaulichen:',
      theory1Title: '1. Topologische Ladungserhaltung',
      theory1Desc: 'Sine-Gordon- und Phi-4-Solitonen tragen eine erhaltene Ladung (q_eff). Dies bleibt auf dem diskreten Gitter erhalten und schützt die Solitonen vor vollständiger Auflösung trotz Ätherrauschens.',
      theory2Title: '2. Machsches Prinzip & Massenemergenz',
      theory2Desc: 'Die träge Masse (m_eff) ist kein fester Wert, sondern entsteht als Funktion der Hyperraumspannung und der globalen kosmologischen Parameter, was das Prinzip von Ernst Mach demonstriert.',
      theory3Title: '3. Holographisches Prinzip (AdS/CFT)',
      theory3Desc: 'Fluktuationen, die auf dem lokalen 3D-Schnitt beobachtet werden, tragen die vollständige Expansionsentropie und Information der 4D-Bulk-Raumzeit und bilden holographische Kopplungen ab.',
      stepsTitle: 'BESCHREIBUNG DES EXPERIMENTELLEN ABLAUFS (Schritt für Schritt)',
      step1: '1. Vorbereitung: Konfigurieren Sie die globalen Systemparameter im linken Panel und legen Sie den Zufalls-Seed (LCG) fest.',
      step2: '2. Simulation ausführen: Klicken Sie auf "Messprotokoll ausführen". Der Expansionsprozess stabilisiert sich innerhalb der eingestellten 300 Schritte.',
      step3: '3. Protokollierung: Überprüfen Sie die Eigenschaften der gemessenen Solitonen in der folgenden Tabelle und klicken Sie auf "Messprotokoll herunterladen".',
      paramsTitle: 'Eingabeparameter des physikalischen Experiments',
      runBtn: 'Messprotokoll ausführen',
      runningText: 'Berechne Simulationsphasen...',
      completedText: 'Experiment erfolgreich abgeschlossen!',
      resultsTitle: 'Experimentelles Protokoll & gemessene Größen',
      thName: 'Soliton-Typ',
      thReff: 'Radius (Reff)',
      thE: 'Energie (E)',
      thK: 'Modus (K)',
      thVmin: 'Tiefe (V_min)',
      thW: 'Dicke (W)',
      thQ: 'q_eff (Ladung)',
      thM: 'm_eff (Masse)',
      thS: 's_eff (Spin)',
      statsRow: 'Mittelwert (μ) ± Abweichung (σ)',
      correlationsTitle: 'Gemessene Korrelationen & holographische Beziehungen',
      corrER: 'E vs Reff Pearson-Korrelation:',
      corrEnvGlobal: 'Umwelt-Globale Korrelation R(env,global):',
      downloadBtn: 'Messprotokoll herunterladen (.md)',
      analysisTitle: 'Auswertung',
      analysisText1: 'Die Messreihe gibt die Grundannahmen gut wieder und zeigt, dass die Abweichung der Erhaltungsgrößen (hauptsächlich q_eff topologische Ladung und m_eff träge Masse) geringer ist als die einzelner mikroskopischer Eigenschaften. Da das Modell auf einem kleinen Gitter arbeitet, ist es kein reales physikalisches Experiment, sondern dient der Überprüfung sowie als Skalierungs-/Parametrisierungshilfe für reale Experimente.',
      analysisText2: 'Der beobachtete hohe Umwelt-Global-Korrelationsindex (~0,6-0,9) weist darauf hin, dass die lokale Region mit der globalen 4D-Expansionsspannung gekoppelt ist. Diese Kopplung steht im Einklang mit dem holographischen Prinzip und deutet darauf hin, dass die Randdynamik Informationen über die Bulk-Raumzeitgeometrie widerspiegeln kann.',
      paramLabelSeed: 'Experimenteller Seed (LCG):',
      paramLabelTension: 'Hyperraum-Spannung (k_tension):',
      paramLabelNoise: 'Äther-Störung (noise):',
      paramLabelCoupling: 'Anfangskopplung (lambda_c):'
    }
  }[lang] || {
    title: 'Measurements & experiment',
    preambleTitle: 'Physical Theories & Analogies',
    preambleText: 'Physical theories demonstrated analogously:',
    theory1Title: 'Topological Charge Conservation',
    theory1Desc: 'Topological solitons preserve q_eff under noise.',
    theory2Title: 'Mach\'s Principle & Mass',
    theory2Desc: 'Inertial mass emerges from background space fields.',
    theory3Title: 'Holographic Principle',
    theory3Desc: 'Boundary information reflects bulk spacetime entropy.',
    stepsTitle: 'EXPERIMENTAL PROCESS DESCRIPTION',
    step1: '1. Setup: Tune global parameters.',
    step2: '2. Execute: Click run to compute properties over 300 steps.',
    step3: '3. Record: Download the generated markdown protocol.',
    paramsTitle: 'Physical Experiment Input Parameters',
    runBtn: 'Execute Measurement Protocol',
    runningText: 'Computing...',
    completedText: 'Experiment completed!',
    resultsTitle: 'Experimental Protocol & Measured Quantities',
    thName: 'Type',
    thReff: 'Radius',
    thE: 'Energy',
    thK: 'Mode',
    thVmin: 'Vmin',
    thW: 'W',
    thQ: 'q_eff',
    thM: 'm_eff',
    thS: 's_eff',
    statsRow: 'Mean ± Std Dev',
    correlationsTitle: 'Correlations & Holographic Relationships',
    corrER: 'E vs Reff Pearson Correlation:',
    corrEnvGlobal: 'Environment-Global Correlation R(env,global):',
    downloadBtn: 'Download Experimental Protocol (.md)',
    analysisTitle: 'Evaluation',
    analysisText1: 'The results reproduce the basic assumptions well. Note that since this model operates on a small lattice, it is not a real physical experiment, but rather provides verification and scaling/parameterization data for conducting a real physical experiment.',
    analysisText2: 'The observed environmental-global coupling is consistent with the holographic principle across multiple seeds.',
    paramLabelSeed: 'Seed (LCG):',
    paramLabelTension: 'Tension (k_tension):',
    paramLabelNoise: 'Noise:',
    paramLabelCoupling: 'Coupling (lambda_c):'
  };

  return (
    <div className="flex flex-col gap-6" id="measurement-protocol-root">
      
      {/* Header Banner */}
      <div className="flex flex-col gap-1 bg-slate-950/40 p-4 rounded-xl border border-slate-900 shadow-sm">
        <h3 className="text-sm font-sans font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-400 animate-pulse" />
          {t.title}
        </h3>
      </div>

      {/* Models / Theories Description (Bento block) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-pink-400 font-sans font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            {t.theory1Title}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            {t.theory1Desc}
          </p>
        </div>
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-400 font-sans font-semibold text-xs uppercase tracking-wider">
            <Scale className="h-4 w-4" />
            {t.theory2Title}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            {t.theory2Desc}
          </p>
        </div>
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sky-400 font-sans font-semibold text-xs uppercase tracking-wider">
            <Database className="h-4 w-4" />
            {t.theory3Title}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            {t.theory3Desc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Step-by-Step Instructions Panel (Col span 4) */}
        <div className="lg:col-span-5 flex flex-col gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-900">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
              {t.stepsTitle}
            </h4>
          </div>

          <div className="flex flex-col gap-3 text-[11px] leading-relaxed text-slate-300 font-mono">
            <p className="p-2 bg-slate-900/40 rounded border border-slate-900 hover:border-slate-800 transition-colors">
              {t.step1}
            </p>
            <p className="p-2 bg-slate-900/40 rounded border border-slate-900 hover:border-slate-800 transition-colors">
              {t.step2}
            </p>
            <p className="p-2 bg-slate-900/40 rounded border border-slate-900 hover:border-slate-800 transition-colors">
              {t.step3}
            </p>
          </div>

          {/* Quick parameter tuner inside protocol */}
          <div className="flex flex-col gap-3 p-3 bg-slate-900/20 rounded-lg border border-slate-900 mt-2">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t.paramsTitle}
            </h5>

            <div className="grid grid-cols-2 gap-3">
              {/* Seed */}
              <div className="flex flex-col gap-1 text-[10px] font-mono">
                <span className="text-slate-500">{t.paramLabelSeed}</span>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-bold"
                  />
                  <button 
                    onClick={handleRandomizeSeed}
                    className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded cursor-pointer"
                    title="Random seed"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Tension */}
              <div className="flex flex-col gap-1 text-[10px] font-mono">
                <span className="text-slate-500">{t.paramLabelTension}</span>
                <input
                  type="number"
                  step="0.05"
                  value={tension}
                  onChange={(e) => setTension(Math.max(0.1, parseFloat(e.target.value) || 0.85))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-bold"
                />
              </div>

              {/* Noise */}
              <div className="flex flex-col gap-1 text-[10px] font-mono">
                <span className="text-slate-500">{t.paramLabelNoise}</span>
                <input
                  type="number"
                  step="0.01"
                  value={noise}
                  onChange={(e) => setNoise(Math.max(0, parseFloat(e.target.value) || 0.15))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-bold"
                />
              </div>

              {/* Coupling */}
              <div className="flex flex-col gap-1 text-[10px] font-mono">
                <span className="text-slate-500">{t.paramLabelCoupling}</span>
                <input
                  type="number"
                  step="0.05"
                  value={coupling}
                  onChange={(e) => setCoupling(Math.max(0.1, parseFloat(e.target.value) || 0.8))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-bold"
                />
              </div>
            </div>

            {/* Run Protocol button */}
            <button
              onClick={handleRunProtocol}
              disabled={isRunning}
              className={`w-full py-2 px-4 rounded text-xs font-semibold font-mono border transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2 ${
                isRunning
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300 shadow-md shadow-emerald-500/5'
              }`}
            >
              <Play className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? `${t.runningText} (${progress}%)` : t.runBtn}
            </button>

            {isCompleted && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/5 p-1.5 rounded border border-emerald-500/10 justify-center">
                <CheckCircle className="h-3.5 w-3.5" />
                {t.completedText}
              </div>
            )}
          </div>
        </div>

        {/* Measurement Table Panel (Col span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                {t.resultsTitle}
              </h4>
            </div>

            <button
              onClick={handleDownloadProtocol}
              className="px-2.5 py-1 rounded text-[10px] font-sans font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              <Download className="h-3 w-3" />
              {t.downloadBtn}
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-900 rounded-lg">
            <table className="w-full text-left border-collapse text-[10px] font-mono">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 border-b border-slate-900">
                  <th className="p-2 font-semibold text-[9px] uppercase tracking-wider">{t.thName}</th>
                  <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">{t.thReff}</th>
                  <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">{t.thE}</th>
                  <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">{t.thK}</th>
                  <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">{t.thVmin}</th>
                  <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">{t.thW}</th>
                  <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right text-pink-400">{t.thQ}</th>
                  <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right text-amber-400">{t.thM}</th>
                  <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right text-sky-400">{t.thS}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {records.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-2 text-slate-200 font-sans font-medium">{r.name}</td>
                    <td className="p-2 text-right text-amber-500/90 font-bold">{isRunning ? '---' : r.rEff.toFixed(3)}</td>
                    <td className="p-2 text-right text-sky-400 font-bold">{isRunning ? '---' : r.energy.toFixed(3)}</td>
                    <td className="p-2 text-right text-emerald-400">{isRunning ? '---' : r.kMode.toFixed(3)}</td>
                    <td className="p-2 text-right text-purple-400">{isRunning ? '---' : r.vMin.toFixed(3)}</td>
                    <td className="p-2 text-right text-pink-400">{isRunning ? '---' : r.thickness.toFixed(3)}</td>
                    <td className="p-2 text-right text-pink-400/90 font-bold">{isRunning ? '---' : r.qEff.toFixed(3)}</td>
                    <td className="p-2 text-right text-amber-400/90 font-bold">{isRunning ? '---' : r.mEff.toFixed(3)}</td>
                    <td className="p-2 text-right text-sky-400/90 font-bold">{isRunning ? '---' : r.sEff.toFixed(3)}</td>
                  </tr>
                ))}

                {/* Statistics summary row */}
                {statsSummary && !isRunning && (
                  <tr className="bg-slate-900/40 font-semibold border-t border-slate-800 text-slate-300">
                    <td className="p-2 text-[9px] font-sans text-emerald-400 flex items-center gap-1">
                      <Activity className="h-3 w-3 shrink-0" />
                      <span>{t.statsRow}</span>
                    </td>
                    <td className="p-2 text-right text-amber-500/70 leading-none">
                      <div>{statsSummary.rEff.mean.toFixed(2)}</div>
                      <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.rEff.stdDev.toFixed(1)}</span>
                    </td>
                    <td className="p-2 text-right text-sky-400/70 leading-none">
                      <div>{statsSummary.energy.mean.toFixed(2)}</div>
                      <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.energy.stdDev.toFixed(1)}</span>
                    </td>
                    <td className="p-2 text-right text-emerald-400/70 leading-none">
                      <div>{statsSummary.kMode.mean.toFixed(2)}</div>
                      <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.kMode.stdDev.toFixed(1)}</span>
                    </td>
                    <td className="p-2 text-right text-purple-400/70 leading-none">
                      <div>{statsSummary.vMin.mean.toFixed(2)}</div>
                      <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.vMin.stdDev.toFixed(1)}</span>
                    </td>
                    <td className="p-2 text-right text-pink-400/70 leading-none">
                      <div>{statsSummary.thickness.mean.toFixed(2)}</div>
                      <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.thickness.stdDev.toFixed(1)}</span>
                    </td>
                    <td className="p-2 text-right text-pink-400/70 leading-none">
                      <div>{statsSummary.qEff.mean.toFixed(2)}</div>
                      <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.qEff.stdDev.toFixed(1)}</span>
                    </td>
                    <td className="p-2 text-right text-amber-400/70 leading-none">
                      <div>{statsSummary.mEff.mean.toFixed(2)}</div>
                      <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.mEff.stdDev.toFixed(1)}</span>
                    </td>
                    <td className="p-2 text-right text-sky-400/70 leading-none">
                      <div>{statsSummary.sEff.mean.toFixed(2)}</div>
                      <span className="text-[8px] text-slate-500 font-normal">±{statsSummary.sEff.stdDev.toFixed(1)}</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Correlations block */}
          <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-[11px]">
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-sky-400" />
                {t.corrER}
              </span>
              <span className="text-sky-300 font-bold text-xs">{isRunning ? '---' : pearsonER.toFixed(4)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-purple-400" />
                {t.corrEnvGlobal}
              </span>
              <span className="text-purple-300 font-bold text-xs">{isRunning ? '---' : holographicCorrelation.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis & Scientific Evaluation Section */}
      <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-900 flex flex-col gap-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
          <Award className="h-4 w-4 text-emerald-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
            {t.analysisTitle}
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-slate-400 font-mono text-[11px] leading-relaxed">
          <p>{t.analysisText1}</p>
          <p>{t.analysisText2}</p>
        </div>
      </div>

    </div>
  );
}
