import { Globe, User, Box, GitBranch } from "lucide-react";

const DOMAINS = [
  { id: "environment", label: "Environment", icon: Globe },
  { id: "characters", label: "Characters", icon: User },
  { id: "objects", label: "Objects", icon: Box },
  { id: "scenarios", label: "Scenarios", icon: GitBranch },
];

export default function AuthorSidebar({
  activeDomain,
  setActiveDomain,

  // Environment nodes
  onAddTerrainNode,
  onAddPerlinNoise,
  onAddNumberSlider,
  onAddPanelNode,

  // Character nodes
  onAddNPCNode
}) {
  return (
    <aside className="author-sidebar">
      {/* -----------------------------------------------------
         DOMAIN SELECTOR
      ------------------------------------------------------ */}
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

      {/* -----------------------------------------------------
         NODE LIBRARY
      ------------------------------------------------------ */}
      <div className="domain-section-shell preset-shell-full">
        <div className="preset-library">
          <div className="preset-library-title">
            {activeDomain.charAt(0).toUpperCase() + activeDomain.slice(1)} Nodes
          </div>

          <div className="preset-library-list">

            {/* ENVIRONMENT DOMAIN */}
            {activeDomain === "environment" && (
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

                <button
                  className="preset-node-item"
                  onClick={onAddNumberSlider}
                >
                  Add Number Slider Node
                </button>

                <button
                  className="preset-node-item"
                  onClick={onAddPanelNode}
                >
                  Add Panel Node
                </button>
              </div>
            )}

            {/* CHARACTERS DOMAIN */}
            {activeDomain === "characters" && (
              <div className="preset-node-list">
                <button
                  className="preset-node-item"
                  onClick={onAddNPCNode}
                >
                  Add NPC
                </button>
              </div>
            )}

            {/* OBJECTS DOMAIN */}
            {activeDomain === "objects" && (
              <div className="preset-placeholder">
                No object nodes yet.
              </div>
            )}

            {/* SCENARIOS DOMAIN */}
            {activeDomain === "scenarios" && (
              <div className="preset-placeholder">
                No scenario nodes yet.
              </div>
            )}

          </div>
        </div>
      </div>
    </aside>
  );
}
