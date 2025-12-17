![Header Image](./public/github-cover.png)

# helloworld.js

A procedural 3D world generation tool built with React, Three.js, and ReactFlow. Create immersive environments through a node-based visual editor, then explore them in first-person mode.

## Summary

helloworld.js combines procedural generation algorithms with a visual node editor to create dynamic 3D worlds. The application features:

- **Node-based authoring system** for creating procedural content
- **First-person exploration mode** for navigating generated worlds
- **Procedural terrain generation** using Perlin noise
- **L-System-based plant generation** with customizable growth patterns
- **Flocking behavior system** for dynamic agent animations
- **Procedural building generation** using shape grammars
- **Interactive flower placement** driven by noise patterns

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Controls

#### Player Mode (First-Person)

- **W / A / S / D** — Move forward/left/backward/right
- **Mouse** — Look around
- **Click** — Enable pointer lock (required for mouse look)
- **P** — Toggle to Author Mode

#### Author Mode (Node Editor)

- **Click sidebar buttons** — Add nodes to the canvas
- **Drag nodes** — Reposition nodes
- **Connect handles** — Link nodes by dragging from output to input handles
- **Click nodes** — Select and configure node parameters
- **P** — Toggle back to Player Mode

## Detailed Guide

### Components

#### Noise & Heightfields

##### Perlin Noise Node

Generates multi-octave Perlin noise for terrain heightfields and procedural placement.

**Inputs:**

```javascript
{
  seed: number,        // Random seed (default: 42)
  scale: number,       // Noise scale (default: 0.05)
  octaves: number,     // Number of noise layers (default: 4, max: 8)
  persistence: number, // Amplitude decay per octave (default: 0.5)
  amplitude: number,   // Height amplitude (default: 10)
  frequency: number    // Base frequency (default: 1)
}
```

**Outputs:**

```javascript
{
  type: "perlinNoise",
  value: number,       // Sampled noise value
  seed: number,
  scale: number,
  octaves: number,
  persistence: number,
  amplitude: number,
  frequency: number
}
```

**Connections:**

- Output → Terrain Node (config handle)
- Output → Flower Node (noise handle, optional)
- Output → Flocking Node (noise handle, optional)

---

##### Terrain Node

Creates a 3D terrain mesh using Perlin noise configuration.

**Inputs:**

```javascript
{
  // Receives from Perlin Noise Node via config handle:
  seed: number,
  scale: number,
  octaves: number,
  persistence: number,
  amplitude: number,
  frequency: number
}
```

**Outputs:**

```javascript
{
  // Terrain configuration forwarded to renderer
  // (No direct output handle, but updates world terrain)
}
```

**Connections:**

- Input (config) ← Perlin Noise Node

---

#### Agent & Behavior Systems

##### Agent Node

Defines agent spawn parameters for flocking systems.

**Inputs:**

```javascript
{
  count: number,       // Number of agents to spawn (default: 10, max: 200)
  positionX: number,   // Spawn position X (default: 0)
  positionY: number,   // Spawn position Y (default: 50)
  positionZ: number,   // Spawn position Z (default: 0)
  velocityX: number,   // Initial velocity X (default: 0)
  velocityY: number,   // Initial velocity Y (default: 0)
  velocityZ: number,   // Initial velocity Z (default: 0)
  size: number,        // Agent size (default: 0.3)
  spread: number       // Spawn spread radius (default: 20.0)
}
```

**Outputs:**

```javascript
{
  type: "agent",
  count: number,
  positionX: number,
  positionY: number,
  positionZ: number,
  velocityX: number,
  velocityY: number,
  velocityZ: number,
  size: number,
  spread: number
}
```

**Connections:**

- Input (behavior) ← Flocking Node
- Output → Flocking System (via AuthorCanvas)

---

##### Flocking Node

Configures flocking behavior rules for agents.

**Inputs:**

```javascript
{
  separation: number,      // Separation force (default: 1.5)
  alignment: number,       // Alignment force (default: 1.0)
  cohesion: number,        // Cohesion force (default: 1.0)
  separationRadius: number, // Separation detection radius (default: 2.0)
  neighborRadius: number,  // Neighbor detection radius (default: 5.0)
  maxSpeed: number,        // Maximum agent speed (default: 5.0)
  maxForce: number,        // Maximum steering force (default: 0.1)
  boundsWidth: number,     // Boundary width (default: 50)
  boundsDepth: number,     // Boundary depth (default: 50)
  planeHeight: number,     // Flocking plane height (default: 50)
  // Optional noise input for flow fields:
  noiseConfig: object      // From Perlin Noise Node
}
```

**Outputs:**

```javascript
{
  type: "flockingBehavior",
  separation: number,
  alignment: number,
  cohesion: number,
  separationRadius: number,
  neighborRadius: number,
  maxSpeed: number,
  maxForce: number,
  boundsWidth: number,
  boundsDepth: number,
  planeHeight: number,
  noiseConfig: object | null
}
```

**Connections:**

- Input (noise) ← Perlin Noise Node (optional)
- Output → Agent Node (behavior handle)

---

#### Simulation & Natural Systems

##### L-System Node

Generates L-system strings for procedural plant generation.

**Inputs:**

```javascript
{
  axiom: string,           // Starting string (default: "F")
  rule1: string,           // First rule character
  rule1Replacement: string, // First rule replacement (default: "F[+F]F[-F]F")
  rule2: string,           // Second rule character (optional)
  rule2Replacement: string, // Second rule replacement (optional)
  rule3: string,           // Third rule character (optional)
  rule3Replacement: string, // Third rule replacement (optional)
  iterations: number,      // Iteration count (default: 3, max: 8)
  angle: number,           // Branch angle in degrees (default: 25)
  stepSize: number         // Step size for drawing (default: 1.0)
}
```

