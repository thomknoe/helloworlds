import { useEffect } from "react";
import { Handle, Position } from "reactflow";
export default function ParticleSystemNode({ id, data }) {
  const {
    label = "Particle System",
    maxParticles = 1000,
    spawnRate = 10,
    gravityX = 0,
    gravityY = -9.8,
    gravityZ = 0,
    windX = 0,
    windY = 0,
    windZ = 0,
    spawnX = 0,
    spawnY = 50,
    spawnZ = 0,
    spawnSizeX = 10,
    spawnSizeY = 5,
    spawnSizeZ = 10,
    lifetime = 5.0,
    onChange,
    onOutput,
  } = data || {};
  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();
  useEffect(() => {
    onOutput?.({
      id,
      type: "particleSystem",
      maxParticles,
      spawnRate,
      gravityX,
      gravityY,
      gravityZ,
      windX,
      windY,
      windZ,
      spawnX,
      spawnY,
      spawnZ,
      spawnSizeX,
      spawnSizeY,
      spawnSizeZ,
      lifetime,
    });
  }, [
    id,
    maxParticles,
    spawnRate,
    gravityX,
    gravityY,
    gravityZ,
    windX,
    windY,
    windZ,
    spawnX,
    spawnY,
    spawnZ,
    spawnSizeX,
    spawnSizeY,
    spawnSizeZ,
    lifetime,
    onOutput,
  ]);
  return (
    <div className="node-default node-particle-system">
      <div className="node-title">{label}</div>
      <div className="node-param-row">
        <div className="node-param-label">Max Particles</div>
        <input
          className="node-param-input"
          type="number"
          min={1}
          max={10000}
          value={maxParticles}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ maxParticles: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Spawn Rate</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          min="0"
          value={spawnRate}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ spawnRate: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Gravity Y</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          value={gravityY}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ gravityY: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Wind X</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          value={windX}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ windX: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Wind Z</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          value={windZ}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ windZ: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Lifetime</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          min="0"
          value={lifetime}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ lifetime: Number(e.target.value) })}
        />
      </div>
      <div style={{
        position: 'absolute',
        right: '-100px',
        top: '40px',
        fontSize: '11px',
        color: '#4a9e4a',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        pointerEvents: 'none'
      }}>
        Particle System →
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="config"
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
