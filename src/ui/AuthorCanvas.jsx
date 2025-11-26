// src/ui/AuthorCanvas.jsx
import { useState, useMemo, useEffect } from "react";
import { useNodesState, useEdgesState, addEdge } from "reactflow";
import "reactflow/dist/style.css";

import AuthorSidebar from "./AuthorSidebar.jsx";
import AuthorFlowCanvas from "./AuthorFlowCanvas.jsx";
import AuthorInspector from "./AuthorInspector.jsx";

import { nodeRegistry } from "../nodes/registry.js";
import {
  createPerlinNoiseNode,
  createNumberSliderNode,
  createPanelNode,
  createTerrainNode,
} from "../nodes/factory/environmentNodes.js";

import { createNPCNode } from "../nodes/factory/characterNodes.js";

// ------------------------------------------------------
// INITIAL NODES & EDGES
// ------------------------------------------------------
const initialNodes = [];
const initialEdges = [];

// ------------------------------------------------------
// COMPONENT
// ------------------------------------------------------
export default function AuthorCanvas({
  onTerrainConfigChange,
  onNPCConfigChange    // ← NEW
}) {
  const [activeDomain, setActiveDomain] = useState("environment");

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [nodeOutputs, setNodeOutputs] = useState({});
  const nodeTypes = useMemo(() => nodeRegistry, []);

  // ------------------------------------------------------
  // TERRAIN CONFIG PIPELINE
  // ------------------------------------------------------
  useEffect(() => {
    const terrainNode = nodes.find((n) => n.type === "terrain");
    if (!terrainNode) return;

    const configEdge = edges.find(
      (e) =>
        e.target === terrainNode.id &&
        (e.targetHandle === "config" || e.targetHandle == null)
    );

    let nextTerrainConfig = null;

    if (configEdge) {
      const srcOutput = nodeOutputs[configEdge.source];

      if (srcOutput) {
        nextTerrainConfig = {
          sourceId: configEdge.source,
          seed: srcOutput.seed ?? 42,
          scale: srcOutput.scale ?? 0.05,
          octaves: srcOutput.octaves ?? 4,
          persistence: srcOutput.persistence ?? 0.5,
          amplitude: srcOutput.amplitude ?? 10,
          frequency: srcOutput.frequency ?? 1,
          rawValue: srcOutput.value ?? 0,
        };
      }
    }

    if (nextTerrainConfig) {
      const needsUpdate =
        terrainNode.data?.seed !== nextTerrainConfig.seed ||
        terrainNode.data?.scale !== nextTerrainConfig.scale ||
        terrainNode.data?.octaves !== nextTerrainConfig.octaves ||
        terrainNode.data?.persistence !== nextTerrainConfig.persistence ||
        terrainNode.data?.amplitude !== nextTerrainConfig.amplitude ||
        terrainNode.data?.frequency !== nextTerrainConfig.frequency ||
        terrainNode.data?.sourceId !== nextTerrainConfig.sourceId;

      if (needsUpdate) {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === terrainNode.id
              ? { ...n, data: { ...n.data, ...nextTerrainConfig } }
              : n
          )
        );
      }

      if (typeof onTerrainConfigChange === "function") {
        onTerrainConfigChange(nextTerrainConfig);
      }
    }
  }, [nodes, edges, nodeOutputs, setNodes, onTerrainConfigChange]);

  // ------------------------------------------------------
  // NPC CONFIG PIPELINE (NEW)
  // ------------------------------------------------------
  useEffect(() => {
    if (typeof onNPCConfigChange !== "function") return;

    const npcNodes = nodes.filter((n) => n.type === "npc");

    const npcPayload = npcNodes.map((n) => ({
      id: n.id,
      name: n.data?.name || "NPC",
      apiKey: n.data?.apiKey || "",
      modelFile: n.data?.modelFile || null,
    }));

    onNPCConfigChange(npcPayload);
  }, [nodes, nodeOutputs, onNPCConfigChange]);

  // ------------------------------------------------------
  // Attach handlers to new node instance
  // ------------------------------------------------------
  function attachNodeHandlers(node) {
    const data = node.data || {};

    return {
      ...node,
      data: {
        ...data,
        onChange: (newData) => {
          setNodes((prev) =>
            prev.map((n) =>
              n.id === node.id ? { ...n, data: { ...n.data, ...newData } } : n
            )
          );
        },
        onOutput: (output) => {
          setNodeOutputs((prev) => ({
            ...prev,
            [node.id]: output,
          }));
          console.log("[Node Output]", node.id, output);
        },
      },
    };
  }

  function addNodeToEnvironment(node) {
    const wrapped = attachNodeHandlers(node);
    setNodes((prev) => [...prev, wrapped]);
  }

  // ------------------------------------------------------
  // Sidebar handlers
  // ------------------------------------------------------
  const handleAddTerrainNode = () => addNodeToEnvironment(createTerrainNode());
  const handleAddPerlinNoise = () => addNodeToEnvironment(createPerlinNoiseNode());
  const handleAddNumberSlider = () => addNodeToEnvironment(createNumberSliderNode());
  const handleAddPanelNode = () => addNodeToEnvironment(createPanelNode());
  const handleAddNPCNode = () => addNodeToEnvironment(createNPCNode()); // NEW

  // ------------------------------------------------------
  // Connect edges
  // ------------------------------------------------------
  function onConnect(params) {
    setEdges((prev) => addEdge({ ...params, animated: true }, prev));
  }

  // ------------------------------------------------------
  // RENDER
  // ------------------------------------------------------
  return (
    <div className="author-shell">
      <AuthorSidebar
        activeDomain={activeDomain}
        setActiveDomain={setActiveDomain}
        onAddTerrainNode={handleAddTerrainNode}
        onAddPerlinNoise={handleAddPerlinNoise}
        onAddNumberSlider={handleAddNumberSlider}
        onAddPanelNode={handleAddPanelNode}
        onAddNPCNode={handleAddNPCNode} // NEW
      />

      <AuthorFlowCanvas
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      />

      <AuthorInspector activeDomain={activeDomain} />
    </div>
  );
}
