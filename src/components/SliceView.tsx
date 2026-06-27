/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { parseCoord, makeKey, Coord4D, GrowingR4Model } from '../model/toyModel';
import { Grid3X3, Layers } from 'lucide-react';

interface SliceViewProps {
  model: GrowingR4Model;
  selectedCoord: string | null;
  onSelectCoord: (coordStr: string | null) => void;
}

export default function SliceView({ model, selectedCoord, onSelectCoord }: SliceViewProps) {
  const V = model.V;
  // Dimensions layout settings:
  // 0 -> x0, 1 -> x1, 2 -> x2, 3 -> x3
  const [xAxisDim, setXAxisDim] = useState<number>(0);
  const [yAxisDim, setYAxisDim] = useState<number>(1);

  // Sliced values for the other two dimensions
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

  // Determine the sliced dimensions
  const slicedDims = useMemo(() => {
    return [0, 1, 2, 3].filter((d) => d !== xAxisDim && d !== yAxisDim);
  }, [xAxisDim, yAxisDim]);

  const maxPotential = useMemo(() => {
    const vals = Object.values(V);
    if (vals.length === 0) return 1;
    return Math.max(...vals) || 1;
  }, [V]);

  // Color mapping matching Visualizer4D
  const getColorForPotential = (pot: number, maxPot: number) => {
    if (pot === 0) return 'rgba(51, 65, 85, 0.15)'; // slate-700 translucent
    const ratio = pot / maxPot;
    if (ratio < 0.2) {
      const t = ratio / 0.2;
      const r = Math.round(56 + t * (6 - 56));
      const g = Math.round(189 + t * (182 - 189));
      const b = Math.round(248 + t * (212 - 248));
      return `rgb(${r}, ${g}, ${b})`;
    } else if (ratio < 0.5) {
      const t = (ratio - 0.2) / 0.3;
      const r = Math.round(6 + t * (234 - 6));
      const g = Math.round(182 + t * (179 - 182));
      const b = Math.round(212 + t * (8 - 212));
      return `rgb(${r}, ${g}, ${b})`;
    } else if (ratio < 0.8) {
      const t = (ratio - 0.5) / 0.3;
      const r = Math.round(234 + t * (249 - 234));
      const g = Math.round(179 + t * (115 - 179));
      const b = Math.round(8 + t * (22 - 8));
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const t = (ratio - 0.8) / 0.2;
      const r = Math.round(249 + t * (255 - 249));
      const g = Math.round(115 + t * (255 - 115));
      const b = Math.round(22 + t * (255 - 22));
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Build grid of X-axis coordinates vs Y-axis coordinates for active slice
  const gridCells = useMemo(() => {
    const minX = bounds[xAxisDim].min;
    const maxX = bounds[xAxisDim].max;
    const minY = bounds[yAxisDim].min;
    const maxY = bounds[yAxisDim].max;

    const cells: {
      xVal: number;
      yVal: number;
      coord: Coord4D;
      key: string;
      potential: number | null; // null if site doesn't exist in the lattice
    }[] = [];

    // Slice coordinates values
    const s0 = xAxisDim === 0 ? 0 : yAxisDim === 0 ? 0 : sliceValues[0];
    const s1 = xAxisDim === 1 ? 0 : yAxisDim === 1 ? 0 : sliceValues[1];
    const s2 = xAxisDim === 2 ? 0 : yAxisDim === 2 ? 0 : sliceValues[2];
    const s3 = xAxisDim === 3 ? 0 : yAxisDim === 3 ? 0 : sliceValues[3];

    // Build grid cells (drawn from max Y to min Y for standard Cartesian display)
    for (let y = maxY; y >= minY; y--) {
      for (let x = minX; x <= maxX; x++) {
        // Construct full 4D coordinate
        const fullCoord: Coord4D = [0, 0, 0, 0];
        
        fullCoord[xAxisDim] = x;
        fullCoord[yAxisDim] = y;
        
        slicedDims.forEach((dim) => {
          fullCoord[dim] = sliceValues[dim];
        });

        const key = makeKey(fullCoord);
        const pot = V[key] !== undefined ? V[key] : null;

        cells.push({
          xVal: x,
          yVal: y,
          coord: fullCoord,
          key,
          potential: pot,
        });
      }
    }

    return {
      cells,
      colsCount: maxX - minX + 1,
      rowsCount: maxY - minY + 1,
      minX,
      maxX,
      minY,
      maxY,
    };
  }, [V, xAxisDim, yAxisDim, sliceValues, bounds, slicedDims]);

  const handleDimChange = (axis: 'X' | 'Y', dim: number) => {
    if (axis === 'X') {
      if (dim === yAxisDim) {
        // Swap axes if they are identical
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

  const getDimName = (dim: number) => {
    return `X${dim}`;
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-md font-semibold text-slate-100 flex items-center gap-2">
            <Grid3X3 className="h-4 w-4 text-sky-400" />
            2D Hőtérkép Szeletelő
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Vetítse ki a 4D rácsot egy tetszőleges 2D koordinátasíkra. A többi dimenziót rögzítheti.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Slice selection settings */}
        <div className="md:col-span-1 flex flex-col gap-4">
          {/* Axis Selector */}
          <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80">
            <h3 className="font-semibold text-slate-200 text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="h-3.5 w-3.5 text-sky-400" />
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
                          ? 'bg-sky-500/10 border-sky-500/40 text-sky-400 font-bold'
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
                          ? 'bg-sky-500/10 border-sky-500/40 text-sky-400 font-bold'
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
              <span>Szelet Pozíciók</span>
            </h3>
            
            <div className="flex flex-col gap-3 font-mono text-xs">
              {slicedDims.map((dim) => {
                const currentVal = sliceValues[dim];
                const min = bounds[dim].min;
                const max = bounds[dim].max;
                
                return (
                  <div key={dim} className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-slate-300 font-bold">X{dim} Szelet</span>
                      <span className="text-sky-400 font-bold">érték: {currentVal}</span>
                    </div>

                    <div className="flex items-center gap-2 justify-between">
                      <button
                        disabled={currentVal <= min}
                        onClick={() => adjustSliceVal(dim, -1)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800"
                      >
                        -
                      </button>
                      <span className="text-[10px] text-slate-500">
                        Tartomány: {min} .. {max}
                      </span>
                      <button
                        disabled={currentVal >= max}
                        onClick={() => adjustSliceVal(dim, 1)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="md:col-span-2 flex flex-col items-center justify-center bg-slate-950/80 rounded-xl border border-slate-800 p-4 relative min-h-[300px]">
          {/* Legend */}
          <div className="w-full flex items-center justify-between mb-4 px-2 text-[10px] font-mono text-slate-400">
            <span>Potenciál Skála:</span>
            <div className="flex items-center gap-1">
              <span>0.0</span>
              <div className="w-32 h-2.5 rounded bg-gradient-to-r from-slate-800 via-sky-400 via-amber-400 to-red-500 border border-slate-700" />
              <span>{maxPotential.toFixed(0)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 relative max-w-full overflow-auto p-1.5">
            {/* Y Axis Labels on Left */}
            <div className="flex flex-col justify-between font-mono text-[10px] text-slate-400 h-[280px] pr-1 pt-[14px] pb-[14px] select-none">
              {Array.from({ length: gridCells.rowsCount }).map((_, idx) => {
                const val = gridCells.maxY - idx;
                return (
                  <div key={idx} className="h-7 flex items-center justify-end leading-none">
                    {getDimName(yAxisDim)}={val}
                  </div>
                );
              })}
            </div>

            {/* Matrix */}
            <div className="flex flex-col gap-1">
              <div
                className="grid gap-1 bg-slate-900/40 p-1.5 rounded-lg border border-slate-800"
                style={{
                  gridTemplateColumns: `repeat(${gridCells.colsCount}, minmax(0, 1fr))`,
                  width: 'fit-content',
                }}
              >
                {gridCells.cells.map((cell) => {
                  const isExist = cell.potential !== null;
                  const isSelected = selectedCoord === cell.key;
                  const val = cell.potential || 0.0;
                  const isPerturbed = isExist && model.isPerturbed(cell.key);
                  
                  const bg = isExist ? getColorForPotential(val, maxPotential) : 'transparent';
                  const borderStyle = isExist 
                    ? isSelected 
                      ? 'border-sky-400 scale-105 z-10' 
                      : isPerturbed
                        ? 'border-amber-500 scale-100 ring-2 ring-amber-500/50'
                        : 'border-slate-800/40'
                    : 'border-slate-800/20 border-dashed hover:border-slate-700/60';

                  return (
                    <div
                      key={cell.key}
                      onClick={() => isExist && onSelectCoord(isSelected ? null : cell.key)}
                      className={`h-7 w-7 rounded flex items-center justify-center cursor-pointer border transition-all relative ${borderStyle}`}
                      style={{ backgroundColor: bg }}
                      title={`Koor: [${cell.coord.join(',')}]\nPotenciál: ${isExist ? val.toFixed(3) : 'Nem létezik rácspont'}${isPerturbed ? ' (Perturbált / Lezárt)' : ''}`}
                    >
                      {/* Dotted indicator for non-existent sites */}
                      {!isExist && (
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-850 group-hover:bg-slate-600" />
                      )}
                      {isExist && isPerturbed && (
                        <>
                          <div className="absolute inset-0 bg-amber-500/20 rounded-sm animate-pulse" />
                          <div className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-amber-400 border border-amber-950" />
                        </>
                      )}
                      {isExist && val > 0 && (
                        <span className="text-[7px] font-mono font-bold text-slate-950 truncate max-w-full px-0.5 pointer-events-none relative z-10">
                          {val >= 1000 ? `${(val/1000).toFixed(0)}k` : val.toFixed(0)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* X Axis Labels at Bottom */}
              <div
                className="grid gap-1 text-[10px] font-mono text-slate-400 select-none text-center pt-1"
                style={{
                  gridTemplateColumns: `repeat(${gridCells.colsCount}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: gridCells.colsCount }).map((_, idx) => {
                  const val = gridCells.minX + idx;
                  return (
                    <div key={idx} className="truncate">
                      {getDimName(xAxisDim)}={val}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
