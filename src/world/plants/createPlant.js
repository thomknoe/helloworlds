import * as THREE from "three";
import { parseLSystemString } from "../../algorithms/lsystem.js";

export function createPlant(config, scene) {
  if (!config || !config.lsystem) return null;

  const {
    positionX = 0,
    positionY = 0,
    positionZ = 0,
    branchThickness = 0.1,
    branchColor = "#8B4513",
    leafSize = 0.3,
    leafColor = "#228B22",
    leafDensity = 0.7,
    lsystem,
  } = config;

  const commands = parseLSystemString(
    lsystem.resultString,
    lsystem.angle,
    lsystem.stepSize
  );

  const group = new THREE.Group();
  group.name = "plant";
  group.position.set(positionX, positionY, positionZ);

  const barkMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(branchColor),
    roughness: 0.95,
    metalness: 0.0,
  });

  const leafMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(leafColor),
    roughness: 0.6,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  const branchEndpoints = new Set();
  const branchThicknessMap = new Map();

  commands.forEach((cmd) => {
    if (cmd.type === "line") {
      const { from, to } = cmd;

      const direction = new THREE.Vector3(
        to.x - from.x,
        to.y - from.y,
        to.z - from.z
      );
      const length = direction.length();

      if (length < 0.001) return;

      direction.normalize();

      const fromDist = Math.sqrt(from.x * from.x + from.y * from.y + from.z * from.z);
      const toDist = Math.sqrt(to.x * to.x + to.y * to.y + to.z * to.z);
      const baseThickness = branchThickness * (1 - fromDist * 0.1);
      const tipThickness = branchThickness * (1 - toDist * 0.1);

      const finalBaseThickness = Math.max(baseThickness, branchThickness * 0.3);
      const finalTipThickness = Math.max(tipThickness, branchThickness * 0.2);

      branchThicknessMap.set(`${to.x},${to.y},${to.z}`, finalTipThickness);

      branchEndpoints.add(`${to.x},${to.y},${to.z}`);

      const geometry = new THREE.CylinderGeometry(
        finalBaseThickness,
        finalTipThickness,
        length,
        8
      );

      const mesh = new THREE.Mesh(geometry, barkMaterial);

      const midPoint = new THREE.Vector3(
        (from.x + to.x) / 2,
        (from.y + to.y) / 2,
        (from.z + to.z) / 2
      );

      mesh.position.copy(midPoint);

      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(up, direction);
      mesh.quaternion.copy(quaternion);

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      group.add(mesh);
    }
  });

  commands.forEach((cmd) => {
    if (cmd.type === "line") {
      const { from } = cmd;
      branchEndpoints.delete(`${from.x},${from.y},${from.z}`);
    }
  });

  branchEndpoints.forEach((endpointKey) => {
    if (Math.random() > leafDensity) return;

    const [x, y, z] = endpointKey.split(',').map(Number);
    const thickness = branchThicknessMap.get(endpointKey) || branchThickness * 0.3;

    if (thickness > branchThickness * 0.6) return;

    const leafCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < leafCount; i++) {
      const offsetX = (Math.random() - 0.5) * leafSize * 0.5;
      const offsetY = (Math.random() - 0.5) * leafSize * 0.5;
      const offsetZ = (Math.random() - 0.5) * leafSize * 0.5;

      const rotationX = (Math.random() - 0.5) * Math.PI * 0.5;
      const rotationY = Math.random() * Math.PI * 2;
      const rotationZ = (Math.random() - 0.5) * Math.PI * 0.3;

      const leafGeometry = new THREE.PlaneGeometry(
        leafSize * (0.8 + Math.random() * 0.4),
        leafSize * (0.6 + Math.random() * 0.4)
      );

      const leafMesh = new THREE.Mesh(leafGeometry, leafMaterial);

      leafMesh.position.set(
        x + offsetX,
        y + offsetY,
        z + offsetZ
      );

      leafMesh.rotation.set(rotationX, rotationY, rotationZ);

      leafMesh.castShadow = true;
      leafMesh.receiveShadow = true;

      group.add(leafMesh);
    }
  });

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
      if (newConfig.lsystem?.resultString !== lsystem.resultString) {
        return false;
      }

      group.position.set(
        newConfig.positionX ?? positionX,
        newConfig.positionY ?? positionY,
        newConfig.positionZ ?? positionZ
      );

      barkMaterial.color.set(newConfig.branchColor ?? branchColor);
      leafMaterial.color.set(newConfig.leafColor ?? leafColor);

      return true;
    },
  };
}
