import { Plant } from "./Plant.js";

/**
 * Factory function to create a plant
 * @param {Object} config - Plant configuration
 * @param {THREE.Scene} scene - Three.js scene
 * @returns {Plant|null} Plant instance or null
 */
export function createPlant(config, scene) {
  if (!config || !config.lsystem) return null;

  const plant = new Plant(config);
  scene.add(plant.getGroup());

  // Return object with backward-compatible interface
  return {
    group: plant.getGroup(),
    dispose: () => {
      plant.dispose();
    },
    updateConfig: (newConfig) => {
      return plant.updateConfig(newConfig);
    },
    // Store plant instance for internal use
    _plant: plant,
  };
}
