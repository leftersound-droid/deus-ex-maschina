/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Coord4D = [number, number, number, number];

export interface ModelStats {
  step: number;
  num_sites: number;
  sum: number;
  mean: number;
  var: number;
  max: number;
  min: number;
  gini: number;
  entropy: number;
  neighbor_corr: number;
  num_clusters: number;
  largest_cluster: number;
  max_abs_change: number;
  core_potential_pct: number;
  wavefront_potential_pct: number;
  core_sites_count: number;
  wavefront_sites_count: number;
  wavefront_gini: number;
  wavefront_shannon_entropy: number;
  wavefront_num_clusters: number;
  wavefront_largest_cluster: number;
}

export function parseCoord(key: string): Coord4D {
  const parts = key.split(',').map(Number);
  return [parts[0], parts[1], parts[2], parts[3]] as Coord4D;
}

export function makeKey(c: Coord4D): string {
  return `${c[0]},${c[1]},${c[2]},${c[3]}`;
}

export function neighbors4(coord: Coord4D): Coord4D[] {
  const [x0, x1, x2, x3] = coord;
  return [
    [x0 + 1, x1, x2, x3], [x0 - 1, x1, x2, x3],
    [x0, x1 + 1, x2, x3], [x0, x1 - 1, x2, x3],
    [x0, x1, x2 + 1, x3], [x0, x1 - 1, x2, x3],
    [x0, x1, x2, x3 + 1], [x0, x1, x2, x3 - 1],
  ];
}

export function getNeighborsStr(key: string): string[] {
  return neighbors4(parseCoord(key)).map(makeKey);
}

// Gini coefficient for non-negative values
export function computeGini(arr: number[]): number {
  if (arr.length === 0) return 0.0;
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;
  
  let allZero = true;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += sorted[i];
    if (sorted[i] !== 0) allZero = false;
  }
  if (allZero || sum === 0) return 0.0;

  let indexSum = 0;
  for (let i = 0; i < n; i++) {
    indexSum += (i + 1) * sorted[i];
  }
  return (2.0 * indexSum) / (n * sum) - (n + 1) / n;
}

// Shannon entropy
export function computeShannonEntropy(arr: number[]): number {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  if (sum <= 0) return 0.0;

  let entropy = 0;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (v > 0) {
      const p = v / sum;
      entropy -= p * Math.log(p);
    }
  }
  return entropy;
}

// Pearson correlation coefficient
export function computePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0.0;

  let sumX = 0, sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  if (denX === 0 || denY === 0) return 0.0;
  return num / Math.sqrt(denX * denY);
}

// Connected components using BFS
export function connectedComponents(coordsSet: Set<string>): string[][] {
  const visited = new Set<string>();
  const comps: string[][] = [];

  for (const v of coordsSet) {
    if (visited.has(v)) continue;

    const comp: string[] = [];
    const q: string[] = [v];
    visited.add(v);

    while (q.length > 0) {
      const u = q.shift()!;
      comp.push(u);

      const nbs = getNeighborsStr(u);
      for (const nb of nbs) {
        if (coordsSet.has(nb) && !visited.has(nb)) {
          visited.add(nb);
          q.push(nb);
        }
      }
    }
    comps.push(comp);
  }
  return comps;
}

