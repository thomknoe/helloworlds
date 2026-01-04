import TerrainPreview from "./TerrainPreview.jsx";

export default function AuthorInspector({ activeDomain }) {
  const previews = {
    noiseHeightfields: {
      title: "Terrain Preview",
      component: <TerrainPreview />,
    },
    simulationNatural: {
      title: "Simulations & Systems Preview",
      component: (
        <div className="inspector-placeholder">
          Simulations & systems preview coming soon.
        </div>
      ),
    },
    structuralGenerative: {
      title: "Structures & Grammars Preview",
      component: (
        <div className="inspector-placeholder">
          Structures & grammars preview coming soon.
        </div>
      ),
    },
    agentBehavior: {
      title: "Agent & Entities Preview",
      component: (
        <div className="inspector-placeholder">
          Agent & entities preview coming soon.
        </div>
      ),
    },
  };

  const { title, component } = previews[activeDomain] || previews.noiseHeightfields;

  return (
    <aside className="author-inspector">
      <div className="inspector-preview-block">
        <div className="inspector-preview-title">{title}</div>
        <div className="inspector-preview-canvas">{component}</div>
      </div>

      <div className="chatbot-shell">
        <div className="chatbot-title">World Assistant</div>
        <div className="chatbot-body">
          <div className="chatbot-placeholder">Chatbot coming soon.</div>
        </div>
      </div>
    </aside>
  );
}
