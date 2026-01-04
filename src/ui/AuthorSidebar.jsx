import { Waves, Zap, Network, Users } from "lucide-react";

const DOMAINS = [
  { id: "noiseHeightfields", label: "Noise & Heightfields", icon: Waves },
  { id: "simulationNatural", label: "Simulations & Systems", icon: Zap },
  { id: "structuralGenerative", label: "Structures & Grammars", icon: Network },
  { id: "agentBehavior", label: "Agent & Entities", icon: Users },
];

export default function AuthorSidebar({
  activeDomain,
  setActiveDomain,
  onAddTerrainNode,
  onAddPerlinNoise,
  onAddVoronoiNoise,
  onAddRidgeNoise,
  onAddSimplexNoise,
  onAddAgentNode,
  onAddFlockingNode,
  onAddLSystemNode,
  onAddPlantNode,
  onAddFlowerNode,
  onAddBuildingGrammarNode,
  onAddShapeGrammarNode,
  onAddMarkovChainNode,
  onAddParametricCurveNode,
  onAddBuildingNode,
  onAddCellularAutomataNode,
  onAddParticleSystemNode,
  onAddWavePropagationNode,
}) {
  return (
    <aside className="author-sidebar">
      <div className="domain-section-shell">
        <div className="author-sidebar-header">
          <div className="author-sidebar-title">World Builder</div>
          <div className="author-sidebar-subtitle">
            Select what you're editing.
          </div>
        </div>

        <div className="domain-tab-container">
          {DOMAINS.map((dom) => (
            <button
              key={dom.id}
              className={`domain-tab ${activeDomain === dom.id ? "active" : ""}`}
              onClick={() => setActiveDomain(dom.id)}
            >
              <dom.icon
                size={16}
                strokeWidth={1.75}
                className="domain-tab-icon"
              />
              {dom.label}
            </button>
          ))}
        </div>
      </div>

      <div className="domain-section-shell preset-shell-full">
        <div className="preset-library">
          <div className="preset-library-title">
            {activeDomain.charAt(0).toUpperCase() + activeDomain.slice(1)} Nodes
          </div>

          <div className="preset-library-list">

            {activeDomain === "noiseHeightfields" && (
              <div className="preset-node-list">
                <button
                  className="preset-node-item"
                  onClick={onAddPerlinNoise}
                >
                  Add Perlin Noise Node
                </button>

                <button
                  className="preset-node-item"
                  onClick={onAddVoronoiNoise}
                >
                  Add Voronoi Noise Node
                </button>

                <button
                  className="preset-node-item"
                  onClick={onAddRidgeNoise}
                >
                  Add Ridge Noise Node
                </button>

                <button
                  className="preset-node-item"
                  onClick={onAddSimplexNoise}
                >
                  Add Simplex Noise Node
                </button>
              </div>
            )}

            {activeDomain === "simulationNatural" && (
              <div className="preset-node-list">
                <button
                  className="preset-node-item"
                  onClick={onAddFlockingNode}
                >
                  Add Flocking Behavior Node
                </button>
                <button
                  className="preset-node-item"
                  onClick={onAddCellularAutomataNode}
                >
                  Add Cellular Automata Node
                </button>
                <button
                  className="preset-node-item"
                  onClick={onAddParticleSystemNode}
                >
                  Add Particle System Node
                </button>
                <button
                  className="preset-node-item"
                  onClick={onAddWavePropagationNode}
                >
                  Add Wave Propagation Node
                </button>
              </div>
            )}

            {activeDomain === "structuralGenerative" && (
              <div className="preset-node-list">
                <button
                  className="preset-node-item"
                  onClick={onAddLSystemNode}
                >
                  Add L-System Node
                </button>
                <button
                  className="preset-node-item"
                  onClick={onAddShapeGrammarNode}
                >
                  Add Shape Grammar Node
                </button>
                <button
                  className="preset-node-item"
                  onClick={onAddMarkovChainNode}
                >
                  Add Markov Chain Node
                </button>
                <button
                  className="preset-node-item"
                  onClick={onAddParametricCurveNode}
                >
                  Add Parametric Curve Node
                </button>
              </div>
            )}

            {activeDomain === "agentBehavior" && (
              <div className="preset-node-list">
                <button
                  className="preset-node-item"
                  onClick={onAddTerrainNode}
                >
                  Add Terrain Node
                </button>
                <button
                  className="preset-node-item"
                  onClick={onAddAgentNode}
                >
                  Add Boids Node
                </button>
                <button
                  className="preset-node-item"
                  onClick={onAddPlantNode}
                >
                  Add Plant Node
                </button>
                <button
                  className="preset-node-item"
                  onClick={onAddFlowerNode}
                >
                  Add Flower Node
                </button>
                <button
                  className="preset-node-item"
                  onClick={onAddBuildingNode}
                >
                  Add Building Node
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </aside>
  );
}