// Deterministic hash function for coordinate-based perturbation
export function isKeyPerturbed(key: string, seed: number, ratio: number): boolean {
  const str = `${key}:${seed}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const randVal = Math.abs(hash) / 2147483647;
  return randVal < ratio;
}

// Growing R4 Grid Model State class (immutable-friendly or cloneable)
export class GrowingR4Model {
  V: Record<string, number> = {};
  stepCount = 0;
  initShape: [number, number, number, number];
  totalPotentialTarget: number;
  seed: number;
  startFromOrigin: boolean;
  perturbationActive: boolean;
  perturbationStartStep: number;
  perturbationDuration: number;
  perturbedSitesRatio: number;
  tensionCoupling: number;
  dampingRate: number;

  constructor(
    initShape: [number, number, number, number] = [4, 4, 4, 4],
    initTotalPotential = 1e6,
    seed = 42,
    startFromOrigin = true,
    perturbationActive = true,
    perturbationStartStep = 2,
    perturbationDuration = 10,
    perturbedSitesRatio = 0.25,
    tensionCoupling = 0.5,
    dampingRate = 0.0
  ) {
    this.initShape = initShape;
    this.totalPotentialTarget = initTotalPotential;
    this.seed = seed;
    this.startFromOrigin = startFromOrigin;
    this.perturbationActive = perturbationActive;
    this.perturbationStartStep = perturbationStartStep;
    this.perturbationDuration = perturbationDuration;
    this.perturbedSitesRatio = perturbedSitesRatio;
    this.tensionCoupling = tensionCoupling;
    this.dampingRate = dampingRate;
    this._initGrid(seed);
  }

  private _initGrid(seed: number) {
    this.V = {};
    if (this.startFromOrigin) {
      this.V["0,0,0,0"] = this.totalPotentialTarget;
    } else {
      const [sx, sy, sz, sw] = this.initShape;
      const coords: Coord4D[] = [];
      for (let i = 0; i < sx; i++) {
        for (let j = 0; j < sy; j++) {
          for (let k = 0; k < sz; k++) {
            for (let l = 0; l < sw; l++) {
              coords.push([i, j, k, l]);
            }
          }
        }
      }

      // Pseudo-random generator with seed
      let randState = seed || 42;
      const lcgRandom = () => {
        randState = (randState * 1664525 + 1013904223) % 4294967296;
        return randState / 4294967296;
      };

      const vals = coords.map(() => lcgRandom());
      const valSum = vals.reduce((acc, v) => acc + v, 0);
      
      coords.forEach((c, idx) => {
        const scaledVal = (vals[idx] / valSum) * this.totalPotentialTarget;
        const key = makeKey(c);
        this.V[key] = scaledVal;
      });
    }

    this.stepCount = 0;
  }

  isPerturbed(key: string): boolean {
    if (key === "0,0,0,0") return false; // Never perturb the origin
    if (!this.perturbationActive) return false;
    if (this.stepCount < this.perturbationStartStep) return false;
    if (this.stepCount >= this.perturbationStartStep + this.perturbationDuration) return false;
    return isKeyPerturbed(key, this.seed, this.perturbedSitesRatio);
  }

  ensureBoundaryNeighbors() {
    const keys = Object.keys(this.V);
    const added: string[] = [];
    for (let i = 0; i < keys.length; i++) {
      const nbs = getNeighborsStr(keys[i]);
      for (let j = 0; j < nbs.length; j++) {
        const nb = nbs[j];
        if (this.V[nb] === undefined) {
          this.V[nb] = 0.0;
          added.push(nb);
        }
      }
    }
    return added;
  }

  step(): { maxAbsChange: number; totalPotential: number } {
    // 1. Ensure all missing boundary neighbors exist (grow)
    this.ensureBoundaryNeighbors();

    // 2. Take old potential snapshot
    const oldV = { ...this.V };
    
    // Outflows and inflows
    const outflows: Record<string, number> = {};
    const inflows: Record<string, number> = {};

    const keys = Object.keys(oldV);

    // 3. Compute transfers based on oldV
    for (let idx = 0; idx < keys.length; idx++) {
      const i = keys[idx];
      const Vi = oldV[i];
      if (Vi <= 0) continue; // No flow out from 0 potential

      // If this site is currently perturbed, it cannot outflow any energy
      if (this.isPerturbed(i)) continue;

      const nbs = getNeighborsStr(i);
      
      // Receiving neighbors where Vi > Vj
      const recvs: string[] = [];
      for (let j = 0; j < nbs.length; j++) {
        const nb = nbs[j];
        // nb is guaranteed to be in oldV due to ensureBoundaryNeighbors
        // If the neighbor is currently perturbed, it cannot receive energy
        if (oldV[nb] !== undefined && Vi > oldV[nb] && !this.isPerturbed(nb)) {
          recvs.push(nb);
        }
      }

      const nRecv = recvs.length;
      if (nRecv === 0) continue;

      // Environment-dependent feedback flow modulation (Tension)
      let totalOutflow = 0;
      const deltas: Record<string, number> = {};
      
      for (let rIdx = 0; rIdx < nRecv; rIdx++) {
        const j = recvs[rIdx];
        
        // Calculate average of OTHER neighbors of i (excluding the target j)
        let otherSum = 0;
        let otherCount = 0;
        for (let k = 0; k < nbs.length; k++) {
          const nb = nbs[k];
          if (nb !== j && oldV[nb] !== undefined) {
            otherSum += oldV[nb];
            otherCount++;
          }
        }
        const V_other = otherCount > 0 ? otherSum / otherCount : 0.0;
        
        // Environmental tension multiplier using tanh
        let M_j = 1.0 + this.tensionCoupling * Math.tanh((V_other - Vi) / (Vi + 1.0));
        M_j = Math.max(0.01, M_j); // keep positive
        
        const delta = M_j * (Vi - oldV[j]) / nRecv;
        deltas[j] = delta;
        totalOutflow += delta;
      }

      // Stabilize flow: restrict total outflow to maximum 90% of current potential
      const maxAllowedOutflow = 0.9 * Vi;
      let scale = 1.0;
      if (totalOutflow > maxAllowedOutflow && totalOutflow > 0) {
        scale = maxAllowedOutflow / totalOutflow;
      }

      for (let rIdx = 0; rIdx < nRecv; rIdx++) {
        const j = recvs[rIdx];
        const finalDelta = deltas[j] * scale;
        outflows[i] = (outflows[i] || 0.0) + finalDelta;
        inflows[j] = (inflows[j] || 0.0) + finalDelta;
      }
    }

    // 4. Apply updates and find max absolute change
    let maxAbsChange = 0.0;
    const allKeys = Object.keys(this.V);
    for (let idx = 0; idx < allKeys.length; idx++) {
      const c = allKeys[idx];
      const outVal = outflows[c] || 0.0;
      const inVal = inflows[c] || 0.0;
      let newVal = this.V[c] - outVal + inVal;
      
      if (this.dampingRate > 0) {
        newVal *= (1.0 - this.dampingRate);
      }

      const diff = Math.abs(newVal - this.V[c]);
      if (diff > maxAbsChange) {
        maxAbsChange = diff;
      }
      this.V[c] = newVal;
    }

    this.stepCount += 1;

    let total = 0.0;
    const finalKeys = Object.keys(this.V);
    for (let idx = 0; idx < finalKeys.length; idx++) {
      total += this.V[finalKeys[idx]];
    }

    return { maxAbsChange, totalPotential: total };
  }

  getStats(maxAbsChange = 0.0): ModelStats {
    const vals = Object.values(this.V);
    const n = vals.length;
    
    let sum = 0.0;
    let max = -Infinity;
    let min = Infinity;
    for (let i = 0; i < n; i++) {
      const v = vals[i];
      sum += v;
      if (v > max) max = v;
      if (v < min) min = v;
    }

    const mean = n > 0 ? sum / n : 0.0;
    
    let sqDiffSum = 0.0;
    for (let i = 0; i < n; i++) {
      const diff = vals[i] - mean;
      sqDiffSum += diff * diff;
    }
    const variance = n > 0 ? sqDiffSum / n : 0.0;

    const gini = computeGini(vals);
    const entropy = computeShannonEntropy(vals);
    const neighborCorr = this.computeNeighborCorrelation();
    const cluster = this.getClusterInfo(mean + Math.sqrt(variance));

    // Wavefront vs Core classification
    const activeKeys = Object.keys(this.V).filter(k => this.V[k] > 1e-9);
    let wavefrontPotentialSum = 0;
    let corePotentialSum = 0;
    let wavefrontSitesCount = 0;
    let coreSitesCount = 0;

    const wavefrontVals: number[] = [];
    const coreVals: number[] = [];

    for (let idx = 0; idx < activeKeys.length; idx++) {
      const k = activeKeys[idx];
      const pot = this.V[k];
      const nbs = getNeighborsStr(k);
      
      let isWavefront = false;
      for (let j = 0; j < nbs.length; j++) {
        const nb = nbs[j];
        if (this.V[nb] === undefined || this.V[nb] <= 1e-9) {
          isWavefront = true;
          break;
        }
      }
      
      if (isWavefront) {
        wavefrontPotentialSum += pot;
        wavefrontSitesCount++;
        wavefrontVals.push(pot);
      } else {
        corePotentialSum += pot;
        coreSitesCount++;
        coreVals.push(pot);
      }
    }

    const totalActivePot = wavefrontPotentialSum + corePotentialSum;
    const core_potential_pct = totalActivePot > 0 ? (corePotentialSum / totalActivePot) * 100 : 0;
    const wavefront_potential_pct = totalActivePot > 0 ? (wavefrontPotentialSum / totalActivePot) * 100 : 0;

    const wavefront_gini = computeGini(wavefrontVals);
    const wavefront_shannon_entropy = computeShannonEntropy(wavefrontVals);

    // Wavefront clustering
    const wavefront_mean = wavefrontSitesCount > 0 ? wavefrontPotentialSum / wavefrontSitesCount : 0;
    let wavefrontSqDiffSum = 0;
    for (let i = 0; i < wavefrontVals.length; i++) {
      const diff = wavefrontVals[i] - wavefront_mean;
      wavefrontSqDiffSum += diff * diff;
    }
    const wavefrontVar = wavefrontSitesCount > 0 ? wavefrontSqDiffSum / wavefrontSitesCount : 0;
    const wavefrontThreshold = wavefront_mean + Math.sqrt(wavefrontVar);

    const highWavefrontCoords = new Set<string>();
    for (let idx = 0; idx < activeKeys.length; idx++) {
      const k = activeKeys[idx];
      const pot = this.V[k];
      let isWavefront = false;
      const nbs = getNeighborsStr(k);
      for (let j = 0; j < nbs.length; j++) {
        const nb = nbs[j];
        if (this.V[nb] === undefined || this.V[nb] <= 1e-9) {
          isWavefront = true;
          break;
        }
      }
      if (isWavefront && pot >= wavefrontThreshold) {
        highWavefrontCoords.add(k);
      }
    }

    const wfComps = connectedComponents(highWavefrontCoords);
    const wfSizes = wfComps.map(c => c.length).sort((a, b) => b - a);
    const wavefront_num_clusters = wfSizes.length;
    const wavefront_largest_cluster = wfSizes[0] || 0;

    return {
      step: this.stepCount,
      num_sites: n,
      sum,
      mean,
      var: variance,
      max: max === -Infinity ? 0 : max,
      min: min === Infinity ? 0 : min,
      gini,
      entropy,
      neighbor_corr: neighborCorr,
      num_clusters: cluster.num_clusters,
      largest_cluster: cluster.largest_cluster,
      max_abs_change: maxAbsChange,
      core_potential_pct,
      wavefront_potential_pct,
      core_sites_count: coreSitesCount,
      wavefront_sites_count: wavefrontSitesCount,
      wavefront_gini,
      wavefront_shannon_entropy,
      wavefront_num_clusters,
      wavefront_largest_cluster,
    };
  }

  private computeNeighborCorrelation(): number {
    const vals: number[] = [];
    const nbMeans: number[] = [];
    const entries = Object.entries(this.V);

    for (let idx = 0; idx < entries.length; idx++) {
      const [key, v] = entries[idx];
      const nbs = getNeighborsStr(key);
      let sum = 0.0;
      for (let j = 0; j < nbs.length; j++) {
        sum += this.V[nbs[j]] || 0.0;
      }
      vals.push(v);
      nbMeans.push(sum / nbs.length);
    }

    return computePearsonCorrelation(vals, nbMeans);
  }

  getClusterInfo(threshold: number) {
    const highCoords = new Set<string>();
    const entries = Object.entries(this.V);
    for (let idx = 0; idx < entries.length; idx++) {
      const [key, v] = entries[idx];
      if (v >= threshold) {
        highCoords.add(key);
      }
    }

    if (highCoords.size === 0) {
      return { threshold, num_clusters: 0, largest_cluster: 0, cluster_sizes: [] as number[] };
    }

    const comps = connectedComponents(highCoords);
    const sizes = comps.map(c => c.length).sort((a, b) => b - a);

    return {
      threshold,
      num_clusters: sizes.length,
      largest_cluster: sizes[0] || 0,
      cluster_sizes: sizes,
    };
  }

  // Clone function to trigger React state updates easily
  clone(): GrowingR4Model {
    const model = new GrowingR4Model(
      this.initShape,
      this.totalPotentialTarget,
      this.seed,
      this.startFromOrigin,
      this.perturbationActive,
      this.perturbationStartStep,
      this.perturbationDuration,
      this.perturbedSitesRatio,
      this.tensionCoupling,
      this.dampingRate
    );
    model.V = { ...this.V };
    model.stepCount = this.stepCount;
    return model;
  }
}
