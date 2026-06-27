/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { parseCoord, makeKey, Coord4D, GrowingR4Model } from '../model/toyModel';
import { Activity, Layers, HelpCircle, Sparkles, Scale, Info } from 'lucide-react';

interface FourierAnalysisProps {
  model: GrowingR4Model;
}

export default function FourierAnalysis({ model }: FourierAnalysisProps) {
  const V = model.V;

  // Slicing dimensions state (identical to SliceView for perfect alignment)
  const [xAxisDim, setXAxisDim] = useState<number>(0);
  const [yAxisDim, setYAxisDim] = useState<number>(1);
  const [sliceValues, setSliceValues] = useState<Record<number, number>>({
    0: 1,
    1: 1,
    2: 1,
    3: 1,
  });

  // Calculate coordinates bounds dynamically
  const bounds = useMemo(() => {
    const keys = Object.keys(V);
    const result = {
      0: { min: 0, max: 3 },
      1: { min: 0, max: 3 },
      2: { min: 0, max: 3 },
      3: { min: 0, max: 3 },
    };

    if (keys.length === 0) return result;

    keys.forEach((key) => {
      const c = parseCoord(key);
      for (let d = 0; d < 4; d++) {
        if (c[d] < result[d].min) result[d].min = c[d];
        if (c[d] > result[d].max) result[d].max = c[d];
      }
    });

    return result;
  }, [V]);

  const slicedDims = useMemo(() => {
    return [0, 1, 2, 3].filter((d) => d !== xAxisDim && d !== yAxisDim);
  }, [xAxisDim, yAxisDim]);

  const handleDimChange = (axis: 'X' | 'Y', dim: number) => {
    if (axis === 'X') {
      if (dim === yAxisDim) {
        setYAxisDim(xAxisDim);
      }
      setXAxisDim(dim);
    } else {
      if (dim === xAxisDim) {
        setXAxisDim(yAxisDim);
      }
      setYAxisDim(dim);
    }
  };

  const adjustSliceVal = (dim: number, delta: number) => {
    setSliceValues((prev) => {
      const current = prev[dim];
      const min = bounds[dim].min;
      const max = bounds[dim].max;
      const newVal = Math.max(min, Math.min(max, current + delta));
      return { ...prev, [dim]: newVal };
    });
  };

  // Build dense 2D matrix of values for the selected slice
  const { matrix, minX, maxX, minY, maxY, colsCount, rowsCount } = useMemo(() => {
    const minXVal = bounds[xAxisDim].min;
    const maxXVal = bounds[xAxisDim].max;
    const minYVal = bounds[yAxisDim].min;
    const maxYVal = bounds[yAxisDim].max;

    const M = maxXVal - minXVal + 1;
    const N = maxYVal - minYVal + 1;

    // Initialize dense 2D array [row][col] -> [y][x]
    const arr: number[][] = Array.from({ length: N }, () => Array(M).fill(0.0));

    // Slice coordinates values
    const s0 = xAxisDim === 0 ? 0 : yAxisDim === 0 ? 0 : sliceValues[0];
    const s1 = xAxisDim === 1 ? 0 : yAxisDim === 1 ? 0 : sliceValues[1];
    const s2 = xAxisDim === 2 ? 0 : yAxisDim === 2 ? 0 : sliceValues[2];
    const s3 = xAxisDim === 3 ? 0 : yAxisDim === 3 ? 0 : sliceValues[3];

    for (let r = 0; r < N; r++) {
      const y = maxYVal - r; // cartesian representation (top-down in grid)
      for (let c = 0; c < M; c++) {
        const x = minXVal + c;

        const fullCoord: Coord4D = [0, 0, 0, 0];
        fullCoord[xAxisDim] = x;
        fullCoord[yAxisDim] = y;

        slicedDims.forEach((dim) => {
          fullCoord[dim] = sliceValues[dim];
        });

        const key = makeKey(fullCoord);
        arr[r][c] = V[key] !== undefined ? V[key] : 0.0;
      }
    }

    return {
      matrix: arr,
      minX: minXVal,
      maxX: maxXVal,
      minY: minYVal,
      maxY: maxYVal,
      colsCount: M,
      rowsCount: N,
    };
  }, [V, xAxisDim, yAxisDim, sliceValues, bounds, slicedDims]);

  // Compute 2D Discrete Fourier Transform (DFT)
  const dftResult = useMemo(() => {
    const M = colsCount; // Width (X-axis)
    const N = rowsCount; // Height (Y-axis)

    if (M <= 1 || N <= 1) {
      return {
        magnitude: [[0]],
        shiftedMagnitude: [[0]],
        maxMag: 1,
        radialSpectrum: [],
        spectralEntropy: 0,
        dominantWavelength: 0,
        flatness: 1,
      };
    }

    const F_real: number[][] = Array.from({ length: N }, () => Array(M).fill(0));
    const F_imag: number[][] = Array.from({ length: N }, () => Array(M).fill(0));
    const F_mag: number[][] = Array.from({ length: N }, () => Array(M).fill(0));

    let totalSum = 0;
    // Compute 2D DFT
    for (let v = 0; v < N; v++) {
      for (let u = 0; u < M; u++) {
        let re = 0;
        let im = 0;
        for (let y = 0; y < N; y++) {
          for (let x = 0; x < M; x++) {
            const val = matrix[y][x];
            if (val > 0) {
              // 2D DFT kernel formula
              const angle = -2 * Math.PI * ((u * x) / M + (v * y) / N);
              re += val * Math.cos(angle);
              im += val * Math.sin(angle);
            }
          }
        }
        F_real[v][u] = re;
        F_imag[v][u] = im;
        const m = Math.sqrt(re * re + im * im);
        F_mag[v][u] = m;
        totalSum += m;
      }
    }

    // FFT Shift: shift the zero-frequency (DC) component to the center of the spectrum
    const halfM = Math.floor(M / 2);
    const halfN = Math.floor(N / 2);

    const shiftedMagnitude: number[][] = Array.from({ length: N }, () => Array(M).fill(0));
    let maxMagNonDC = 0;
    let dominantFreqX = 0;
    let dominantFreqY = 0;

    for (let vs = 0; vs < N; vs++) {
      for (let us = 0; us < M; us++) {
        const u = (us + halfM) % M;
        const v = (vs + halfN) % N;
        const magVal = F_mag[v][u];
        shiftedMagnitude[vs][us] = magVal;

        // Find dominant non-DC mode (ignoring the central pixel in shifted coordinate)
        if (us !== halfM || vs !== halfN) {
          if (magVal > maxMagNonDC) {
            maxMagNonDC = magVal;
            dominantFreqX = us - halfM;
            dominantFreqY = vs - halfN;
          }
        }
      }
    }

    const maxMag = Math.max(...shiftedMagnitude.flat()) || 1;

    // Compute Spectral Entropy
    let entropySum = 0;
    let validSitesCount = 0;
    for (let vs = 0; vs < N; vs++) {
      for (let us = 0; us < M; us++) {
        const p = totalSum > 0 ? shiftedMagnitude[vs][us] / totalSum : 0;
        if (p > 1e-12) {
          entropySum -= p * Math.log2(p);
          validSitesCount++;
        }
      }
    }
    const maxEntropy = Math.log2(M * N) || 1;
    const spectralEntropy = entropySum / maxEntropy;

    // Spectral Flatness (Wiener entropy-based index)
    let logSum = 0;
    let geomSum = 0;
    for (let vs = 0; vs < N; vs++) {
      for (let us = 0; us < M; us++) {
        const val = shiftedMagnitude[vs][us];
        logSum += val;
        geomSum += Math.log(val + 1e-9);
      }
    }
    const arithmeticMean = logSum / (M * N);
    const geometricMean = Math.exp(geomSum / (M * N));
    const flatness = arithmeticMean > 0 ? geometricMean / arithmeticMean : 0;

    // Dominant physical spatial wavelength (in lattice grid units)
    const freqDist = Math.sqrt(dominantFreqX * dominantFreqX + dominantFreqY * dominantFreqY);
    const dominantWavelength = freqDist > 0 ? Math.min(M, N) / freqDist : Infinity;

    // Compute Radial Power Spectrum (Structure Factor / Radial Profiling)
    // Group cells by their distance to the center (shifted frequency coordinates)
    const binSize = 0.5;
    const maxDist = Math.sqrt(halfM * halfM + halfN * halfN) || 1;
    const numBins = Math.ceil(maxDist / binSize) + 1;

    const bins = Array.from({ length: numBins }, (_, idx) => ({
      k_min: idx * binSize,
      k_max: (idx + 1) * binSize,
      k_center: (idx + 0.5) * binSize,
      sum: 0,
      count: 0,
    }));

    for (let vs = 0; vs < N; vs++) {
      for (let us = 0; us < M; us++) {
        const dx = us - halfM;
        const dy = vs - halfN;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const binIdx = Math.floor(dist / binSize);
        if (binIdx >= 0 && binIdx < numBins) {
          bins[binIdx].sum += shiftedMagnitude[vs][us];
          bins[binIdx].count++;
        }
      }
    }

    const radialSpectrum = bins
      .filter((b) => b.count > 0)
      .map((b) => ({
        wavenumber: b.k_center,
        amplitude: b.sum / b.count,
        energy: b.sum,
      }));

    return {
      magnitude: F_mag,
      shiftedMagnitude,
      maxMag,
      radialSpectrum,
      spectralEntropy,
      dominantWavelength,
      flatness,
    };
  }, [matrix, colsCount, rowsCount]);

  // Color mapping matching DFT magnitude scale
  const getDFTColor = (val: number, maxVal: number) => {
    if (val === 0) return 'rgba(15, 23, 42, 0.4)';
    const ratio = Math.pow(val / maxVal, 0.4); // logarithmic expansion to see small frequencies
    if (ratio < 0.25) {
      const t = ratio / 0.25;
      const r = Math.round(15 + t * (99 - 15));
      const g = Math.round(23 + t * (102 - 23));
      const b = Math.round(42 + t * (241 - 42));
      return `rgb(${r}, ${g}, ${b})`;
    } else if (ratio < 0.6) {
      const t = (ratio - 0.25) / 0.35;
      const r = Math.round(99 + t * (236 - 99));
      const g = Math.round(102 + t * (72 - 102));
      const b = Math.round(241 + t * (153 - 241));
      return `rgb(${r}, ${g}, ${b})`;
    } else if (ratio < 0.85) {
      const t = (ratio - 0.6) / 0.25;
      const r = Math.round(236 + t * (244 - 236));
      const g = Math.round(72 + t * (63 - 72));
      const b = Math.round(153 + t * (94 - 153));
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const t = (ratio - 0.85) / 0.15;
      const r = Math.round(244 + t * (255 - 244));
      const g = Math.round(63 + t * (255 - 63));
      const b = Math.round(94 + t * (255 - 94));
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Render SVG Line Chart for the structure factor
  const renderRadialChart = () => {
    const data = dftResult.radialSpectrum;
    if (data.length === 0) return null;

    const width = 380;
    const height = 180;
    const padding = { top: 15, right: 15, bottom: 30, left: 45 };

    const maxWavenumber = Math.max(...data.map((d) => d.wavenumber)) || 1;
    const maxAmplitude = Math.max(...data.map((d) => d.amplitude)) || 1;

    const scaleX = (wn: number) => {
      return padding.left + (wn / maxWavenumber) * (width - padding.left - padding.right);
    };

    const scaleY = (amp: number) => {
      return height - padding.bottom - (amp / maxAmplitude) * (height - padding.top - padding.bottom);
    };

    // Draw line
    let linePath = '';
    data.forEach((d, idx) => {
      const x = scaleX(d.wavenumber);
      const y = scaleY(d.amplitude);
      if (idx === 0) {
        linePath = `M ${x} ${y}`;
      } else {
        linePath += ` L ${x} ${y}`;
      }
    });

    // Draw area
    const areaPath = linePath
      ? `${linePath} L ${scaleX(data[data.length - 1].wavenumber)} ${scaleY(0)} L ${scaleX(data[0].wavenumber)} ${scaleY(0)} Z`
      : '';

    return (
      <svg className="w-full h-[180px] bg-slate-950/40 rounded-xl border border-slate-800/80 p-2" viewBox={`0 0 ${width} ${height}`}>
        {/* Grids */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = scaleY(ratio * maxAmplitude);
          return (
            <line
              key={ratio}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#1e293b"
              strokeDasharray="2,2"
            />
          );
        })}

        {/* Axes */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#475569"
        />
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#475569"
        />

        {/* Area and Line */}
        {areaPath && <path d={areaPath} fill="url(#radialGrad)" opacity="0.15" />}
        {linePath && (
          <path d={linePath} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Dots */}
        {data.map((d, idx) => (
          <circle
            key={idx}
            cx={scaleX(d.wavenumber)}
            cy={scaleY(d.amplitude)}
            r="4"
            className="fill-rose-400 stroke-slate-950 stroke-2 hover:r-6 cursor-pointer transition-all"
            title={`Hullámszám k: ${d.wavenumber.toFixed(2)}, Amplitúdó: ${d.amplitude.toFixed(2)}`}
          />
        ))}

        {/* X Axis labels */}
        {[0, maxWavenumber * 0.25, maxWavenumber * 0.5, maxWavenumber * 0.75, maxWavenumber].map((wn, i) => (
          <text
            key={i}
            x={scaleX(wn)}
            y={height - 10}
            fill="#94a3b8"
            fontSize="9"
            textAnchor="middle"
            fontFamily="monospace"
          >
            k={wn.toFixed(1)}
          </text>
        ))}

        {/* Y Axis labels */}
        {[0, maxAmplitude * 0.5, maxAmplitude].map((amp, i) => (
          <text
            key={i}
            x={padding.left - 8}
            y={scaleY(amp) + 3}
            fill="#94a3b8"
            fontSize="9"
            textAnchor="end"
            fontFamily="monospace"
          >
            {amp >= 1000 ? `${(amp / 1000).toFixed(0)}k` : amp.toFixed(0)}
          </text>
        ))}

        {/* Label axes */}
        <text
          x={width / 2}
          y={height - 2}
          fill="#475569"
          fontSize="8"
          textAnchor="middle"
          fontWeight="bold"
        >
          Szerkezeti térbeli hullámszám (k)
        </text>

        {/* Gradient Definition */}
        <defs>
          <linearGradient id="radialGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  // Interpretation generator based on Fourier results
  const getFourierInterpretation = () => {
    const entropy = dftResult.spectralEntropy;
    const flatness = dftResult.flatness;
    const wavelength = dftResult.dominantWavelength;

    if (colsCount <= 1 || rowsCount <= 1) {
      return 'Nincs elegendő rácspont a Fourier-analízis elvégzéséhez. Indítsa el vagy növessze a szimulációt.';
    }

    let structuresDesc = '';
    let stabilityDesc = '';

    // Wavelength evaluation
    if (wavelength === Infinity || isNaN(wavelength)) {
      structuresDesc = 'Homogén, egyenletes energiaeloszlás. Nincsenek periodikus hullámok vagy kiemelkedő mintázatok a síkban.';
    } else if (wavelength > 6) {
      structuresDesc = `Nagy méretű, globális hullámvölgyek és dombok (hullámhossz: ~${wavelength.toFixed(1)} rácsegység). Ez a belső gömb belső magjának lassú, egyenletes terjedését tükrözi.`;
    } else if (wavelength > 2.5) {
      structuresDesc = `Közepes méretű, jól kivehető, zárt klasztereződések és domborzatok (hullámhossz: ~${wavelength.toFixed(1)} rácsegység). Ezek stabil, elszigetelt alakzatokat alkotnak a 3D hiperfelületen.`;
    } else {
      structuresDesc = `Nagyon finom, magas térbeli frekvenciájú fodrozódások és apró feszültséggócok (hullámhossz: ~${wavelength.toFixed(1)} rácsegység). Ez lokális interferenciára vagy erős kaotikus tágulásra utal.`;
    }

    // Entropy & Flatness evaluation (Organisation index)
    if (entropy < 0.35) {
      stabilityDesc = 'Rendkívül magasan szervezett, stabil és koherens formák jellemzik a teret. Az energia néhány domináns rezonáns frekvenciamódusban koncentrálódik, ami arra utal, hogy a perturbáció által keltett zárt formák tartósan rögzültek.';
    } else if (entropy < 0.6) {
      stabilityDesc = 'Közepesen strukturált tér. Jól kivehető a gömbszimmetrikus alapáramlás (alacsony frekvenciák), de emellett markánsan jelen vannak a perturbáció által keltett szigetelt csomópontok.';
    } else {
      stabilityDesc = 'Magas entrópiájú, szétterjedő vagy homogén állapot. Az energia egyenletesen eloszlik a térbeli frekvenciák között. Ez arra utal, hogy a rendszer belső magja már nagyrészt kiegyenlítődött és homogénné vált, vagy a csillapítás és az áramlás elmosta a korábbi éles határokat.';
    }

    return { structuresDesc, stabilityDesc };
  };

  const interpretation = getFourierInterpretation();

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-md font-semibold text-slate-100 flex items-center gap-2">
            <Activity className="h-4 w-4 text-rose-400" />
            Fourier Spektrum & Térbeli Frekvenciaanalízis
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Matematikai Fourier-transzformáció (DFT) a 4D tágulás 2D síkmetszetére vetítve. Vizsgálja meg a megmaradó zárt formák és hullámok spektrális ujjlenyomatát.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Slice Selection Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-4">
          {/* Axis Selector */}
          <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80">
            <h3 className="font-semibold text-slate-200 text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="h-3.5 w-3.5 text-rose-400" />
              Síkvetítési Tengelyek
            </h3>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-mono">X-Tengely (Vízszintes):</label>
                <div className="grid grid-cols-4 gap-1 font-mono">
                  {[0, 1, 2, 3].map((d) => (
                    <button
                      key={d}
                      onClick={() => handleDimChange('X', d)}
                      className={`py-1 px-2 text-center rounded border transition-colors ${
                        xAxisDim === d
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 font-bold'
                          : 'bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      X{d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono">Y-Tengely (Függőleges):</label>
                <div className="grid grid-cols-4 gap-1 font-mono">
                  {[0, 1, 2, 3].map((d) => (
                    <button
                      key={d}
                      onClick={() => handleDimChange('Y', d)}
                      className={`py-1 px-2 text-center rounded border transition-colors ${
                        yAxisDim === d
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 font-bold'
                          : 'bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      X{d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Slices Controls */}
          <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80">
            <h3 className="font-semibold text-slate-200 text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <span>Rögzített Dimenziók</span>
            </h3>

            <div className="flex flex-col gap-3 font-mono text-xs">
              {slicedDims.map((dim) => {
                const currentVal = sliceValues[dim];
                const min = bounds[dim].min;
                const max = bounds[dim].max;

                return (
                  <div key={dim} className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-slate-300 font-bold">X{dim} szelet</span>
                      <span className="text-rose-400 font-bold">érték: {currentVal}</span>
                    </div>

                    <div className="flex items-center gap-2 justify-between">
                      <button
                        disabled={currentVal <= min}
                        onClick={() => adjustSliceVal(dim, -1)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="text-[10px] text-slate-500">
                        Tartomány: {min} .. {max}
                      </span>
                      <button
                        disabled={currentVal >= max}
                        onClick={() => adjustSliceVal(dim, 1)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mathematical Quantifiers */}
          <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80 flex flex-col gap-3.5 text-xs">
            <h3 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Scale className="h-3.5 w-3.5 text-rose-400" />
              Spektrális Mutatók
            </h3>

            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                <span className="text-slate-400">Spektrális Entrópia:</span>
                <span className="font-mono font-bold text-rose-400">
                  {typeof dftResult.spectralEntropy === 'number' ? dftResult.spectralEntropy.toFixed(4) : '0.0000'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                <span className="text-slate-400">Domináns frekvenciak:</span>
                <span className="font-mono font-bold text-sky-400">
                  {dftResult.dominantWavelength === Infinity ? '0 (DC mód)' : `${dftResult.dominantWavelength.toFixed(2)} rács`}
                </span>
              </div>
              <div className="flex justify-between items-center pb-0.5">
                <span className="text-slate-400">Spektrális Laposság:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {typeof dftResult.flatness === 'number' ? dftResult.flatness.toFixed(4) : '0.0000'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fourier Visualizations Grid */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 2D DFT Shifted Heatmap */}
            <div className="flex flex-col bg-slate-950/80 rounded-xl border border-slate-800 p-4 min-h-[240px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  2D DFT Spektrum (|F(u, v)|)
                </span>
                <span className="text-[9px] font-mono text-slate-500">DC (középen)</span>
              </div>

              {colsCount <= 1 || rowsCount <= 1 ? (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                  Nem elegendő rácspont
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-2">
                  <div
                    className="grid gap-1 bg-slate-900/20 p-2 rounded-lg border border-slate-850"
                    style={{
                      gridTemplateColumns: `repeat(${colsCount}, minmax(0, 1fr))`,
                      width: 'fit-content',
                    }}
                  >
                    {dftResult.shiftedMagnitude.map((row, rIdx) =>
                      row.map((val, cIdx) => {
                        const halfM = Math.floor(colsCount / 2);
                        const halfN = Math.floor(rowsCount / 2);
                        const isDC = rIdx === halfN && cIdx === halfM;
                        const bg = getDFTColor(val, dftResult.maxMag);

                        // Frequency labels shifted
                        const freqU = cIdx - halfM;
                        const freqV = rIdx - halfN;

                        return (
                          <div
                            key={`${rIdx}-${cIdx}`}
                            className={`h-6 w-6 rounded flex items-center justify-center border text-[7px] font-mono transition-all relative ${
                              isDC ? 'border-amber-400 scale-105 z-10' : 'border-slate-800/40'
                            }`}
                            style={{ backgroundColor: bg }}
                            title={`Frekvencia-mód u: ${freqU}, v: ${freqV}\nAmplitúdó: ${val.toFixed(2)}${
                              isDC ? ' (Egyenáramú / Átlagos potenciál összetevő)' : ''
                            }`}
                          >
                            {isDC && <span className="text-slate-950 font-black text-[6px]">DC</span>}
                            {!isDC && val > dftResult.maxMag * 0.4 && (
                              <span className="text-slate-200 opacity-60 font-bold">●</span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Radial Power Spectrum Graph */}
            <div className="flex flex-col bg-slate-950/80 rounded-xl border border-slate-800 p-4 min-h-[240px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-rose-500" />
                  Szerkezeti Tényező S(k)
                </span>
                <span className="text-[9px] font-mono text-slate-500">Sugárirányú átlag</span>
              </div>

              <div className="flex-1 flex items-center justify-center">
                {renderRadialChart()}
              </div>
            </div>
          </div>

          {/* Detailed Interpretation */}
          <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Matematikai Visszafejtés & Spektrális Következtetések
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
              <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-800/40">
                <div className="font-bold text-rose-400 mb-1 flex items-center gap-1">
                  <span>●</span> 3D Hiperfelületi Hullámok & Klaszterek:
                </div>
                <p className="text-slate-300 text-[11px]">
                  {typeof interpretation === 'string' ? interpretation : interpretation.structuresDesc}
                </p>
              </div>

              <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-800/40">
                <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1">
                  <span>●</span> Rendszer-Stabilizáció és Szerveződés:
                </div>
                <p className="text-slate-300 text-[11px]">
                  {typeof interpretation === 'string' ? interpretation : interpretation.stabilityDesc}
                </p>
              </div>
            </div>

            <div className="mt-1 flex items-start gap-2 bg-indigo-500/5 p-2.5 rounded-lg border border-indigo-500/10 text-[11px] text-slate-400 leading-normal">
              <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Hogyan kell olvasni?</strong> A Fourier Spektrum a térbeli formákat frekvencia-összetevőkre bontja. Ha a spektrum elmosódott és sima (magas entrópia), a tér kiegyenlítődik és homogenizálódik (termikus egyensúly felé halad). Ha határozott, éles pontok láthatóak (alacsony entrópia), akkor a térben megmaradó, stabilan lüktető hullámfront-gátak, egyedi klaszterek és zárt formák konzerválódtak az aszimmetrikus indításból!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
