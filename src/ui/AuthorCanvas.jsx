import { useState, useMemo, useEffect } from "react";
import { useNodesState, useEdgesState, addEdge } from "reactflow";
import "reactflow/dist/style.css";

import AuthorSidebar from "./AuthorSidebar.jsx";
import AuthorFlowCanvas from "./AuthorFlowCanvas.jsx";
import AuthorInspector from "./AuthorInspector.jsx";

import { nodeRegistry } from "../nodes/registry.js";
import {
  createPerlinNoiseNode,
  createTerrainNode,
} from "../nodes/factory/environmentNodes.js";

import { createAgentNode, createFlockingNode } from "../nodes/factory/agentNodes.js";
import { createLSystemNode, createPlantNode, createFlowerNode } from "../nodes/factory/simulationNodes.js";
import { createBuildingGrammarNode, createBuildingNode } from "../nodes/factory/structuralNodes.js";

const initialNodes = [];
const initialEdges = [];

export default function AuthorCanvas({
  onTerrainConfigChange,
  onFlockingConfigChange,
  onPlantConfigChange,
  onBuildingConfigChange,
  onFlowerConfigChange
}) {
  const [activeDomain, setActiveDomain] = useState("noiseHeightfields");

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [nodeOutputs, setNodeOutputs] = useState({});
  const nodeTypes = useMemo(() => nodeRegistry, []);

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
  const handleAddAgentNode = () => addNodeToEnvironment(createAgentNode());
  const handleAddFlockingNode = () => addNodeToEnvironment(createFlockingNode());
  const handleAddLSystemNode = () => addNodeToEnvironment(createLSystemNode());
  const handleAddPlantNode = () => addNodeToEnvironment(createPlantNode());
  const handleAddFlowerNode = () => addNodeToEnvironment(createFlowerNode());
  const handleAddBuildingGrammarNode = () => addNodeToEnvironment(createBuildingGrammarNode());
  const handleAddBuildingNode = () => addNodeToEnvironment(createBuildingNode());

  function onConnect(params) {
    setEdges((prev) => addEdge({ ...params, animated: true }, prev));
  }

  return (
    <div className="author-shell">
      <AuthorSidebar
        activeDomain={activeDomain}
        setActiveDomain={setActiveDomain}
        onAddTerrainNode={handleAddTerrainNode}
        onAddPerlinNoise={handleAddPerlinNoise}
        onAddAgentNode={handleAddAgentNode}
        onAddFlockingNode={handleAddFlockingNode}
        onAddLSystemNode={handleAddLSystemNode}
        onAddPlantNode={handleAddPlantNode}
        onAddFlowerNode={handleAddFlowerNode}
        onAddBuildingGrammarNode={handleAddBuildingGrammarNode}
        onAddBuildingNode={handleAddBuildingNode}
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
