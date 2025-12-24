import PerlinNoiseNode from "./algorithms/PerlinNoiseNode.jsx";
import FlockingNode from "./algorithms/FlockingNode.jsx";
import AgentNode from "./algorithms/AgentNode.jsx";
import LSystemNode from "./algorithms/LSystemNode.jsx";
import PlantNode from "./algorithms/PlantNode.jsx";
import FlowerNode from "./algorithms/FlowerNode.jsx";
import BuildingGrammarNode from "./algorithms/BuildingGrammarNode.jsx";
import BuildingNode from "./algorithms/BuildingNode.jsx";
import DefaultNode from "./core/DefaultNode.jsx";
import InputNode from "./core/InputNode.jsx";
import TerrainNode from "./environment/TerrainNode.jsx";

export const nodeRegistry = {
  default: DefaultNode,
  input: InputNode,

  perlinNoise: PerlinNoiseNode,
  flocking: FlockingNode,
  agent: AgentNode,
  lsystem: LSystemNode,
  plant: PlantNode,
  flower: FlowerNode,
  buildingGrammar: BuildingGrammarNode,
  building: BuildingNode,

  terrain: TerrainNode,
};
