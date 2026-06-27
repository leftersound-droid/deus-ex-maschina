/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'hu' | 'en' | 'de';

export const i18n = {
  hu: {
    // Header
    title: 'Deus Ex Machina',
    subtitle: 'Kozmológiai táguló R⁴ rács-potenciál szimulátor és emergens R³ téridő',
    exportCsv: 'Exportálás (CSV)',
    documentation: 'Kódletöltés (ZIP / Git)',
    
    // Tabs
    tab4D: '4D Vetítés (3D)',
    tabSlice: '2D Szeletelő',
    tabFourier: 'Fourier-Analízis (FFT)',
    tabLab: 'Hiperfelületi Lab (Szoliton)',
    tabCharts: 'Időbeli Grafikonok',
    tabManuscript: 'Tanulmány & Telepítés',

    // Presets
    presetsTitle: 'Kezdeti Fizikai Presetek',
    presetRandom: 'Véletlen Hullám',
    presetRandomDesc: 'Randomizált fluktuáció',
    presetSingularity: 'Szingularitás',
    presetSingularityDesc: 'Egyetlen forró pont',
    presetDipole: 'Dipólus Mező',
    presetDipoleDesc: 'Két pólusú feszültség',
    presetBoundary: 'Határhullám',
    presetBoundaryDesc: 'Külső héj töltés',

    // Controller
    controllerTitle: 'Időfejlődés Vezérlő',
    btnStop: 'Megállítás',
    btnStart: 'Indítás',
    btnStep: 'Egy szimulációs lépés',
    btnReset: 'Újraindítás jelenlegi beállításokkal',
    speedLabel: 'Lépés / Frissítés (Futási sebesség):',
    delayLabel: 'Frissítési időköz:',

    // Lattice config
    configTitle: 'Rács Konfiguráció',
    configOrigin: 'Origóból induló növekedés',
    configOriginDesc: 'Gömbszimmetrikus 4D hullám',
    configSize: 'Kiinduló rács méret (X0 x X1 x X2 x X3):',
    configSizeInactive: '(Inaktív - Origó [0,0,0,0])',
    configPotential: 'Kezdeti Összpotenciál:',
    configSeed: 'LCG Véletlenszám Seed:',
    configSafety: 'Rácspont biztonsági korlát (Fejlődés ideje):',
    configSafetyWarning: '⚠️ Figyelem: Magas rácspontszám esetén a szimuláció és a 3D nézet számításigénye megnőhet!',
    configTolerance: 'Konvergencia Tolerancia:',
    configToleranceQuick: '1e-3 (Gyors leállás)',
    configToleranceMed: '1e-5 (Közepes)',
    configToleranceHigh: '1e-7 (Precíziós)',
    configApply: 'Beállítások Alkalmazása',

    // Perturbation
    perturbTitle: 'Perturbáció & Aszimmetria',
    perturbActive: 'AKTÍV',
    perturbInactive: 'INAKTÍV',
    perturbSystem: 'Rendszer perturbálása',
    perturbSystemDesc: 'Kezdeti aszimmetrikus gátak',
    perturbStart: 'Perturbáció kezdete (lépés):',
    perturbStartDesc: 'Hányadik lépéstől lépnek érvénybe a lezárt pontok. Alacsony értéknél azonnal, magasabbnál kezdetben tiszta gömbszimmetrikus tágulás látható.',
    perturbDuration: 'Perturbáció időtartama:',
    perturbDurationDesc: 'Hány lépésig maradnak fagyasztva (szigetelve) a perturbált pontok, utána újra bekapcsolódnak a normál áramlásba.',
    perturbRatio: 'Perturbált pontok aránya:',
    perturbRatioDesc: 'A kezdeti rácspontok mekkora része legyen véletlenszerűen kiválasztva szigetelőként.',
    perturbTension: 'Környezeti feszültség csatolás:',
    perturbTensionDesc: 'Feszültség csatolás: Pozitív térerősségnél a környező magas potenciálok "nyomása" felgyorsítja az átadást. Negatív térerősségnél torlódást / ellenállást okoznak, ami lelassítja a terjedést.',
    perturbDamping: 'Aktív energia-csillapítás (Diszipáció):',
    perturbDampingDesc: 'Csillapítás nagysága: Lépésenként elvezetett/diszipált energia aránya. Magasabb csillapítás csökkenti az energiaszintet és elcsendesíti a 3D hullámfrontot.',
    perturbApplyReset: 'Aszimmetria Alkalmazása (Újraindítás)',

    // Stats Grid
    statsActive: 'Aktív rácspontok',
    statsTotalPot: 'Összes potenciál',
    statsMaxPot: 'Max potenciál',
    statsRadius: 'Tágulási sugár (RMS)',
    statsEntropy: 'Rendszer entrópia',
    statsSteps: 'Lépésszám',

    // Alert
    alertNotice: 'Értesítés: ',
    alertEquilibrium: 'Rendszer egyensúlyba került vagy elhalt (Nincs jelentős potenciálváltozás).',
    alertMaxCap: 'Elértük a rácspontok biztonsági korlátját (Max sites). A böngésző védelmében leállítva.',

    // Additional info
    observerPoint: 'Észlelő kiválasztott pontja',
    observerDesc: 'Kattints egy pontra a fenti grafikonokon, hogy kijelöld az Észlelőt (Megfigyelőt), és vizsgáld meg a lokális potenciál áramlását!',
    observerNoSelection: 'Nincs kijelölt pont (Globális szimmetrikus állapot)',
    observerCoordinate: 'Koordináta:',
    observerPotential: 'Lokális Potenciál:',
    observerNeighbors: 'Szomszédos Áramlások:',

    // Inspector & Summary
    inspectorTitle: 'Rácspont Részletes Vizsgálója',
    inspectorCoord: 'Kiválasztott koordináta:',
    inspectorPotential: 'Helyi Skaláris Potenciál:',
    inspectorNeighbors: '4D Térbeli Közeli Szomszédok (8 db) és Potenciáláramlás',
    inspectorDirection: 'Irányszög:',
    inspectorPotentialShort: 'Potenciál:',
    inspectorNotExist: 'Nem létezik rácspont',
    inspectorNoFlow: 'Nincs áramlás',
    inspectorOutflow: 'KIÁRAMLÁS: -',
    inspectorInflow: 'BEÁRAMLÁS: +',
    summaryTitle: 'Matematikai Modell Összefoglaló',
    summaryPara1: 'A szimuláció egy fejlődő 4-dimenziós rácson (R⁴) zajlik. Kezdetben egy kicsiny hiperkockát definiálunk (pl. 3x3x3x3), majd minden lépésben az összes létező rácspont hiányzó térbeli szomszédait automatikusan legeneráljuk 0.0 potenciállal (a rács növekedése).',
    summaryPara2: 'A potenciál áramlása (gradiens áramlás) szinkron módon történik: Minden pont az energiáját egyenlő arányban osztja szét azon közvetlen szomszédai között, amelyeknek kisebb a potenciáljuk, mint a sajátja. A rendszer összpotenciálja (energiája) szigorúan állandó marad a folyamatos határbővülés ellenére is, így megfigyelhető a fizikai entrópia növekedése és a feszültségek kiegyenlítődése (termalizáció).'
  },
  en: {
    // Header
    title: 'Deus Ex Machina',
    subtitle: 'Cosmological expanding R⁴ lattice-potential simulator and emergent R³ spacetime',
    exportCsv: 'Export (CSV)',
    documentation: 'Code Export (ZIP / Git)',
    
    // Tabs
    tab4D: '4D Projection (3D)',
    tabSlice: '2D Slice Heatmap',
    tabFourier: 'Fourier Analysis (FFT)',
    tabLab: 'Hypersurface Lab (Soliton)',
    tabCharts: 'Time Graphs',
    tabManuscript: 'Study & Installation',

    // Presets
    presetsTitle: 'Initial Physical Presets',
    presetRandom: 'Random Wave',
    presetRandomDesc: 'Randomized fluctuation',
    presetSingularity: 'Singularity',
    presetSingularityDesc: 'Single hot point',
    presetDipole: 'Dipole Field',
    presetDipoleDesc: 'Two-pole tension',
    presetBoundary: 'Boundary Wave',
    presetBoundaryDesc: 'Outer boundary charge',

    // Controller
    controllerTitle: 'Time Evolution Controller',
    btnStop: 'Stop Simulation',
    btnStart: 'Start Simulation',
    btnStep: 'One simulation step',
    btnReset: 'Restart with current settings',
    speedLabel: 'Steps / Update (Simulation speed):',
    delayLabel: 'Update interval:',

    // Lattice config
    configTitle: 'Lattice Configuration',
    configOrigin: 'Growth from origin',
    configOriginDesc: 'Spherically symmetric 4D wave',
    configSize: 'Initial lattice size (X0 x X1 x X2 x X3):',
    configSizeInactive: '(Inactive - Origin [0,0,0,0])',
    configPotential: 'Initial Total Potential:',
    configSeed: 'LCG Random Seed:',
    configSafety: 'Grid point safety cap (Time of evolution):',
    configSafetyWarning: '⚠️ Warning: With high grid points, computation time for simulation and 3D projection increases significantly!',
    configTolerance: 'Convergence Tolerance:',
    configToleranceQuick: '1e-3 (Fast Stop)',
    configToleranceMed: '1e-5 (Medium)',
    configToleranceHigh: '1e-7 (Precision)',
    configApply: 'Apply Settings',

    // Perturbation
    perturbTitle: 'Perturbation & Asymmetry',
    perturbActive: 'ACTIVE',
    perturbInactive: 'INACTIVE',
    perturbSystem: 'Perturb system',
    perturbSystemDesc: 'Initial asymmetric barriers',
    perturbStart: 'Perturbation start (step):',
    perturbStartDesc: 'From which step the locked points take effect. At low values, immediately; at higher values, clean spherical expansion is visible initially.',
    perturbDuration: 'Perturbation duration:',
    perturbDurationDesc: 'For how many steps the perturbed points remain frozen (insulated), then rejoin normal flow.',
    perturbRatio: 'Perturbed points ratio:',
    perturbRatioDesc: 'What ratio of initial grid points should be randomly chosen as insulators.',
    perturbTension: 'Environmental tension coupling:',
    perturbTensionDesc: 'Tension coupling: At positive tension, surrounding high potentials "squeeze" and speed up transmission. At negative values, they cause congestion/resistance, slowing down propagation.',
    perturbDamping: 'Active energy damping (Dissipation):',
    perturbDampingDesc: 'Damping amount: Ratio of energy dissipated per step. Higher damping decreases energy and quiets the 3D wavefront.',
    perturbApplyReset: 'Apply Asymmetry (Restart)',

    // Stats Grid
    statsActive: 'Active grid points',
    statsTotalPot: 'Total potential',
    statsMaxPot: 'Max potential',
    statsRadius: 'Expansion radius (RMS)',
    statsEntropy: 'System entropy',
    statsSteps: 'Step count',

    // Alert
    alertNotice: 'Notice: ',
    alertEquilibrium: 'System reached equilibrium or decayed (No significant potential change).',
    alertMaxCap: 'Grid point safety cap (Max sites) reached. Stopped to protect the browser.',

    // Additional info
    observerPoint: 'Observer selected point',
    observerDesc: 'Click on a point in the graphs above to set the Observer, and examine the local potential flow!',
    observerNoSelection: 'No selected point (Global symmetric state)',
    observerCoordinate: 'Coordinate:',
    observerPotential: 'Local Potential:',
    observerNeighbors: 'Neighboring Flows:',

    // Inspector & Summary
    inspectorTitle: 'Grid Point Detailed Inspector',
    inspectorCoord: 'Selected coordinate:',
    inspectorPotential: 'Local Scalar Potential:',
    inspectorNeighbors: '4D Spatial Nearest Neighbors (8 pcs) & Potential Flow',
    inspectorDirection: 'Direction angle:',
    inspectorPotentialShort: 'Potential:',
    inspectorNotExist: 'Grid point does not exist',
    inspectorNoFlow: 'No flow',
    inspectorOutflow: 'OUTFLOW: -',
    inspectorInflow: 'INFLOW: +',
    summaryTitle: 'Mathematical Model Summary',
    summaryPara1: 'The simulation occurs on an evolving 4-dimensional lattice (R⁴). Initially, a small hypercube is defined (e.g., 3x3x3x3), and at each step, the missing spatial neighbors of all existing grid points are automatically generated with 0.0 potential (lattice growth).',
    summaryPara2: 'The potential flow (gradient flow) happens synchronously: Each point distributes its energy equally among its immediate neighbors whose potential is lower than its own. The total system potential (energy) remains strictly conserved despite continuous boundary expansion, leading to physical entropy growth and thermalization.'
  },
  de: {
    // Header
    title: 'Deus Ex Machina',
    subtitle: 'Kosmologischer expandierender R⁴-Gitter-Potenzial-Simulator und emergente R³-Raumzeit',
    exportCsv: 'Exportieren (CSV)',
    documentation: 'Code-Export (ZIP / Git)',
    
    // Tabs
    tab4D: '4D-Projektion (3D)',
    tabSlice: '2D-Schnitt-Heatmap',
    tabFourier: 'Fourier-Analyse (FFT)',
    tabLab: 'Hyperflächen-Labor (Soliton)',
    tabCharts: 'Zeitdiagramme',
    tabManuscript: 'Studie & Installation',

    // Presets
    presetsTitle: 'Anfängliche physikalische Voreinstellungen',
    presetRandom: 'Zufällige Welle',
    presetRandomDesc: 'Randomisierte Fluktuation',
    presetSingularity: 'Singularität',
    presetSingularityDesc: 'Einziger heißer Punkt',
    presetDipole: 'Dipolfeld',
    presetDipoleDesc: 'Zweipolige Spannung',
    presetBoundary: 'Grenzwellen',
    presetBoundaryDesc: 'Äußere Grenzhüllladung',

    // Controller
    controllerTitle: 'Zeitentwicklungs-Controller',
    btnStop: 'Simulation stoppen',
    btnStart: 'Simulation starten',
    btnStep: 'Ein Simulationsschritt',
    btnReset: 'Mit aktuellen Einstellungen neu starten',
    speedLabel: 'Schritte / Update (Simulationsgeschwindigkeit):',
    delayLabel: 'Aktualisierungsintervall:',

    // Lattice config
    configTitle: 'Gitterkonfiguration',
    configOrigin: 'Wachstum vom Ursprung',
    configOriginDesc: 'Kugelsymmetrische 4D-Welle',
    configSize: 'Anfängliche Gittergröße (X0 x X1 x X2 x X3):',
    configSizeInactive: '(Inaktiv - Ursprung [0,0,0,0])',
    configPotential: 'Anfängliches Gesamtpotenzial:',
    configSeed: 'LCG-Zufalls-Seed:',
    configSafety: 'Gitterpunkt-Sicherheitsgrenze (Entwicklungszeit):',
    configSafetyWarning: '⚠️ Warnung: Bei hohen Gitterpunkten erhöht sich die Rechenzeit für die Simulation und die 3D-Projektion erheblich!',
    configTolerance: 'Konvergenztoleranz:',
    configToleranceQuick: '1e-3 (Schneller Stopp)',
    configToleranceMed: '1e-5 (Mittel)',
    configToleranceHigh: '1e-7 (Präzision)',
    configApply: 'Einstellungen anwenden',

    // Perturbation
    perturbTitle: 'Störung & Asymmetrie',
    perturbActive: 'AKTIV',
    perturbInactive: 'INAKTIV',
    perturbSystem: 'System stören',
    perturbSystemDesc: 'Anfängliche asymmetrische Barrieren',
    perturbStart: 'Störungsstart (Schritt):',
    perturbStartDesc: 'Ab welchem Schritt die blockierten Punkte wirksam werden. Bei niedrigen Werten sofort; bei höheren Werten ist anfangs eine saubere kugelförmige Ausdehnung sichtbar.',
    perturbDuration: 'Störungsdauer:',
    perturbDurationDesc: 'Für wie viele Schritte die gestörten Punkte gefroren (isoliert) bleiben, und sich dann wieder dem normalen Fluss anschließen.',
    perturbRatio: 'Verhältnis gestörter Punkte:',
    perturbRatioDesc: 'Welcher Anteil der anfänglichen Gitterpunkte zufällig als Isolatoren ausgewählt werden soll.',
    perturbTension: 'Umgebungsspannung-Kopplung:',
    perturbTensionDesc: 'Spannungskopplung: Bei positiver Spannung "pressen" umgebende hohe Potenziale und beschleunigen die Übertragung. Bei negativen Werten verursachen sie Stauungen/Widerstand, was die Ausbreitung verlangsamt.',
    perturbDamping: 'Aktive Energiedämpfung (Dissipation):',
    perturbDampingDesc: 'Dämpfungsbetrag: Verhältnis der pro Schritt abgeführten Energie. Eine höhere Dämpfung verringert die Energie und beruhigt die 3D-Wellenfront.',
    perturbApplyReset: 'Asymmetrie anwenden (Neustart)',

    // Stats Grid
    statsActive: 'Aktive Gitterpunkte',
    statsTotalPot: 'Gesamtpotenzial',
    statsMaxPot: 'Maximales Potenzial',
    statsRadius: 'Expansionsradius (RMS)',
    statsEntropy: 'Systementropie',
    statsSteps: 'Schrittanzahl',

    // Alert
    alertNotice: 'Hinweis: ',
    alertEquilibrium: 'System hat das Gleichgewicht erreicht oder ist abgeklungen (keine wesentliche Potenzialänderung).',
    alertMaxCap: 'Gitterpunkt-Sicherheitsgrenze (Max sites) erreicht. Zum Schutz des Browsers gestoppt.',

    // Additional info
    observerPoint: 'Ausgewählter Beobachterpunkt',
    observerDesc: 'Klicken Sie auf einen Punkt in den obigen Diagrammen, um den Beobachter festzulegen, und untersuchen Sie den lokalen Potenzialfluss!',
    observerNoSelection: 'Kein Punkt ausgewählt (Globaler symmetrischer Zustand)',
    observerCoordinate: 'Koordinate:',
    observerPotential: 'Lokales Potenzial:',
    observerNeighbors: 'Nachbarströme:',

    // Inspector & Summary
    inspectorTitle: 'Detaillierter Gitterpunkt-Inspektor',
    inspectorCoord: 'Ausgewählte Koordinate:',
    inspectorPotential: 'Lokales Skalarpotenzial:',
    inspectorNeighbors: '4D-Nächste Nachbarn (8 Stk.) & Potenzialfluss',
    inspectorDirection: 'Richtungswinkel:',
    inspectorPotentialShort: 'Potenzial:',
    inspectorNotExist: 'Gitterpunkt existiert nicht',
    inspectorNoFlow: 'Kein Fluss',
    inspectorOutflow: 'AUSFLUSS: -',
    inspectorInflow: 'EINFLUSS: +',
    summaryTitle: 'Zusammenfassung des mathematischen Modells',
    summaryPara1: 'Die Simulation findet auf einem sich entwickelnden 4-dimensionalen Gitter (R⁴) statt. Zunächst wird ein kleiner Hyperwürfel definiert (z. B. 3x3x3x3), und bei jedem Schritt werden die fehlenden räumlichen Nachbarn aller vorhandenen Gitterpunkte automatisch mit einem Potenzial von 0,0 erzeugt (Gitterwachstum).',
    summaryPara2: 'Der Potenzialfluss (Gradientenfluss) erfolgt synchron: Jeder Punkt verteilt seine Energie gleichmäßig auf seine unmittelbaren Nachbarn, deren Potenzial niedriger ist als sein eigenes. Das Gesamtpotenzial (Energie) des Systems bleibt trotz kontinuierlicher Grenzausdehnung streng erhalten, was zu physikalischem Entropiewachstum und Thermalisierung führt.'
  }
};
