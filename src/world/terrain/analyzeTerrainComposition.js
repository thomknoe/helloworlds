export function analyzeTerrainComposition(terrain, waterHeight = 20) {
  if (!terrain || !terrain.geometry) {
    return 0.0; 
  }
  const positionAttr = terrain.geometry.getAttribute("position");
  if (!positionAttr) {
    return 0.0;
  }
  const positions = positionAttr.array;
  const count = positionAttr.count;
  let grassCount = 0; 
  let totalCount = 0;
  for (let i = 0; i < count; i += 10) {
    const idx = i * 3;
    const height = positions[idx + 1]; 
    totalCount++;
    if (height > waterHeight + 12.0) {
      grassCount++;
    }
  }
  if (totalCount === 0) {
    return 0.0;
  }
  const grassRatio = grassCount / totalCount;
  return Math.max(0, Math.min(1, grassRatio));
}
