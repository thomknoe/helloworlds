import { useEffect } from "react";
import { Handle, Position } from "reactflow";
import { ParametricCurve } from "../../algorithms/parametricCurves.js";
import * as THREE from "three";
export default function ParametricCurveNode({ id, data }) {
  const {
    label = "Parametric Curve",
    curveType = "bezier",
    segments = 50,
    controlPointsX = "0,5,10,15",
    controlPointsY = "0,0,0,0",
    controlPointsZ = "0,5,0,5",
    onChange,
    onOutput,
  } = data || {};
  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();
  useEffect(() => {
    const xCoords = controlPointsX.split(",").map(s => parseFloat(s.trim()) || 0);
    const yCoords = controlPointsY.split(",").map(s => parseFloat(s.trim()) || 0);
    const zCoords = controlPointsZ.split(",").map(s => parseFloat(s.trim()) || 0);
    const maxLength = Math.max(xCoords.length, yCoords.length, zCoords.length);
    const controlPoints = [];
    for (let i = 0; i < maxLength; i++) {
      controlPoints.push(new THREE.Vector3(
        xCoords[i] || 0,
        yCoords[i] || 0,
        zCoords[i] || 0
      ));
    }
    if (controlPoints.length < 2) {
      controlPoints.push(new THREE.Vector3(0, 0, 0));
      controlPoints.push(new THREE.Vector3(10, 0, 10));
    }
    const curve = new ParametricCurve({
      curveType,
      controlPoints,
      segments,
    });
    const points = curve.generatePoints();
    const length = curve.getLength();
    onOutput?.({
      id,
      type: "parametricCurve",
      curveType,
      segments,
      controlPoints: controlPoints.map(p => ({ x: p.x, y: p.y, z: p.z })),
      points: points.map(p => ({ x: p.x, y: p.y, z: p.z })),
      length,
    });
  }, [id, curveType, segments, controlPointsX, controlPointsY, controlPointsZ, onOutput]);
  return (
    <div className="node-default node-parametric-curve">
      <div className="node-title">{label}</div>
      <div className="node-param-row">
        <div className="node-param-label">Curve Type</div>
        <select
          className="node-param-input"
          value={curveType}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ curveType: e.target.value })}
        >
          <option value="bezier">Bezier</option>
          <option value="spline">Spline</option>
          <option value="line">Line</option>
        </select>
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Segments</div>
        <input
          className="node-param-input"
          type="number"
          min={10}
          max={200}
          value={segments}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ segments: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Control X</div>
        <input
          className="node-param-input"
          type="text"
          value={controlPointsX}
          placeholder="0,5,10,15"
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ controlPointsX: e.target.value })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Control Y</div>
        <input
          className="node-param-input"
          type="text"
          value={controlPointsY}
          placeholder="0,0,0,0"
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ controlPointsY: e.target.value })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Control Z</div>
        <input
          className="node-param-input"
          type="text"
          value={controlPointsZ}
          placeholder="0,5,0,5"
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ controlPointsZ: e.target.value })}
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
        Parametric Curve →
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
