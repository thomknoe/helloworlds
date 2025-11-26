// src/nodes/characters/characterNodes.js

import NPCNode from "../characters/NPCNode";

// FACTORY — create a new NPC node instance
export function createNPCNode() {
  return {
    id: `npc-${crypto.randomUUID()}`,
    type: "npc",
    position: { x: 400, y: 200 },
    data: {
      name: "NPC",
      apiKey: "",
      modelFile: null,
    },
  };
}

// REGISTRY — exported to global registry.js
export const characterNodeTypes = {
  npc: NPCNode,
};
