import { Grammar } from "../core/algorithms/Grammar.js";
export class BuildingGrammar extends Grammar {
  constructor(config = {}) {
    super();
    this.levels = config.levels || 3;
    this.roomsPerLevel = config.roomsPerLevel || 4;
    this.roomSize = config.roomSize || 4.0;
    this.levelHeight = config.levelHeight || 3.0;
    this.wallThickness = config.wallThickness || 0.2;
    this.hasStairs = config.hasStairs !== false;
    this.roomLayout = config.roomLayout || "grid";
  }
  generate(config = {}) {
    const levels = config.levels ?? this.levels;
    const hasStairs = config.hasStairs ?? this.hasStairs;
    const building = {
      levels: [],
      stairs: [],
    };
    for (let level = 0; level < levels; level++) {
      const levelData = this.generateLevel(level, config);
      building.levels.push(levelData);
      if (hasStairs && level < levels - 1) {
        const stair = this.generateStairs(level, levelData);
        building.stairs.push(stair);
      }
    }
    return building;
  }
  generateLevel(levelIndex, config = {}) {
    const rooms = [];
    const levelHeight = config.levelHeight ?? this.levelHeight;
    const roomSize = config.roomSize ?? this.roomSize;
    const roomsPerLevel = config.roomsPerLevel ?? this.roomsPerLevel;
    const y = levelIndex * levelHeight;
    const positions = this.generateRoomPositions(levelIndex, config);
    positions.forEach((pos, index) => {
      const room = {
        id: `level-${levelIndex}-room-${index}`,
        x: pos.x,
        y: y,
        z: pos.z,
        width: roomSize,
        depth: roomSize,
        height: levelHeight,
        level: levelIndex,
        connections: [],
      };
      positions.forEach((otherPos, otherIndex) => {
        if (index === otherIndex) return;
        const distance = Math.sqrt(
          Math.pow(pos.x - otherPos.x, 2) + Math.pow(pos.z - otherPos.z, 2)
        );
        if (distance < roomSize * 1.2) {
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
  generateRoomPositions(levelIndex, config = {}) {
    const positions = [];
    const roomSize = config.roomSize ?? this.roomSize;
    const roomsPerLevel = config.roomsPerLevel ?? this.roomsPerLevel;
    const roomLayout = config.roomLayout ?? this.roomLayout;
    const spacing = roomSize * 1.1;
    switch (roomLayout) {
      case "grid":
        const cols = Math.ceil(Math.sqrt(roomsPerLevel));
        const rows = Math.ceil(roomsPerLevel / cols);
        for (let i = 0; i < roomsPerLevel; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          positions.push({
            x: (col - (cols - 1) / 2) * spacing,
            z: (row - (rows - 1) / 2) * spacing,
          });
        }
        break;
      case "linear":
        for (let i = 0; i < roomsPerLevel; i++) {
          positions.push({
            x: (i - (roomsPerLevel - 1) / 2) * spacing,
            z: 0,
          });
        }
        break;
      case "radial":
        const angleStep = (Math.PI * 2) / roomsPerLevel;
        const radius = spacing * 1.5;
        for (let i = 0; i < roomsPerLevel; i++) {
          const angle = i * angleStep;
          positions.push({
            x: Math.cos(angle) * radius,
            z: Math.sin(angle) * radius,
          });
        }
        break;
      default:
        for (let i = 0; i < roomsPerLevel; i++) {
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
}
