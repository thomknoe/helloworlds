import PerlinNoiseNode from "./algorithms/PerlinNoiseNode.jsx";
import VoronoiNoiseNode from "./algorithms/VoronoiNoiseNode.jsx";
import RidgeNoiseNode from "./algorithms/RidgeNoiseNode.jsx";
import SimplexNoiseNode from "./algorithms/SimplexNoiseNode.jsx";
import FlockingNode from "./algorithms/FlockingNode.jsx";
import CellularAutomataNode from "./algorithms/CellularAutomataNode.jsx";
import ParticleSystemNode from "./algorithms/ParticleSystemNode.jsx";
import WavePropagationNode from "./algorithms/WavePropagationNode.jsx";
import AgentNode from "./algorithms/AgentNode.jsx";
import NPCNode from "./algorithms/NPCNode.jsx";
import LSystemNode from "./algorithms/LSystemNode.jsx";
import PlantNode from "./algorithms/PlantNode.jsx";
import FlowerNode from "./algorithms/FlowerNode.jsx";
import BuildingGrammarNode from "./algorithms/BuildingGrammarNode.jsx";
import ShapeGrammarNode from "./algorithms/ShapeGrammarNode.jsx";
import MarkovChainNode from "./algorithms/MarkovChainNode.jsx";
import ParametricCurveNode from "./algorithms/ParametricCurveNode.jsx";
import BuildingNode from "./algorithms/BuildingNode.jsx";
import DefaultNode from "./core/DefaultNode.jsx";
import InputNode from "./core/InputNode.jsx";
import TerrainNode from "./environment/TerrainNode.jsx";
export const nodeRegistry = {
  default: DefaultNode,
  input: InputNode,
  perlinNoise: PerlinNoiseNode,
  voronoiNoise: VoronoiNoiseNode,
  ridgeNoise: RidgeNoiseNode,
  simplexNoise: SimplexNoiseNode,
  flocking: FlockingNode,
  cellularAutomata: CellularAutomataNode,
  particleSystem: ParticleSystemNode,
  wavePropagation: WavePropagationNode,
  agent: AgentNode,
  npc: NPCNode,
  lsystem: LSystemNode,
  plant: PlantNode,
  flower: FlowerNode,
  buildingGrammar: BuildingGrammarNode,
  shapeGrammar: ShapeGrammarNode,
  markovChain: MarkovChainNode,
  parametricCurve: ParametricCurveNode,
  building: BuildingNode,
  terrain: TerrainNode,
};
