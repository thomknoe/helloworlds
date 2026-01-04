import { Building } from "./Building.js";

/**
 * Factory function to create a building
 * @param {Object} config - Building configuration
 * @param {THREE.Scene} scene - Three.js scene
 * @returns {Object|null} Building object or null
 */
export function createBuilding(config, scene) {
  if (!config || !config.grammar || !config.grammar.building) return null;

  const building = new Building(config);
  scene.add(building.getGroup());

  // Return object with backward-compatible interface
  return {
    group: building.getGroup(),
    dispose: () => {
      building.dispose();
    },
    updateConfig: (newConfig) => {
      return building.updateConfig(newConfig);
    },
    // Store building instance for internal use
    _building: building,
  };
}
