/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Coord4D } from './toyModel';

export interface SolitonObstacle {
  id: string;
  position: Coord4D;
  potential: number; // positive = potential barrier, negative = potential well
  radius: number;
  type: 'well' | 'barrier' | 'defect' | 'emitter';
}

export class EffectiveSoliton {
  id: string;
  position: Coord4D;
  velocity: Coord4D;
  baseRadius: number;
  radius: number;
  maxPotential: number;
  energyProfile: number[];
  fourierAmplitudes: number[];
  topologicalCharge: number; // Winding number (+1, -1, or 0)
  phase = 0;
  mass = 1.0;
  baseMass = 1.0;
  
  // Historical trajectory tracking
  history: Coord4D[] = [];
  maxHistoryLength = 200;

  constructor(
    id: string,
    position: Coord4D,
    velocity: Coord4D = [0, 0, 0, 0],
    radius = 2.5,
    maxPotential = 1e6,
    energyProfile: number[] = [1.0, 0.8, 0.5, 0.3, 0.1, 0.05, 0.01],
    fourierAmplitudes: number[] = [0.1, 0.05, 0.02],
    topologicalCharge = 1
  ) {
    this.id = id;
    this.position = [...position] as Coord4D;
    this.velocity = [...velocity] as Coord4D;
    this.baseRadius = radius;
    this.radius = radius;
    this.maxPotential = maxPotential;
    this.energyProfile = [...energyProfile];
    this.fourierAmplitudes = [...fourierAmplitudes];
    this.topologicalCharge = topologicalCharge;
    this.baseMass = 1.0 + 0.5 * Math.abs(topologicalCharge);
    this.mass = this.baseMass;
  }

  /**
   * Resets the trajectory history.
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Computes the soliton's potential field value at a given 4D point.
   * Utilizes a smooth soliton-like envelope: V(r) = maxPotential * sech^2(beta * r).
   */
  getPotentialAt(point: Coord4D): number {
    const dx = point[0] - this.position[0];
    const dy = point[1] - this.position[1];
    const dz = point[2] - this.position[2];
    const dw = point[3] - this.position[3];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);

    // Beta determines the width/steepness
    const beta = 1.5 / this.radius;
    const u = beta * dist;
    if (u > 10) return 0; // out of range

    const coshU = Math.cosh(u);
    const sechSq = 1.0 / (coshU * coshU);

    // Modulate with internal phase oscillations (wavefront ripples)
    let ripple = 1.0;
    if (this.fourierAmplitudes.length > 0) {
      let phaseSum = 0;
      for (let i = 0; i < this.fourierAmplitudes.length; i++) {
        phaseSum += this.fourierAmplitudes[i] * Math.sin((i + 1) * this.phase - dist * 1.2);
      }
      ripple = 1.0 + 0.15 * phaseSum;
    }

