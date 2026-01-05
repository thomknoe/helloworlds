import { Plant } from "./Plant.js";
export function createPlant(config, scene) {
  if (!config || !config.lsystem) return null;
  const plant = new Plant(config);
  scene.add(plant.getGroup());
  return {
    group: plant.getGroup(),
    dispose: () => {
      plant.dispose();
    },
    updateConfig: (newConfig) => {
      return plant.updateConfig(newConfig);
    },
    _plant: plant,
  };
}
