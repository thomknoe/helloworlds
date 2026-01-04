import { useState, useCallback, useEffect } from "react";
import PlayerView from "./player/PlayerView.jsx";
import AuthorCanvas from "./ui/AuthorCanvas.jsx";
import Portal from "./ui/Portal.jsx";
import PerformanceMonitor from "./ui/PerformanceMonitor.jsx";
import GameConsole from "./ui/GameConsole.jsx";

export default function App() {
  const [isAuthorMode, setIsAuthorMode] = useState(false);
  const [terrainConfig, setTerrainConfig] = useState(null);
  const [flockingConfig, setFlockingConfig] = useState(null);
  const [plantConfigs, setPlantConfigs] = useState([]);
  const [buildingConfigs, setBuildingConfigs] = useState([]);
  const [flowerConfigs, setFlowerConfigs] = useState([]);
  const [npcConfigs, setNPCConfigs] = useState([]);
  const [playerData, setPlayerData] = useState(null);
  const [consoleMessages, setConsoleMessages] = useState([]);

  const toggleAuthorMode = useCallback(() => {
    setIsAuthorMode((prev) => !prev);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key.toLowerCase() === "p") {
        e.preventDefault();
        const wasInAuthorMode = isAuthorMode;
        toggleAuthorMode();
        // If exiting author mode, request pointer lock (user interaction is available from keydown event)
        if (wasInAuthorMode) {
          // Request pointer lock after a brief delay to ensure state has updated
          setTimeout(() => {
            if (document.pointerLockElement !== document.body) {
              document.body.requestPointerLock();
            }
          }, 10);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isAuthorMode, toggleAuthorMode]);

  // Handle pointer unlock when entering author mode
  useEffect(() => {
    if (isAuthorMode) {
      // Entering author mode: unlock the cursor
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    }
  }, [isAuthorMode]);

  return (
    <>
      <PlayerView
        isAuthorMode={isAuthorMode}
        terrainConfig={terrainConfig}
        flockingConfig={flockingConfig}
        plantConfigs={plantConfigs}
        buildingConfigs={buildingConfigs}
        flowerConfigs={flowerConfigs}
        npcConfigs={npcConfigs}
        onPlayerDataUpdate={setPlayerData}
        onConsoleMessage={setConsoleMessages}
      />

      <Portal>
        {!isAuthorMode && (
          <div className="bottom-ui-container">
            <PerformanceMonitor playerData={playerData} />
            <GameConsole messages={consoleMessages} />
          </div>
        )}

        <div
          className="author-backdrop"
          style={{ display: isAuthorMode ? "flex" : "none" }}
        >
          <div className="author-overlay-shell">
            <AuthorCanvas
              onTerrainConfigChange={setTerrainConfig}
              onFlockingConfigChange={setFlockingConfig}
              onPlantConfigChange={setPlantConfigs}
              onBuildingConfigChange={setBuildingConfigs}
              onFlowerConfigChange={setFlowerConfigs}
              onNPCConfigChange={setNPCConfigs}
            />
          </div>
        </div>
      </Portal>
    </>
  );
}
