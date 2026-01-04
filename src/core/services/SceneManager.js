import * as THREE from "three";

/**
 * Manages the Three.js scene, camera, and renderer
 * Provides centralized access to core rendering components
 */
export class SceneManager {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.water = null;
    this.terrain = null;
  }

  /**
   * Initialize the scene with a mount element
   * @param {HTMLElement} mount - DOM element to mount renderer
   * @param {Object} options - Initialization options
   */
  initialize(mount, options = {}) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      options.fov ?? 75,
      mount.clientWidth / mount.clientHeight,
      options.near ?? 0.1,
      options.far ?? 2000
    );
    this.camera.position.set(
      options.cameraX ?? 0,
      options.cameraY ?? 10,
      options.cameraZ ?? 15
    );
  }

  /**
   * Set the scene background
   * @param {THREE.Texture|THREE.Color} background - Background texture or color
   */
  setBackground(background) {
    if (this.scene) {
      this.scene.background = background;
      this.scene.environment = background;
    }
  }

  /**
   * Add fog to the scene
   * @param {THREE.Color} color - Fog color
   * @param {number} near - Near distance
   * @param {number} far - Far distance
   */
  setFog(color, near, far) {
    if (this.scene) {
      this.scene.fog = new THREE.Fog(color, near, far);
    }
  }

  /**
   * Add a light to the scene
   * @param {THREE.Light} light - Light object to add
   */
  addLight(light) {
    if (this.scene) {
      this.scene.add(light);
    }
  }

  /**
   * Add an object to the scene
   * @param {THREE.Object3D} object - Object to add
   */
  add(object) {
    if (this.scene) {
      this.scene.add(object);
    }
  }

  /**
   * Remove an object from the scene
   * @param {THREE.Object3D} object - Object to remove
   */
  remove(object) {
    if (this.scene && object.parent) {
      this.scene.remove(object);
    }
  }

  /**
   * Set the terrain reference
   * @param {THREE.Mesh} terrain - Terrain mesh
   */
  setTerrain(terrain) {
    this.terrain = terrain;
    if (terrain) {
      this.add(terrain);
    }
  }

  /**
   * Set the water reference
   * @param {THREE.Mesh} water - Water mesh
   */
  setWater(water) {
    this.water = water;
    if (water) {
      this.add(water);
    }
  }

  /**
   * Render the scene
   */
  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    if (this.renderer?.domElement?.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.water = null;
    this.terrain = null;
  }
}

