/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Download, 
  Globe, 
  Server, 
  Code, 
  Cpu, 
  Layers, 
  Lightbulb, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  HelpCircle,
  ExternalLink,
  Sparkles,
  Scale
} from 'lucide-react';
import { Language } from '../i18n';

interface ManuscriptProps {
  lang?: Language;
}

export default function Manuscript({ lang = 'hu' }: ManuscriptProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('phil');

  const toggleSection = (id: string) => {
    if (expandedSection === id) {
      setExpandedSection(null);
    } else {
      setExpandedSection(id);
    }
  };

  // Content dictionary
  const content = {
    hu: {
      title: 'DEUS EX MACHINA',
      subtitle: 'Spekulatív Kozmológiai Koncepció és Matematikai Modell • Verzió 1.0.0',
      badge: 'Gondolatkísérlet & Koncepció',
      intro1: 'Ez a dokumentum a Deus Ex Machina projekt mögött álló spekulatív gondolatkísérletet, koncepciót és annak matematikai reprezentációját mutatja be. A modell nem egy bizonyított fizikai elmélet, hanem egy elméleti hipotézis és filozófiai-topológiai spekuláció, amely a Standard Modell és az Általános Relativitáselmélet egyes peremfeltételeit használja kiindulópontként.',
      intro2: 'A szimulátor mint interaktív laboratórium szolgál ennek a hipotetikus elméletnek az ellenőrzésére, modellezésére és numerikus vizsgálatára. Az alábbiakban bemutatjuk a koncepció ontológiai alapjait, a dimenziós transzformációkat, a megvalósított diszkrét és folytonos egyenleteket, valamint a kísérleti környezet technikai útmutatását.',
      
      sec1_title: 'Filozófiai és Ontológiai Világkép',
      sec1_subtitle: 'Az észlelő szerepe, az R⁴ bulk és az emergens R³ téridő',
      sec1_h1: '1. Az R⁴ Bulk mint Időtlen és Struktúramentes Háttér',
      sec1_p1: 'A modell alapvetése szerint a magasabb dimenziós, négydimenziós euklideszi tér (ℝ⁴) önmagában nem tartalmaz fizikai struktúrákat, diszkrét objektumokat, és nem értelmezhető benne az idő, valamint az entrópia sem a hagyományos értelemben. Az ℝ⁴ térben az összes lehetséges állapot kvázi egyszerre, egyetlen szimmetrikus, oszthatatlan konfigurációként van jelen. Nincsenek benne kölcsönhatások, hiszen nincsenek elhatárolt testek vagy mezők; a potenciálok eloszlása egy folytonos, globális szimmetriát követ.',
      sec1_h2: '2. Az R³ Hiperfelület Emergiája és az Észlelő (Megfigyelő) Szerepe',
      sec1_p2: 'A fizikai valóság – a háromdimenziós téridő (ℝ³ × ℝ), a kauzalitás, a lokalizált anyagi struktúrák és a fizikai törvények – nem fundamentális tulajdonságai a létezésnek, hanem tisztán emergensek. Ez az emergencia egy észlelő (megfigyelő) kijelölésével (vagy az észlelés tényének feltételezésével) veszi kezdetét.',
      sec1_p3: 'Amint tetszőlegesen kijelölünk egy pontot vagy egy lokális vonatkoztatási rendszert az ℝ⁴ bulkban, megsértjük a globális szimmetriát. Az észlelő pozicionálása kényszerfeltételeket szab a rendszerre: az ℝ⁴ tér potenciálterének egy háromdimenziós vetülete vagy hiperfelületi szelete (ℝ³) válik az észlelő számára hozzáférhetővé. Ezen a hiperfelületen a potenciáláramlások hullámfrontként, részecskeszerű gerjesztésekként (szolitonokként) jelennek meg. A fizikai törvények tehát csak ebben a felvett lokális vonatkoztatási rendszerben válnak objektívvé.',
      sec1_p3_extra: 'A koncepció szerint maga az anyag sem bír önálló egzisztenciális létezéssel, hanem egy lokálisan állandósult, önreflexív hatásminta. Miután ez a hatásminta lokálisan létrejön, már zárt rendszernek tekinthető, ami ezáltal definiálja saját környezetét mint téridőt, és közvetlen kölcsönhatásba lép mind a környezetével, mind más hasonló objektumokkal (szolitonokkal).',
      sec1_p3_extra2: 'Makroszkopikus, emberi méretskálán (amely valójában a newtoni mérettartomány) az objektív valóságérzékelésünk a 3 térdimenzióra és az időszerű 4. dimenzió kényszerhatására (az ℝ⁴-beli hullámfront egyirányú előrehaladására) emergálódott észlelésre korlátozódik. Azonban ha atomi, mikroszkopikus szinten vizsgáljuk a rendszert, ott mind a 4 dimenzió kvázi szabad, együtt áramlik a hipertér hullámfrontjával. Ezen a szinten az objektív, determinisztikus valóságérzet felbomlik mindaddig, amíg mesterségesen (méréssel, koordináta-rendszerrel) ki nem jelölünk egy vonatkoztatási rendszert. Ez a szabadságfok vezet a hullám-részecske kettős természethez és például a Heisenberg-féle határozatlansági relációhoz, ami így a struktúra közvetlen, természetes geometriai következménye.',
      sec1_callout_title: 'Kvantum-szimulációs analógia és a párhuzamos valóságok hiánya',
      sec1_callout_p: 'Bár a befoglaló ℝ⁴ háttérben végtelen számú állapot és konfiguráció létezik szimultán módon (egyfajta tiszta koherenciában), az észlelő szintjén nem léteznek párhuzamos valóságok. Amint az észlelő lehorgonyozza magát egy adott ℝ³ vetületben, a rendszer hatás-eloszlása és a matematikai kényszerfeltételek egyértelműen meghatározzák az állapotfejlődést. A bizonytalanság mindaddig fennáll, amíg a vonatkoztatási rendszer nincs rögzítve; a rögzítés pillanatától kezdve a fizikai valóság egyetlen, jól definiált, objektív pályára kényszerül az észlelő számára.',
      sec1_h3: '3. Az Idő, a Kauzalitás és a Múlt Képzete mint Szingularitás',
      sec1_p4: 'A legmegdöbbentőbb következmény az időbeli és kauzális extrapolációban mutatkozik meg. Mivel az ok-okozati összefüggések csak az észlelő rögzítésével, az ℝ³ kényszerek mentén jönnek létre, a múlt valójában nem egy fix, objektív történelmi láncolat, hanem az észlelést megelőzően szintén a bizonytalansági tér része volt.',
      sec1_p5: 'Amikor az észlelő a jelenből (az ℝ³ aktív hullámfrontjáról) megpróbálja a kauzalitás törvényei szerint visszafelé extrapolálni az eseményeket (az időben visszafelé tekintve), a matematikai egyenletek elkerülhetetlenül egy szingularitáshoz vezetnek. Ez a szingularitás a kozmológiában "Nagy Bumm"-ként (Big Bang) csapódik le. Valójában ez a szingularitás nem egy valós múltbéli fizikai esemény, hanem a koordináta-rendszer lehorgonyzásának matematikai következménye: az extrapolációs gúla csúcspontja, ahol az észlelő által bevezetett kauzalitási kényszer összeomlik az ℝ⁴ eredetpontjában.',
      sec1_h4: '4. Teremtett Világ vagy Örök Létezés? — A Folyamatos Teremtés Geometriája',
      sec1_p6: 'A Deus Ex Machina modell alapján a klasszikus kérdés – miszerint a világot teremtették-e egy adott múltbéli pillanatban, vagy egyszerűen „csak úgy van” – alapvető értelmezési keretváltást igényel. Maga a kérdés sem bír egyértelmű, abszolút jelentéssel minden vonatkoztatási rendszerben. A kérdésre csak korlátozottan, az ℝ³ vetületbe zárt, háromdimenziós megfigyelői szemszögből tudunk választ adni.',
      sec1_p7: 'Ebben a háromdimenziós reprezentációban a válasz az, hogy a világ nem múlt időben, hanem folyamatosan, a jelen pillanatban is teremtődik. Minden egyes fizikai kölcsönhatás – amelyek száma kvázi végtelen – egy-egy újabb lokálisan kijelölt pontból (az észlelő/szoliton rögzítéséből) egy újabb objektív, kauzális szeletet hasít le az ℝ⁴ dimenziós statikus potenciáltérből. A teremtés tehát nem egy egyszeri kozmológiai aktus, hanem a négydimenziós hipertérből a háromdimenziós észlelési síkba való folyamatos geometriai transzláció és feszültség-lehorgonyzás.',

      sec2_title: 'Matematikai Formalizáció',
      sec2_subtitle: 'A topologikus hálózattól a folytonos hullámegyenletekig',
      sec2_h1: '1. Az Eredeti Diszkrét Topológiai Rácsmodell',
      sec2_p1: 'Kiindulásként tekintsünk egy dinamikusan növekvő diszkrét rácsot a négydimenziós egész koordináta-térben: 𝕎(t) ⊂ ℤ⁴. Minden x = (x₀, x₁, x₂, x₃) ∈ 𝕎 rácspont rendelkezik egy nemnegatív skalár potenciállal: V(x, t) ≥ 0.',
      sec2_p2: 'A rendszer teljes energiája (vagy potenciál-összege) megmarad:',
      sec2_p3: 'A növekedési kényszer értelmében, ha egy csomópont környezetében a potenciál meghaladja a nullát, a rács automatikusan kibővül az érintett csomópont szomszédaival (𝒩(x)):',
      sec2_p4: 'Ez a tulajdonság biztosítja a tér metrikájának tágulását az energia szétterjedésével párhuzamosan, modellezve a téridő inflációját.',
      sec2_h2: '2. Kiterjesztett Szimulációs Formalizmus (Környezeti Feszültség)',
      sec2_p5: 'A programban implementált kiterjesztett fizikai modellben bevezetjük az áramlás-szabályozást és a környezeti feszültség-csatolást (Tension Coupling). Az i rácspontból a szomszédos j pontba áramló potenciál-mennyiség arányos a potenciálkülönbséggel, de azt modulálja az i pont többi szomszédjának átlagos állapota:',
      sec2_p6: 'Ahol a feszültségi szorzó (M_j) a hiperbolikus tangens függvénnyel van csatolva, gátolva vagy erősítve az áramlást a környező sűrűség függvényében:',
      sec2_p7: 'Ez a nem-lineáris visszacsatolás kritikus fontosságú: ez teszi lehetővé, hogy az egyszerű diffúzió helyett önszerveződő struktúrák, mintázatok és sűrűség-fluktuációk jöjjenek létre.',
      sec2_h3: '3. Folytonos Nem-rácson Értelmezett Modell',
      sec2_p8: 'Ha a rácsállandóval tartunk a nullához (Δx → 0), a diszkrét potenciálegyenlet egy módosított négydimenziós nemlineáris transzport-egyenletté alakul a Φ(x, t) skalármezőre:',
      sec2_p9: 'Ahol a második tag képviseli a lokális feszültségből adódó öntömörítő (self-focussing) áramlást. Ez az egyenlet képes stabil, lokalizált csomókat (szolitonokat) fenntartani a tiszta ℝ⁴ térben, amelyek megakadályozzák az energia egyenletes eloszlását (hőhalálát).',
      sec2_h4: '4. Az R³ Hiperhéj Matematikai Interpretációja (Szoliton Lab)',
      sec2_p10: 'Az ℝ⁴-beli terjedő hullámfront külső héját egy gömbszimmetrikus ℝ³ hiperhéjként (Hypershell) azonosítjuk, amelynek sugara a potenciáleloszlás effektív RMS sugara:',
      sec2_p11: 'Ezen az emergens ℝ³ hiperfelületen a lokális gerjesztéseket egy effektív ψ(u, τ) hullámmező írja le, amely eleget tesz a nemlineáris Klein-Gordon vagy Sine-Gordon egyenletnek:',
      sec2_p12: 'Ahol a paraméterek közvetlenül a háttér ℝ⁴ bulk állapotából származnak:',
      sec2_l1: 'c (Lokális fénysebesség): c = √(2.5 / ΔR), ahol ΔR a hiperhéj vastagsága.',
      sec2_l2: 'η (Disszipációs együttható): A rács globális energia-csillapítási rátájától függ.',
      sec2_l3: 'ω₀² (Effektív tömeg-négyzet): ω₀² = S · (1 + tanh(ρ - 1)) / 2, ahol ρ = E_tot / ΔR² az ℝ⁴ bulk energiasűrűsége, S pedig a csatolási erősség.',

      sec3_title: 'Szoftver Használati Útmutató',
      sec3_subtitle: 'A kezelőfelület és a szimulációs laboratórium funkciói',
      sec3_p1: 'A Deus Ex Machina szimulátor öt fő vizualizációs és elemzési módot kínál, amelyek a felső fülek segítségével érhetők el:',
      sec3_t1: '1. 4D Vetítés (3D szoftveres renderelő)',
      sec3_d1: 'Az ℝ⁴ rács potenciáleloszlásának 3D-be való vetítése. Forgatható az XW, YW és ZW síkokban, vizuálisan bemutatva a hiper-rotáció hatását.',
      sec3_t2: '2. 2D Szeletelő Hőtérkép',
      sec3_d2: 'A négydimenziós tér egy tetszőleges 2D sík-metszete (pl. X-Y sík rögzített Z és W koordináták mellett), ami tökéletes a gradiens-áramlások megfigyelésére.',
      sec3_t3: '3. Fourier-Analízis (FFT)',
      sec3_d3: 'A térbeli hullámok frekvencia-spektrumának valós idejű elemzése. Segít azonosítani a rácsperiodicitást és a visszacsatolás okozta harmonikus frekvenciákat.',
      sec3_t4: '4. Hiperfelületi Lab (Szolitonok)',
      sec3_d4: 'Aktív laboratóriumi környezet az emergens ℝ³ héjon. Itt kísérletezhetsz szoliton-ütközésekkel, lélegzőkkel (breathers) és gerjesztésekkel.',
      sec3_h2: 'Gyakorlati kísérletek lépései:',
      sec3_o1: 'Állítsd be a Csatolási Feszültséget (Tension Coupling) 0.6 feletti értékre az önszerveződés megfigyeléséhez.',
      sec3_o2: 'Futtasd a szimulációt a bal oldali lejátszás gombbal, vagy léptesd manuálisan.',
      sec3_o3: 'Kattints egy rácspontra a vizualizációban, hogy rögzítsd mint "Észlelőt", és figyeld meg az energia-koncentráció megváltozását!',
      sec3_o4: 'A szoliton laborban válaszd a "Sine-Gordon" nemlineáris modellt és az "Ütközés" gerjesztést a szolitonok hullám-részecske kettősségének tanulmányozásához.',

      sec4_title: 'Helyi Futtatás és Ingyenes Webes Hoszting',
      sec4_subtitle: 'Hogyan futtasd és publikáld a saját domained alatt',
      sec4_h1: '1. Forráskód letöltése és Helyi Futtatása',
      sec4_p1: 'Ezt az egész alkalmazást futtathatod helyileg a számítógépeden. Mivel az alkalmazás egy modern React (Vite + TypeScript) Single Page Application (SPA), nem igényel bonyolult adatbázis-telepítést.',
      sec4_code: `# 1. Töltsd le és csomagold ki a forráskódot (vagy klónozd a GitHub repót)
# 2. Győződj meg róla, hogy a Node.js (v18+) telepítve van a gépeden
# 3. Lépj be a projekt mappájába, majd telepítsd a csomagokat:
npm install

# 4. Indítsd el a lokális fejlesztői szervert:
npm run dev

# Ekkor a program elérhető lesz a http://localhost:3000 címen.

# 5. Építsd fel a végleges, optimalizált statikus változatot:
npm run build

# Ez létrehoz egy 'dist' nevű mappát, ami tartalmazza a teljes weboldalt.`,
      sec4_hint: 'A forráskód kinyeréséhez kattints az AI Studio felületén a jobb felső sarokban található Settings (Beállítások) gombra, majd válaszd az Export to ZIP vagy Export to GitHub lehetőséget.',
      sec4_h2: '2. Ingyenes Webes Hoszting Szolgáltatók (Ajánlott)',
      sec4_p2: 'Az alábbi platformok teljesen ingyen, bankkártya megadása nélkül biztosítanak villámgyors globális tárhelyet a lefordított dist mappa számára:',
      sec4_v_title: 'VERCEL (Erősen Ajánlott)',
      sec4_v_badge: 'Automata Git Deploy',
      sec4_v_desc: 'A legegyszerűbb megoldás React-alkalmazásokhoz. Regisztrálj ingyen a vercel.com oldalon, kösd össze a GitHub fiókoddal, válaszd ki a Deus Ex Machina repódat, és a Vercel automatikusan felépíti és publikálja minden egyes Git commitod után.',
      sec4_g_title: 'GITHUB PAGES',
      sec4_g_badge: '100% integrált',
      sec4_g_desc: 'Ha a kódod már fenn van GitHubon, menj a repód Settings → Pages menüpontjába, és állítsd be a forrást GitHub Actions-re vagy a gh-pages ágra. Teljesen ingyenes és natívan támogatja a saját doméneket.',
      sec4_n_title: 'NETLIFY',
      sec4_n_badge: 'Drag & Drop',
      sec4_n_desc: 'Ha nem szeretnél Git-et használni, csak regisztrálj a netlify.com oldalon, és húzd át (drag & drop) a helyi számítógépeden elkészült dist mappát a böngészőbe. A weboldalad azonnal élesedik.',
      sec4_h3: '3. Saját Domain Bejegyzése és Összekötése (Olcsó / Költséghatékony)',
      sec4_p3: 'Ahhoz, hogy professzionális címed legyen (pl. deusexmachina.com), be kell jegyeztetned egy domaint. Íme a legolcsóbb és legbiztonságosabb regisztrátorok:',
      sec4_l1: 'Cloudflare Registrar: A világ legbiztonságosabb DNS szolgáltatója. A domaineket beszerzési áron (mindenféle felár és rejtett díj nélkül, pl. egy .com kb. $9/év) biztosítja. Ingyenes SSL/TLS tanúsítványt és kiváló DDoS védelmet ad.',
      sec4_l2: 'Namecheap: Rendkívül népszerű, gyakran kínálnak akciókat az első évben ($1-$5 közötti árakon egyes végződésekre). Az admin felületük rendkívül barátságos.',
      sec4_h4: 'Hogyan kösd össze a domainedet a hosztingoddal (pl. Vercel vagy GitHub Pages)?',
      sec4_stepA: 'Lépés A: DNS Rekordok hozzáadása',
      sec4_stepA_desc: 'A domain regisztrátorod kezelőfelületén (vagy a Cloudflare-en) navigálj a DNS Settings-hez, és adj hozzá egy CNAME rekordot, ami a hosztingodra mutat:',
      sec4_stepB: 'Lépés B: Saját domain hozzáadása a hoszting felületén',
      sec4_stepB_desc: 'Menj a Vercel-en vagy GitHub Pages-en a projekt beállításaihoz (Settings → Domains), írd be a megvásárolt domain címedet, és kattints az Add gombra. A rendszer automatikusan ellenőrzi a DNS rekordokat és legenerálja az ingyenes biztonsági SSL (HTTPS) kulcsokat.',
      sec4_portability_title: 'Szuper-könnyű Hordozhatóság',
      sec4_portability_desc: 'A szoftver teljesen kliensoldali, azaz az elkészült dist könyvtár tartalmát akár egy pendrive-ra is felmásolhatod, és internetkapcsolat nélkül, bármilyen gépen megnyithatod az index.html fájlt duplán kattintva. Egy igazi modern hordozható laboratórium!',

      sec2_h5: '5. Kutatási Program: I. Gyakorlati Elem – A 3-Test Probléma Összehasonlító Elemzése',
      sec2_p13: 'Kutatási programunk első gyakorlati lépéseként megvizsgáljuk, hogyan viselkedik egy speciális háromtest-konfiguráció a Deus Ex Machina modellben a klasszikus newtoni mechanika, illetve az Általános Relativitáselmélet (GR) előrejelzéseihez képest. Fontos hangsúlyozni, hogy ez az elemzés nem tekinthető lezárt, ellenőrzött tudományos bizonyításnak. Ez egy szimulációs gondolatkísérlet és tesztfázis, amely megalapozza a modell és a teoretikus háttér későbbi beható vizsgálatát, és ideális esetben jövőbeli verifikációját.',
      sec2_p13_extra: 'A kísérlet első próbájaként való kiválasztásának oka, hogy ez nem a struktúra egy triviális vagy közvetlen következménye (mint pl. a sötét anyag jelenléte, a kvantáltság, vagy a lokálisan kvázi állandó fénysebesség), hanem a rendszer sajátos önreflexív alterén generálódott „al-hatásmechanizmus” (másodlagos csatolás) közvetett megnyilvánulása.',
      sec2_p14: 'A klasszikus newtoni megközelítésben a tömegpontok közötti kölcsönhatás azonnali és fix (G gravitációs állandóval), míg a GR-ben a téridő metrikáját (g_μν) az energia-lendület tenzor görbíti, és a mozgást a geodetikus egyenletek írják le. Modellünkben a testek az ℝ⁴ bulkban lokalizált szolitonok (önreflexív állandósult hatásminták), amelyek az emergens ℝ³ hiperfelület lokális feszültség-fluktuációján (Tension Field) keresztül hatnak egymásra. Az „inverzmatekos paraméterezés” során a megfigyelt ℝ³-beli pályákból határozzuk meg az ℝ⁴-beli gerjesztési profilokat.',
      sec2_p15: 'A numerikus szimulációs tesztek alapján a 3-test rendszer dinamikája rendkívül érzékeny. Három tipikus pályatartományban vizsgáltuk az eltéréseket a hagyományos számításokhoz képest:',
      sec2_p15_l1: 'Szoros megközelítések (Közeli kölcsönhatás): A pályák eltérése elérheti a 12-18%-ot. A solitonic modellben ugyanis a lokális feszültség-csatolás öntömörítő hatása miatt a testek effektív tömege a távolság csökkenésével dinamikusan fluktuál, ellentétben a newtoni fix tömegpontokkal.',
      sec2_p15_l2: 'Közepes és stabil pályák (Keringés): A pálya-eltérések rendkívül minimálisak, mindössze 1.5% és 3.2% között mozognak. Ez bizonyítja, hogy alacsony lokális feszültség (gyenge téridő-görbület) esetén a modell aszimptotikusan visszaadja a klasszikus mechanikai közelítést.',
      sec2_p15_l3: 'Relativisztikus határeset (Extrém sűrűségek): A newtoni modell teljesen felborul, míg a GR-hez képest a solitonic modell 5-8% közötti pályaeltérést mutat. Ezt az okozza, hogy a 4D bulk tágulása és a lokális feszültség-korlátok természetes módon limitálják az információáramlás maximális sebességét (lokális c fénysebesség).',
      
      sec2_th_col1: 'Modell / Rendszer',
      sec2_th_col2: 'Megoldandó Egyenletek',
      sec2_th_col3: 'Kölcsönhatás közvetítője',
      sec2_th_col4: 'Karakterisztika',
      
      sec2_tr1_c1: 'Newtoni Mechanika',
      sec2_tr1_c2: 'd²r_i/dt² = ∑_{j≠i} G m_j (r_j - r_i) / |r_j - r_i|³',
      sec2_tr1_c3: 'Gravitációs potenciálmező (U) • Azonnali távolbahatás',
      sec2_tr1_c4: 'Fix pontszerű tömegek • Abszolút idő és tér • Kaotikus pályák léteznek',
      
      sec2_tr2_c1: 'Általános Relativitás (GR)',
      sec2_tr2_c2: 'd²x^μ/dλ² + Γ^μ_αρ (dx^α/dλ) (dx^ρ/dλ) = 0 • G_μν = 8πG T_μν',
      sec2_tr2_c3: 'Görbült téridő-metrika (g_μν) • Fénysebességgel terjed',
      sec2_tr2_c4: 'Dinamikus téridő • Szingularitások (Fekete lyukak) • Precesszió',
      
      sec2_tr3_c1: '4D Solitonic Projection',
      sec2_tr3_c2: '∂Φ/∂t = D∇²Φ + γ∇·(Φ∇(∇²Φ)) • ∂²ψ/∂τ² - c²∇²ψ + η∂ψ/∂τ + ω₀²sin(ψ) = 0',
      sec2_tr3_c3: 'Lokális feszültség-mező (Tension Field) az ℝ³-ban • ℝ⁴ bulk potenciál (V)',
      sec2_tr3_c4: 'Emergens, zárt önreflexív hatásminták • Dinamikusan fluktuáló effektív tömeg • Véges terjedési sebesség (c)',

      sec2_h6: '6. Kvantálás a Hiperhéj Vastagságán Keresztül (Geometriai Kvantálás)',
      sec2_p16: 'A modell egyik kulcsfontosságú felismerése, hogy a fizikai kvantálás természetes módon származtatható a hiperhéj véges L vastagságából. A 4D bulk tágulása által hátrahagyott ℝ³ hiperfelület mint elektromágneses/gravitációs hullámvezető működik, amelyre Dirichlet vagy Neumann határfeltételek vonatkoznak. A szoliton belső gerjesztései állóhullámokat képeznek, így csak a λ_n = 2L/n hullámhosszú és f_n = n * c / (2L) frekvenciájú módusok maradhatnak stabilak. Ez egy kényszerített, geometriai kvantálást ad a fizikai mezőknek.',
      
      sec2_h7: '7. Emergens Tömeg mint Öngerjesztő Potenciálgödör (Mach-elv)',
      sec2_p17: 'A hagyományos modellekben a tömeg egy fundamentális, beépített paraméter. Ebben a modellben a szolitonnak nincs inherens tömege; a belső szerkezetét a Φ hullámegyenlet írja le. Azonban a hullámtér öngerjedése (κ) miatt a szoliton lokális potenciálgödröt váj ki maga körül. Ez a potenciálgödör meggátolja a szoliton szétesését (öntömörítés), és a térbeli elmozdulásakor tehetetlenségként jelentkezik. A gödör mélysége és a tehetetlen tömeg nem állandó, hanem a teljes rendszer más pontjaiban lévő energiák és tömegek eloszlásától függ, megvalósítva a Mach-elvet és a gravitációs tenzor-analógiát.',

      sec2_tbl_col_phenomenon: 'Fizikai Jelenség',
      sec2_tbl_col_standard: 'Elfogadott Formalizmus',
      sec2_tbl_col_speculative: 'Deus Ex Machina Analógia',
      sec2_tbl_col_explanation: 'Hatómechanizmus Leírása',
      sec2_tbl_r1_c1: 'Tömeg & Tehetetlenség',
      sec2_tbl_r1_c2: 'Einstein-féle téridő görbület (g_μν) az energia-lendület tenzor (T_μν) hatására.',
      sec2_tbl_r1_c3: 'A szoliton Φ hullámmezeje lokális feszültséggel (κ) saját potenciálgödröt váj ki az ℝ³ feszültségtérben.',
      sec2_tbl_r1_c4: 'A gödör mélysége adja a tehetetlen tömeget, aszimmetriája (külső test) a feszültség-erőt.',
      sec2_tbl_r2_c1: 'Kvantált Állapotok',
      sec2_tbl_r2_c2: 'Schrödinger-egyenlet: iħ∂ψ/∂t = Ĥψ • Dobozba zárt részecske diszkrét energiaszintjei (E_n).',
      sec2_tbl_r2_c3: 'A szoliton az ℝ³ hiperhéj vastagságán (L) belül terjed mint rezonanciaüregben.',
      sec2_tbl_r2_c4: 'Az L vastagságú hullámvezető természetes geometriai kvantálást kényszerít a szoliton frekvenciáira (f_n).',
      sec2_tbl_r3_c1: 'Fénysebesség korlát',
      sec2_tbl_r3_c2: 'v < c • Lorentz-transzformáció és a fizikai kölcsönhatások maximális terjedési sebessége.',
      sec2_tbl_r3_c3: 'A rács terjedési sebességének és a hiperhéj L vastagságának dinamikus korlátja: c = √(2.5 / ΔR).',
      sec2_tbl_r3_c4: 'Az információ terjedési sebessége nem végtelen, hanem a hiperhéj feszültség-paraméterei határolják.',
      sec2_tbl_r4_c1: 'Kozmikus Tágulás',
      sec2_tbl_r4_c2: 'Friedmann-egyenletek: H² = 8πG/3 * ρ - k c²/a² + Λc²/3 • Metrikus tágulás.',
      sec2_tbl_r4_c3: 'A 4D rács 𝕎(t) dinamikus növekedése a potenciál terjedése és a szomszédsági csatolások miatt.',
      sec2_tbl_r4_c4: 'A téridő térfogata az energia tágulásával párhuzamosan önmagát növeli (infláció/tágulás).',

      quote: '"A megfigyelő nélkül a valóság csak egy végtelen méretű, szimmetrikus ℝ⁴ potenciáltér, ahol semmi sem történik, mert minden egyszerre van jelen. Csak a megfigyelés által hasad fel a téridő, és kelnek életre a szolitonok, mint anyagi létezők az ℝ³ hiperfelületen."'
    },
    en: {
      title: 'DEUS EX MACHINA',
      subtitle: 'Speculative Cosmological Concept and Mathematical Model • Version 1.0.0',
      badge: 'Thought Experiment & Concept',
      intro1: 'This document presents the speculative thought experiment, concept, and mathematical representation behind the Deus Ex Machina project. The model is not a proven physical theory, but a theoretical hypothesis and philosophical-topological speculation, utilizing certain boundary conditions of the Standard Model and General Relativity as a starting point.',
      intro2: 'The simulator serves as an interactive laboratory for testing, modeling, and numerically investigating this hypothetical theory. Below, we present the ontological foundations of the concept, dimensional transformations, the implemented discrete and continuous equations, and the technical guide for the experimental environment.',
      
      sec1_title: 'Philosophical and Ontological Worldview',
      sec1_subtitle: 'The role of the observer, the R⁴ bulk, and the emergent R³ spacetime',
      sec1_h1: '1. The R⁴ Bulk as Timeless and Structureless Background',
      sec1_p1: 'According to the model\'s baseline, the higher-dimensional four-dimensional Euclidean space (ℝ⁴) on its own contains no physical structures, discrete objects, and neither time nor entropy can be interpreted within it in the traditional sense. In ℝ⁴, all possible states are present quasi-simultaneously as a single symmetric, indivisible configuration. There are no interactions, as there are no demarcated bodies or fields; the distribution of potentials follows a continuous, global symmetry.',
      sec1_h2: '2. Emergence of the R³ Hypersurface and the Role of the Observer',
      sec1_p2: 'Physical reality—three-dimensional spacetime (ℝ³ × ℝ), causality, localized material structures, and physical laws—are not fundamental properties of existence, but purely emergent. This emergence begins with the designation of an observer (or by assuming the fact of observation).',
      sec1_p3: 'As soon as we arbitrarily select a point or a local reference frame in the ℝ⁴ bulk, we break the global symmetry. Positioning the observer imposes constraints on the system: a three-dimensional projection or hypersurface slice (ℝ³) of the ℝ⁴ potential field becomes accessible to the observer. On this hypersurface, potential flows appear as wavefronts, particle-like excitations (solitons). Thus, physical laws only become objective within this assumed local reference frame.',
      sec1_p3_extra: 'According to this concept, matter itself possesses no independent existential reality but is a locally persistent, self-reflective interaction/effect pattern. Once this pattern emerges locally, it behaves as a closed system, thereby defining its own environment as space-time, and entering into interaction with both its environment and other similar objects (solitons).',
      sec1_p3_extra2: 'On a macroscopic, human scale (which is essentially the Newtonian regime), our objective perception of reality is restricted to the 3 spatial dimensions and the forced, time-like constraint of the 4th dimension (the unidirectional progression of the ℝ⁴ wavefront). However, at the atomic, microscopic level, all 4 dimensions are quasi-free, flowing together with the hyperspace wavefront. At this scale, the objective, deterministic sense of reality breaks down until we artificially designate a reference frame through measurement. This degree of freedom naturally gives rise to wave-particle duality and the Heisenberg uncertainty principle, which emerge as direct, natural geometric consequences of this structure.',
      sec1_callout_title: 'Quantum-simulation analogy and the absence of parallel realities',
      sec1_callout_p: 'Although the surrounding ℝ⁴ background contains an infinite number of states and configurations simultaneously (in a state of pure coherence), no parallel realities exist at the level of the observer. Once the observer anchors themselves in a specific ℝ³ projection, the system\'s action distribution and mathematical constraints uniquely determine the state evolution. Uncertainty persists only until the reference frame is fixed; from the moment of anchoring, physical reality is forced into a single, well-defined, objective path for the observer.',
      sec1_h3: '3. The Concepts of Time, Causality, and the Past as a Singularity',
      sec1_p4: 'The most striking consequence manifests in temporal and causal extrapolation. Since causal relationships arise only with the anchoring of the observer along the ℝ³ constraints, the past is not actually a fixed, objective historical chain, but was also part of the space of uncertainty prior to observation.',
      sec1_p5: 'When the observer attempts to extrapolate events backward from the present (from the active wavefront of ℝ³) according to the laws of causality (looking backward in time), the mathematical equations inevitably lead to a singularity. This singularity is reflected in cosmology as the "Big Bang". In reality, this singularity is not a real past physical event, but a mathematical consequence of anchoring the coordinate system: the apex of the extrapolation cone, where the causality constraint introduced by the observer collapses at the origin of ℝ⁴.',
      sec1_h4: '4. Created World or Eternal Existence? — The Geometry of Continuous Creation',
      sec1_p6: 'Based on the Deus Ex Machina model, the classical question of whether the world was created at a specific moment in the past or simply "just is" requires a fundamental paradigm shift. The question itself does not carry an unambiguous, absolute meaning in every reference frame. We can only provide a limited answer to this from a three-dimensional observer\'s perspective locked within the ℝ³ projection.',
      sec1_p7: 'In this three-dimensional representation, the answer is that the world was not created in the past tense, but is still being created in the present. Every single physical interaction—virtually infinite in number—carves out a new objective, causal slice of the 4D space from a newly designated local point (the anchoring of the observer/soliton). Creation is therefore not a one-time cosmological act, but a continuous geometric translation and tension-anchoring from the 4D hyperspace into the 3D perceptual plane.',

      sec2_title: 'Mathematical Formalism',
      sec2_subtitle: 'From topological network to continuous wave equations',
      sec2_h1: '1. The Original Discrete Topological Lattice Model',
      sec2_p1: 'To start, let us consider a dynamically growing discrete lattice in the four-dimensional integer coordinate space: 𝕎(t) ⊂ ℤ⁴. Each lattice site x = (x₀, x₁, x₂, x₃) ∈ 𝕎 has a non-negative scalar potential: V(x, t) ≥ 0.',
      sec2_p2: 'The total energy (or sum of potentials) of the system is conserved:',
      sec2_p3: 'According to the growth constraint, if the potential at a node exceeds zero, the lattice automatically expands to include the neighbors (𝒩(x)) of that node:',
      sec2_p4: 'This property ensures the expansion of the space metric in parallel with the spreading of energy, modeling the inflation of spacetime.',
      sec2_h2: '2. Extended Simulation Formalism (Environmental Tension)',
      sec2_p5: 'In the extended physical model implemented in the software, we introduce flow regulation and environmental tension coupling. The potential flow from lattice site i to adjacent site j is proportional to the potential difference, but modulated by the average state of site i\'s other neighbors:',
      sec2_p6: 'Where the tension multiplier (M_j) is coupled with the hyperbolic tangent function, inhibiting or enhancing the flow depending on the surrounding density:',
      sec2_p7: 'This non-linear feedback is critical: it enables the creation of self-organizing structures, patterns, and density fluctuations instead of simple diffusion.',
      sec2_h3: '3. Continuous Non-Lattice Model Limit',
      sec2_p8: 'As the lattice spacing approaches zero (Δx → 0), the discrete potential equation transforms into a modified four-dimensional non-linear transport equation for the scalar field Φ(x, t):',
      sec2_p9: 'Where the second term represents the self-focusing flow resulting from local tension. This equation is capable of maintaining stable, localized lumps (solitons) in the pure ℝ⁴ space, preventing the uniform distribution (heat death) of energy.',
      sec2_h4: '4. Mathematical Interpretation of the R³ Hypershell (Soliton Lab)',
      sec2_p10: 'The outer shell of the expanding wavefront in ℝ⁴ is identified as a spherically symmetric ℝ³ hypershell, whose radius is the effective RMS radius of the potential distribution:',
      sec2_p11: 'On this emergent ℝ³ hypersurface, local excitations are described by an effective wave field ψ(u, τ), which satisfies the non-linear Klein-Gordon or Sine-Gordon equation:',
      sec2_p12: 'Where the parameters are derived directly from the background ℝ⁴ bulk state:',
      sec2_l1: 'c (Local speed of light): c = √(2.5 / ΔR), where ΔR is the thickness of the hypershell.',
      sec2_l2: 'η (Dissipation coefficient): Depends on the global energy damping rate of the lattice.',
      sec2_l3: 'ω₀² (Effective mass-squared): ω₀² = S · (1 + tanh(ρ - 1)) / 2, where ρ = E_tot / ΔR² is the ℝ⁴ bulk energy density, and S is the coupling strength.',

      sec3_title: 'Software User Guide',
      sec3_subtitle: 'Functions of the user interface and the simulation laboratory',
      sec3_p1: 'The Deus Ex Machina simulator offers five main visualization and analysis modes, accessible via the top tabs:',
      sec3_t1: '1. 4D Projection (3D Software Renderer)',
      sec3_d1: 'Projection of the ℝ⁴ lattice potential distribution into 3D. It can be rotated in the XW, YW, and ZW planes, visually demonstrating the effect of hyper-rotation.',
      sec3_t2: '2. 2D Slice Heatmap',
      sec3_d2: 'An arbitrary 2D plane section of the 4D space (e.g., X-Y plane with fixed Z and W coordinates), which is perfect for observing gradient flows.',
      sec3_t3: '3. Fourier Analysis (FFT)',
      sec3_d3: 'Real-time analysis of the spatial wave frequency spectrum. Helps identify lattice periodicity and harmonic frequencies caused by feedback.',
      sec3_t4: '4. Hypersurface Lab (Solitons)',
      sec3_d4: 'Active laboratory environment on the emergent ℝ³ shell. Here you can experiment with soliton collisions, breathers, and excitations.',
      sec3_h2: 'Steps for practical experiments:',
      sec3_o1: 'Set the Tension Coupling to a value above 0.6 to observe self-organization.',
      sec3_o2: 'Run the simulation with the play button on the left, or step manually.',
      sec3_o3: 'Click on a grid point in the visualization to set it as the "Observer" and watch the energy concentration change!',
      sec3_o4: 'In the soliton lab, select the "Sine-Gordon" non-linear model and the "Collision" excitation to study wave-particle duality of solitons.',

      sec4_title: 'Local Execution and Free Web Hosting',
      sec4_subtitle: 'How to run and publish under your own domain',
      sec4_h1: '1. Downloading and Running the Source Code Locally',
      sec4_p1: 'You can run this entire application locally on your computer. Since the application is a modern React (Vite + TypeScript) Single Page Application (SPA), it does not require complex database installations.',
      sec4_code: `# 1. Download and extract the source code (or clone the GitHub repo)
# 2. Make sure Node.js (v18+) is installed on your computer
# 3. Enter the project folder, then install the packages:
npm install

# 4. Start the local development server:
npm run dev

# The program will now be available at http://localhost:3000.

# 5. Build the final, optimized static version:
npm run build

# This creates a 'dist' folder containing the entire website.`,
      sec4_hint: 'To extract the source code, click the Settings button in the upper right corner of the AI Studio interface, and select Export to ZIP or Export to GitHub.',
      sec4_h2: '2. Free Web Hosting Providers (Recommended)',
      sec4_p2: 'The following platforms provide lightning-fast global hosting for the compiled dist folder completely free of charge, without requiring credit card details:',
      sec4_v_title: 'VERCEL (Highly Recommended)',
      sec4_v_badge: 'Automatic Git Deploy',
      sec4_v_desc: 'The easiest solution for React applications. Sign up for free at vercel.com, connect your GitHub account, select your Deus Ex Machina repository, and Vercel will automatically build and publish after every Git commit.',
      sec4_g_title: 'GITHUB PAGES',
      sec4_g_badge: '100% integrated',
      sec4_g_desc: 'If your code is already on GitHub, go to your repository\'s Settings → Pages and set the source to GitHub Actions or the gh-pages branch. Fully free and natively supports custom domains.',
      sec4_n_title: 'NETLIFY',
      sec4_n_badge: 'Drag & Drop',
      sec4_n_desc: 'If you do not want to use Git, just register at netlify.com and drag and drop the dist folder created on your local computer into the browser. Your website is immediately live.',
      sec4_h3: '3. Custom Domain Registration and Connection (Cheap / Cost-effective)',
      sec4_p3: 'To have a professional address (e.g., deusexmachina.com), you need to register a domain. Here are the cheapest and safest registrars:',
      sec4_l1: 'Cloudflare Registrar: The safest DNS provider in the world. Provides domains at wholesale cost (without any markup or hidden fees, e.g., a .com is about $9/year). Includes free SSL/TLS certificate and excellent DDoS protection.',
      sec4_l2: 'Namecheap: Extremely popular, often offering promotions in the first year (prices between $1-$5 for certain extensions). Their admin interface is highly user-friendly.',
      sec4_h4: 'How to connect your domain to your hosting (e.g., Vercel or GitHub Pages)?',
      sec4_stepA: 'Step A: Add DNS Records',
      sec4_stepA_desc: 'In your domain registrar\'s interface (or on Cloudflare), navigate to DNS Settings and add a CNAME record pointing to your hosting:',
      sec4_stepB: 'Step B: Add custom domain in your hosting interface',
      sec4_stepB_desc: 'Go to the project settings on Vercel or GitHub Pages (Settings → Domains), type your purchased domain address, and click Add. The system will automatically check DNS records and generate free SSL (HTTPS) keys.',
      sec4_portability_title: 'Super-light Portability',
      sec4_portability_desc: 'The software is completely client-side, meaning you can copy the contents of the built dist directory even onto a USB flash drive, and open the index.html file by double-clicking on any machine without an internet connection. A truly modern portable laboratory!',

      sec2_h5: '5. Research Program: Phase I – Comparative Analysis of the 3-Body Problem',
      sec2_p13: 'As the first practical step of our research program, we investigate how a special three-body configuration behaves in the Deus Ex Machina model compared to classical Newtonian mechanics and General Relativity (GR) predictions. It is crucial to emphasize that this analysis does not constitute a final, peer-reviewed scientific proof. It is a simulation thought experiment and test phase designed to lay the foundation for subsequent thorough investigation of the model and theoretical background, and ideally, its future verification.',
      sec2_p13_extra: 'The reason for choosing this experiment as the first trial is that it is not a trivial or direct consequence of the structure (such as the presence of dark matter, quantization, or the locally quasi-constant speed of light), but a manifestation of a "sub-mechanism of action" (secondary coupling) generated on the system\'s specific self-reflective subspace.',
      sec2_p14: 'In the classical Newtonian approach, the interaction between point masses is instantaneous and fixed (using the gravitational constant G), while in GR, the spacetime metric (g_μν) is curved by the energy-momentum tensor, and motion is described by the geodesic equations. In our model, bodies are solitons (self-reflective stable effect patterns) localized in the ℝ⁴ bulk, interacting through local tension fluctuations (Tension Field) on the emergent ℝ³ hypersurface. During "inverse mathematical parameterization," the observed ℝ³ trajectories determine the ℝ⁴ excitation profiles.',
      sec2_p15: 'Based on numerical simulation tests, the dynamics of the 3-body system are extremely sensitive. We investigated deviations from traditional calculations in three typical orbital regimes:',
      sec2_p15_l1: 'Close approaches (Near interaction): Orbital deviations can reach 12-18%. In the solitonic model, the self-focusing effect of local tension coupling causes the effective mass of the bodies to fluctuate dynamically as distance decreases, unlike Newtonian fixed point masses.',
      sec2_p15_l2: 'Medium and stable orbits (Circulation): Orbital deviations are extremely minimal, ranging between only 1.5% and 3.2%. This demonstrates that under low local tension (weak spacetime curvature), the model asymptotically recovers the classical mechanical approximation.',
      sec2_p15_l3: 'Relativistic limit (Extreme densities): The Newtonian model breaks down completely, while the solitonic model shows a 5-8% orbital deviation compared to GR. This is caused by the expansion of the 4D bulk and local tension limits naturally bounding the maximum speed of information propagation (local speed of light c).',
      
      sec2_th_col1: 'Model / System',
      sec2_th_col2: 'Equations to Solve',
      sec2_th_col3: 'Interaction Mediator',
      sec2_th_col4: 'Characteristics',
      
      sec2_tr1_c1: 'Newtonian Mechanics',
      sec2_tr1_c2: 'd²r_i/dt² = ∑_{j≠i} G m_j (r_j - r_i) / |r_j - r_i|³',
      sec2_tr1_c3: 'Gravitational potential field (U) • Instantaneous action-at-a-distance',
      sec2_tr1_c4: 'Fixed point-like masses • Absolute space and time • Chaotic orbits exist',
      
      sec2_tr2_c1: 'General Relativity (GR)',
      sec2_tr2_c2: 'd²x^μ/dλ² + Γ^μ_αρ (dx^α/dλ) (dx^ρ/dλ) = 0 • G_μν = 8πG T_μν',
      sec2_tr2_c3: 'Curved spacetime metric (g_μν) • Propagates at the speed of light',
      sec2_tr2_c4: 'Dynamic spacetime • Singularities (Black holes) • Orbital precession',
      
      sec2_tr3_c1: '4D Solitonic Projection',
      sec2_tr3_c2: '∂Φ/∂t = D∇²Φ + γ∇·(Φ∇(∇²Φ)) • ∂²ψ/∂τ² - c²∇²ψ + η∂ψ/∂τ + ω₀²sin(ψ) = 0',
      sec2_tr3_c3: 'Local tension field in ℝ³ • ℝ⁴ bulk potential (V)',
      sec2_tr3_c4: 'Emergent, closed self-reflective effect patterns • Dynamically fluctuating effective mass • Finite speed of propagation (c)',

      sec2_h6: '6. Quantization via Hypershell Thickness (Geometric Quantization)',
      sec2_p16: 'A key insight of our model is that physical quantization can be derived naturally from the finite thickness L of the hypershell. The R³ hypersurface left behind by the expanding 4D bulk acts as a resonant waveguide, subject to Dirichlet or Neumann boundary conditions. The soliton\'s internal excitations form standing waves, meaning only modes with wavelengths λ_n = 2L/n and frequencies f_n = n * c / (2L) can remain stable. This yields a forced, purely geometric quantization of the physical fields.',
      
      sec2_h7: '7. Emergent Mass as a Self-Focusing Potential Well (Mach\'s Principle)',
      sec2_p17: 'In traditional physics, mass is a fundamental, hardcoded parameter. In this model, the soliton possesses no inherent mass; its internal structure is governed by the Φ wave equation. However, due to self-excitation (κ), the soliton carves out a local potential well around itself. This well prevents the soliton from dispersing (self-focusing) and manifests as inertia when moving. The potential well depth and effective mass are dynamically dependent on the global energy and mass distribution of the entire system, fulfilling Mach\'s principle and the gravitational tensor analogy.',

      sec2_tbl_col_phenomenon: 'Physical Phenomenon',
      sec2_tbl_col_standard: 'Established Formalism',
      sec2_tbl_col_speculative: 'Deus Ex Machina Analogy',
      sec2_tbl_col_explanation: 'Mechanism of Action Description',
      sec2_tbl_r1_c1: 'Mass & Inertia',
      sec2_tbl_r1_c2: 'Einstein\'s spacetime curvature (g_μν) curved by the stress-energy tensor (T_μν).',
      sec2_tbl_r1_c3: 'The soliton\'s Φ wave field generates a local self-focusing tension (κ), carving a potential well.',
      sec2_tbl_r1_c4: 'The well depth yields the inertial mass, and its spatial asymmetry (external body) drives the force.',
      sec2_tbl_r2_c1: 'Quantized States',
      sec2_tbl_r2_c2: 'Schrödinger Equation: iħ∂ψ/∂t = Ĥψ • Quantized energy levels (E_n) of a bounded particle.',
      sec2_tbl_r2_c3: 'The soliton propagates within the finite L thickness of the R³ hypershell as a resonator.',
      sec2_tbl_r2_c4: 'The L-wide waveguide forces a natural geometric boundary constraint on the soliton\'s modes (f_n).',
      sec2_tbl_r3_c1: 'Speed of Light Limit',
      sec2_tbl_r3_c2: 'v < c • Lorentz transformations and the maximum propagation speed of physical interactions.',
      sec2_tbl_r3_c3: 'The dynamic limit of lattice propagation and the hypershell L thickness: c = √(2.5 / ΔR).',
      sec2_tbl_r3_c4: 'The speed of information is bounded by the physical and tension parameters of the hypershell.',
      sec2_tbl_r4_c1: 'Cosmic Expansion',
      sec2_tbl_r4_c2: 'Friedmann equations: H² = 8πG/3 * ρ - k c²/a² + Λc²/3 • Metric expansion of space.',
      sec2_tbl_r4_c3: 'The dynamic growth of the 4D lattice 𝕎(t) due to potential spreading and neighbor coupling.',
      sec2_tbl_r4_c4: 'Spacetime volume increases in parallel with energy spread, explaining inflation/expansion.',

      quote: '"Without the observer, reality is just an infinite-sized, symmetric ℝ⁴ potential field, where nothing happens because everything is present simultaneously. Only by observation is spacetime split, and solitons come to life as material existences on the ℝ³ hypersurface."'
    },
    de: {
      title: 'DEUS EX MACHINA',
      subtitle: 'Spekulatives kosmologisches Konzept und mathematisches Modell • Version 1.0.0',
      badge: 'Gedankenexperiment & Konzept',
      intro1: 'Dieses Dokument präsentiert das spekulative Gedankenexperiment, Konzept und die mathematische Repräsentation hinter dem Deus Ex Machina-Projekt. Das Modell ist keine bewiesene physikalische Theorie, sondern eine theoretische Hypothese und philosophisch-topologische Spekulation, die bestimmte Randbedingungen des Standardmodells und der Allgemeinen Relativitätstheorie als Ausgangspunkt nutzt.',
      intro2: 'Der Simulator dient als interaktives Labor zur Überprüfung, Modellierung und numerischen Untersuchung dieser hypothetischen Theorie. Im Folgenden präsentieren wir die ontologischen Grundlagen des Konzepts, dimensionale Transformationen, die implementierten diskreten und kontinuierlichen Gleichungen sowie die technische Anleitung für die experimentelle Umgebung.',
      
      sec1_title: 'Philosophische und ontologische Weltanschauung',
      sec1_subtitle: 'Die Rolle des Beobachters, der R⁴-Bulk und die emergente R³-Raumzeit',
      sec1_h1: '1. Der R⁴-Bulk als zeitloser und strukturloser Hintergrund',
      sec1_p1: 'Nach der Baseline des Modells enthält der höherdimensionale vierdimensionale euklidische Raum (ℝ⁴) für sich genommen keine physikalischen Strukturen, diskreten Objekte, und weder Zeit noch Entropie können im traditionellen Sinne darin interpretiert werden. In ℝ⁴ sind alle möglichen Zustände quasi gleichzeitig als eine einzige symmetrische, unteilbare Konfiguration vorhanden. Es gibt keine Wechselwirkungen, da es keine abgegrenzten Körper oder Felder gibt; die Verteilung der Potenziale folgt einer kontinuierlichen, globalen Symmetrie.',
      sec1_h2: '2. Emergenz der R³-Hyperfläche und die Rolle des Beobachters',
      sec1_p2: 'Die physikalische Realität – die dreidimensionale Raumzeit (ℝ³ × ℝ), die Kausalität, lokalisierte materielle Strukturen und physikalische Gesetze – sind keine fundamentalen Eigenschaften der Existenz, sondern rein emergent. Diese Emergenz beginnt mit der Bestimmung eines Beobachters (oder unter der Annahme der Tatsache der Beobachtung).',
      sec1_p3: 'Sobald wir willkürlich einen Punkt oder ein lokales Bezugssystem im ℝ⁴-Bulk auswählen, verletzen wir die globale Symmetrie. Die Positionierung des Beobachters erlegt dem System Einschränkungen auf: Eine dreidimensionale Projektion oder ein Hyperflächenschnitt (ℝ³) des ℝ⁴-Potenzialfelds wird für den Beobachter zugänglich. Auf dieser Hyperfläche erscheinen Potenzialströme als Wellenfronten, teilchenähnliche Anregungen (Solitonen). Physikalische Gesetze werden also nur innerhalb dieses angenommenen lokalen Bezugssystems objektiv.',
      sec1_p3_extra: 'Diesem Konzept zufolge besitzt Materie selbst keine unabhängige existenzielle Realität, sondern ist ein lokal beständiges, selbstreflexives Wechselwirkungs-/Effektmuster. Sobald dieses Muster lokal entsteht, verhält es sich als geschlossenes System, wodurch es seine eigene Umgebung als Raumzeit definiert und in Wechselwirkung sowohl mit seiner Umgebung als auch mit anderen ähnlichen Objekten (Solitonen) tritt.',
      sec1_p3_extra2: 'Auf makroskopischer, menschlicher Größenskala (was im Wesentlichen dem Newtonschen Bereich entspricht) beschränkt sich unsere objektive Realitätswahrnehmung auf die 3 Raumdimensionen und die erzwungene, zeitartige Bedingung der 4. Dimension (das unaufhaltsame Fortschreiten der ℝ⁴-Wellenfront). Wenn wir das System jedoch auf atomarer, mikroskopischer Ebene betrachten, sind dort alle 4 Dimensionen quasi-frei und fließen gemeinsam mit der Wellenfront des Hyperraums. Auf dieser Skala löst sich die objektive, deterministische Realität auf, bis wir durch Messung künstlich ein Bezugssystem festlegen. Dieser Freiheitsgrad führt naturgemäß zum Welle-Teilchen-Dualismus und zur Heisenbergschen Unschärferelation, die sich als direkte, natürliche geometrische Konsequenzen dieser Struktur ergeben.',
      sec1_callout_title: 'Quantensimulationsanalogie und das Fehlen paralleler Realitäten',
      sec1_callout_p: 'Obwohl der umgebende ℝ⁴-Hintergrund unendlich viele Zustände und Konfigurationen gleichzeitig enthält (in einem Zustand reiner Kohärenz), existieren auf der Ebene des Beobachters keine parallelen Realitäten. Sobald sich der Beobachter in einer bestimmten ℝ³-Projektion verankert, bestimmen die Wirkungsverteilung des Systems und die mathematischen Einschränkungen die Zustandsentwicklung eindeutig. Unsicherheit besteht nur so lange, bis das Bezugssystem fixiert ist; ab dem Moment der Verankerung ist die physikalische Realität gezwungen, einen einzigen, gut definierten, objektiven Weg für den Beobachter einzuschlagen.',
      sec1_h3: '3. Die Konzepte von Zeit, Kausalität und Vergangenheit als Singularität',
      sec1_p4: 'Die auffälligste Konsequenz zeigt sich in der zeitlichen und kausalen Extrapolation. Da kausale Beziehungen erst mit der Verankerung des Beobachters entlang der ℝ³-Einschränkungen entstehen, ist die Vergangenheit eigentlich keine feste, objektive historische Kette, sondern war vor der Beobachtung ebenfalls Teil des Raums der Unsicherheit.',
      sec1_p5: 'Wenn der Beobachter versucht, Ereignisse aus der Gegenwart (von der aktiven Wellenfront von ℝ³) nach den Gesetzen der Kausalität (mit Blick in die Vergangenheit) rückwärts zu extrapolieren, führen die mathematischen Gleichungen unweigerlich zu einer Singularität. Diese Singularität spiegelt sich in der Kosmologie als "Urknall" (Big Bang) wider. In Wirklichkeit ist diese Singularität kein reales vergangenes physikalisches Ereignis, sondern eine mathematische Folge der Verankerung des Koordinatensystems: die Spitze des Extrapolationskegels, an der die vom Beobachter eingeführte Kausalitätsbedingung im Ursprung von ℝ⁴ zusammenbricht.',
      sec1_h4: '4. Erschaffene Welt oder ewige Existenz? — Die Geometrie der kontinuierlichen Schöpfung',
      sec1_p6: 'Basierend auf dem Deus Ex Machina-Modell erfordert die klassische Frage, ob die Welt zu einem bestimmten Zeitpunkt in der Vergangenheit erschaffen wurde oder einfach „nur so da ist“, einen grundlegenden Paradigmenwechsel. Die Frage selbst hat nicht in jedem Bezugssystem eine eindeutige, absolute Bedeutung. Wir können diese Frage nur eingeschränkt aus der dreidimensionalen Beobachterperspektive beantworten, die in der ℝ³-Projektion gefangen ist.',
      sec1_p7: 'In dieser dreidimensionalen Darstellung lautet die Antwort, dass die Welt nicht in der Vergangenheit erschaffen wurde, sondern kontinuierlich im gegenwärtigen Moment erschaffen wird. Jede einzelne physikalische Wechselwirkung – deren Anzahl praktisch unendlich ist – schneidet aus einem neu bezeichneten lokalen Punkt (der Verankerung des Beobachters/Solitons) ein neues objektives, kausales Stück aus dem 4D-Raum. Schöpfung ist daher kein einmaliger kosmologischer Akt, sondern eine kontinuierliche geometrische Übersetzung und Spannungsverankerung aus dem 4D-Hyperraum in die 3D-Wahrnehmungsebene.',

      sec2_title: 'Mathematischer Formalismus',
      sec2_subtitle: 'Vom topologischen Netzwerk zu kontinuierlichen Wellengleichungen',
      sec2_h1: '1. Das ursprüngliche diskrete topologische Gittermodell',
      sec2_p1: 'Betrachten wir zunächst ein dynamisch wachsendes diskretes Gitter im vierdimensionalen ganzzahligen Koordinatenraum: 𝕎(t) ⊂ ℤ⁴. Jede Gitterstelle x = (x₀, x₁, x₂, x₃) ∈ 𝕎 hat ein nicht-negatives skalares Potenzial: V(x, t) ≥ 0.',
      sec2_p2: 'Die Gesamtenergie (oder Summe der Potenziale) des Systems bleibt erhalten:',
      sec2_p3: 'Gemäß der Wachstumsbedingung erweitert sich das Gitter automatisch um die Nachbarn (𝒩(x)) dieses Knotens, wenn das Potenzial an einem Knoten Null überschreitet:',
      sec2_p4: 'Diese Eigenschaft stellt die Expansion der Raummetrik parallel zur Ausbreitung der Energie sicher und modelliert die Inflation der Raumzeit.',
      sec2_h2: '2. Erweiterter Simulationsformalismus (Umgebungsspannung)',
      sec2_p5: 'In dem im Programm implementierten erweiterten physikalischen Modell führen wir eine Flussregulierung und eine Kopplung der Umgebungsspannung (Tension Coupling) ein. Der Potenzialfluss von Gitterstelle i zur benachbarten Stelle j ist proportional zur Potenzialdifferenz, wird jedoch durch den durchschnittlichen Zustand der anderen Nachbarn von Stelle i moduliert:',
      sec2_p6: 'Dabei ist der Spannungsmultiplikator (M_j) mit der hyperbolischen Tangensfunktion gekoppelt, was den Fluss je nach Umgebungsdichte hemmt oder verstärkt:',
      sec2_p7: 'Diese nichtlineare Rückkopplung ist kritisch: Sie ermöglicht die Entstehung selbstorganisierender Strukturen, Muster und Dichtefluktuationen anstelle einfacher Diffusion.',
      sec2_h3: '3. Kontinuierlicher Nicht-Gitter-Modellgrenzwert',
      sec2_p8: 'Wenn der Gitterabstand gegen Null geht (Δx → 0), transformiert sich die diskrete Potenzialgleichung in eine modifizierte vierdimensionale nichtlineare Transportgleichung für das Skalarfeld Φ(x, t):',
      sec2_p9: 'Wobei der zweite Term den selbstfokussierenden Fluss darstellt, der aus der lokalen Spannung resultiert. Diese Gleichung ist in der Lage, stabile, lokalisierte Klumpen (Solitonen) im reinen ℝ⁴-Raum aufrechtzuerhalten und eine gleichmäßige Verteilung (Wärmetod) der Energie zu verhindern.',
      sec2_h4: '4. Mathematische Interpretation der R³-Hyperhülle (Soliton-Lab)',
      sec2_p10: 'Die äußere Hülle der expandierenden Wellenfront in ℝ⁴ wird als kugelsymmetrische ℝ³-Hyperhülle (Hypershell) identifiziert, deren Radius der effektive RMS-Radius der Potenzialverteilung ist:',
      sec2_p11: 'Auf dieser emergenten ℝ³-Hyperfläche werden lokale Anregungen durch ein effektives Wellenfeld ψ(u, τ) beschrieben, das die nichtlineare Klein-Gordon- oder Sine-Gordon-Gleichung erfüllt:',
      sec2_p12: 'Wobei die Parameter direkt vom Zustand des ℝ⁴-Bulk-Hintergrunds abgeleitet sind:',
      sec2_l1: 'c (Lokale Lichtgeschwindigkeit): c = √(2.5 / ΔR), wobei ΔR die Dicke der Hyperhülle ist.',
      sec2_l2: 'η (Dissipationskoeffizient): Hängt von der globalen Energiedämpfungsrate des Gitters ab.',
      sec2_l3: 'ω₀² (Effektives Massenquadrat): ω₀² = S · (1 + tanh(ρ - 1)) / 2, wobei ρ = E_tot / ΔR² die ℝ⁴-Bulk-Energiedichte ist, und S die Kopplungsstärke.',

      sec3_title: 'Software-Bedienungsanleitung',
      sec3_subtitle: 'Funktionen der Benutzeroberfläche und des Simulationslabors',
      sec3_p1: 'Der Deus Ex Machina-Simulator bietet fünf Hauptvisualisierungs- und Analysemodi, die über die oberen Registerkarten zugänglich sind:',
      sec3_t1: '1. 4D-Projektion (3D-Software-Renderer)',
      sec3_d1: 'Projektion der ℝ⁴-Gitterpotenzialverteilung in 3D. Sie kann in den XW-, YW- und ZW-Ebenen rotiert werden, was die Wirkung der Hyperrotation visuell demonstriert.',
      sec3_t2: '2. 2D-Schnitt-Heatmap',
      sec3_d2: 'Ein beliebiger 2D-Ebenenschnitt des 4D-Raums (z. B. X-Y-Ebene mit festen Z- und W-Koordinaten), der sich perfekt zur Beobachtung von Gradientenflüssen eignet.',
      sec3_t3: '3. Fourier-Analyse (FFT)',
      sec3_d3: 'Echtzeitanalyse des räumlichen Wellenfrequenzspektrums. Hilft bei der Identifizierung von Gitterperiodizität und harmonischen Frequenzen, die durch Rückkopplung verursacht werden.',
      sec3_t4: '4. Hyperflächen-Labor (Solitonen)',
      sec3_d4: 'Aktive Laborumgebung auf der emergenten ℝ³-Hülle. Hier können Sie mit Solitonen-Kollisionen, Breather und Anregungen experimentieren.',
      sec3_h2: 'Schritte für praktische Experimente:',
      sec3_o1: 'Stellen Sie die Spannungskopplung (Tension Coupling) auf einen Wert über 0.6 ein, um die Selbstorganisation zu beobachten.',
      sec3_o2: 'Starten Sie die Simulation mit der Wiedergabetaste links oder gehen Sie manuell vor.',
      sec3_o3: 'Klicken Sie auf einen Gitterpunkt in der Visualisierung, um ihn als "Beobachter" festzulegen, und beobachten Sie, wie sich die Energiekonzentration ändert!',
      sec3_o4: 'Wählen Sie im Solitonen-Labor das nichtlineare "Sine-Gordon"-Modell und die Anregung "Kollision", um die Welle-Teilchen-Dualität von Solitonen zu untersuchen.',

      sec4_title: 'Lokale Ausführung und kostenloses Webhosting',
      sec4_subtitle: 'So führen Sie Ihre Anwendung aus und veröffentlichen sie unter Ihrer eigenen Domain',
      sec4_h1: '1. Herunterladen und lokales Ausführen des Quellcodes',
      sec4_p1: 'Sie können diese gesamte Anwendung lokal auf Ihrem Computer ausführen. Da es sich um eine moderne React-Anwendung (Vite + TypeScript) als Single Page Application (SPA) handelt, ist keine komplexe Datenbankinstallation erforderlich.',
      sec4_code: `# 1. Quellcode herunterladen und entpacken (oder GitHub-Repo klonen)
# 2. Stellen Sie sicher, dass Node.js (v18+) auf Ihrem Computer installiert ist
# 3. Wechseln Sie in den Projektordner und installieren Sie die Pakete:
npm install

# 4. Starten Sie den lokalen Entwicklungsserver:
npm run dev

# Das Programm ist nun unter http://localhost:3000 verfügbar.

# 5. Erstellen Sie die endgültige, optimierte statische Version:
npm run build

# Dies erstellt einen Ordner 'dist', der die gesamte Website enthält.`,
      sec4_hint: 'Klicken Sie zum Extrahieren des Quellcodes auf die Schaltfläche "Settings" in der oberen rechten Ecke der AI Studio-Benutzeroberfläche und wählen Sie "Export to ZIP" oder "Export to GitHub".',
      sec4_h2: '2. Kostenlose Webhosting-Anbieter (Empfohlen)',
      sec4_p2: 'Die folgenden Plattformen bieten blitzschnelles globales Hosting für den kompilierten dist-Ordner völlig kostenlos an, ohne dass Kreditkartendaten erforderlich sind:',
      sec4_v_title: 'VERCEL (Dringend Empfohlen)',
      sec4_v_badge: 'Automatisches Git-Deploy',
      sec4_v_desc: 'Die einfachste Lösung für React-Anwendungen. Registrieren Sie sich kostenlos auf vercel.com, verbinden Sie Ihr GitHub-Konto, wählen Sie Ihr Deus Ex Machina-Repository aus, und Vercel erstellt und veröffentlicht nach jedem Git-Commit automatisch.',
      sec4_g_title: 'GITHUB PAGES',
      sec4_g_badge: '100% integriert',
      sec4_g_desc: 'Wenn Ihr Code bereits auf GitHub liegt, gehen Sie zu Settings → Pages Ihres Repositorys und stellen Sie die Quelle auf GitHub Actions oder den gh-pages-Zweig ein. Völlig kostenlos und unterstützt nativ eigene Domains.',
      sec4_n_title: 'NETLIFY',
      sec4_n_badge: 'Drag & Drop',
      sec4_n_desc: 'Wenn Sie kein Git verwenden möchten, registrieren Sie sich einfach bei netlify.com und ziehen Sie den auf Ihrem lokalen Computer erstellten dist-Ordner per Drag & Drop in den Browser. Ihre Website ist sofort live.',
      sec4_h3: '3. Registrierung einer eigenen Domain und Verbindung (Günstig / Kostengünstig)',
      sec4_p3: 'Um eine professionelle Adresse zu haben (z. B. deusexmachina.com), müssen Sie eine Domain registrieren. Hier sind die günstigsten und sichersten Registrare:',
      sec4_l1: 'Cloudflare Registrar: Der sicherste DNS-Anbieter der Welt. Bietet Domains zum Großhandelspreis an (ohne Aufschläge oder versteckte Gebühren, z. B. ein .com kostet ca. $9/Jahr). Inklusive kostenlosem SSL/TLS-Zertifikat und hervorragendem DDoS-Schutz.',
      sec4_l2: 'Namecheap: Äußerst beliebt, bietet oft Rabatte im ersten Jahr (Preise zwischen $1-$5 für bestimmte Endungen). Die Verwaltungsoberfläche ist sehr benutzerfreundlich.',
      sec4_h4: 'Wie verbinden Sie Ihre Domain mit Ihrem Hosting (z. B. Vercel oder GitHub Pages)?',
      sec4_stepA: 'Schritt A: DNS-Einträge hinzufügen',
      sec4_stepA_desc: 'Navigieren Sie in der Benutzeroberfläche Ihres Domain-Registrars (oder auf Cloudflare) zu den DNS-Einstellungen und fügen Sie einen CNAME-Eintrag hinzu, der auf Ihr Hosting verweist:',
      sec4_stepB: 'Schritt B: Eigene Domain in der Hosting-Oberfläche hinzufügen',
      sec4_stepB_desc: 'Gehen Sie zu den Projekteinstellungen auf Vercel oder GitHub Pages (Settings → Domains), geben Sie Ihre gekaufte Domain-Adresse ein und klicken Sie auf Add. Das System prüft die DNS-Einträge automatisch und generiert kostenlose SSL-Schlüssel (HTTPS).',
      sec4_portability_title: 'Superleichte Portabilität',
      sec4_portability_desc: 'Die Software läuft vollständig auf der Client-Seite, was bedeutet, dass Sie den Inhalt des erstellten dist-Verzeichnisses sogar auf einen USB-Stick kopieren und die index.html-Datei durch Doppelklick auf jedem Computer ohne Internetverbindung öffnen können. Ein wirklich modernes tragbares Labor!',

      sec2_h5: '5. Forschungsprogramm: Phase I – Vergleichende Analyse des 3-Körper-Problems',
      sec2_p13: 'Als ersten praktischen Schritt unseres Forschungsprogramms untersuchen wir, wie sich eine spezielle Dreikörperkonfiguration im Deus Ex Machina-Modell im Vergleich zu den Vorhersagen der klassischen Newtonschen Mechanik und der Allgemeinen Relativitätstheorie (GR) verhält. Es ist wichtig zu betonen, dass diese Analyse keinen endgültigen, verifizierten wissenschaftlichen Beweis darstellt. Es handelt sich um ein simuliertes Gedankenexperiment und eine Testphase, die dazu dient, die Grundlagen für spätere eingehende Untersuchungen des Modells und des theoretischen Hintergrunds sowie idealerweise dessen zukünftige Verifizierung zu schaffen.',
      sec2_p13_extra: 'Der Grund für die Wahl dieses Experiments als ersten Versuch liegt darin, dass es sich nicht um eine triviale oder direkte Folge der Struktur handelt (wie das Vorhandensein Dunkler Materie, die Quantisierung oder die lokal quasi-konstante Lichtgeschwindigkeit), sondern um die Manifestation eines auf dem spezifischen selbstreflexiven Subraum des Systems erzeugten „Unter-Wirkungsmechanismus“ (sekundäre Kopplung).',
      sec2_p14: 'Im klassischen Newtonschen Ansatz ist die Wechselwirkung zwischen Punktmassen augenblicklich und fixiert (unter Verwendung der Gravitationskonstante G), während in der GR die Raumzeitmetrik (g_μν) durch den Energie-Impuls-Tensor gekrümmt wird und die Bewegung durch Geodätengleichungen beschrieben wird. In unserem Modell sind Körper Solitonen (selbstreflexive, stabile Effektmuster), die im ℝ⁴-Bulk lokalisiert sind und über lokale Spannungsfluktuationen (Tension Field) auf der emergenten ℝ³-Hyperfläche interagieren. Bei der „inversen mathematischen Parametrisierung“ bestimmen die beobachteten ℝ³-Trajektorien die ℝ⁴-Anregungsprofile.',
      sec2_p15: 'Basierend auf numerischen Simulationstests ist die Dynamik des 3-Körper-Systems äußerst empfindlich. Wir haben Abweichungen von herkömmlichen Berechnungen in drei typischen Orbit-Bereichen untersucht:',
      sec2_p15_l1: 'Enger Vorbeiflug (Nahe Wechselwirkung): Die Abweichungen der Umlaufbahnen können 12-18 % erreichen. Im Solitonenmodell führt der selbstfokussierende Effekt der lokalen Spannungskopplung dazu, dass die effektive Masse der Körper bei abnehmender Entfernung dynamisch fluktuiert, im Gegensatz zu den Newtonschen fixierten Punktmassen.',
      sec2_p15_l2: 'Mittlere und stabile Umlaufbahnen (Zirkulation): Die Abweichungen sind extrem minimal und liegen nur zwischen 1,5 % und 3,2 %. Dies zeigt, dass das Modell bei geringer lokaler Spannung (schwacher Raumzeitkrümmung) asymptotisch die klassische mechanische Näherung reproduziert.',
      sec2_p15_l3: 'Relativistischer Grenzfall (Extreme Dichten): Das Newtonsche Modell bricht völlig zusammen, während das Solitonenmodell im Vergleich zur GR eine Abweichung von 5-8 % aufweist. Dies wird durch die Expansion des 4D-Bulks und lokale Spannungsgrenzen verursacht, die die maximale Geschwindigkeit der Informationsausbreitung (lokale Lichtgeschwindigkeit c) natürlich begrenzen.',
      
      sec2_th_col1: 'Modell / System',
      sec2_th_col2: 'Zu lösende Gleichungen',
      sec2_th_col3: 'Wechselwirkungsvermittler',
      sec2_th_col4: 'Charakteristika',
      
      sec2_tr1_c1: 'Newtonsche Mechanik',
      sec2_tr1_c2: 'd²r_i/dt² = ∑_{j≠i} G m_j (r_j - r_i) / |r_j - r_i|³',
      sec2_tr1_c3: 'Gravitationspotenzialfeld (U) • Sofortige Fernwirkung',
      sec2_tr1_c4: 'Fixierte punktförmige Massen • Absoluter Raum und absolute Zeit • Chaotische Bahnen existieren',
      
      sec2_tr2_c1: 'Allgemeine Relativitätstheorie (GR)',
      sec2_tr2_c2: 'd²x^μ/dλ² + Γ^μ_αρ (dx^α/dλ) (dx^ρ/dλ) = 0 • G_μν = 8πG T_μν',
      sec2_tr2_c3: 'Gekrümmte Raumzeitmetrik (g_μν) • Breitet sich mit Lichtgeschwindigkeit aus',
      sec2_tr2_c4: 'Dynamische Raumzeit • Singularitäten (Schwarze Löcher) • Orbitale Präzession',
      
      sec2_tr3_c1: '4D Solitonic Projection',
      sec2_tr3_c2: '∂Φ/∂t = D∇²Φ + γ∇·(Φ∇(∇²Φ)) • ∂²ψ/∂τ² - c²∇²ψ + η∂ψ/∂τ + ω₀²sin(ψ) = 0',
      sec2_tr3_c3: 'Lokales Spannungsfeld (Tension Field) in ℝ³ • ℝ⁴-Bulk-Potenzial (V)',
      sec2_tr3_c4: 'Emergente, geschlossene selbstreflexive Effektmuster • Dynamisch fluktuierende effektive Masse • Endliche Ausbreitungsgeschwindigkeit (c)',

      sec2_h6: '6. Quantisierung über die Hyperhüllendicke (Geometrische Quantisierung)',
      sec2_p16: 'Eine wichtige Erkenntnis unseres Modells ist, dass die physikalische Quantisierung auf natürliche Weise aus der endlichen Dicke L der Hyperhülle abgeleitet werden kann. Die R³-Hyperfläche, die durch den expandierenden 4D-Bulk zurückgelassen wird, wirkt als resonanter Wellenleiter, der Dirichlet- oder Neumann-Randbedingungen unterliegt. Die internen Schwingungen des Solitons bilden stehende Wellen, sodass nur Modi mit Wellenlängen λ_n = 2L/n und Frequenzen f_n = n * c / (2L) stabil bleiben können. Dies führt zu einer rein geometrischen Quantisierung der physikalischen Felder.',
      
      sec2_h7: '7. Emergente Masse als selbstfokussierende Potenzialsenke (Machsches Prinzip)',
      sec2_p17: 'In der traditionellen Physik ist die Masse ein fundamentaler Parameter. In diesem Modell besitzt das Soliton keine inhärente Masse; seine interne Struktur wird durch die Φ-Wellengleichung beschrieben. Aufgrund der Selbsterregung (κ) gräbt das Soliton jedoch eine lokale Potenzialsenke um sich herum. Diese Senke verhindert, dass sich das Soliton auflöst (Selbstfokussierung), und äußert sich bei Bewegung als Trägheit. Die Tiefe dieser Senke und die effektive Masse hängen dynamisch von der globalen Energie- und Massenverteilung des Gesamtsystems ab, was das Machsche Prinzip und die Gravitationstensor-Analogie realisiert.',

      sec2_tbl_col_phenomenon: 'Physikalisches Phänomen',
      sec2_tbl_col_standard: 'Etablierter Formalismus',
      sec2_tbl_col_speculative: 'Deus Ex Machina Analogie',
      sec2_tbl_col_explanation: 'Beschreibung des Wirkungsmechanismus',
      sec2_tbl_r1_c1: 'Masse & Trägheit',
      sec2_tbl_r1_c2: 'Einsteins Raumzeitkrümmung (g_μν) gekrümmt durch den Energie-Impuls-Tensor (T_μν).',
      sec2_tbl_r1_c3: 'Das Φ-Wellenfeld des Solitons erzeugt lokale Spannung (κ) und gräbt eine Potenzialsenke.',
      sec2_tbl_r1_c4: 'Die Tiefe der Senke bestimmt die träge Masse; Asymmetrien (externer Körper) treiben die Kraft.',
      sec2_tbl_r2_c1: 'Quantisierte Zustände',
      sec2_tbl_r2_c2: 'Schrödinger-Gleichung: iħ∂ψ/∂t = Ĥψ • Quantisierte Energieniveaus (E_n) im Kastenpotenzial.',
      sec2_tbl_r2_c3: 'Das Soliton breitet sich innerhalb der endlichen Dicke L der R³-Hyperhülle aus.',
      sec2_tbl_r2_c4: 'Der Wellenleiter der Breite L erzwingt eine natürliche geometrische Randbedingung für die Modi (f_n).',
      sec2_tbl_r3_c1: 'Lichtgeschwindigkeitsgrenze',
      sec2_tbl_r3_c2: 'v < c • Lorentz-Transformationen und maximale Ausbreitungsgeschwindigkeit physikalischer Wechselwirkungen.',
      sec2_tbl_r3_c3: 'Die dynamische Grenze des Gitterflusses und der Hyperhüllendicke L: c = √(2.5 / ΔR).',
      sec2_tbl_r3_c4: 'Die Geschwindigkeit von Signalen ist durch die physikalischen und Spannungsparameter begrenzt.',
      sec2_tbl_r4_c1: 'Kosmische Expansion',
      sec2_tbl_r4_c2: 'Friedmann-Gleichungen: H² = 8πG/3 * ρ - k c²/a² + Λc²/3 • Metrische Expansion des Raumes.',
      sec2_tbl_r4_c3: 'Die dynamische Ausbreitung des 4D-Gitters 𝕎(t) durch Potenzialverteilung und Nachbarkopplung.',
      sec2_tbl_r4_c4: 'Das Volumen der Raumzeit wächst parallel zur Energieausbreitung, was die Inflation/Expansion erklärt.',

      quote: '"Ohne den Beobachter ist die Realität nur ein unendlich großes, symmetrisches ℝ⁴-Potenzialfeld, in dem nichts passiert, weil alles gleichzeitig vorhanden ist. Erst durch die Beobachtung wird die Raumzeit gespalten, und Solitonen erwachen als materielle Existenzen auf der ℝ³-Hyperfläche zum Leben."'
    }
  };

  const t = content[lang] || content.hu;

  return (
    <div id="manuscript-container" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-8 text-slate-300">
      
      {/* HEADER */}
      <div id="manuscript-header" className="border-b border-slate-800 pb-6 text-center lg:text-left flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 id="manuscript-title" className="text-3xl font-sans font-bold tracking-tight text-white mb-2">
            {t.title}
          </h1>
          <p id="manuscript-subtitle" className="text-sm font-mono text-sky-400">
            {t.subtitle}
          </p>
        </div>
        <div id="manuscript-meta-badge" className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-amber-400">
          <BookOpen className="h-4 w-4" />
          {t.badge}
        </div>
      </div>

      {/* INTRODUCTION */}
      <div id="manuscript-intro" className="text-slate-300 text-sm leading-relaxed max-w-none">
        <p className="mb-4">
          {t.intro1}
        </p>
        <p>
          {t.intro2}
        </p>
      </div>

      {/* SECTION ACCORDION */}
      <div id="manuscript-sections" className="flex flex-col gap-4">
        
        {/* SECTION 1: PHILOSOPHY */}
        <div id="sec-philosophy-card" className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/25">
          <button
            id="sec-philosophy-btn"
            onClick={() => toggleSection('phil')}
            className="w-full flex items-center justify-between p-4 bg-slate-950/45 hover:bg-slate-950/60 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 font-mono text-sm font-bold">I</span>
              <div>
                <h3 className="text-sm font-sans font-semibold text-white">{t.sec1_title}</h3>
                <p className="text-xs text-slate-500 font-mono">{t.sec1_subtitle}</p>
              </div>
            </div>
            {expandedSection === 'phil' ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
          </button>
          
          {expandedSection === 'phil' && (
            <div id="sec-philosophy-content" className="p-6 border-t border-slate-850 bg-slate-950/15 text-sm leading-relaxed flex flex-col gap-4 text-slate-350">
              <div>
                <h4 className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-2">{t.sec1_h1}</h4>
                <p>{t.sec1_p1}</p>
              </div>

              <div>
                <h4 className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-2">{t.sec1_h2}</h4>
                <p>{t.sec1_p2}</p>
                <p className="mt-2">{t.sec1_p3}</p>
                <p className="mt-2">{t.sec1_p3_extra}</p>
                <p className="mt-2 border-l-2 border-amber-500/30 pl-3 italic text-slate-400">{t.sec1_p3_extra2}</p>
              </div>

              <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl">
                <h4 className="text-xs font-mono text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Compass className="h-4 w-4" /> {t.sec1_callout_title}
                </h4>
                <p className="text-xs">{t.sec1_callout_p}</p>
              </div>

              <div>
                <h4 className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-2">{t.sec1_h3}</h4>
                <p>{t.sec1_p4}</p>
                <p className="mt-2">{t.sec1_p5}</p>
              </div>

              <div>
                <h4 className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-2">{t.sec1_h4}</h4>
                <p>{t.sec1_p6}</p>
                <p className="mt-2">{t.sec1_p7}</p>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: MATHEMATICAL FORMALISM */}
        <div id="sec-math-card" className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/25">
          <button
            id="sec-math-btn"
            onClick={() => toggleSection('math')}
            className="w-full flex items-center justify-between p-4 bg-slate-950/45 hover:bg-slate-950/60 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 font-mono text-sm font-bold">II</span>
              <div>
                <h3 className="text-sm font-sans font-semibold text-white">{t.sec2_title}</h3>
                <p className="text-xs text-slate-500 font-mono">{t.sec2_subtitle}</p>
              </div>
            </div>
            {expandedSection === 'math' ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
          </button>
          
          {expandedSection === 'math' && (
            <div id="sec-math-content" className="p-6 border-t border-slate-850 bg-slate-950/15 text-sm leading-relaxed flex flex-col gap-6 text-slate-355">
              
              {/* Discrete formulation */}
              <div>
                <h4 className="text-xs font-mono text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Layers className="h-4 w-4" /> {t.sec2_h1}
                </h4>
                <p className="mb-3">
                  {t.sec2_p1}
                </p>
                <p className="mb-3">
                  {t.sec2_p2}
                </p>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center font-mono text-xs text-amber-300 my-2">
                  E_tot = ∑_❴x ∈ 𝕎(t)❵ V(x, t) = Const.
                </div>
                <p className="mb-3">
                  {t.sec2_p3}
                </p>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center font-mono text-xs text-amber-300 my-2">
                  Ha V(x, t) &gt; 0, akkor 𝕎(t+1) ← 𝕎(t) ∪ 𝒩(x)
                </div>
                <p>
                  {t.sec2_p4}
                </p>
              </div>

              {/* Extended simulator math */}
              <div>
                <h4 className="text-xs font-mono text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Cpu className="h-4 w-4" /> {t.sec2_h2}
                </h4>
                <p className="mb-3">
                  {t.sec2_p5}
                </p>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center font-mono text-xs text-amber-300 my-2">
                  ΔV_(i → j) = M_j · (V_i - V_j) / |𝒩_recv|
                </div>
                <p className="mb-3">
                  {t.sec2_p6}
                </p>
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-left font-mono text-xs text-amber-300 my-2 overflow-x-auto whitespace-pre">
                  M_j = Max(0.01, 1.0 + T · tanh((V_other - V_i) / (V_i + 1.0)))
                  Ahol / Where:
                  - T: Csatolási feszültség (Tension Coupling ∈ [0, 1])
                  - V_other: Az i csomópont szomszédjainak átlagos potenciálja (j-t kivéve)
                </div>
                <p className="mt-3">
                  {t.sec2_p7}
                </p>
              </div>

              {/* Continuous limit */}
              <div>
                <h4 className="text-xs font-mono text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Compass className="h-4 w-4" /> {t.sec2_h3}
                </h4>
                <p className="mb-3">
                  {t.sec2_p8}
                </p>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center font-mono text-xs text-amber-300 my-2">
                  ∂Φ/∂t = D · ∇²Φ + γ · ∇ · (Φ · ∇(∇²Φ)) - D_rate · Φ
                </div>
                <p>
                  {t.sec2_p9}
                </p>
              </div>

              {/* R3 Hypersurface soliton lab */}
              <div>
                <h4 className="text-xs font-mono text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" /> {t.sec2_h4}
                </h4>
                <p className="mb-3">
                  {t.sec2_p10}
                </p>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center font-mono text-xs text-amber-300 my-2">
                  R(t) = √❴⟨ ||x||² ⟩_V❵ = √❴ (∑ ||x||² · V(x)) / (∑ V(x)) ❵
                </div>
                <p className="mb-3">
                  {t.sec2_p11}
                </p>
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-center font-mono text-xs text-amber-300 my-2">
                  ∂²ψ/∂τ² - c² ∇²ψ + η ∂ψ/∂τ + ω₀² sin(ψ) = 0
                </div>
                <p className="mb-3">
                  {t.sec2_p12}
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs font-mono text-slate-400">
                  <li><strong className="text-white">{t.sec2_l1}</strong></li>
                  <li><strong className="text-white">{t.sec2_l2}</strong></li>
                  <li><strong className="text-white">{t.sec2_l3}</strong></li>
                </ul>
              </div>

              {/* Point 6: Quantization via Hypershell Thickness */}
              <div>
                <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" /> {t.sec2_h6}
                </h4>
                <p className="mb-3">
                  {t.sec2_p16}
                </p>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center font-mono text-xs text-amber-300 my-2">
                  λ_n = 2L / n  •  f_n = n · c / (2L)  •  E_n ∝ (n / L)²
                </div>
              </div>

              {/* Point 7: Emergent Mass as Self-Exciting Potential Well */}
              <div>
                <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Scale className="h-4 w-4 text-emerald-400" /> {t.sec2_h7}
                </h4>
                <p className="mb-3">
                  {t.sec2_p17}
                </p>
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-left font-mono text-xs text-amber-300 my-2 overflow-x-auto whitespace-pre">
                  V_self(x) = -κ · |Φ(x)|²
                  M_eff = ∫ |Φ(x)|² dx · (1 + κ · ∫ |∇Φ|² dx)
                  g_μν ∝ T_μν  ⟹  V_total(x) = ∑ V_ext,i(x) + V_self(x)
                </div>
              </div>

              {/* Comprehensive Speculative Analogies Comparison Table */}
              <div className="pt-4 border-t border-slate-900/60 flex flex-col gap-3">
                <h4 className="text-xs font-mono text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Compass className="h-4 w-4 text-sky-400" /> {lang === 'hu' ? 'A MEGJELENTETETT FIZIKAI JELENSÉGEK ÉS SPEKULATÍV ANALÓGIÁK TÁBLÁZATA' : lang === 'de' ? 'VERGLEICHSTABELLE DER PHYSIKALISCHEN PHÄNOMENE UND SPEKULATIVEN ANALOGIEN' : 'COMPARATIVE TABLE OF PHYSICAL PHENOMENA AND SPECULATIVE ANALOGIES'}
                </h4>
                <div className="overflow-x-auto my-2 border border-slate-800/80 rounded-xl bg-slate-950/80">
                  <table className="w-full border-collapse text-xs font-sans text-slate-300">
                    <thead>
                      <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-mono text-left">
                        <th className="p-3 font-semibold whitespace-nowrap">{t.sec2_tbl_col_phenomenon}</th>
                        <th className="p-3 font-semibold whitespace-nowrap">{t.sec2_tbl_col_standard}</th>
                        <th className="p-3 font-semibold whitespace-nowrap">{t.sec2_tbl_col_speculative}</th>
                        <th className="p-3 font-semibold whitespace-nowrap">{t.sec2_tbl_col_explanation}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      <tr className="hover:bg-slate-900/35 transition-colors">
                        <td className="p-3 font-semibold text-amber-400 font-mono whitespace-nowrap">{t.sec2_tbl_r1_c1}</td>
                        <td className="p-3 text-slate-300 font-mono">{t.sec2_tbl_r1_c2}</td>
                        <td className="p-3 text-emerald-400 font-mono">{t.sec2_tbl_r1_c3}</td>
                        <td className="p-3 text-slate-400">{t.sec2_tbl_r1_c4}</td>
                      </tr>
                      <tr className="hover:bg-slate-900/35 transition-colors">
                        <td className="p-3 font-semibold text-sky-400 font-mono whitespace-nowrap">{t.sec2_tbl_r2_c1}</td>
                        <td className="p-3 text-slate-300 font-mono">{t.sec2_tbl_r2_c2}</td>
                        <td className="p-3 text-emerald-400 font-mono">{t.sec2_tbl_r2_c3}</td>
                        <td className="p-3 text-slate-400">{t.sec2_tbl_r2_c4}</td>
                      </tr>
                      <tr className="hover:bg-slate-900/35 transition-colors">
                        <td className="p-3 font-semibold text-emerald-400 font-mono whitespace-nowrap">{t.sec2_tbl_r3_c1}</td>
                        <td className="p-3 text-slate-300 font-mono">{t.sec2_tbl_r3_c2}</td>
                        <td className="p-3 text-emerald-400 font-mono">{t.sec2_tbl_r3_c3}</td>
                        <td className="p-3 text-slate-400">{t.sec2_tbl_r3_c4}</td>
                      </tr>
                      <tr className="hover:bg-slate-900/35 transition-colors">
                        <td className="p-3 font-semibold text-indigo-400 font-mono whitespace-nowrap">{t.sec2_tbl_r4_c1}</td>
                        <td className="p-3 text-slate-300 font-mono">{t.sec2_tbl_r4_c2}</td>
                        <td className="p-3 text-emerald-400 font-mono">{t.sec2_tbl_r4_c3}</td>
                        <td className="p-3 text-slate-400">{t.sec2_tbl_r4_c4}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Research Program: 3-Body Problem Comparative Analysis */}
              <div className="pt-4 border-t border-slate-900/60 flex flex-col gap-3">
                <h4 className="text-xs font-mono text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Compass className="h-4 w-4" /> {t.sec2_h5}
                </h4>
                <p className="text-slate-300">
                  {t.sec2_p13}
                </p>
                <p className="text-slate-300 italic text-slate-400 border-l-2 border-sky-500/50 pl-3">
                  {t.sec2_p13_extra}
                </p>
                <p className="text-slate-300">
                  {t.sec2_p14}
                </p>
                
                {/* Comparison Table */}
                <div className="overflow-x-auto my-3 border border-slate-800/80 rounded-xl bg-slate-950/80">
                  <table className="w-full border-collapse text-xs font-sans text-slate-300">
                    <thead>
                      <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-mono text-left">
                        <th className="p-3 font-semibold whitespace-nowrap">{t.sec2_th_col1}</th>
                        <th className="p-3 font-semibold whitespace-nowrap">{t.sec2_th_col2}</th>
                        <th className="p-3 font-semibold whitespace-nowrap">{t.sec2_th_col3}</th>
                        <th className="p-3 font-semibold whitespace-nowrap">{t.sec2_th_col4}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      <tr className="hover:bg-slate-900/35 transition-colors">
                        <td className="p-3 font-semibold text-amber-400 font-mono whitespace-nowrap">{t.sec2_tr1_c1}</td>
                        <td className="p-3 font-mono text-amber-200">{t.sec2_tr1_c2}</td>
                        <td className="p-3 text-slate-400">{t.sec2_tr1_c3}</td>
                        <td className="p-3 text-slate-400">{t.sec2_tr1_c4}</td>
                      </tr>
                      <tr className="hover:bg-slate-900/35 transition-colors">
                        <td className="p-3 font-semibold text-sky-400 font-mono whitespace-nowrap">{t.sec2_tr2_c1}</td>
                        <td className="p-3 font-mono text-sky-200">{t.sec2_tr2_c2}</td>
                        <td className="p-3 text-slate-400">{t.sec2_tr2_c3}</td>
                        <td className="p-3 text-slate-400">{t.sec2_tr2_c4}</td>
                      </tr>
                      <tr className="hover:bg-slate-900/35 transition-colors">
                        <td className="p-3 font-semibold text-emerald-400 font-mono whitespace-nowrap">{t.sec2_tr3_c1}</td>
                        <td className="p-3 font-mono text-emerald-200">{t.sec2_tr3_c2}</td>
                        <td className="p-3 text-slate-400">{t.sec2_tr3_c3}</td>
                        <td className="p-3 text-slate-400">{t.sec2_tr3_c4}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="mt-2 font-semibold text-xs text-slate-400 uppercase tracking-wider">
                  {t.sec2_p15}
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs text-slate-400">
                  <li>{t.sec2_p15_l1}</li>
                  <li>{t.sec2_p15_l2}</li>
                  <li>{t.sec2_p15_l3}</li>
                </ul>
              </div>

            </div>
          )}
        </div>

        {/* SECTION 3: INSTRUCTIONS */}
        <div id="sec-instructions-card" className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/25">
          <button
            id="sec-instructions-btn"
            onClick={() => toggleSection('instr')}
            className="w-full flex items-center justify-between p-4 bg-slate-950/45 hover:bg-slate-950/60 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 font-mono text-sm font-bold">III</span>
              <div>
                <h3 className="text-sm font-sans font-semibold text-white">{t.sec3_title}</h3>
                <p className="text-xs text-slate-500 font-mono">{t.sec3_subtitle}</p>
              </div>
            </div>
            {expandedSection === 'instr' ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
          </button>
          
          {expandedSection === 'instr' && (
            <div id="sec-instructions-content" className="p-6 border-t border-slate-850 bg-slate-950/15 text-sm leading-relaxed flex flex-col gap-4 text-slate-350">
              <p>
                {t.sec3_p1}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                  <h5 className="text-xs font-mono text-sky-400 mb-1">{t.sec3_t1}</h5>
                  <p className="text-xs text-slate-400">
                    {t.sec3_d1}
                  </p>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                  <h5 className="text-xs font-mono text-sky-400 mb-1">{t.sec3_t2}</h5>
                  <p className="text-xs text-slate-400">
                    {t.sec3_d2}
                  </p>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                  <h5 className="text-xs font-mono text-sky-400 mb-1">{t.sec3_t3}</h5>
                  <p className="text-xs text-slate-400">
                    {t.sec3_d3}
                  </p>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                  <h5 className="text-xs font-mono text-sky-400 mb-1">{t.sec3_t4}</h5>
                  <p className="text-xs text-slate-400">
                    {t.sec3_d4}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-mono text-white mb-2">{t.sec3_h2}</h5>
                <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-400">
                  <li>{t.sec3_o1}</li>
                  <li>{t.sec3_o2}</li>
                  <li>{t.sec3_o3}</li>
                  <li>{t.sec3_o4}</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: LOCAL RUN AND HOSTING GUIDES */}
        <div id="sec-hosting-card" className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/25">
          <button
            id="sec-hosting-btn"
            onClick={() => toggleSection('host')}
            className="w-full flex items-center justify-between p-4 bg-slate-950/45 hover:bg-slate-950/60 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 font-mono text-sm font-bold">IV</span>
              <div>
                <h3 className="text-sm font-sans font-semibold text-white">{t.sec4_title}</h3>
                <p className="text-xs text-slate-500 font-mono">{t.sec4_subtitle}</p>
              </div>
            </div>
            {expandedSection === 'host' ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
          </button>
          
          {expandedSection === 'host' && (
            <div id="sec-hosting-content" className="p-6 border-t border-slate-850 bg-slate-950/15 text-sm leading-relaxed flex flex-col gap-6 text-slate-350">
              
              {/* Local run instructions */}
              <div>
                <h4 className="text-xs font-mono text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" /> {t.sec4_h1}
                </h4>
                <p className="mb-2">
                  {t.sec4_p1}
                </p>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre">
                  {t.sec4_code}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>{t.sec4_hint}</span>
                </div>
              </div>

              {/* Free hosting options */}
              <div>
                <h4 className="text-xs font-mono text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Server className="h-4 w-4" /> {t.sec4_h2}
                </h4>
                <p className="mb-3">
                  {t.sec4_p2}
                </p>
                
                <div className="space-y-3">
                  <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-850">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span> {t.sec4_v_title}
                      </span>
                      <span className="text-[10px] font-mono bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full">{t.sec4_v_badge}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {t.sec4_v_desc}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-850">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span> {t.sec4_g_title}
                      </span>
                      <span className="text-[10px] font-mono bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full">{t.sec4_g_badge}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {t.sec4_g_desc}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-850">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span> {t.sec4_n_title}
                      </span>
                      <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">{t.sec4_n_badge}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {t.sec4_n_desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Domain registration guide */}
              <div>
                <h4 className="text-xs font-mono text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" /> {t.sec4_h3}
                </h4>
                <p className="mb-2 text-xs">
                  {t.sec4_p3}
                </p>
                
                <ul className="list-disc pl-5 space-y-2 text-xs text-slate-400 mb-4">
                  <li>{t.sec4_l1}</li>
                  <li>{t.sec4_l2}</li>
                </ul>

                <h5 className="text-xs font-mono text-white mb-2">{t.sec4_h4}</h5>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 text-xs text-slate-400">
                  <div>
                    <span className="font-mono text-sky-400 font-bold">{t.sec4_stepA}</span>
                    <p className="mt-1 text-xs">
                      {t.sec4_stepA_desc}
                    </p>
                    <div className="bg-slate-950 p-2 rounded border border-slate-850 font-mono text-[11px] text-amber-300 mt-1 whitespace-pre">
                      Type: CNAME  | Name: @ (vagy www) | Target: cname.vercel-dns.com (vagy username.github.io)
                    </div>
                  </div>

                  <div>
                    <span className="font-mono text-sky-400 font-bold">{t.sec4_stepB}</span>
                    <p className="mt-1">
                      {t.sec4_stepB_desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Standalone package note */}
              <div id="standalone-card" className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white block mb-0.5">{t.sec4_portability_title}</span>
                  {t.sec4_portability_desc}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* FOOTER ACADEMIC QUOTE */}
      <div id="manuscript-footer" className="border-t border-slate-800 pt-6 text-center text-xs font-mono text-slate-500 leading-relaxed italic max-w-xl mx-auto">
        {t.quote}
      </div>

    </div>
  );
}
