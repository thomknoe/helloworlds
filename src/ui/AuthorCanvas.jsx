import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useNodesState, useEdgesState, addEdge } from "reactflow";
import "reactflow/dist/style.css";

import AuthorSidebar from "./AuthorSidebar.jsx";
import AuthorFlowCanvas from "./AuthorFlowCanvas.jsx";

import { nodeRegistry } from "../nodes/registry.js";
import {
  createPerlinNoiseNode,
  createVoronoiNoiseNode,
  createRidgeNoiseNode,
  createSimplexNoiseNode,
  createTerrainNode,
} from "../nodes/factory/environmentNodes.js";

import { createAgentNode, createFlockingNode, createNPCNode } from "../nodes/factory/agentNodes.js";
import {
  createLSystemNode,
  createPlantNode,
  createFlowerNode,
  createCellularAutomataNode,
  createParticleSystemNode,
  createWavePropagationNode,
} from "../nodes/factory/simulationNodes.js";
import {
  createBuildingGrammarNode,
  createShapeGrammarNode,
  createMarkovChainNode,
  createParametricCurveNode,
  createBuildingNode,
} from "../nodes/factory/structuralNodes.js";

const initialNodes = [];
const initialEdges = [];

export default function AuthorCanvas({
  onTerrainConfigChange,
  onFlockingConfigChange,
  onPlantConfigChange,
  onBuildingConfigChange,
  onFlowerConfigChange,
  onNPCConfigChange,
}) {
  const [activeDomain, setActiveDomain] = useState("noiseHeightfields");

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [nodeOutputs, setNodeOutputs] = useState({});
  const [copiedNodes, setCopiedNodes] = useState([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState(new Set());
  const nodeTypes = useMemo(() => nodeRegistry, []);
  
  // Use refs to access latest state in event handlers
  const nodesRef = useRef(nodes);
  const selectedNodeIdsRef = useRef(selectedNodeIds);
  const copiedNodesRef = useRef(copiedNodes);
  
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  
  useEffect(() => {
    selectedNodeIdsRef.current = selectedNodeIds;
  }, [selectedNodeIds]);
  
  useEffect(() => {
    copiedNodesRef.current = copiedNodes;
  }, [copiedNodes]);

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
          type: srcOutput.type || "perlinNoise",
          seed: srcOutput.seed ?? 42,
          scale: srcOutput.scale ?? 0.05,
          octaves: srcOutput.octaves ?? 4,
          persistence: srcOutput.persistence ?? 0.5,
          amplitude: srcOutput.amplitude ?? 10,
          frequency: srcOutput.frequency ?? 1,
          rawValue: srcOutput.value ?? 0,
          // Voronoi specific
          mode: srcOutput.mode,
          // Domain Warping specific
          baseScale: srcOutput.baseScale,
          warpStrength: srcOutput.warpStrength,
          warpScale: srcOutput.warpScale,
          // Ridge Noise specific
          offset: srcOutput.offset,
          power: srcOutput.power,
          // Simplex specific
          zOffset: srcOutput.zOffset,
        };
      }
    }

    if (nextTerrainConfig) {
      const needsUpdate =
        terrainNode.data?.type !== nextTerrainConfig.type ||
        terrainNode.data?.seed !== nextTerrainConfig.seed ||
        terrainNode.data?.scale !== nextTerrainConfig.scale ||
        terrainNode.data?.octaves !== nextTerrainConfig.octaves ||
        terrainNode.data?.persistence !== nextTerrainConfig.persistence ||
        terrainNode.data?.amplitude !== nextTerrainConfig.amplitude ||
        terrainNode.data?.frequency !== nextTerrainConfig.frequency ||
        terrainNode.data?.sourceId !== nextTerrainConfig.sourceId ||
        terrainNode.data?.mode !== nextTerrainConfig.mode ||
        terrainNode.data?.baseScale !== nextTerrainConfig.baseScale ||
        terrainNode.data?.warpStrength !== nextTerrainConfig.warpStrength ||
        terrainNode.data?.warpScale !== nextTerrainConfig.warpScale ||
        terrainNode.data?.offset !== nextTerrainConfig.offset ||
        terrainNode.data?.power !== nextTerrainConfig.power ||
        terrainNode.data?.zOffset !== nextTerrainConfig.zOffset;

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

  useEffect(() => {
    if (typeof onFlockingConfigChange !== "function") return;

    const agentNodes = nodes.filter((n) => n.type === "agent");

    if (agentNodes.length === 0) {
      onFlockingConfigChange(null);
      return;
    }

    const agents = [];
    agentNodes.forEach((agentNode) => {
      const agentOutput = nodeOutputs[agentNode.id];
      const count = agentOutput?.count ?? agentNode.data?.count ?? 1;
      const basePositionX = agentOutput?.positionX ?? agentNode.data?.positionX ?? 0;
      const basePositionY = agentOutput?.positionY ?? agentNode.data?.positionY ?? 50;
      const basePositionZ = agentOutput?.positionZ ?? agentNode.data?.positionZ ?? 0;
      const baseVelocityX = agentOutput?.velocityX ?? agentNode.data?.velocityX ?? 0;
      const baseVelocityY = agentOutput?.velocityY ?? agentNode.data?.velocityY ?? 0;
      const baseVelocityZ = agentOutput?.velocityZ ?? agentNode.data?.velocityZ ?? 0;
      const size = agentOutput?.size ?? agentNode.data?.size ?? 0.3;
      const spread = agentOutput?.spread ?? agentNode.data?.spread ?? 20.0;

      for (let i = 0; i < count; i++) {
        const offsetX = (Math.random() - 0.5) * spread;
        const offsetY = (Math.random() - 0.5) * spread * 0.3;
        const offsetZ = (Math.random() - 0.5) * spread;

        const velX = baseVelocityX || (Math.random() - 0.5) * 4;
        const velY = baseVelocityY || (Math.random() - 0.5) * 1;
        const velZ = baseVelocityZ || (Math.random() - 0.5) * 4;

        agents.push({
          id: `${agentNode.id}-${i}`,
          positionX: basePositionX + offsetX,
          positionY: basePositionY + offsetY,
          positionZ: basePositionZ + offsetZ,
          velocityX: velX,
          velocityY: velY,
          velocityZ: velZ,
          size: size,
        });
      }
    });

    const behaviorMap = new Map();

    agentNodes.forEach((agentNode) => {
      const behaviorEdge = edges.find(
        (e) =>
          e.target === agentNode.id &&
          e.targetHandle === "behavior"
      );

      if (behaviorEdge) {
        const behaviorNode = nodes.find((n) => n.type === "flocking" && n.id === behaviorEdge.source);
        if (behaviorNode && !behaviorMap.has(behaviorNode.id)) {
          const behaviorOutput = nodeOutputs[behaviorNode.id];

          const noiseEdge = edges.find(
            (e) =>
              e.target === behaviorNode.id &&
              e.targetHandle === "noise"
          );

          let noiseConfig = null;
          if (noiseEdge) {
            const srcOutput = nodeOutputs[noiseEdge.source];
            if (srcOutput) {
              noiseConfig = srcOutput;
            }
          }

          behaviorMap.set(behaviorNode.id, {
            id: behaviorNode.id,
            separation: behaviorOutput?.separation ?? behaviorNode.data?.separation ?? 1.5,
            alignment: behaviorOutput?.alignment ?? behaviorNode.data?.alignment ?? 1.0,
            cohesion: behaviorOutput?.cohesion ?? behaviorNode.data?.cohesion ?? 1.0,
            separationRadius: behaviorOutput?.separationRadius ?? behaviorNode.data?.separationRadius ?? 2.0,
            neighborRadius: behaviorOutput?.neighborRadius ?? behaviorNode.data?.neighborRadius ?? 5.0,
            maxSpeed: behaviorOutput?.maxSpeed ?? behaviorNode.data?.maxSpeed ?? 5.0,
            maxForce: behaviorOutput?.maxForce ?? behaviorNode.data?.maxForce ?? 0.1,
            boundsWidth: behaviorOutput?.boundsWidth ?? behaviorNode.data?.boundsWidth ?? 50,
            boundsDepth: behaviorOutput?.boundsDepth ?? behaviorNode.data?.boundsDepth ?? 50,
            planeHeight: behaviorOutput?.planeHeight ?? behaviorNode.data?.planeHeight ?? 50,
            noiseConfig,
          });
        }
      }
    });

    const behaviors = Array.from(behaviorMap.values());
    const behavior = behaviors.length > 0 ? behaviors[0] : null;

    const flockingConfig = {
      agents,
      behavior,
    };

    onFlockingConfigChange(flockingConfig);
  }, [nodes, edges, nodeOutputs, onFlockingConfigChange]);

  useEffect(() => {
    if (typeof onPlantConfigChange !== "function") return;

    const plantNodes = nodes.filter((n) => n.type === "plant");

    if (plantNodes.length === 0) {
      onPlantConfigChange([]);
      return;
    }

    const plants = plantNodes.map((plantNode) => {
      const plantOutput = nodeOutputs[plantNode.id];

      const lsystemEdge = edges.find(
        (e) =>
          e.target === plantNode.id &&
          e.targetHandle === "lsystem"
      );

      let lsystem = null;
      if (lsystemEdge) {
        const lsystemOutput = nodeOutputs[lsystemEdge.source];
        if (lsystemOutput && lsystemOutput.type === "lsystem") {
          lsystem = lsystemOutput;
        }
      }

      return {
        id: plantNode.id,
        positionX: plantOutput?.positionX ?? plantNode.data?.positionX ?? 0,
        positionY: plantOutput?.positionY ?? plantNode.data?.positionY ?? 0,
        positionZ: plantOutput?.positionZ ?? plantNode.data?.positionZ ?? 0,
        branchThickness: plantOutput?.branchThickness ?? plantNode.data?.branchThickness ?? 0.1,
        branchColor: plantOutput?.branchColor ?? plantNode.data?.branchColor ?? "#8B4513",
        leafSize: plantOutput?.leafSize ?? plantNode.data?.leafSize ?? 0.3,
        leafColor: plantOutput?.leafColor ?? plantNode.data?.leafColor ?? "#228B22",
        leafDensity: plantOutput?.leafDensity ?? plantNode.data?.leafDensity ?? 0.7,
        lsystem,
      };
    });

    onPlantConfigChange(plants);
  }, [nodes, edges, nodeOutputs, onPlantConfigChange]);

  useEffect(() => {
    if (typeof onBuildingConfigChange !== "function") return;

    const buildingNodes = nodes.filter((n) => n.type === "building");

    if (buildingNodes.length === 0) {
      onBuildingConfigChange([]);
      return;
    }

    const buildings = buildingNodes.map((buildingNode) => {
      const buildingOutput = nodeOutputs[buildingNode.id];

      const grammarEdge = edges.find(
        (e) =>
          e.target === buildingNode.id &&
          e.targetHandle === "grammar"
      );

      let grammar = null;
      if (grammarEdge) {
        const grammarOutput = nodeOutputs[grammarEdge.source];
        if (grammarOutput && grammarOutput.type === "buildingGrammar") {
          grammar = grammarOutput;
        }
      }

      return {
        id: buildingNode.id,
        positionX: buildingOutput?.positionX ?? buildingNode.data?.positionX ?? 0,
        positionY: buildingOutput?.positionY ?? buildingNode.data?.positionY ?? 0,
        positionZ: buildingOutput?.positionZ ?? buildingNode.data?.positionZ ?? 0,
        color: buildingOutput?.color ?? buildingNode.data?.color ?? "#ffffff",
        grammar,
      };
    });

    onBuildingConfigChange(buildings);
  }, [nodes, edges, nodeOutputs, onBuildingConfigChange]);

  useEffect(() => {
    if (typeof onFlowerConfigChange !== "function") return;

    const flowerNodes = nodes.filter((n) => n.type === "flower");

    if (flowerNodes.length === 0) {
      onFlowerConfigChange([]);
      return;
    }

    const flowers = flowerNodes.map((flowerNode) => {
      const flowerOutput = nodeOutputs[flowerNode.id];

      const noiseEdge = edges.find(
        (e) =>
          e.target === flowerNode.id &&
          e.targetHandle === "noise"
      );

      let noiseConfig = null;
      if (noiseEdge) {
        const noiseOutput = nodeOutputs[noiseEdge.source];
        if (noiseOutput && (noiseOutput.type === "perlinNoise" || noiseOutput.seed !== undefined)) {
          noiseConfig = noiseOutput;
        }
      }

      return {
        id: flowerNode.id,
        count: flowerOutput?.count ?? flowerNode.data?.count ?? 50,
        spread: flowerOutput?.spread ?? flowerNode.data?.spread ?? 50.0,
        size: flowerOutput?.size ?? flowerNode.data?.size ?? 0.2,
        noiseConfig,
      };
    });

    onFlowerConfigChange(flowers);
  }, [nodes, edges, nodeOutputs, onFlowerConfigChange]);

  useEffect(() => {
    if (typeof onNPCConfigChange !== "function") return;

    const npcNodes = nodes.filter((n) => n.type === "npc");

    if (npcNodes.length === 0) {
      onNPCConfigChange([]);
      return;
    }

    const npcs = npcNodes.map((npcNode) => {
      const npcOutput = nodeOutputs[npcNode.id];

      return {
        id: npcNode.id,
        positionX: npcOutput?.positionX ?? npcNode.data?.positionX ?? 0,
        positionY: npcOutput?.positionY ?? npcNode.data?.positionY ?? 0,
        positionZ: npcOutput?.positionZ ?? npcNode.data?.positionZ ?? 0,
        movementType: npcOutput?.movementType ?? npcNode.data?.movementType ?? "random",
        speed: npcOutput?.speed ?? npcNode.data?.speed ?? 2.0,
        wanderRadius: npcOutput?.wanderRadius ?? npcNode.data?.wanderRadius ?? 10.0,
        wanderCenterX: npcOutput?.wanderCenterX ?? npcNode.data?.wanderCenterX ?? 0,
        wanderCenterY: npcOutput?.wanderCenterY ?? npcNode.data?.wanderCenterY ?? 0,
        wanderCenterZ: npcOutput?.wanderCenterZ ?? npcNode.data?.wanderCenterZ ?? 0,
        interactionRadius: npcOutput?.interactionRadius ?? npcNode.data?.interactionRadius ?? 5.0,
        dialogueWords: npcOutput?.dialogueWords ?? npcNode.data?.dialogueWords ?? [],
        dialogueLength: npcOutput?.dialogueLength ?? npcNode.data?.dialogueLength ?? 5,
        color: npcOutput?.color ?? npcNode.data?.color ?? "#4a90e2",
        size: npcOutput?.size ?? npcNode.data?.size ?? 1.0,
      };
    });

    onNPCConfigChange(npcs);
  }, [nodes, edges, nodeOutputs, onNPCConfigChange]);

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

  const handleAddTerrainNode = () => addNodeToEnvironment(createTerrainNode());
  const handleAddPerlinNoise = () => addNodeToEnvironment(createPerlinNoiseNode());
  const handleAddVoronoiNoise = () => addNodeToEnvironment(createVoronoiNoiseNode());
  const handleAddRidgeNoise = () => addNodeToEnvironment(createRidgeNoiseNode());
  const handleAddSimplexNoise = () => addNodeToEnvironment(createSimplexNoiseNode());
  const handleAddAgentNode = () => addNodeToEnvironment(createAgentNode());
  const handleAddFlockingNode = () => addNodeToEnvironment(createFlockingNode());
  const handleAddNPCNode = () => addNodeToEnvironment(createNPCNode());
  const handleAddLSystemNode = () => addNodeToEnvironment(createLSystemNode());
  const handleAddPlantNode = () => addNodeToEnvironment(createPlantNode());
  const handleAddFlowerNode = () => addNodeToEnvironment(createFlowerNode());
  const handleAddBuildingGrammarNode = () => addNodeToEnvironment(createBuildingGrammarNode());
  const handleAddShapeGrammarNode = () => addNodeToEnvironment(createShapeGrammarNode());
  const handleAddMarkovChainNode = () => addNodeToEnvironment(createMarkovChainNode());
  const handleAddParametricCurveNode = () => addNodeToEnvironment(createParametricCurveNode());
  const handleAddBuildingNode = () => addNodeToEnvironment(createBuildingNode());
  const handleAddCellularAutomataNode = () => addNodeToEnvironment(createCellularAutomataNode());
  const handleAddParticleSystemNode = () => addNodeToEnvironment(createParticleSystemNode());
  const handleAddWavePropagationNode = () => addNodeToEnvironment(createWavePropagationNode());

  function onConnect(params) {
    setEdges((prev) => addEdge({ ...params, animated: true }, prev));
  }

  // Handle node selection change
  const onSelectionChange = useCallback(({ nodes: selectedNodes }) => {
    const selectedIds = new Set(selectedNodes.map((n) => n.id));
    setSelectedNodeIds(selectedIds);
  }, []);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle if user is typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target.isContentEditable
      ) {
        return;
      }

      // Copy (Ctrl+C or Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        const currentNodes = nodesRef.current;
        const currentSelectedIds = selectedNodeIdsRef.current;
        const selectedNodes = currentNodes.filter((n) => currentSelectedIds.has(n.id));
        
        if (selectedNodes.length > 0) {
          e.preventDefault();
          // Store node data without handlers
          const nodesToCopy = selectedNodes.map((node) => {
            const { onChange, onOutput, ...nodeData } = node.data || {};
            return {
              ...node,
              data: nodeData,
            };
          });
          setCopiedNodes(nodesToCopy);
          console.log(`Copied ${nodesToCopy.length} node(s)`);
        }
      }
      
      // Paste (Ctrl+V or Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        const currentCopiedNodes = copiedNodesRef.current;
        
        if (currentCopiedNodes.length > 0) {
          e.preventDefault();
          
          // Generate new IDs and offset positions
          const offsetX = 50;
          const offsetY = 50;
          
          const newNodes = currentCopiedNodes.map((node) => {
            const newId = `${node.type}-${Math.random().toString(36).slice(2, 8)}`;
            
            return {
              ...node,
              id: newId,
              position: {
                x: node.position.x + offsetX,
                y: node.position.y + offsetY,
              },
              selected: false,
            };
          });

          // Attach handlers and add to canvas
          const wrappedNodes = newNodes.map((node) => attachNodeHandlers(node));
          setNodes((prev) => [...prev, ...wrappedNodes]);
          
          // Select newly pasted nodes
          setSelectedNodeIds(new Set(newNodes.map((n) => n.id)));
          
          console.log(`Pasted ${newNodes.length} node(s)`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="author-shell">
      <AuthorSidebar
        activeDomain={activeDomain}
        setActiveDomain={setActiveDomain}
        onAddTerrainNode={handleAddTerrainNode}
        onAddPerlinNoise={handleAddPerlinNoise}
        onAddVoronoiNoise={handleAddVoronoiNoise}
        onAddRidgeNoise={handleAddRidgeNoise}
        onAddSimplexNoise={handleAddSimplexNoise}
        onAddAgentNode={handleAddAgentNode}
        onAddFlockingNode={handleAddFlockingNode}
        onAddNPCNode={handleAddNPCNode}
        onAddLSystemNode={handleAddLSystemNode}
        onAddPlantNode={handleAddPlantNode}
        onAddFlowerNode={handleAddFlowerNode}
        onAddBuildingGrammarNode={handleAddBuildingGrammarNode}
        onAddShapeGrammarNode={handleAddShapeGrammarNode}
        onAddMarkovChainNode={handleAddMarkovChainNode}
        onAddParametricCurveNode={handleAddParametricCurveNode}
        onAddBuildingNode={handleAddBuildingNode}
        onAddCellularAutomataNode={handleAddCellularAutomataNode}
        onAddParticleSystemNode={handleAddParticleSystemNode}
        onAddWavePropagationNode={handleAddWavePropagationNode}
      />

      <AuthorFlowCanvas
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
}
