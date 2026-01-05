import * as THREE from "three";
import { createRenderer } from "../../engine/createRenderer.js";
import { createGradientSky } from "../../engine/createGradientSky.js";
import { createTerrain } from "../terrain/createTerrain.js";
import { createWater } from "../water/createWater.js";
export default function createScene(mount, terrainConfig = null) {
  const scene = new THREE.Scene();
  const sky = createGradientSky();
  scene.add(sky);
  scene.background = new THREE.Color(0x7db8e8);
  const camera = new THREE.PerspectiveCamera(
    75,
    mount.clientWidth / mount.clientHeight,
    0.1,
    2000
  );
  camera.position.set(0, 10, 15);
  const renderer = createRenderer(mount);
  const terrain = createTerrain({});
  scene.add(terrain);
  if (typeof window !== "undefined") {
    window.__terrainReference = terrain;
    window.__updateTerrain = null;
  }
  const waterHeight = terrainConfig?.waterHeight ?? 0;
  const water = createWater({ height: waterHeight, size: 400 });
  scene.add(water);
  const hemi = new THREE.HemisphereLight(0xfff5e6, 0xd4c5b8, 0.6);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff8f0, 0.6);
  sun.position.set(60, 100, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 4096;
  sun.shadow.mapSize.height = 4096;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 500;
  sun.shadow.camera.left = -200;
  sun.shadow.camera.right = 200;
  sun.shadow.camera.top = 200;
  sun.shadow.camera.bottom = -200;
  sun.shadow.bias = -0.0001;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 4;
  scene.add(sun);
  const ambient = new THREE.AmbientLight(0xf5e6d3, 0.4);
  scene.add(ambient);
  const fillLight = new THREE.DirectionalLight(0xfff5e6, 0.008);
  fillLight.position.set(-40, 50, -30);
  scene.add(fillLight);
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x7db8e8);
  const envSphere = new THREE.Mesh(
    new THREE.SphereGeometry(100, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0x7db8e8,
      side: THREE.BackSide,
    })
  );
  envScene.add(envSphere);
  const envMapRT = pmremGenerator.fromScene(envScene, 0.04).texture;
  scene.environment = envMapRT;
  pmremGenerator.dispose();
  return { scene, camera, renderer, water, terrain, sky };
}
