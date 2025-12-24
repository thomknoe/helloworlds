import * as THREE from "three";

export function createBuilding(config, scene) {
  if (!config || !config.grammar || !config.grammar.building) return null;

  const {
    positionX = 0,
    positionY = 0,
    positionZ = 0,
    color = "#ffffff",
    grammar,
  } = config;

  const building = grammar.building;
  const wallThickness = grammar.wallThickness || 0.2;

  const group = new THREE.Group();
  group.name = "building";

  group.position.set(positionX, positionY, positionZ);

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.7,
    metalness: 0.1,
  });

  building.levels.forEach((level) => {
    level.rooms.forEach((room) => {

      const floorGeometry = new THREE.PlaneGeometry(room.width, room.depth);
      const floor = new THREE.Mesh(floorGeometry, material);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(room.x, room.y, room.z);
      floor.receiveShadow = true;
      group.add(floor);

      const ceilingGeometry = new THREE.PlaneGeometry(room.width, room.depth);
      const ceiling = new THREE.Mesh(ceilingGeometry, material);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.set(room.x, room.y + room.height, room.z);
      ceiling.receiveShadow = true;
      group.add(ceiling);

      const halfWidth = room.width / 2;
      const halfDepth = room.depth / 2;

      if (!hasConnection(room, "north", level.rooms)) {
        const northWall = createWall(
          room.width,
          room.height,
          wallThickness,
          material
        );
        northWall.position.set(room.x, room.y + room.height / 2, room.z - halfDepth);
        northWall.castShadow = true;
        northWall.receiveShadow = true;
        group.add(northWall);
      }

      if (!hasConnection(room, "south", level.rooms)) {
        const southWall = createWall(
          room.width,
          room.height,
          wallThickness,
          material
        );
        southWall.position.set(room.x, room.y + room.height / 2, room.z + halfDepth);
        southWall.castShadow = true;
        southWall.receiveShadow = true;
        group.add(southWall);
      }

      if (!hasConnection(room, "east", level.rooms)) {
        const eastWall = createWall(
          room.depth,
          room.height,
          wallThickness,
          material
        );
        eastWall.rotation.y = Math.PI / 2;
        eastWall.position.set(room.x + halfWidth, room.y + room.height / 2, room.z);
        eastWall.castShadow = true;
        eastWall.receiveShadow = true;
        group.add(eastWall);
      }

      if (!hasConnection(room, "west", level.rooms)) {
        const westWall = createWall(
          room.depth,
          room.height,
          wallThickness,
          material
        );
        westWall.rotation.y = Math.PI / 2;
        westWall.position.set(room.x - halfWidth, room.y + room.height / 2, room.z);
        westWall.castShadow = true;
        westWall.receiveShadow = true;
        group.add(westWall);
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
      const stairMesh = new THREE.Mesh(stairGeometry, material);
      stairMesh.position.set(
        stair.x,
        stair.y + stair.height / 2,
        stair.z
      );
      stairMesh.castShadow = true;
      stairMesh.receiveShadow = true;
      group.add(stairMesh);
    });
  }

  scene.add(group);

  return {
    group,
    dispose: () => {
      group.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
      scene.remove(group);
    },
    updateConfig: (newConfig) => {

      if (newConfig.grammar?.building !== grammar.building) {
        return false;
      }

      group.position.set(
        newConfig.positionX ?? positionX,
        newConfig.positionY ?? positionY,
        newConfig.positionZ ?? positionZ
      );

      material.color.set(newConfig.color ?? color);

      return true;
    },
  };
}

function createWall(width, height, thickness, material) {
  const geometry = new THREE.BoxGeometry(width, height, thickness);
  return new THREE.Mesh(geometry, material);
}

function hasConnection(room, direction, allRooms) {
  return room.connections.some((conn) => {
    if (conn.direction === direction) {

      return allRooms.some((r) => r.id === conn.to);
    }
    return false;
  });
}
