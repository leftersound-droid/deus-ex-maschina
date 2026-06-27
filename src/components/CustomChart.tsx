/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { Language } from '../i18n';

interface ChartDataItem {
  [key: string]: number;
}

interface CustomChartProps {
  data: ChartDataItem[];
  xKey: string;
  yKey: string;
  color: string;
  title: string;
  yLabel?: string;
  valueFormatter?: (v: number) => string;
  lang?: Language;
}

export default function CustomChart({
  data,
  xKey,
  yKey,
  color,
  title,
  yLabel = '',
  valueFormatter = (v) => v.toFixed(2),
  lang = 'hu',
}: CustomChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const padding = { top: 20, right: 20, bottom: 35, left: 55 };

  // Calculate scales and coordinates
  const { points, areaPath, minX, maxX, minY, maxY, gridYValues } = useMemo(() => {
    if (data.length === 0) {
      return { points: [], areaPath: '', minX: 0, maxX: 0, minY: 0, maxY: 0, gridYValues: [] };
    }

    const xValues = data.map((d) => d[xKey]);
    const yValues = data.map((d) => d[yKey]);

    const minXVal = Math.min(...xValues);
    const maxXVal = Math.max(...xValues);
    const minYVal = Math.min(...yValues);
    const maxYVal = Math.max(...yValues);

    const rangeX = maxXVal - minXVal || 1;
    let rangeY = maxYVal - minYVal;
    
    // Add small buffer to Y axis to make it look nicer
    const yBuffer = rangeY * 0.1 || 1;
    const currentMinY = Math.max(0, minYVal - yBuffer * 0.5); // don't go below 0 for non-negatives
    const currentMaxY = maxYVal + yBuffer * 0.5;
    const currentRangeY = currentMaxY - currentMinY || 1;

    // Generate grid coordinates for Y axis
    const gridYVals: number[] = [];
    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      gridYVals.push(currentMinY + (currentRangeY * i) / gridSteps);
    }

    return {
      minX: minXVal,
      maxX: maxXVal,
      minY: currentMinY,
      maxY: currentMaxY,
      gridYValues: gridYVals,
      rangeX,
      rangeY: currentRangeY,
    };
  }, [data, xKey, yKey]);

  // Width and height of SVG viewport
  const viewWidth = 500;
  const viewHeight = 220;
  const plotWidth = viewWidth - padding.left - padding.right;
  const plotHeight = viewHeight - padding.top - padding.bottom;

  const pointsList = useMemo(() => {
    if (data.length === 0 || maxX === minX) return [];

    return data.map((d) => {
      const xRatio = (d[xKey] - minX) / (maxX - minX);
      const yRatio = maxY === minY ? 0.5 : (d[yKey] - minY) / (maxY - minY);

      return {
        x: padding.left + xRatio * plotWidth,
        y: padding.top + (1 - yRatio) * plotHeight,
        item: d,
      };
    });
  }, [data, minX, maxX, minY, maxY, plotWidth, plotHeight, xKey, yKey, padding.left, padding.top]);

  // SVG Line path string
  const linePath = useMemo(() => {
    if (pointsList.length === 0) return '';
    return pointsList.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [pointsList]);

  // SVG Area path string (for gradient fill under the line)
  const filledAreaPath = useMemo(() => {
    if (pointsList.length === 0) return '';
    const startY = padding.top + plotHeight;
    const startX = pointsList[0].x;
    const endX = pointsList[pointsList.length - 1].x;

    return `M ${startX} ${startY} ` + pointsList.map((p) => `L ${p.x} ${p.y}`).join(' ') + ` L ${endX} ${startY} Z`;
  }, [pointsList, plotHeight, padding.top]);

  // Handle mouse moves for tooltips
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current || pointsList.length === 0) return;

    const rect = svgRef.current.getBoundingClientRect();
    // Convert client coordinate to SVG local coordinate
    const clientX = e.clientX - rect.left;
    const localX = (clientX / rect.width) * viewWidth;

    // Find the closest point in along X axis
    let closestIndex = 0;
    let minDistance = Infinity;

    pointsList.forEach((p, idx) => {
      const distance = Math.abs(p.x - localX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    setHoverIndex(closestIndex);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activePoint = hoverIndex !== null ? pointsList[hoverIndex] : null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md transition-all hover:border-slate-700/80">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">{title}</h3>
        {activePoint && (
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-500">
              {lang === 'hu' ? 'Lépés' : lang === 'de' ? 'Schritt' : 'Step'} {activePoint.item[xKey]}:
            </span>
            <span className="font-bold" style={{ color }}>
              {valueFormatter(activePoint.item[yKey])}
            </span>
          </div>
        )}
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id={`areaGrad-${yKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Axis labels */}
          {gridYValues.map((val, idx) => {
            const yRatio = maxY === minY ? 0.5 : (val - minY) / (maxY - minY);
            const yPos = padding.top + (1 - yRatio) * plotHeight;

            return (
              <g key={idx} className="opacity-40">
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={padding.left + plotWidth}
                  y2={yPos}
                  stroke="#334155"
                  strokeWidth="0.75"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  className="fill-slate-400 font-mono text-[10px] tabular-nums"
                >
                  {valueFormatter(val)}
                </text>
              </g>
            );
          })}

          {/* X Axis ticks */}
          {data.length > 1 && (
            <g className="opacity-40">
              {/* Start tick */}
              <text
                x={padding.left}
                y={padding.top + plotHeight + 16}
                textAnchor="start"
                className="fill-slate-400 font-mono text-[10px] tabular-nums"
              >
                {minX}
              </text>
              {/* Middle tick */}
              <text
                x={padding.left + plotWidth / 2}
                y={padding.top + plotHeight + 16}
                textAnchor="middle"
                className="fill-slate-400 font-mono text-[10px] tabular-nums"
              >
                {Math.round((minX + maxX) / 2)}
              </text>
              {/* End tick */}
              <text
                x={padding.left + plotWidth}
                y={padding.top + plotHeight + 16}
                textAnchor="end"
                className="fill-slate-400 font-mono text-[10px] tabular-nums"
              >
                {maxX}
              </text>
            </g>
          )}

          {/* Render Area & Line Path */}
          {data.length > 0 && (
            <>
              {/* Gradient fill */}
              <path d={filledAreaPath} fill={`url(#areaGrad-${yKey})`} />

              {/* Line path */}
              <path d={linePath} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
            </>
          )}

          {/* Active tooltip vertical guide line */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={padding.top + plotHeight}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle cx={activePoint.x} cy={activePoint.y} r="5" fill="#0f172a" stroke={color} strokeWidth="2.5" />
            </g>
          )}
        </svg>

        {data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-slate-500">
            Nincs adat a grafikonhoz
          </div>
        )}
      </div>
    </div>
  );
}
