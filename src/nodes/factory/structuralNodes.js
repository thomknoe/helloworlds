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
export function createShapeGrammarNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("shapeGrammar"),
    type: "shapeGrammar",
    position,
    data: {
      label: "Shape Grammar",
      grammarType: "building",
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
export function createMarkovChainNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("markovChain"),
    type: "markovChain",
    position,
    data: {
      label: "Markov Chain",
      states: "A,B,C",
      sequenceLength: 10,
    },
  };
}
export function createParametricCurveNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("parametricCurve"),
    type: "parametricCurve",
    position,
    data: {
      label: "Parametric Curve",
      curveType: "bezier",
      segments: 50,
      controlPointsX: "0,5,10,15",
      controlPointsY: "0,0,0,0",
      controlPointsZ: "0,5,0,5",
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