**Outputs:**

```javascript
{
  type: "lsystem",
  axiom: string,
  rules: object,           // { [char]: replacement }
  iterations: number,
  angle: number,           // Converted to radians
  stepSize: number,
  resultString: string     // Generated L-system string
}
```

**Connections:**

- Output → Plant Node (lsystem handle)

---

##### Plant Node

Creates 3D plants using L-system geometry.

**Inputs:**

```javascript
{
  positionX: number,      // Plant position X (default: 0)
  positionY: number,      // Plant position Y (auto-snapped to terrain)
  positionZ: number,      // Plant position Z (default: 0)
  branchThickness: number, // Branch thickness (default: 0.1)
  branchColor: string,    // Branch/bark color (default: "#8B4513")
  leafSize: number,       // Leaf size (default: 0.3)
  leafColor: string,      // Leaf color (default: "#228B22")
  leafDensity: number,    // Leaf density 0-1 (default: 0.7)
  // Required L-system input:
  lsystem: object         // From L-System Node
}
```

**Outputs:**

```javascript
{
  type: "plant",
  positionX: number,
  positionY: number,      // Auto-adjusted to terrain height
  positionZ: number,
  branchThickness: number,
  branchColor: string,
  leafSize: number,
  leafColor: string,
  leafDensity: number,
  lsystem: object
}
```

**Connections:**

- Input (lsystem) ← L-System Node
- Output → Plant Renderer (via AuthorCanvas)

---

##### Flower Node

Places procedural flowers on terrain using noise-based distribution.

**Inputs:**

```javascript
{
  count: number,          // Number of flowers (default: 50, max: 500)
  spread: number,         // Distribution spread (default: 50.0)
  size: number,           // Flower size (default: 1.0)
  // Optional noise input:
  noiseConfig: object     // From Perlin Noise Node (for placement)
}
```

**Outputs:**

```javascript
{
  type: "flower",
  count: number,
  spread: number,
  size: number,
  noiseConfig: object | null
}
```

**Connections:**

- Input (noise) ← Perlin Noise Node (optional)
- Output → Flower Renderer (via AuthorCanvas)

---

#### Structural / Generative Grammars

##### Building Grammar Node

Generates building structure definitions using procedural grammar.

**Inputs:**

```javascript
{
  levels: number,         // Number of building levels (default: 3, max: 10)
  roomsPerLevel: number,  // Rooms per level (default: 4, max: 16)
  roomSize: number,       // Room size (default: 4.0)
  levelHeight: number,    // Height per level (default: 3.0)
  wallThickness: number,  // Wall thickness (default: 0.2)
  hasStairs: boolean,     // Include stairs (default: true)
  roomLayout: string      // Layout type: "grid" | "linear" | "radial" (default: "grid")
}
```

**Outputs:**

```javascript
{
  type: "buildingGrammar",
  levels: number,
  roomsPerLevel: number,
  roomSize: number,
  levelHeight: number,
  wallThickness: number,
  hasStairs: boolean,
  roomLayout: string,
  building: object        // Generated building structure
}
```

**Connections:**

- Output → Building Node (grammar handle)

---

##### Building Node

Instantiates buildings in the world using grammar definitions.

**Inputs:**

```javascript
{
  positionX: number,      // Building position X (default: 0)
  positionY: number,      // Building position Y (auto-snapped to terrain)
  positionZ: number,      // Building position Z (default: 0)
  color: string,          // Building color (default: "#ffffff")
  // Required grammar input:
  grammar: object         // From Building Grammar Node
}
```

**Outputs:**

```javascript
{
  type: "building",
  positionX: number,
  positionY: number,      // Auto-adjusted to terrain height
  positionZ: number,
  color: string,
  grammar: object
}
```

**Connections:**

- Input (grammar) ← Building Grammar Node
- Output → Building Renderer (via AuthorCanvas)

---

## Code Architecture

| Component            | Purpose                                     | Key Files                                                                  |
| -------------------- | ------------------------------------------- | -------------------------------------------------------------------------- |
| **Algorithms**       | Core procedural generation logic            | `src/algorithms/` (perlin.js, lsystem.js, buildingGrammar.js, flocking.js) |
| **Nodes**            | ReactFlow node components for visual editor | `src/nodes/algorithms/`, `src/nodes/environment/`, `src/nodes/core/`       |
| **World Generation** | Three.js scene object creation              | `src/world/` (terrain/, buildings/, plants/, flowers/, flocking/)          |
| **Player**           | First-person camera and controls            | `src/player/` (PlayerView.jsx, useFirstPersonControls.js, cameraRig.js)    |
| **UI**               | Author mode interface                       | `src/ui/` (AuthorCanvas.jsx, AuthorSidebar.jsx, AuthorFlowCanvas.jsx)      |
| **Engine**           | Three.js renderer and scene setup           | `src/engine/` (createRenderer.js, loadSkybox.js, loadTexture.js)           |
| **App**              | Main application orchestrator               | `src/App.jsx`, `src/main.jsx`                                              |

### Data Flow

1. **Author Mode**: Users create nodes and connections in ReactFlow
2. **Node Processing**: `AuthorCanvas.jsx` collects outputs from connected nodes
3. **Config Aggregation**: Configurations are merged and passed to `PlayerView.jsx`
4. **World Generation**: `PlayerView.jsx` creates Three.js objects using world generation functions
5. **Rendering**: Three.js renderer displays the scene with first-person camera controls

### Key Technologies

- **React 19** — UI framework
- **Three.js** — 3D graphics engine
- **ReactFlow** — Node-based visual editor
- **@react-three/fiber** — React renderer for Three.js
- **@react-three/drei** — Three.js helpers and abstractions
- **Vite** — Build tool and dev server
