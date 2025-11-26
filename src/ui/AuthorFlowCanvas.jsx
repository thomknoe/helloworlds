// src/components/AuthorFlowCanvas.jsx

import ReactFlow, { Background, Controls } from "reactflow";

export default function AuthorFlowCanvas({
  nodes,
  edges,
  nodeTypes,
  onNodesChange,
  onEdgesChange,
  onConnect
}) {
  return (
    <main className="author-main">
      <div className="author-main-inner">
        <div className="author-flow-wrapper">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            className="author-flow"
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </main>
  );
}
