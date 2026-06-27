/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { parseCoord, makeKey, neighbors4, Coord4D, GrowingR4Model } from '../model/toyModel';
import { RotateCw, Move, HelpCircle, ZoomIn, ZoomOut } from 'lucide-react';

interface Visualizer4DProps {
  model: GrowingR4Model;
  selectedCoord: string | null;
  onSelectCoord: (coordStr: string | null) => void;
}

export default function Visualizer4D({ model, selectedCoord, onSelectCoord }: Visualizer4DProps) {
  const V = model.V;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D rotation angles (orbit controls)
  const [pitch, setPitch] = useState<number>(-0.4); // rotation about X
  const [yaw, setYaw] = useState<number>(0.6);   // rotation about Y

  // 4D rotation angles (changed continuously if active)
  const [angles4D, setAngles4D] = useState({
    xy: 0.0,
    xz: 0.0,
    xw: 0.0,
    yz: 0.0,
    yw: 0.0,
    zw: 0.0,
  });

  // Auto-rotation speeds in 4D planes
  const [speeds4D, setSpeeds4D] = useState({
    xy: 0.0,
    xz: 0.0,
    xw: 0.005, // slow auto rotate in xw
    yz: 0.0,
    yw: 0.003, // slow auto rotate in yw
    zw: 0.0,
  });

  // Projection configurations
  const [cameraDist4D, setCameraDist4D] = useState<number>(7.0);
  const [cameraDist3D, setCameraDist3D] = useState<number>(5.0);
  const [zoom, setZoom] = useState<number>(110);
  const [isPerspective4D, setIsPerspective4D] = useState<boolean>(true);
  const [isPerspective3D, setIsPerspective3D] = useState<boolean>(true);
  const [drawEdges, setDrawEdges] = useState<boolean>(true);
  const [edgeThreshold, setEdgeThreshold] = useState<number>(0.0); // Only draw edges above this potential
  const [maxEdgesToDraw, setMaxEdgesToDraw] = useState<number>(1500);

  // Mouse interaction state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [hoveredCoord, setHoveredCoord] = useState<string | null>(null);

  // 4D Rotation Tick
  useEffect(() => {
    let animationFrameId: number;
    const tick = () => {
      setAngles4D((prev) => ({
        xy: (prev.xy + speeds4D.xy) % (Math.PI * 2),
        xz: (prev.xz + speeds4D.xz) % (Math.PI * 2),
        xw: (prev.xw + speeds4D.xw) % (Math.PI * 2),
        yz: (prev.yz + speeds4D.yz) % (Math.PI * 2),
        yw: (prev.yw + speeds4D.yw) % (Math.PI * 2),
        zw: (prev.zw + speeds4D.zw) % (Math.PI * 2),
      }));
      animationFrameId = requestAnimationFrame(tick);
    };
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [speeds4D]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (isDragging) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setYaw((prev) => prev + dx * 0.007);
      setPitch((prev) => Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev + dy * 0.007)));
      dragStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Rotation & projection math
  const projectedData = useMemo(() => {
    const keys = Object.keys(V);
    if (keys.length === 0) return [];

    // 1. Calculate center of mass to rotate around the geometric center
    let sumX0 = 0, sumX1 = 0, sumX2 = 0, sumX3 = 0;
    const coords: [string, Coord4D][] = keys.map((key) => {
      const c = parseCoord(key);
      sumX0 += c[0];
      sumX1 += c[1];
      sumX2 += c[2];
      sumX3 += c[3];
      return [key, c];
    });

    const num = keys.length;
    const c0 = sumX0 / num;
    const c1 = sumX1 / num;
    const c2 = sumX2 / num;
    const c3 = sumX3 / num;

    // 2. Rotate and project each point
    const pts = coords.map(([key, coord]) => {
      // Center the coordinate
      let x = coord[0] - c0;
      let y = coord[1] - c1;
      let z = coord[2] - c2;
      let w = coord[3] - c3;

      // Rotate 4D
      // XY Plane
      if (angles4D.xy !== 0) {
        const cos = Math.cos(angles4D.xy);
        const sin = Math.sin(angles4D.xy);
        const rx = x * cos - y * sin;
        const ry = x * sin + y * cos;
        x = rx; y = ry;
      }
      // XZ Plane
      if (angles4D.xz !== 0) {
        const cos = Math.cos(angles4D.xz);
        const sin = Math.sin(angles4D.xz);
        const rx = x * cos - z * sin;
        const rz = x * sin + z * cos;
        x = rx; z = rz;
      }
      // XW Plane
      if (angles4D.xw !== 0) {
        const cos = Math.cos(angles4D.xw);
        const sin = Math.sin(angles4D.xw);
        const rx = x * cos - w * sin;
        const rw = x * sin + w * cos;
        x = rx; w = rw;
      }
      // YZ Plane
      if (angles4D.yz !== 0) {
        const cos = Math.cos(angles4D.yz);
        const sin = Math.sin(angles4D.yz);
        const ry = y * cos - z * sin;
        const rz = y * sin + z * cos;
        y = ry; z = rz;
      }
      // YW Plane
      if (angles4D.yw !== 0) {
        const cos = Math.cos(angles4D.yw);
        const sin = Math.sin(angles4D.yw);
        const ry = y * cos - w * sin;
        const rw = y * sin + w * cos;
        y = ry; w = rw;
      }
      // ZW Plane
      if (angles4D.zw !== 0) {
        const cos = Math.cos(angles4D.zw);
        const sin = Math.sin(angles4D.zw);
        const rz = z * cos - w * sin;
        const rw = z * sin + w * cos;
        z = rz; w = rw;
      }

      // 4D perspective / orthographic projection to 3D
      let x3d = x;
      let y3d = y;
      let z3d = z;
      if (isPerspective4D) {
        const factor = cameraDist4D - w;
        const f = factor > 0.1 ? 1 / factor : 10;
        x3d = x * f * 4.5;
        y3d = y * f * 4.5;
        z3d = z * f * 4.5;
      }

      // 3D rotation (yaw/pitch)
      // Yaw (around Y axis)
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const xRot = x3d * cosY - z3d * sinY;
      const zRot1 = x3d * sinY + z3d * cosY;

      // Pitch (around X axis)
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const yRot = y3d * cosP - zRot1 * sinP;
      const zRot = y3d * sinP + zRot1 * cosP; // Depth

      return {
        key,
        origCoord: coord,
        rotated4D: [x, y, z, w] as Coord4D,
        x3d: xRot,
        y3d: yRot,
        z3d: zRot, // acts as depth
        potential: V[key],
      };
    });

    return pts;
  }, [V, yaw, pitch, angles4D, isPerspective4D, cameraDist4D]);

  // Max Potential for color mapping
  const maxPotential = useMemo(() => {
    const vals = Object.values(V);
    if (vals.length === 0) return 1;
    return Math.max(...vals) || 1;
  }, [V]);

  // Color mapper helper
  const getColorForPotential = (pot: number, maxPot: number, alpha = 1) => {
    if (pot === 0) return `rgba(51, 65, 85, ${alpha * 0.4})`; // slate-700
    const ratio = pot / maxPot;
    if (ratio < 0.2) {
      // Indigo to Cyan
      const t = ratio / 0.2;
      const r = Math.round(56 + t * (6 - 56));
      const g = Math.round(189 + t * (182 - 189));
      const b = Math.round(248 + t * (212 - 248));
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else if (ratio < 0.5) {
      // Cyan to Green/Yellow
      const t = (ratio - 0.2) / 0.3;
      const r = Math.round(6 + t * (234 - 6));
      const g = Math.round(182 + t * (179 - 182));
      const b = Math.round(212 + t * (8 - 212));
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else if (ratio < 0.8) {
      // Yellow to Orange
      const t = (ratio - 0.5) / 0.3;
      const r = Math.round(234 + t * (249 - 234));
      const g = Math.round(179 + t * (115 - 179));
      const b = Math.round(8 + t * (22 - 8));
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else {
      // Orange to White-hot
      const t = (ratio - 0.8) / 0.2;
      const r = Math.round(249 + t * (255 - 249));
      const g = Math.round(115 + t * (255 - 115));
      const b = Math.round(22 + t * (255 - 22));
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  };

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || projectedData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear Canvas with sleek cosmic background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Draw grid ring for reference space
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, zoom * 1.5, 0, Math.PI * 2);
    ctx.stroke();

    // 1. Calculate screen coordinates of points
    const screenPoints = projectedData.map((pt) => {
      let scale = zoom;
      if (isPerspective3D) {
        const d = cameraDist3D - pt.z3d;
        scale = d > 0.1 ? (zoom * cameraDist3D) / d : zoom * 10;
      }

      const scrX = centerX + pt.x3d * scale;
      const scrY = centerY + pt.y3d * scale;

      return {
        ...pt,
        scrX,
        scrY,
        scale,
      };
    });

    // Index coordinates for quick edge lookups
    const screenPointMap = new Map<string, typeof screenPoints[0]>();
    screenPoints.forEach((p) => screenPointMap.set(p.key, p));

    // 2. Render Edges (draw first, so they lie behind nodes)
    if (drawEdges) {
      ctx.lineWidth = 0.8;
      let drawnEdgeCount = 0;

      for (let i = 0; i < screenPoints.length; i++) {
        const p1 = screenPoints[i];
        if (p1.potential < edgeThreshold) continue;
        if (drawnEdgeCount > maxEdgesToDraw) break;

        const nbs = neighbors4(p1.origCoord);
        for (let j = 0; j < nbs.length; j++) {
          const nbKey = makeKey(nbs[j]);
          // To draw each edge once, only draw if lexicographically smaller
          if (p1.key < nbKey) {
            const p2 = screenPointMap.get(nbKey);
            if (p2 && p2.potential >= edgeThreshold) {
              // Fade edge color based on depth
              const avgZ = (p1.z3d + p2.z3d) / 2;
              const opacity = Math.max(0.04, Math.min(0.35, 0.2 + avgZ * 0.1));

              // Active transfers can glow brighter
              const isTransfersActive = p1.potential !== p2.potential;
              const strokeColor = isTransfersActive
                ? `rgba(94, 234, 212, ${opacity * 1.3})` // bright teal
                : `rgba(71, 85, 105, ${opacity})`;

              ctx.strokeStyle = strokeColor;
              ctx.lineWidth = isTransfersActive ? 1.1 : 0.6;
              ctx.beginPath();
              ctx.moveTo(p1.scrX, p1.scrY);
              ctx.lineTo(p2.scrX, p2.scrY);
              ctx.stroke();
              drawnEdgeCount++;
            }
          }
        }
      }
    }

    // Sort by depth (painters algorithm) so back elements are drawn first
    const sortedPoints = [...screenPoints].sort((a, b) => a.z3d - b.z3d);

    // 3. Find closest hovered node under mouse
    let currentHover: string | null = null;
    let minHoverDist = 14; // hover range in pixels

    for (let i = 0; i < screenPoints.length; i++) {
      const p = screenPoints[i];
      const dx = p.scrX - mousePos.x;
      const dy = p.scrY - mousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minHoverDist) {
        minHoverDist = dist;
        currentHover = p.key;
      }
    }

    setHoveredCoord(currentHover);

    // Get active set for neighbor highlighting
    let highlightNeighbors = new Set<string>();
    if (selectedCoord) {
      neighbors4(parseCoord(selectedCoord)).forEach(n => highlightNeighbors.add(makeKey(n)));
    } else if (currentHover) {
      neighbors4(parseCoord(currentHover)).forEach(n => highlightNeighbors.add(makeKey(n)));
    }

    // 4. Draw Nodes
    for (let i = 0; i < sortedPoints.length; i++) {
      const p = sortedPoints[i];
      const isSelected = p.key === selectedCoord;
      const isHovered = p.key === currentHover;
      const isNeighborHighlight = highlightNeighbors.has(p.key);
      const isPerturbedNode = model.isPerturbed(p.key);

      // Node size calculation based on potential & 3D camera depth scale
      const sizeRatio = Math.log(1 + p.potential) / 3 || 0;
      let baseRadius = 2.5 + sizeRatio * 4;
      
      // Depth scaling
      baseRadius = Math.max(0.8, baseRadius * (p.scale / zoom));

      ctx.beginPath();
      ctx.arc(p.scrX, p.scrY, baseRadius, 0, Math.PI * 2);

      // Glow effect for high potentials or perturbed nodes
      if (p.potential > maxPotential * 0.1 || isPerturbedNode) {
        ctx.shadowColor = isPerturbedNode ? '#f59e0b' : getColorForPotential(p.potential, maxPotential, 0.8);
        ctx.shadowBlur = isPerturbedNode ? 12 : Math.min(15, baseRadius * 1.5);
      } else {
        ctx.shadowBlur = 0;
      }

      // Fill node color
      let nodeColor = getColorForPotential(p.potential, maxPotential);
      if (isSelected) {
        nodeColor = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 20;
      } else if (isHovered) {
        nodeColor = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
      } else if (isNeighborHighlight) {
        nodeColor = '#2dd4bf'; // bright green-teal for neighbors
        ctx.shadowBlur = 8;
      } else if (isPerturbedNode) {
        nodeColor = '#f59e0b'; // amber color for perturbed/locked nodes
      }

      ctx.fillStyle = nodeColor;
      ctx.fill();

      // Draw stroke ring around hovered / selected / neighbor / perturbed
      if (isSelected || isHovered || isNeighborHighlight || isPerturbedNode) {
        if (isSelected) {
          ctx.strokeStyle = '#38bdf8';
          ctx.setLineDash([]);
          ctx.lineWidth = 1.5;
        } else if (isHovered) {
          ctx.strokeStyle = '#38bdf8';
          ctx.setLineDash([]);
          ctx.lineWidth = 1.5;
        } else if (isNeighborHighlight) {
          ctx.strokeStyle = '#2dd4bf';
          ctx.setLineDash([]);
          ctx.lineWidth = 1.5;
        } else if (isPerturbedNode) {
          ctx.strokeStyle = '#f59e0b';
          ctx.setLineDash([2, 2]); // dashed ring for perturbed
          ctx.lineWidth = 1.2;
        }

        ctx.beginPath();
        ctx.arc(p.scrX, p.scrY, baseRadius + 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
      }

      // Reset shadows for lines
      ctx.shadowBlur = 0;
    }

    // 5. Draw simple overlay showing hovered node info on the canvas
    if (currentHover) {
      const hp = screenPointMap.get(currentHover);
      if (hp) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        
        const isPerturbed = model.isPerturbed(hp.key);
        const boxW = 190;
        const boxH = isPerturbed ? 82 : 68;
        let boxX = hp.scrX + 12;
        let boxY = hp.scrY - 34;

        // Keep inside canvas bounds
        if (boxX + boxW > width) boxX = hp.scrX - boxW - 12;
        if (boxY + boxH > height) boxY = height - boxH - 10;
        if (boxY < 0) boxY = 10;

        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(`Koor: [${hp.origCoord.join(', ')}]`, boxX + 10, boxY + 18);
        
        ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Potenciál: `, boxX + 10, boxY + 34);
        ctx.fillStyle = isPerturbed ? '#f59e0b' : getColorForPotential(hp.potential, maxPotential);
        ctx.font = 'bold 10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
        ctx.fillText(`${hp.potential.toFixed(3)}`, boxX + 66, boxY + 34);

        if (isPerturbed) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 9px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
          ctx.fillText(`PERTURBÁLT (Blokkolva)`, boxX + 10, boxY + 50);

          ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(`Kattintson a részletekért`, boxX + 10, boxY + 68);
        } else {
          ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(`Kattintson a részletekért`, boxX + 10, boxY + 54);
        }
      }
    }
  }, [projectedData, maxPotential, zoom, cameraDist3D, isPerspective3D, drawEdges, edgeThreshold, maxEdgesToDraw, selectedCoord, mousePos, isDragging]);

  const toggleSpeed4D = (plane: keyof typeof speeds4D) => {
    setSpeeds4D((prev) => ({
      ...prev,
      [plane]: prev[plane] === 0 ? 0.005 : 0,
    }));
  };

  const handleCanvasClick = () => {
    if (hoveredCoord) {
      onSelectCoord(hoveredCoord);
    } else {
      onSelectCoord(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-md font-semibold text-slate-100 flex items-center gap-2">
            <RotateCw className="h-4 w-4 text-sky-400 animate-spin-slow" />
            4D Hiperspagia Vetítés (R⁴)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Forgassa az egeret vonszolva. Forgási síkok és 4D vetítési konfiguráció.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(40, z - 15))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Kicsinyítés"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs font-mono text-slate-400 w-12 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(250, z + 15))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Nagyítás"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Canvas Area */}
        <div className="lg:col-span-3 relative flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
          <canvas
            ref={canvasRef}
            width={600}
            height={440}
            className="w-full max-w-[600px] h-[440px] cursor-grab active:cursor-grabbing block"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
          />
          {projectedData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-sm font-mono text-slate-500">
              Szimuláció betöltése...
            </div>
          )}

          {/* Guide Overlay */}
          <div className="absolute bottom-3 left-3 flex gap-2 pointer-events-none opacity-80">
            <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
              <Move className="h-3 w-3" /> Drag / Forgatás
            </span>
          </div>
        </div>

        {/* 4D Controls Panel */}
        <div className="flex flex-col gap-4 text-xs">
          {/* 4D Rotation States */}
          <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/80">
            <h3 className="font-semibold text-slate-200 mb-2.5 flex items-center justify-between">
              <span>4D Forgatás Síkok</span>
              <HelpCircle className="h-3.5 w-3.5 text-slate-500 hover:text-slate-400 cursor-pointer" title="4D-ben 6 fő síkon tudunk forgatni a gömböket." />
            </h3>
            
            <div className="flex flex-col gap-2 font-mono">
              {Object.keys(speeds4D).map((plane) => {
                const key = plane as keyof typeof speeds4D;
                const isRotating = speeds4D[key] > 0;
                return (
                  <button
                    key={plane}
                    onClick={() => toggleSpeed4D(key)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-all ${
                      isRotating
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 font-semibold shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>Síkszeg: {plane.toUpperCase()}</span>
                    <span>{isRotating ? 'FOROG' : 'ÁLL'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Perspective & Edges */}
          <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/80 flex flex-col gap-3">
            <h3 className="font-semibold text-slate-200">Kameramódok</h3>
            
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={isPerspective4D}
                onChange={(e) => setIsPerspective4D(e.target.checked)}
                className="rounded border-slate-800 text-sky-500 focus:ring-sky-500/50 bg-slate-900"
              />
              <span>4D Perspektíva</span>
            </label>

            {isPerspective4D && (
              <div className="pl-5 flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>4D Távolság (W)</span>
                  <span className="font-mono text-sky-400">{cameraDist4D.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="4.5"
                  max="12.0"
                  step="0.5"
                  value={cameraDist4D}
                  onChange={(e) => setCameraDist4D(parseFloat(e.target.value))}
                  className="w-full accent-sky-400 h-1 rounded-lg bg-slate-800"
                />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 mt-1">
              <input
                type="checkbox"
                checked={isPerspective3D}
                onChange={(e) => setIsPerspective3D(e.target.checked)}
                className="rounded border-slate-800 text-sky-500 focus:ring-sky-500/50 bg-slate-900"
              />
              <span>3D Perspektíva</span>
            </label>

            <hr className="border-slate-800/80 my-1" />

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={drawEdges}
                onChange={(e) => setDrawEdges(e.target.checked)}
                className="rounded border-slate-800 text-sky-500 focus:ring-sky-500/50 bg-slate-900"
              />
              <span>Összekötő élek</span>
            </label>

            {drawEdges && (
              <div className="pl-5 flex flex-col gap-2.5">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Élpotenciál Küszöb</span>
                    <span className="font-mono text-sky-400">{edgeThreshold.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="100.0"
                    step="5.0"
                    value={edgeThreshold}
                    onChange={(e) => setEdgeThreshold(parseFloat(e.target.value))}
                    className="w-full accent-sky-400 h-1 rounded-lg bg-slate-800"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
