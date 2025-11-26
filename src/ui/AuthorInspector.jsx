/* eslint-disable no-unused-vars */
// src/components/AuthorInspector.jsx
import TerrainPreview from "./TerrainPreview.jsx";

export default function AuthorInspector({ activeDomain }) {
  // ---------------------------------------------
  // MAP DOMAIN -> PREVIEW TITLE + COMPONENT
  // ---------------------------------------------
  const previews = {
    environment: {
      title: "Terrain Preview",
      component: <TerrainPreview />,
    },
    characters: {
      title: "Character Preview",
      component: (
        <div className="inspector-placeholder">
        </div>
      ),
    },
    objects: {
      title: "Object Preview",
      component: (
        <div className="inspector-placeholder">
        </div>
      ),
    },
    scenarios: {
      title: "Scenario Preview",
      component: (
        <div className="inspector-placeholder">
        </div>
      ),
    },
  };

  // fallback if domain missing
  const { title, component } = previews[activeDomain] || previews.environment;

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
