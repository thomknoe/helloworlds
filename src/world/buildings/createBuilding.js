import { Building } from "./Building.js";
export function createBuilding(config, scene) {
  if (!config || !config.grammar || !config.grammar.building) return null;
  const building = new Building(config);
  scene.add(building.getGroup());
  return {
    group: building.getGroup(),
    dispose: () => {
      building.dispose();
    },
    updateConfig: (newConfig) => {
      return building.updateConfig(newConfig);
    },
    _building: building,
  };
}
