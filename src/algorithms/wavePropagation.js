import * as THREE from "three";
export class Wave {
  constructor(origin, amplitude, speed, decayRate, lifetime) {
    this.origin = new THREE.Vector3().copy(origin);
    this.amplitude = amplitude;
    this.speed = speed; 
    this.decayRate = decayRate; 
    this.lifetime = lifetime;
    this.age = 0;
    this.alive = true;
  }
  getAmplitudeAt(position) {
    if (!this.alive) return 0;
    const distance = position.distanceTo(this.origin);
    const radius = this.age * this.speed;
    if (distance > radius) return 0;
    const distanceDecay = Math.exp(-distance * this.decayRate);
    const timeDecay = 1.0 - (this.age / this.lifetime);
    return this.amplitude * distanceDecay * timeDecay;
  }
  update(deltaTime) {
    this.age += deltaTime;
    if (this.age >= this.lifetime) {
      this.alive = false;
    }
  }
}
export class WavePropagationSystem {
  constructor(config = {}) {
    this.waves = [];
    this.maxWaves = config.maxWaves || 10;
    this.defaultAmplitude = config.amplitude || 1.0;
    this.defaultSpeed = config.speed || 10.0;
    this.defaultDecayRate = config.decayRate || 0.1;
    this.defaultLifetime = config.lifetime || 5.0;
  }
  emitWave(origin, amplitude = null, speed = null, decayRate = null, lifetime = null) {
    if (this.waves.length >= this.maxWaves) {
      const deadIndex = this.waves.findIndex(w => !w.alive);
      if (deadIndex >= 0) {
        this.waves.splice(deadIndex, 1);
      } else {
        return; 
      }
    }
    const wave = new Wave(
      origin,
      amplitude !== null ? amplitude : this.defaultAmplitude,
      speed !== null ? speed : this.defaultSpeed,
      decayRate !== null ? decayRate : this.defaultDecayRate,
      lifetime !== null ? lifetime : this.defaultLifetime
    );
    this.waves.push(wave);
  }
  getAmplitudeAt(position) {
    let totalAmplitude = 0;
    for (const wave of this.waves) {
      totalAmplitude += wave.getAmplitudeAt(position);
    }
    return totalAmplitude;
  }
  update(deltaTime) {
    for (const wave of this.waves) {
      wave.update(deltaTime);
    }
    this.waves = this.waves.filter(w => w.alive);
  }
  getWaves() {
    return this.waves.filter(w => w.alive);
  }
  reset() {
    this.waves = [];
  }
}
export default WavePropagationSystem;
