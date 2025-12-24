import { Handle, Position } from "reactflow";

export default function TerrainNode({ id, data }) {

  const hasNoiseInput =
    data?.seed !== undefined ||
    data?.scale !== undefined ||
    data?.octaves !== undefined ||
    data?.persistence !== undefined ||
    data?.amplitude !== undefined ||
    data?.frequency !== undefined;

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

      <div style={{
        position: 'absolute',
        left: '-90px',
        top: '35px',
        fontSize: '11px',
        color: '#4a90e2',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        pointerEvents: 'none'
      }}>
        ← Perlin Noise
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="config"
        style={{
          top: 40,
          width: '12px',
          height: '12px',
          background: '#4a90e2',
          border: '2px solid #ffffff',
          boxShadow: '0 0 8px rgba(74, 144, 226, 0.6)'
        }}
      />

      <div style={{
        position: 'absolute',
        right: '-80px',
        top: '35px',
        fontSize: '11px',
        color: '#4a9e4a',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        pointerEvents: 'none'
      }}>
        Terrain →
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{
          top: 40,
          width: '12px',
          height: '12px',
          background: '#4a9e4a',
          border: '2px solid #ffffff',
          boxShadow: '0 0 8px rgba(74, 158, 74, 0.6)'
        }}
      />
    </div>
  );
}
