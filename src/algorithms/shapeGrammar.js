/**
 * Shape Grammar - General purpose shape generation
 * Can be used for buildings, facades, floor plans, architectural details
 * Consolidates/replaces Building Grammar with more general capabilities
 */
export class ShapeGrammar {
  constructor(config = {}) {
    // Building-specific parameters (for compatibility)
    this.levels = config.levels || config.buildingLevels || 3;
    this.roomsPerLevel = config.roomsPerLevel || config.buildingRoomsPerLevel || 4;
    this.roomSize = config.roomSize || config.buildingRoomSize || 4.0;
    this.levelHeight = config.levelHeight || config.buildingLevelHeight || 3.0;
    this.wallThickness = config.wallThickness || 0.2;
    this.hasStairs = config.hasStairs !== false;
    this.roomLayout = config.roomLayout || "grid";
    
    // General shape grammar parameters
    this.grammarType = config.grammarType || "building"; // "building", "facade", "floorplan"
    this.rules = config.rules || {};
    this.iterations = config.iterations || 3;
    this.seed = config.seed || 42;
  }

  // Generate building structure (compatible with BuildingGrammar)
  generateBuilding() {
    const building = {
      levels: [],
      stairs: [],
    };

    for (let level = 0; level < this.levels; level++) {
      const levelData = this.generateLevel(level);
      building.levels.push(levelData);

      if (this.hasStairs && level < this.levels - 1) {
        const stair = this.generateStairs(level, levelData);
        building.stairs.push(stair);
      }
    }

    return building;
  }

  generateLevel(levelIndex) {
    const rooms = [];
    const y = levelIndex * this.levelHeight;
    const positions = this.generateRoomPositions(levelIndex);

    positions.forEach((pos, index) => {
      const room = {
        id: `level-${levelIndex}-room-${index}`,
        x: pos.x,
        y: y,
        z: pos.z,
        width: this.roomSize,
        depth: this.roomSize,
        height: this.levelHeight,
        level: levelIndex,
        connections: [],
      };

      positions.forEach((otherPos, otherIndex) => {
        if (index === otherIndex) return;

        const distance = Math.sqrt(
          Math.pow(pos.x - otherPos.x, 2) + Math.pow(pos.z - otherPos.z, 2)
        );

        if (distance < this.roomSize * 1.2) {
          const direction = this.getDirection(pos, otherPos);
          if (!room.connections.some(c => c.to === `level-${levelIndex}-room-${otherIndex}`)) {
            room.connections.push({
              to: `level-${levelIndex}-room-${otherIndex}`,
              direction: direction,
            });
          }
        }
      });

      rooms.push(room);
    });

    return {
      level: levelIndex,
      y: y,
      rooms: rooms,
    };
  }

  generateRoomPositions(levelIndex) {
    const positions = [];
    const spacing = this.roomSize * 1.1;

    switch (this.roomLayout) {
      case "grid":
        const cols = Math.ceil(Math.sqrt(this.roomsPerLevel));
        const rows = Math.ceil(this.roomsPerLevel / cols);
        for (let i = 0; i < this.roomsPerLevel; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          positions.push({
            x: (col - (cols - 1) / 2) * spacing,
            z: (row - (rows - 1) / 2) * spacing,
          });
        }
        break;

      case "linear":
        for (let i = 0; i < this.roomsPerLevel; i++) {
          positions.push({
            x: (i - (this.roomsPerLevel - 1) / 2) * spacing,
            z: 0,
          });
        }
        break;

      case "radial":
        const angleStep = (Math.PI * 2) / this.roomsPerLevel;
        const radius = spacing * 1.5;
        for (let i = 0; i < this.roomsPerLevel; i++) {
          const angle = i * angleStep;
          positions.push({
            x: Math.cos(angle) * radius,
            z: Math.sin(angle) * radius,
          });
        }
        break;

      default:
        for (let i = 0; i < this.roomsPerLevel; i++) {
          positions.push({
            x: (i % 3 - 1) * spacing,
            z: (Math.floor(i / 3) - 1) * spacing,
          });
        }
    }

    return positions;
  }

  getDirection(from, to) {
    const dx = to.x - from.x;
    const dz = to.z - from.z;

    if (Math.abs(dx) > Math.abs(dz)) {
      return dx > 0 ? "east" : "west";
    } else {
      return dz > 0 ? "south" : "north";
    }
  }

  generateStairs(levelIndex, levelData) {
    const firstRoom = levelData.rooms[0];
    return {
      x: firstRoom.x,
      y: levelData.y,
      z: firstRoom.z,
      width: 1.0,
      depth: 1.0,
      height: this.levelHeight,
      level: levelIndex,
    };
  }

  // General generate method
  generate() {
    switch (this.grammarType) {
      case "building":
        return this.generateBuilding();
      case "facade":
        return this.generateFacade();
      case "floorplan":
        return this.generateFloorPlan();
      default:
        return this.generateBuilding();
    }
  }

  generateFacade() {
    // Placeholder for facade generation
    return {
      type: "facade",
      elements: [],
    };
  }

  generateFloorPlan() {
    // Placeholder for floor plan generation
    return {
      type: "floorplan",
      rooms: [],
    };
  }
}

export default ShapeGrammar;

