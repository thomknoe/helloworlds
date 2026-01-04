import { useState, useEffect, useRef } from "react";

export default function PerformanceMonitor({ playerData = null }) {
  const [fps, setFps] = useState(0);
  const [frameTime, setFrameTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(null);
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsUpdateIntervalRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    const frameTimes = [];
    const maxFrameTimeSamples = 60;

    const updatePerformance = () => {
      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Calculate frame time in milliseconds
      const currentFrameTime = deltaTime;
      frameTimes.push(currentFrameTime);
      if (frameTimes.length > maxFrameTimeSamples) {
        frameTimes.shift();
      }

      // Calculate average frame time
      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      setFrameTime(Math.round(avgFrameTime * 10) / 10);

      // Update FPS every second
      frameCountRef.current += 1;

      // Check memory usage if available
      if (performance.memory) {
        const usedMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(performance.memory.totalJSHeapSize / 1048576);
        setMemoryUsage({ used: usedMB, total: totalMB });
      }

      animationFrameId = requestAnimationFrame(updatePerformance);
    };

    // Update FPS counter every second
    fpsUpdateIntervalRef.current = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);

    animationFrameId = requestAnimationFrame(updatePerformance);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (fpsUpdateIntervalRef.current) {
        clearInterval(fpsUpdateIntervalRef.current);
      }
    };
  }, []);

  const formatFps = (fpsValue) => {
    if (fpsValue >= 60) return `${fpsValue} FPS`;
    if (fpsValue >= 30) return `${fpsValue} FPS`;
    return `${fpsValue} FPS`;
  };

  const getFpsColor = (fpsValue) => {
    if (fpsValue >= 55) return "#4ade80"; // green
    if (fpsValue >= 30) return "#fbbf24"; // yellow
    return "#f87171"; // red
  };

  return (
    <div className="performance-monitor">
      <span className="performance-stat">
        <span className="performance-label">FPS:</span>
        <span className="performance-value" style={{ color: getFpsColor(fps) }}>
          {formatFps(fps)}
        </span>
      </span>
      <span className="performance-stat">
        <span className="performance-label">Frame:</span>
        <span className="performance-value">{frameTime.toFixed(1)}ms</span>
      </span>
      {memoryUsage && (
        <span className="performance-stat">
          <span className="performance-label">Memory:</span>
          <span className="performance-value">
            {memoryUsage.used}MB / {memoryUsage.total}MB
          </span>
        </span>
      )}
      {playerData && (
        <span className="performance-stat">
          <span className="performance-label">Pos:</span>
          <span className="performance-value">
            ({playerData.position.x}, {playerData.position.y}, {playerData.position.z})
          </span>
        </span>
      )}
    </div>
  );
}

