import * as THREE from "three";
import { WorldObject } from "../../core/world/WorldObject.js";
import { parseLSystemString } from "../../algorithms/lsystem.js";
import { createCelShadedMaterial } from "../../engine/createCelShadedMaterial.js";

/**
 * Plant world object
 * Extends WorldObject base class
 */
export class Plant extends WorldObject {
  constructor(config) {
    super();
    this.config = config;
    this.barkMaterial = null;
    this.leafMaterial = null;
    this.build();
  }

  /**
   * Build the plant geometry from L-system
   */
  build() {
    if (!this.config || !this.config.lsystem) return;

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
    } = this.config;

    this.setPosition(positionX, positionY, positionZ);
    this.group.name = "plant";

    // Cel-shaded materials for cartoon-like appearance
    this.barkMaterial = createCelShadedMaterial(branchColor, {
      rimIntensity: 0.2,
    });

    this.leafMaterial = createCelShadedMaterial(leafColor, {
      rimIntensity: 0.3,
    });
    this.leafMaterial.side = THREE.DoubleSide;

    const commands = parseLSystemString(
      lsystem.resultString,
      lsystem.angle,
      lsystem.stepSize
    );

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

        const mesh = new THREE.Mesh(geometry, this.barkMaterial);
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
        this.addMesh(mesh);
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

        const leafMesh = new THREE.Mesh(leafGeometry, this.leafMaterial);
        leafMesh.position.set(x + offsetX, y + offsetY, z + offsetZ);
        leafMesh.rotation.set(rotationX, rotationY, rotationZ);
        leafMesh.castShadow = true;
        leafMesh.receiveShadow = true;
        this.addMesh(leafMesh);
      }
    });
  }

  /**
   * Update plant configuration
   * @param {Object} newConfig - New configuration
   * @returns {boolean} True if update was successful
   */
  updateConfig(newConfig) {
    if (newConfig.lsystem?.resultString !== this.config.lsystem?.resultString) {
      return false;
    }

    this.setPosition(
      newConfig.positionX ?? this.config.positionX ?? 0,
      newConfig.positionY ?? this.config.positionY ?? 0,
      newConfig.positionZ ?? this.config.positionZ ?? 0
    );

    if (this.barkMaterial) {
      this.barkMaterial.color.set(newConfig.branchColor ?? this.config.branchColor ?? "#8B4513");
    }
    if (this.leafMaterial) {
      this.leafMaterial.color.set(newConfig.leafColor ?? this.config.leafColor ?? "#228B22");
    }

    this.config = { ...this.config, ...newConfig };
    return true;
  }
}

