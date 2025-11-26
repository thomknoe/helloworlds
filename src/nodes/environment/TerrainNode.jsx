// src/nodes/TerrainNode.jsx
import { Handle, Position } from "reactflow";

/* eslint-disable no-unused-vars */
export default function TerrainNode({ id, data }) {
  // The PerlinNoiseNode now passes ALL parameters directly via data.onOutput
  // AuthorCanvas injects those values into this node's `data`.
  const hasNoiseInput =
    data?.seed !== undefined ||
    data?.scale !== undefined ||
    data?.octaves !== undefined ||
    data?.persistence !== undefined ||
    data?.amplitude !== undefined ||
    data?.frequency !== undefined;

  // Status messaging
  let status = "Waiting for Perlin input…";
  if (hasNoiseInput) {
    status = "Reading noise values…";
  }

  return (
    <div className="node-default node-terrain">
      <div className="node-title">Terrain</div>

      <div className="node-body">
        <div className="node-terrain-status">{status}</div>
      </div>

      {/* Accept Perlin config */}
      <Handle
        type="target"
        position={Position.Left}
        id="config"
        style={{ top: 40 }}
      />

      {/* Forward terrain config downstream if needed */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: 40 }}
      />
    </div>
  );
}
