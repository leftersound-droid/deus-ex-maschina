# Deus Ex Machina

**Kozmológiai táguló R⁴ rács-potenciál szimulátor és emergens R³ téridő**

Egy interaktív toy modell, amely bemutatja, hogyan alakulhat ki egyszerű lokális szabályokból egy **emergens 3D hiperfelület** (wavefront), valamint azon klaszterek és szoliton-szerű struktúrák.

**Live demo:** [https://www.deusexsmachina.com/](https://www.deusexsmachina.com/)

---

## Mi ez?

A szimuláció egy **növekvő 4D rácson** (R⁴) fut, ahol egy skalár potenciál lokális gradiens-áramlással terjed. A rács dinamikusan bővül a határokon. Perturbációk (ideiglenesen blokkolt pontok) hatására a táguló 3D hiperfelületen gazdag dinamika figyelhető meg.

### Főbb jellemzők
- Dinamikus 4D rácsnövekedés
- Konzervatív energia (összpotenciál megmarad)
- Wavefront vs Core detektálás
- Perturbációval indukált klaszterizáció és lokalizált struktúrák
- 4D vetítés, 2D szeletelő, Fourier-analízis, Hypersurface Lab
- Idősor grafikonok és részletes statisztikák

---

## Hogyan fussam helyben?

### Előfeltételek
- Node.js (18+ verzió ajánlott)

### Lépések
```bash
git clone https://github.com/[felhasználóneved]/deus-ex-maschina.git
cd deus-ex-maschina
npm install
