import { useEffect, useRef } from "react";
import * as THREE from "three";

import createScene from "../world/scene/createScene.js";
import { createCameraRig } from "./cameraRig.js";
import useFirstPersonControls from "./useFirstPersonControls.js";
import { updateTerrainGeometry } from "../world/terrain/createTerrain.js";
import { createFlockingMotes } from "../world/flocking/createFlockingMotes.js";
import { createPlant } from "../world/plants/createPlant.js";
import { createBuilding } from "../world/buildings/createBuilding.js";
import { createFlowers } from "../world/flowers/createFlowers.js";

import { sampleTerrainHeight } from "../world/terrain/sampleHeight.js";

export default function PlayerView({ isAuthorMode, terrainConfig, flockingConfig, plantConfigs = [], buildingConfigs = [], flowerConfigs = [] }) {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const playerRef = useRef(null);
  const terrainRef = useRef(null);
  const sceneRef = useRef(null);

  const flockingSystemRef = useRef(null);

  const plantRefs = useRef([]);

  const buildingRefs = useRef([]);

  const flowerRefs = useRef([]);

  const isAuthorModeRef = useRef(isAuthorMode);
  useEffect(() => {
    isAuthorModeRef.current = isAuthorMode;
  }, [isAuthorMode]);

  const terrainConfigRef = useRef(null);
  useEffect(() => {
    terrainConfigRef.current = terrainConfig;
  }, [terrainConfig]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const { scene, camera, renderer, water, terrain } = createScene(mount);

    sceneRef.current = scene;
    cameraRef.current = camera;
    terrainRef.current = terrain;

    const player = createCameraRig(camera);
    playerRef.current = player;
    scene.add(player);

    let lastTime = performance.now();

    const animate = () => {
      requestAnimationFrame(animate);

      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isAuthorModeRef.current && water?.material?.uniforms?.time) {
        water.material.uniforms.time.value = performance.now() / 1000;
      }

      if (flockingSystemRef.current) {
        flockingSystemRef.current.update(deltaTime);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (renderer?.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  useFirstPersonControls(
    playerRef,
    cameraRef,
    isAuthorModeRef,
    terrainConfigRef
  );

  useEffect(() => {
    if (!terrainConfig || !terrainRef.current) return;
    updateTerrainGeometry(terrainRef.current, terrainConfig);
  }, [terrainConfig]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (flockingSystemRef.current) {
      flockingSystemRef.current.dispose();
      flockingSystemRef.current = null;
    }

    if (flockingConfig) {
      const system = createFlockingMotes(flockingConfig, scene);
      flockingSystemRef.current = system;
    }

    return () => {
      if (flockingSystemRef.current) {
        flockingSystemRef.current.dispose();
        flockingSystemRef.current = null;
      }
    };
  }, [flockingConfig]);

  useEffect(() => {
    if (flockingSystemRef.current && flockingConfig) {
      flockingSystemRef.current.updateConfig(flockingConfig);
    }
  }, [flockingConfig]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    plantRefs.current.forEach((plant) => {
      if (plant && plant.dispose) {
        plant.dispose();
      }
    });
    plantRefs.current = [];

    plantConfigs.forEach((plantConfig) => {
      if (!plantConfig.lsystem) return;

      let terrainHeight = 0;
      if (terrainConfigRef.current) {
        terrainHeight = sampleTerrainHeight(plantConfig.positionX, plantConfig.positionZ, terrainConfigRef.current);
      }

      const adjustedConfig = {
        ...plantConfig,
        positionY: terrainHeight,
      };

      const plant = createPlant(adjustedConfig, scene);
      if (plant) {
        plantRefs.current.push(plant);
      }
    });

    return () => {
      plantRefs.current.forEach((plant) => {
        if (plant && plant.dispose) {
          plant.dispose();
        }
      });
      plantRefs.current = [];
    };
  }, [plantConfigs]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    buildingRefs.current.forEach((building) => {
      if (building && building.dispose) {
        building.dispose();
      }
    });
    buildingRefs.current = [];

    buildingConfigs.forEach((buildingConfig) => {
      if (!buildingConfig.grammar) return;

      let terrainHeight = 0;
      if (terrainConfigRef.current) {
        terrainHeight = sampleTerrainHeight(buildingConfig.positionX, buildingConfig.positionZ, terrainConfigRef.current);
      }

      const adjustedConfig = {
        ...buildingConfig,
        positionX: buildingConfig.positionX,
        positionY: terrainHeight,
        positionZ: buildingConfig.positionZ,
      };

      const building = createBuilding(adjustedConfig, scene);
      if (building) {
        buildingRefs.current.push(building);
      }
    });

    return () => {
      buildingRefs.current.forEach((building) => {
        if (building && building.dispose) {
          building.dispose();
        }
      });
      buildingRefs.current = [];
    };
  }, [buildingConfigs]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    flowerRefs.current.forEach((flower) => {
      if (flower && flower.dispose) {
        flower.dispose();
      }
    });
    flowerRefs.current = [];

    flowerConfigs.forEach((flowerConfig) => {
      const terrainConfigForFlowers = terrainConfigRef.current || null;

      const flower = createFlowers(flowerConfig, scene, terrainConfigForFlowers);
      if (flower) {
        flowerRefs.current.push(flower);
      }
    });

    return () => {
      flowerRefs.current.forEach((flower) => {
        if (flower && flower.dispose) {
          flower.dispose();
        }
      });
      flowerRefs.current = [];
    };
  }, [flowerConfigs]);

  const handleClick = () => {
    if (!isAuthorModeRef.current) {
      document.body.requestPointerLock();
    }
  };

  return (
    <>
      <div
        ref={mountRef}
        style={{
          width: "100vw",
          height: "100vh",
          position: "absolute",
          inset: 0,
          zIndex: 1
        }}
        onClick={handleClick}
      />
    </>
  );
}
