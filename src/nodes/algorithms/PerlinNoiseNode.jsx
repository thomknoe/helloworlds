import { useEffect, useRef } from "react";
import { Handle, Position } from "reactflow";
import Perlin from "../../algorithms/perlin.js";

export default function PerlinNoiseNode({ id, data }) {
  const {
    label = "Perlin Noise",
    seed = 42,
    scale = 0.05,
    octaves = 4,
    persistence = 0.5,
    amplitude = 10,
    frequency = 1,
    onChange,
    onOutput,
  } = data || {};

  const canvasRef = useRef(null);
  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    Perlin.init(seed);

    const safeScale = scale > 0 ? scale : 0.0001;
    const safePersistence = persistence <= 0 ? 0.01 : persistence;
    const safeOctaves = Math.max(1, Math.floor(octaves));
    const safeFreq = frequency <= 0 ? 1 : frequency;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {

        const nx = (x / width - 0.5);
        const ny = (y / height - 0.5);

        let value = 0;
        let amp = 1;
        let freq = safeFreq;
        let maxAmp = 0;

        for (let o = 0; o < safeOctaves; o++) {
          value += Perlin.noise2D(nx * freq / safeScale, ny * freq / safeScale) * amp;
          maxAmp += amp;
          amp *= safePersistence;
          freq *= 2;
        }

        value = value / maxAmp;
        value = (value + 1) / 2;

        value = Math.min(1, Math.max(0, value * (amplitude / 10)));

        const col = Math.floor(value * 255);
        const idx = (y * width + x) * 4;

        pixels[idx] = col;
        pixels[idx + 1] = col;
        pixels[idx + 2] = col;
        pixels[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [seed, scale, octaves, persistence, amplitude, frequency]);

  useEffect(() => {
    Perlin.init(seed);
    const value = Perlin.noise2D(seed * scale, seed * scale);

    onOutput?.({
      id,
      type: "perlinNoise",
      value,
      seed,
      scale,
      octaves,
      persistence,
      amplitude,
      frequency,
    });
  }, [id, seed, scale, octaves, persistence, amplitude, frequency, onOutput]);

  return (
    <div className="node-default node-perlin">
      <Handle type="target" position={Position.Left} id="seed" style={{ top: 40 }} />
      <Handle type="target" position={Position.Left} id="scale" style={{ top: 70 }} />
      <Handle type="target" position={Position.Left} id="octaves" style={{ top: 100 }} />
      <Handle type="target" position={Position.Left} id="persistence" style={{ top: 130 }} />
      <Handle type="target" position={Position.Left} id="amplitude" style={{ top: 160 }} />
      <Handle type="target" position={Position.Left} id="frequency" style={{ top: 190 }} />

      <div className="node-title">{label}</div>

      <canvas
        ref={canvasRef}
        width={160}
        height={120}
        style={{
          width: "160px",
          height: "120px",
          borderRadius: "8px",
          overflow: "hidden",
          margin: "6px 0 8px 0",
          background: "#111",
        }}
        onMouseDown={stop}
        onPointerDown={stop}
        onClick={stop}
      />

      <div className="node-param-row">
        <div className="node-param-label">Seed</div>
        <input
          className="node-param-input"
          type="number"
          value={seed}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ seed: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Scale</div>
        <input
          className="node-param-input"
          type="number"
          step="0.001"
          value={scale}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ scale: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Octaves</div>
        <input
          className="node-param-input"
          type="number"
          min={1}
          max={8}
          value={octaves}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ octaves: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Persistence</div>
        <input
          className="node-param-input"
          type="number"
          step="0.01"
          value={persistence}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ persistence: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Amplitude</div>
        <input
          className="node-param-input"
          type="number"
          value={amplitude}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ amplitude: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Frequency</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          value={frequency}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ frequency: Number(e.target.value) })}
        />
      </div>

      <div style={{
        position: 'absolute',
        right: '-100px',
        top: '115px',
        fontSize: '11px',
        color: '#4a9e4a',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        pointerEvents: 'none'
      }}>
        Perlin Noise →
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="config"
        style={{
          top: 120,
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
