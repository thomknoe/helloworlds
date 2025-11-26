// src/nodes/characters/NPCNode.jsx
import { Handle, Position } from "reactflow";
import { useRef } from "react";

export default function NPCNode({ id, data }) {
  const {
    name = "NPC",
    apiKey = "",
    modelFile = null,
    onChange,
    onOutput
  } = data || {};

  const fileRef = useRef(null);

  // Unified update helper — pushes new data to parent + graph pipeline
  const update = (patch) => {
    const next = { ...data, ...patch };
    onChange?.(next);
    onOutput?.({ id, ...next });
  };

  const stop = (e) => e.stopPropagation();

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    update({ modelFile: file });
  };

  return (
    <div className="node-default node-npc">
      <div className="node-title">NPC</div>

      {/* NPC NAME */}
      <div className="node-param-row">
        <div className="node-param-label">Name</div>
        <input
          className="node-param-input"
          type="text"
          value={name}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ name: e.target.value })}
        />
      </div>

      {/* OPENAI KEY */}
      <div className="node-param-row">
        <div className="node-param-label">OpenAI Key</div>
<input
  className="node-param-input"
  type="text"
  value={apiKey}
  onPointerDown={stop}
  onChange={(e) => update({ apiKey: e.target.value })}
/>

      </div>

      {/* STL FILE UPLOAD */}
      <div
        className="node-param-row"
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "4px"
        }}
      >
        <div className="node-param-label">STL Model</div>

        <input
          ref={fileRef}
          type="file"
          accept=".stl"
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={handleFileUpload}
          style={{ fontSize: "11px" }}
        />

        {modelFile && (
          <div style={{ fontSize: "10px", opacity: 0.7 }}>
            {modelFile.name}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} id="npcOut" />
    </div>
  );
}
