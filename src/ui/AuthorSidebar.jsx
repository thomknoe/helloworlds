import { Waves, Zap, Network, Users } from "lucide-react";

const DOMAINS = [
  { id: "noiseHeightfields", label: "Noise & Heightfields", icon: Waves },
  { id: "simulationNatural", label: "Simulation & Natural Systems", icon: Zap },
  { id: "structuralGenerative", label: "Structural / Generative Grammars", icon: Network },
  { id: "agentBehavior", label: "Agent & Behavior Systems", icon: Users },
];

export default function AuthorSidebar({
  activeDomain,
  setActiveDomain,
  onAddTerrainNode,
  onAddPerlinNoise,
  onAddAgentNode,
  onAddFlockingNode,
  onAddLSystemNode,
  onAddPlantNode,
  onAddFlowerNode,
  onAddBuildingGrammarNode,
  onAddBuildingNode
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
                  onClick={onAddTerrainNode}
                >
                  Add Terrain Node
                </button>

                <button
                  className="preset-node-item"
                  onClick={onAddPerlinNoise}
                >
                  Add Perlin Noise Node
                </button>
              </div>
            )}

            {activeDomain === "simulationNatural" && (
              <div className="preset-node-list">
                <button
                  className="preset-node-item"
                  onClick={onAddLSystemNode}
                >
                  Add L-System Node
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
              </div>
            )}

            {activeDomain === "structuralGenerative" && (
              <div className="preset-node-list">
                <button
                  className="preset-node-item"
                  onClick={onAddBuildingGrammarNode}
                >
                  Add Building Grammar Node
                </button>
                <button
                  className="preset-node-item"
                  onClick={onAddBuildingNode}
                >
                  Add Building Node
                </button>
              </div>
            )}

            {activeDomain === "agentBehavior" && (
              <div className="preset-node-list">
                <button
                  className="preset-node-item"
                  onClick={onAddAgentNode}
                >
                  Add Agents Node
                </button>
                <button
                  className="preset-node-item"
                  onClick={onAddFlockingNode}
                >
                  Add Flocking Behavior Node
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </aside>
  );
}
