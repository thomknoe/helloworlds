import * as THREE from "three";
export class SceneManager {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.water = null;
    this.terrain = null;
  }
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
  setBackground(background) {
    if (this.scene) {
      this.scene.background = background;
      this.scene.environment = background;
    }
  }
  setFog(color, near, far) {
    if (this.scene) {
      this.scene.fog = new THREE.Fog(color, near, far);
    }
  }
  addLight(light) {
    if (this.scene) {
      this.scene.add(light);
    }
  }
  add(object) {
    if (this.scene) {
      this.scene.add(object);
    }
  }
  remove(object) {
    if (this.scene && object.parent) {
      this.scene.remove(object);
    }
  }
  setTerrain(terrain) {
    this.terrain = terrain;
    if (terrain) {
      this.add(terrain);
    }
  }
  setWater(water) {
    this.water = water;
    if (water) {
      this.add(water);
    }
  }
  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
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
