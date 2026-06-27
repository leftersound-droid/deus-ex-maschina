/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GrowingR4Model, parseCoord, Coord4D } from '../model/toyModel';

export interface SolitonAnalysisParams {
  centerKey: string;
  centerCoord: Coord4D;
  maxPotential: number;
  effectiveRadius: number;
  radialProfile: number[];
  fourierAmplitudes: number[];
  wavefrontGini: number;
  numClusters: number;
  neighborCorrelation: number;
  stepCount: number;
  totalPotential: number;
}

/**
 * Calculates Euclidean distance between two 4D coordinates.
 */
export function dist4D(c1: Coord4D, c2: Coord4D): number {
  const dx = c1[0] - c2[0];
  const dy = c1[1] - c2[1];
  const dz = c1[2] - c2[2];
  const dw = c1[3] - c2[3];
  return Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
}

/**
 * Computes the effective radius where the potential falls below a certain threshold.
 */
export function computeEffectiveRadius(
  V: Record<string, number>,
  centerKey: string,
  thresholdRatio = 0.01
): number {
  const centerPot = V[centerKey] || 0;
  if (centerPot <= 0) return 0;

  const threshold = centerPot * thresholdRatio;
  const centerCoord = parseCoord(centerKey);
  let maxDist = 0;

  for (const [key, val] of Object.entries(V)) {
    if (val >= threshold) {
      const coord = parseCoord(key);
      const d = dist4D(centerCoord, coord);
      if (d > maxDist) {
        maxDist = d;
      }
    }
  }

  return maxDist;
}

/**
 * Computes the average potential in radial bins centered on the given point.
 */
export function computeRadialProfile(
  V: Record<string, number>,
  centerKey: string,
  binWidth = 0.5,
  maxBins = 20
): number[] {
  const centerCoord = parseCoord(centerKey);
  const sums = new Array(maxBins).fill(0);
  const counts = new Array(maxBins).fill(0);

  for (const [key, val] of Object.entries(V)) {
    if (val <= 1e-9) continue;
    const coord = parseCoord(key);
    const d = dist4D(centerCoord, coord);
    const binIdx = Math.floor(d / binWidth);
    if (binIdx < maxBins) {
      sums[binIdx] += val;
      counts[binIdx] += 1;
    }
  }

  const profile = sums.map((sum, idx) => (counts[idx] > 0 ? sum / counts[idx] : 0));
  return profile;
}

/**
 * Computes Discrete Fourier Transform (DFT) amplitudes of a 1D sequence (such as a radial profile).
 */
export function computeLocalFourier(profile: number[]): number[] {
  const N = profile.length;
  if (N === 0) return [];

  const amplitudes: number[] = [];
  // Compute DFT up to Nyquist frequency (N/2)
  const limit = Math.floor(N / 2) + 1;

  for (let k = 0; k < limit; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      re += profile[n] * Math.cos(angle);
      im -= profile[n] * Math.sin(angle);
    }
    const amp = Math.sqrt(re * re + im * im) / N; // normalized amplitude
    amplitudes.push(amp);
  }

  return amplitudes;
}

/**
 * Main analysis function that extracts effective soliton parameters from a running 4D grid model.
 */
export function extractSolitonParameters(model: GrowingR4Model): SolitonAnalysisParams | null {
  const keys = Object.keys(model.V);
  if (keys.length === 0) return null;

  // Find center of the soliton (where the potential is maximum)
  let centerKey = '0,0,0,0';
  let maxPotential = -Infinity;

  for (const key of keys) {
    const val = model.V[key];
    if (val > maxPotential) {
      maxPotential = val;
      centerKey = key;
    }
  }

  if (maxPotential <= 0) {
    // Fallback if system is dead
    centerKey = '0,0,0,0';
    maxPotential = 0;
  }

  const centerCoord = parseCoord(centerKey);
  const effectiveRadius = computeEffectiveRadius(model.V, centerKey, 0.01);
  const radialProfile = computeRadialProfile(model.V, centerKey, 0.5, 16);
  const fourierAmplitudes = computeLocalFourier(radialProfile);

  // Extract statistical indicators from the model for comparison
  const stats = model.getStats(0.0);

  return {
    centerKey,
    centerCoord,
    maxPotential,
    effectiveRadius,
    radialProfile,
    fourierAmplitudes,
    wavefrontGini: stats.wavefront_gini,
    numClusters: stats.num_clusters,
    neighborCorrelation: stats.neighbor_corr,
    stepCount: model.stepCount,
    totalPotential: stats.sum,
  };
}
