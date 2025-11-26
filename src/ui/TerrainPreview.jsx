import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function TerrainPreview() {
  const mountRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // -------------------------------
  // Wait until container is stable
  // -------------------------------
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const check = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w > 20 && h > 20) {
        setIsReady(true);
      } else {
        requestAnimationFrame(check);
      }
    };

    check();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const mount = mountRef.current;
    if (!mount) return;

    const terrain = window.__terrainReference;
    if (!terrain) return;

    // -------------------------------------------
    // RENDERER
    // -------------------------------------------
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);

    mount.appendChild(renderer.domElement);

    // -------------------------------------------
    // SCENE
    // -------------------------------------------
    const scene = new THREE.Scene();

    // -------------------------------------------
    // SAFE TERRAIN CLONE
    // -------------------------------------------
    const clone = terrain.clone(true);

    const safeMat = terrain.material.clone();
    safeMat.map = terrain.material.map;
    safeMat.normalMap = terrain.material.normalMap;
    safeMat.roughnessMap = terrain.material.roughnessMap;
    safeMat.needsUpdate = true;

    clone.material = safeMat;

    clone.matrixAutoUpdate = false;
    clone.updateMatrix();

    scene.add(clone);

    // -------------------------------------------
    // LIGHTS
    // -------------------------------------------
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(50, 100, 80);
    scene.add(dir);

    // -------------------------------------------
    // CAMERA (orthographic)
    // -------------------------------------------
    const aspect = mount.clientWidth / mount.clientHeight;
    const frustum = 180;

    const camera = new THREE.OrthographicCamera(
      (-frustum * aspect) / 2,
      (frustum * aspect) / 2,
      frustum / 2,
      -frustum / 2,
      0.1,
      1000
    );

    camera.position.set(140, 140, 140);
    camera.lookAt(0, 0, 0);

    // -------------------------------------------
    // RENDER LOOP
    // -------------------------------------------
    let frameId;
    const loop = () => {
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(loop);
    };
    loop();

    // -------------------------------------------
    // CLEANUP
    // -------------------------------------------
    return () => {
      cancelAnimationFrame(frameId);

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }

      renderer.dispose();

      // CLEAN child resources
      clone.geometry.dispose();
      clone.material.dispose();
    };
  }, [isReady]);

  return (
    <div
      ref={mountRef}
      className="terrain-preview"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        isolation: "isolate", // IMPORTANT for Safari + blur contexts
      }}
    />
  );
}
