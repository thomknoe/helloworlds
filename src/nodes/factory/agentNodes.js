const makeId = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export function createAgentNode(position = { x: 0, y: 0 }) {
  const spread = 100;
  return {
    id: makeId("agent"),
    type: "agent",
    position,
    data: {
      label: "Boids",
      count: 10,
      positionX: (Math.random() - 0.5) * spread,
      positionY: 50 + (Math.random() - 0.5) * spread * 0.3,
      positionZ: (Math.random() - 0.5) * spread,
      velocityX: (Math.random() - 0.5) * 4,
      velocityY: (Math.random() - 0.5) * 1,
      velocityZ: (Math.random() - 0.5) * 4,
      size: 0.3,
      spread: 20.0,
    },
  };
}

export function createFlockingNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("flocking"),
    type: "flocking",
    position,
    data: {
      label: "Flocking Behavior",
      separation: 1.5,
      alignment: 1.0,
      cohesion: 1.0,
      separationRadius: 2.0,
      neighborRadius: 5.0,
      maxSpeed: 5.0,
      maxForce: 0.1,
      boundsWidth: 150,
      boundsDepth: 150,
      planeHeight: 50,
    },
  };
}

export function createNPCNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("npc"),
    type: "npc",
    position,
    data: {
      label: "NPC",
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      movementType: "random",
      speed: 2.0,
      wanderRadius: 10.0,
      wanderCenterX: 0,
      wanderCenterY: 0,
      wanderCenterZ: 0,
      interactionRadius: 6.0, // Slightly larger interaction radius
      dialogueWords:
        "hello,world,greetings,traveler,welcome,friend,adventure,journey",
      dialogueLength: 5,
      color: "#ffffff", // White color
      size: 1.5, // Slightly larger size (will scale with interaction radius)
    },
  };
}
