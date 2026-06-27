/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ModelStats } from '../model/toyModel';
import {
  Activity,
  Hash,
  Coins,
  Scale,
  Brain,
  TrendingUp,
  Boxes,
  Compass,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { Language } from '../i18n';

interface StatsPanelProps {
  stats: ModelStats;
  lang?: Language;
}

export default function StatsPanel({ stats, lang = 'hu' }: StatsPanelProps) {
  // Formatters
  const f = (num: number, dec = 2) => num.toLocaleString(lang === 'hu' ? 'hu-HU' : lang === 'de' ? 'de-DE' : 'en-US', { maximumFractionDigits: dec });
  const fSci = (num: number) => {
    if (num === 0) return '0';
    if (num < 1e-4 || num > 1e6) {
      return num.toExponential(3);
    }
    return f(num, 3);
  };

  // Translation dictionary
  const trans = {
    hu: {
      panelTitle: 'Rendszer Metrikák és Állapotjelzők',
      panelDesc: 'A 4D skalár potenciál áramlás dinamikus mérőszámai.',
      tStep: 'Szimulációs Lépés',
      dStep: 'Az időben végrehajtott szinkron lépések száma.',
      tSites: 'Rácspontok Száma',
      dSites: 'Az összes aktív rácspont a 4D térben (növekszik a határokon).',
      tTotal: 'Megmaradó Összpotenciál',
      dTotal: 'A rendszer teljes energiája. Szigorúan megmarad (fizikai konzisztencia).',
      tMax: 'Maximális Potenciál',
      dMax: 'A rács legmagasabb egyedi potenciál értéke.',
      tGini: 'Gini-együttható (Egyenlőtlenség)',
      dGini: '0 = teljes egyenlőség, 1 = az összes energia egyetlen pontban sűrűsödik.',
      tEntropy: 'Shannon-entrópia',
      dEntropy: 'A potenciáleloszlás statisztikai rendezetlensége.',
      tCorr: 'Szomszédsági Korreláció',
      dCorr: 'Pearson index a rácspontok és szomszédjaik átlaga között. Pozitív = klasztereződés.',
      tClusters: 'Kiemelkedő Klaszterek száma',
      dClusters: 'Összefüggő magas potenciálú régiók száma a rácson (küszöb: átlag + std).',
      tMaxCluster: 'Legnagyobb Klaszter Mérete',
      dMaxCluster: 'A legnagyobb egybefüggő kiemelkedő régió rácspontjainak száma.',
      tWavePct: '3D Hiperfelület Potenciál Arány',
      dWavePct: (pct: string, cnt: string) => `A külső 3D hullámfronton lévő potenciál az összpotenciál arányában (${cnt} rácsponton).`,
      tCorePct: 'Belső Mag Potenciál Arány',
      dCorePct: (pct: string, cnt: string) => `A belső magban lévő potenciál aránya (${cnt} rácsponton). Magas értéknél a mag homogén.`,
      tWaveGini: 'Hullámfront Klaszterizáció (Gini)',
      dWaveGini: 'A külső határfelületen mérhető egyenetlenség. A magas érték egyedi zárt formákat jelez.'
    },
    en: {
      panelTitle: 'System Metrics & Indicators',
      panelDesc: 'Dynamic metrics of the 4D scalar potential flow.',
      tStep: 'Simulation Step',
      dStep: 'Number of synchronized simulation steps executed in time.',
      tSites: 'Grid Points Count',
      dSites: 'Total active grid points in the 4D space (grows dynamically at boundaries).',
      tTotal: 'Conserved Total Potential',
      dTotal: 'The total energy of the system. Strictly conserved (physical consistency).',
      tMax: 'Max Potential',
      dMax: 'The highest single potential value in the lattice.',
      tGini: 'Gini Coefficient (Inequality)',
      dGini: '0 = perfect equality, 1 = all energy concentrated in a single node.',
      tEntropy: 'Shannon Entropy',
      dEntropy: 'Statistical randomness and disorder of the potential distribution.',
      tCorr: 'Neighborhood Correlation',
      dCorr: 'Pearson index between grid points and their neighbors average. Positive = clustering.',
      tClusters: 'High-Potential Clusters',
      dClusters: 'Connected regions of high potential on the lattice (threshold: mean + std).',
      tMaxCluster: 'Largest Cluster Size',
      dMaxCluster: 'Number of grid points in the largest connected high-potential region.',
      tWavePct: '3D Hypersurface Potential Ratio',
      dWavePct: (pct: string, cnt: string) => `Potential on the outer 3D wavefront relative to total potential (on ${cnt} points).`,
      tCorePct: 'Inner Core Potential Ratio',
      dCorePct: (pct: string, cnt: string) => `Potential ratio in the enclosed inner core (on ${cnt} points). High values mean homogeneous core.`,
      tWaveGini: 'Wavefront Clustering (Gini)',
      dWaveGini: 'Inequality on the outer boundary. High values signal persistent localized structures.'
    },
    de: {
      panelTitle: 'Systemmetriken & Statusanzeigen',
      panelDesc: 'Dynamische Messgrößen des 4D-Skalarpotenzialflusses.',
      tStep: 'Simulationsschritt',
      dStep: 'Anzahl der synchron ausgeführten Simulationsschritte in der Zeit.',
      tSites: 'Gitterpunkte Anzahl',
      dSites: 'Gesamte aktive Gitterpunkte im 4D-Raum (wächst dynamisch an Grenzen).',
      tTotal: 'Erhaltenes Gesamtpotenzial',
      dTotal: 'Die Gesamtenergie des Systems. Strikt erhalten (physikalische Konsistenz).',
      tMax: 'Maximales Potenzial',
      dMax: 'Der höchste einzelne Potenzialwert im Gitter.',
      tGini: 'Gini-Koeffizient (Ungleichheit)',
      dGini: '0 = perfekte Gleichheit, 1 = die gesamte Energie konzentriert sich in einem Punkt.',
      tEntropy: 'Shannon-Entropie',
      dEntropy: 'Statistische Unordnung der Potenzialverteilung.',
      tCorr: 'Nachbarschaftskorrelation',
      dCorr: 'Pearson-Index zwischen Gitterpunkten und dem Mittelwert ihrer Nachbarn. Positiv = Clusterbildung.',
      tClusters: 'Hervorragende Cluster-Anzahl',
      dClusters: 'Zusammenhängende Regionen mit hohem Potenzial (Schwellenwert: Mittelwert + Std.Abw.).',
      tMaxCluster: 'Größte Clustergröße',
      dMaxCluster: 'Anzahl der Gitterpunkte in der größten zusammenhängenden Region mit hohem Potenzial.',
      tWavePct: '3D-Hyperfläche Potenzialverhältnis',
      dWavePct: (pct: string, cnt: string) => `Potenzial auf der äußeren 3D-Wellenfront im Verhältnis zum Gesamtpotenzial (auf ${cnt} Punkten).`,
      tCorePct: 'Innerer Kern Potenzialverhältnis',
      dCorePct: (pct: string, cnt: string) => `Potenzialanteil im eingeschlossenen inneren Kern (auf ${cnt} Punkten). Hohe Werte bedeuten einen homogenen Kern.`,
      tWaveGini: 'Wellenfront-Clusterung (Gini)',
      dWaveGini: 'Ungleichheit auf der äußeren Grenzfläche. Hohe Werte deuten auf anhaltende lokale Strukturen hin.'
    }
  };

  const t = trans[lang] || trans.hu;

  const statCards = [
    {
      title: t.tStep,
      value: stats.step.toString(),
      desc: t.dStep,
      icon: <Activity className="h-4 w-4 text-emerald-400" />,
      color: 'border-emerald-500/15 bg-emerald-500/5',
    },
    {
      title: t.tSites,
      value: f(stats.num_sites, 0),
      desc: t.dSites,
      icon: <Hash className="h-4 w-4 text-sky-400" />,
      color: 'border-sky-500/15 bg-sky-500/5',
    },
    {
      title: t.tTotal,
      value: fSci(stats.sum),
      desc: t.dTotal,
      icon: <Coins className="h-4 w-4 text-amber-400" />,
      color: 'border-amber-500/15 bg-amber-500/5',
    },
    {
      title: t.tMax,
      value: fSci(stats.max),
      desc: t.dMax,
      icon: <ArrowUpRight className="h-4 w-4 text-red-400" />,
      color: 'border-red-500/15 bg-red-500/5',
    },
    {
      title: t.tGini,
      value: stats.gini.toFixed(4),
      desc: t.dGini,
      icon: <Scale className="h-4 w-4 text-indigo-400" />,
      color: 'border-indigo-500/15 bg-indigo-500/5',
    },
    {
      title: t.tEntropy,
      value: stats.entropy.toFixed(4),
      desc: t.dEntropy,
      icon: <Brain className="h-4 w-4 text-fuchsia-400" />,
      color: 'border-fuchsia-500/15 bg-fuchsia-500/5',
    },
    {
      title: t.tCorr,
      value: stats.neighbor_corr.toFixed(4),
      desc: t.dCorr,
      icon: <TrendingUp className="h-4 w-4 text-pink-400" />,
      color: 'border-pink-500/15 bg-pink-500/5',
    },
    {
      title: t.tClusters,
      value: stats.num_clusters.toString(),
      desc: t.dClusters,
      icon: <Boxes className="h-4 w-4 text-violet-400" />,
      color: 'border-violet-500/15 bg-violet-500/5',
    },
    {
      title: t.tMaxCluster,
      value: f(stats.largest_cluster, 0),
      desc: t.dMaxCluster,
      icon: <Compass className="h-4 w-4 text-teal-400" />,
      color: 'border-teal-500/15 bg-teal-500/5',
    },
    {
      title: t.tWavePct,
      value: `${f(stats.wavefront_potential_pct, 2)}%`,
      desc: t.dWavePct(`${f(stats.wavefront_potential_pct, 2)}%`, f(stats.wavefront_sites_count, 0)),
      icon: <ArrowUpRight className="h-4 w-4 text-sky-400" />,
      color: 'border-sky-500/15 bg-sky-500/5',
    },
    {
      title: t.tCorePct,
      value: `${f(stats.core_potential_pct, 2)}%`,
      desc: t.dCorePct(`${f(stats.core_potential_pct, 2)}%`, f(stats.core_sites_count, 0)),
      icon: <Activity className="h-4 w-4 text-emerald-400" />,
      color: 'border-emerald-500/15 bg-emerald-500/5',
    },
    {
      title: t.tWaveGini,
      value: stats.wavefront_gini.toFixed(4),
      desc: t.dWaveGini,
      icon: <Scale className="h-4 w-4 text-amber-400" />,
      color: 'border-amber-500/15 bg-amber-500/5',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-md font-semibold text-slate-100 flex items-center gap-2">
          <Activity className="h-4 w-4 text-sky-400" />
          {t.panelTitle}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {t.panelDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`group relative rounded-xl border p-4 backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-lg hover:border-slate-700 ${card.color}`}
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-400 tracking-wide">{card.title}</span>
              <div className="rounded-lg bg-slate-950 p-1.5 border border-slate-800 group-hover:border-slate-700/80 transition-colors">
                {card.icon}
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">
                {card.value}
              </span>
            </div>

            <div className="mt-2 flex items-start gap-1 text-[10px] text-slate-400 leading-snug">
              <Info className="h-3 w-3 text-slate-500 mt-0.5 flex-shrink-0" />
              <span>{card.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
