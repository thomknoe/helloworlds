import { useState, useCallback, useEffect } from "react";
import PlayerView from "./player/PlayerView.jsx";
import AuthorCanvas from "./ui/AuthorCanvas.jsx";
import Portal from "./ui/Portal.jsx";

export default function App() {
  const [isAuthorMode, setIsAuthorMode] = useState(false);
  const [terrainConfig, setTerrainConfig] = useState(null);

  // NEW — NPC configuration storage
  const [npcConfigs, setNPCConfigs] = useState([]);

  const toggleAuthorMode = useCallback(() => {
    setIsAuthorMode((prev) => !prev);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key.toLowerCase() === "p") {
        e.preventDefault();
        toggleAuthorMode();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleAuthorMode]);

  return (
    <>
      <PlayerView
        isAuthorMode={isAuthorMode}
        terrainConfig={terrainConfig}
        npcConfigs={npcConfigs}     // ← NEW
      />

      <Portal>
        {!isAuthorMode && (
          <div className="hud">
            <div className="hud-title">Controls</div>
            <div className="hud-row">W / A / S / D — Move</div>
            <div className="hud-row">Mouse — Look</div>
            <div className="hud-row">Click — Pointer Lock</div>
            <div className="hud-row">P — Author Mode</div>
          </div>
        )}

        <div
          className="author-backdrop"
          style={{ display: isAuthorMode ? "flex" : "none" }}
        >
          <div className="author-overlay-shell">
            <AuthorCanvas
              onTerrainConfigChange={setTerrainConfig}
              onNPCConfigChange={setNPCConfigs}    // ← NEW
            />
          </div>
        </div>
      </Portal>
    </>
  );
}
