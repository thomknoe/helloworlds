// src/nodes/registry.js
import PerlinNoiseNode from "./algorithms/PerlinNoiseNode.jsx";
import NumberSliderNode from "./core/NumberSliderNode.jsx";
import PanelNode from "./core/PanelNode.jsx";
import DefaultNode from "./core/DefaultNode.jsx";
import InputNode from "./core/InputNode.jsx";
import TerrainNode from "./environment/TerrainNode.jsx"; // ← new
import NPCNode from "./characters/NPCNode.jsx";

export const nodeRegistry = {
  default: DefaultNode,
  input: InputNode,

  perlinNoise: PerlinNoiseNode,
  numberSlider: NumberSliderNode,
  panel: PanelNode,

  terrain: TerrainNode,
  npc: NPCNode,
};
