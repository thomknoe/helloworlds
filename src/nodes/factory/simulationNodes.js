const makeId = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export function createLSystemNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("lsystem"),
    type: "lsystem",
    position,
    data: {
      label: "L-System",
      axiom: "F",
      rule1: "F",
      rule1Replacement: "F[+F]F[-F]F",
      rule2: "",
      rule2Replacement: "",
      rule3: "",
      rule3Replacement: "",
      iterations: 3,
      angle: 25,
      stepSize: 1.0,
    },
  };
}

export function createPlantNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("plant"),
    type: "plant",
    position,
    data: {
      label: "Plant",
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      branchThickness: 0.1,
      branchColor: "#8B4513",
      leafSize: 0.3,
      leafColor: "#228B22",
      leafDensity: 0.7,
    },
  };
}

export function createFlowerNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("flower"),
    type: "flower",
    position,
    data: {
      label: "Flowers",
      count: 50,
      spread: 50.0,
      size: 1.0,
    },
  };
}
