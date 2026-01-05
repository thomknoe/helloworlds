import ReactFlow, { Background, Controls } from "reactflow";
export default function AuthorFlowCanvas({
  nodes,
  edges,
  nodeTypes,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectionChange
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
            onSelectionChange={onSelectionChange}
            className="author-flow"
            deleteKeyCode={["Backspace", "Delete"]}
            multiSelectionKeyCode={["Meta", "Control"]}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </main>
  );
}
