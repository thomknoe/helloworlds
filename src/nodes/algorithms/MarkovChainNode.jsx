import { useEffect } from "react";
import { Handle, Position } from "reactflow";
import { MarkovChain } from "../../algorithms/markovChain.js";

export default function MarkovChainNode({ id, data }) {
  const {
    label = "Markov Chain",
    states = "A,B,C",
    sequenceLength = 10,
    onChange,
    onOutput,
  } = data || {};

  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();

  useEffect(() => {
    const stateArray = states.split(",").map(s => s.trim()).filter(s => s.length > 0);
    if (stateArray.length === 0) {
      stateArray.push("A", "B", "C");
    }

    const chain = new MarkovChain({
      states: stateArray,
    });

    const sequence = chain.generateSequence(sequenceLength);

    onOutput?.({
      id,
      type: "markovChain",
      states: stateArray,
      sequenceLength,
      sequence,
      currentState: chain.getCurrentState(),
    });
  }, [id, states, sequenceLength, onOutput]);

  return (
    <div className="node-default node-markov-chain">
      <div className="node-title">{label}</div>

      <div className="node-param-row">
        <div className="node-param-label">States</div>
        <input
          className="node-param-input"
          type="text"
          value={states}
          placeholder="A,B,C"
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ states: e.target.value })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Sequence Length</div>
        <input
          className="node-param-input"
          type="number"
          min={1}
          max={100}
          value={sequenceLength}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ sequenceLength: Number(e.target.value) })}
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
        Markov Chain →
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

