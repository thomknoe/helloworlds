import * as THREE from "three";
import { WorldObject } from "../../core/world/WorldObject.js";

/**
 * Building world object
 * Extends WorldObject base class
 */
export class Building extends WorldObject {
  constructor(config) {
    super();
    this.config = config;
    this.material = null;
    this.build();
  }

  /**
   * Build the building geometry from grammar
   */
  build() {
    if (!this.config || !this.config.grammar || !this.config.grammar.building) return;

    const {
      positionX = 0,
      positionY = 0,
      positionZ = 0,
      color = "#ffffff",
      grammar,
    } = this.config;

    this.setPosition(positionX, positionY, positionZ);
    this.group.name = "building";

    this.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.7,
      metalness: 0.1,
    });

    const building = grammar.building;
    const wallThickness = grammar.wallThickness || 0.2;

    building.levels.forEach((level) => {
      level.rooms.forEach((room) => {
        const floorGeometry = new THREE.PlaneGeometry(room.width, room.depth);
        const floor = new THREE.Mesh(floorGeometry, this.material);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(room.x, room.y, room.z);
        floor.receiveShadow = true;
        this.addMesh(floor);

        const ceilingGeometry = new THREE.PlaneGeometry(room.width, room.depth);
        const ceiling = new THREE.Mesh(ceilingGeometry, this.material);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.set(room.x, room.y + room.height, room.z);
        ceiling.receiveShadow = true;
        this.addMesh(ceiling);

        const halfWidth = room.width / 2;
        const halfDepth = room.depth / 2;

        if (!this.hasConnection(room, "north", level.rooms)) {
          const northWall = this.createWall(room.width, room.height, wallThickness);
          northWall.position.set(room.x, room.y + room.height / 2, room.z - halfDepth);
          northWall.castShadow = true;
          northWall.receiveShadow = true;
          this.addMesh(northWall);
        }

        if (!this.hasConnection(room, "south", level.rooms)) {
          const southWall = this.createWall(room.width, room.height, wallThickness);
          southWall.position.set(room.x, room.y + room.height / 2, room.z + halfDepth);
          southWall.castShadow = true;
          southWall.receiveShadow = true;
          this.addMesh(southWall);
        }

        if (!this.hasConnection(room, "east", level.rooms)) {
          const eastWall = this.createWall(room.depth, room.height, wallThickness);
          eastWall.rotation.y = Math.PI / 2;
          eastWall.position.set(room.x + halfWidth, room.y + room.height / 2, room.z);
          eastWall.castShadow = true;
          eastWall.receiveShadow = true;
          this.addMesh(eastWall);
        }

        if (!this.hasConnection(room, "west", level.rooms)) {
          const westWall = this.createWall(room.depth, room.height, wallThickness);
          westWall.rotation.y = Math.PI / 2;
          westWall.position.set(room.x - halfWidth, room.y + room.height / 2, room.z);
          westWall.castShadow = true;
          westWall.receiveShadow = true;
          this.addMesh(westWall);
        }
      });
    });

    if (building.stairs && building.stairs.length > 0) {
      building.stairs.forEach((stair) => {
        const stairGeometry = new THREE.BoxGeometry(
          stair.width,
          stair.height,
          stair.depth
        );
        const stairMesh = new THREE.Mesh(stairGeometry, this.material);
        stairMesh.position.set(
          stair.x,
          stair.y + stair.height / 2,
          stair.z
        );
        stairMesh.castShadow = true;
        stairMesh.receiveShadow = true;
        this.addMesh(stairMesh);
      });
    }
  }

  /**
   * Create a wall mesh
   * @param {number} width - Wall width
   * @param {number} height - Wall height
   * @param {number} thickness - Wall thickness
   * @returns {THREE.Mesh} Wall mesh
   */
  createWall(width, height, thickness) {
    const geometry = new THREE.BoxGeometry(width, height, thickness);
    return new THREE.Mesh(geometry, this.material);
  }

  /**
   * Check if room has connection in direction
   * @param {Object} room - Room object
   * @param {string} direction - Direction to check
   * @param {Array} allRooms - All rooms in level
   * @returns {boolean} True if connection exists
   */
  hasConnection(room, direction, allRooms) {
    return room.connections.some((conn) => {
      if (conn.direction === direction) {
        return allRooms.some((r) => r.id === conn.to);
      }
      return false;
    });
  }

  /**
   * Update building configuration
   * @param {Object} newConfig - New configuration
   * @returns {boolean} True if update was successful
   */
  updateConfig(newConfig) {
    if (newConfig.grammar?.building !== this.config.grammar?.building) {
      return false;
    }

    this.setPosition(
      newConfig.positionX ?? this.config.positionX ?? 0,
      newConfig.positionY ?? this.config.positionY ?? 0,
      newConfig.positionZ ?? this.config.positionZ ?? 0
    );

    if (this.material) {
      this.material.color.set(newConfig.color ?? this.config.color ?? "#ffffff");
    }

    this.config = { ...this.config, ...newConfig };
    return true;
  }
}