    return this.maxPotential * sechSq * ripple;
  }

  /**
   * Performs one simulation step.
   * Calculates forces (gradient flow), updates 4D trajectory, and evolves internal wave phase.
   */
  step(
    obstacles: SolitonObstacle[],
    otherSolitons: EffectiveSoliton[],
    dt: number,
    tensionCoupling: number,
    damping: number,
    gravityScale = 1.0
  ) {
    // 1. Advance internal phase (wave dynamics)
    this.phase += 0.08;
    
    // 2. Mach's Principle: mass fluctuates with hyperspace position (w-coordinate) and topological charge
    // w is index 3 of position
    const w = this.position[3];
    this.mass = this.baseMass * (1.0 + 0.35 * Math.sin(4.0 * w) * Math.cos(this.phase * 0.5));
    if (this.mass < 0.1) this.mass = 0.1; // lower physical bound

    // 3. Initialize forces in ℝ⁴
    const forces: Coord4D = [0, 0, 0, 0];

    // 4. Force from Cosmic Tension / Hyperspace confinement:
    // Restores the soliton back towards the 3D membrane (w = 0)
    forces[3] += -tensionCoupling * w * this.mass;

    // 5. Force from other Solitons (Gradient of overlapping wave fields)
    // F = -grad(V_other)
    // Under emergent potential model, soliton is attracted to the gradient of potential wells
    for (const other of otherSolitons) {
      if (other.id === this.id) continue;

      const dx = other.position[0] - this.position[0];
      const dy = other.position[1] - this.position[1];
      const dz = other.position[2] - this.position[2];
      const dw = other.position[3] - this.position[3];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw) + 1e-3;

      // Emergent soliton-soliton interaction:
      // F_mag = 2 * beta * G * M_eff * sech^2(beta * r) * tanh(beta * r) / r
      const beta = 1.2 / other.radius;
      const u = beta * dist;
      const coshU = Math.cosh(u);
      const sechSq = 1.0 / (coshU * coshU);
      const tanhU = Math.tanh(u);

      const G = 0.15 * gravityScale;
      // Topological charge pairing (same charges repel slightly, opposite attract strongly)
      const chargeMultiplier = this.topologicalCharge * other.topologicalCharge < 0 ? 1.5 : 0.7;

      const forceMag = (chargeMultiplier * 2.0 * beta * G * other.maxPotential * sechSq * tanhU) / dist;

      forces[0] += forceMag * dx;
      forces[1] += forceMag * dy;
      forces[2] += forceMag * dz;
      forces[3] += forceMag * dw;
    }

    // 6. Force from Obstacles (potential wells or barriers)
    for (const obs of obstacles) {
      const dx = obs.position[0] - this.position[0];
      const dy = obs.position[1] - this.position[1];
      const dz = obs.position[2] - this.position[2];
      const dw = obs.position[3] - this.position[3];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw) + 1e-3;

      if (dist < obs.radius + this.radius) {
        // Gradient flow interaction inside boundary:
        // Barrier pushes out (+ potential), Well pulls in (- potential)
        const beta = 2.0 / obs.radius;
        const u = beta * dist;
        const coshU = Math.cosh(u);
        const sechSq = 1.0 / (coshU * coshU);
        
        // Negative potential means a well, creating attractive force
        // Positive potential means a barrier, creating repulsive force
        // Force direction matches the gradient of obstacle potential: -grad(V_obs)
        const forceMag = -(obs.potential * 2.0 * beta * sechSq * Math.tanh(u)) / dist;

        forces[0] += forceMag * dx;
        forces[1] += forceMag * dy;
        forces[2] += forceMag * dz;
        forces[3] += forceMag * dw;

        // Wavefront energy exchange (Gradient Flow at boundary):
        // Soliton's radius fluctuates slightly in the potential gradient
        const exchangeRate = 0.005;
        this.radius = this.baseRadius * (1.0 + exchangeRate * obs.potential * Math.cos(this.phase));
      }
    }

    // 7. Update acceleration and velocity: a = F / m
    for (let i = 0; i < 4; i++) {
      const acc = forces[i] / this.mass;
      this.velocity[i] += acc * dt;
      
      // Apply environment damping (viscosity)
      this.velocity[i] *= (1.0 - damping);
      
      // Update position
      this.position[i] += this.velocity[i] * dt;
    }

    // 8. Track history
    this.history.push([...this.position] as Coord4D);
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }
  }

  /**
   * Applies an external pulse (perturbation) directly to the soliton,
   * injecting kinetic energy or causing topological instability.
   */
  applyPulse(force: Coord4D) {
    for (let i = 0; i < 4; i++) {
      this.velocity[i] += force[i];
    }
    // Briefly increase size from quantum perturbation
    this.radius *= 1.25;
    setTimeout(() => {
      this.radius = this.baseRadius;
    }, 800);
  }

  /**
   * Deep copy helper.
   */
  clone(): EffectiveSoliton {
    const copy = new EffectiveSoliton(
      this.id,
      this.position,
      this.velocity,
      this.baseRadius,
      this.maxPotential,
      this.energyProfile,
      this.fourierAmplitudes,
      this.topologicalCharge
    );
    copy.radius = this.radius;
    copy.phase = this.phase;
    copy.mass = this.mass;
    copy.history = [...this.history];
    return copy;
  }
}
