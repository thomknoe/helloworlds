/**
 * Analyzes terrain composition based on grass ratio (terrain above waterHeight + 12)
 * Returns a value between 0 (no grass, all sand/other) and 1 (all grass)
 */
export function analyzeTerrainComposition(terrain, waterHeight = 20) {
  if (!terrain || !terrain.geometry) {
    return 0.0; // Default to no grass (neutral sky)
  }

  const positionAttr = terrain.geometry.getAttribute("position");
  if (!positionAttr) {
    return 0.0;
  }

  const positions = positionAttr.array;
  const count = positionAttr.count;

  let grassCount = 0; // Terrain above waterHeight + 12 (green grass areas)
  let totalCount = 0;

  // Sample terrain heights
  for (let i = 0; i < count; i += 10) {
    // Sample every 10th vertex for performance
    const idx = i * 3;
    const height = positions[idx + 1]; // Y coordinate

    totalCount++;

    // Count grass areas (terrain above waterHeight + 12, where green starts)
    if (height > waterHeight + 12.0) {
      grassCount++;
    }
  }

  if (totalCount === 0) {
    return 0.0;
  }

  // Calculate grass ratio: 0 = no grass, 1 = all grass
  const grassRatio = grassCount / totalCount;

  return Math.max(0, Math.min(1, grassRatio));
}
