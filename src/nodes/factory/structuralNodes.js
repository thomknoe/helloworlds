const makeId = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export function createBuildingGrammarNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("buildingGrammar"),
    type: "buildingGrammar",
    position,
    data: {
      label: "Building Grammar",
      levels: 3,
      roomsPerLevel: 4,
      roomSize: 4.0,
      levelHeight: 3.0,
      wallThickness: 0.2,
      hasStairs: true,
      roomLayout: "grid",
    },
  };
}

export function createBuildingNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("building"),
    type: "building",
    position,
    data: {
      label: "Building",
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      color: "#ffffff",
    },
  };
}
