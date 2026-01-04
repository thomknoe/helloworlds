![GitHub Cover](public/github-cover.png)

# Hello Worlds

Hello Worlds is a procedural 3D world generation tool that combines procedural generation algorithms with a visual node editor to create dynamic, immersive environments. It features a node-based authoring system for procedural content creation and a first-person exploration mode for navigating generated worlds.

**Key Features:**

- **Perlin Noise Node** — Multi-octave noise generation for terrain heightfields and procedural placement
- **Terrain Node** — 3D terrain mesh generation that automatically snaps objects to elevation
- **Agent Node** — Spawn configurable agents with position, velocity, and size parameters
- **Flocking Node** — Separation, alignment, and cohesion forces for natural group behavior
- **L-System Node** — Lindenmayer system string generation for procedural plant structures
- **Plant Node** — 3D plant rendering from L-systems with customizable branches and leaves
- **Flower Node** — Noise-driven flower distribution across terrain with density control
- **Building Grammar Node** — Procedural building generation with configurable levels, rooms, and layouts
- **Building Node** — Instantiate buildings from grammar definitions with terrain height snapping

---

## Quick Start

Visit the web application at [https://thomknoe.github.io/helloworlds](https://thomknoe.github.io/helloworlds/)

### Controls

#### Player Mode (First-Person)

- **W / A / S / D** — Move forward/left/backward/right
- **Mouse** — Look around
- **Click** — Enable pointer lock (required for mouse look)
- **P** — Toggle to Author Mode

#### Author Mode (Node Editor)

**Node Management:**

- **Click sidebar buttons** — Add nodes to the canvas
- **Drag nodes** — Reposition nodes on canvas
- **Click nodes** — Select and configure node parameters
- **Ctrl/Cmd + Click** — Multi-select nodes
- **Ctrl/Cmd + C** — Copy selected nodes
- **Ctrl/Cmd + V** — Paste copied nodes (offset by 50px)
- **Backspace/Delete** — Delete selected nodes

**Node Connections:**

- **Connect handles** — Link nodes by dragging from output to input handles
- **Animated edges** — Visual feedback for active connections

**Navigation:**

- **P** — Toggle back to Player Mode
- **Escape** — Unlock mouse cursor (required when switching to Author Mode from Player Mode)

---

## Node Reference

The application consists of multiple node components organized into four categories: **Noise & Heightfields**, **Agent & Behavior Systems**, **Simulation & Natural Systems**, and **Structural / Generative Grammars**. Each node processes inputs and generates outputs that can be connected to other nodes to create complex procedural content.

### Noise & Heightfield Nodes

#### Perlin Noise Node

Generates multi-octave Perlin noise for terrain heightfields and procedural placement. This node creates noise values that can be used to drive terrain height generation, flower distribution patterns, or flow field effects for flocking systems.

**Inputs:**

- `seed (number)`: Random seed for noise generation (default: 42)
- `scale (number)`: Noise scale factor controlling frequency (default: 0.05)
- `octaves (number)`: Number of noise layers combined for detail (default: 4, max: 8)
- `persistence (number)`: Amplitude decay per octave (default: 0.5)
- `amplitude (number)`: Height amplitude multiplier (default: 10)
- `frequency (number)`: Base frequency of the noise pattern (default: 1)

**Outputs:**

- `type`: "perlinNoise"
- `value`: Sampled noise value at seed position
- `seed`, `scale`, `octaves`, `persistence`, `amplitude`, `frequency`: Configuration values

#### Terrain Node

Creates a 3D terrain mesh using noise configuration. This node receives noise parameters from a connected Noise Node and generates a terrain heightfield that all other objects automatically snap to.

**Inputs:**

- `config (object)`: Noise configuration from connected Noise Node (via config handle)

**Outputs:**

- Terrain configuration forwarded directly to renderer, updates world terrain mesh

### Agent & Behavior System Nodes

#### Agent Node

Defines agent spawn parameters for flocking systems. Specifies how many agents to create, their initial positions, velocities, and physical properties. Multiple agents are generated per node based on the count parameter.

**Inputs:**

- `count (number)`: Number of agents to spawn (default: 10, max: 200)
- `positionX/Y/Z (number)`: Base spawn position (default: 0, 50, 0)
- `velocityX/Y/Z (number)`: Initial velocity (default: 0)
- `size (number)`: Physical size of each agent (default: 0.3)
- `spread (number)`: Spawn spread radius (default: 20.0)
- `behavior (object)`: Flocking behavior configuration from Flocking Node

**Outputs:**

- `type`: "agent"
- All input parameters as outputs

#### Flocking Node

Configures flocking behavior rules using separation, alignment, and cohesion forces. Defines how agents interact with each other and their environment, creating natural flocking patterns. Optionally accepts noise input for flow field effects.

**Inputs:**

- `separation (number)`: Separation force strength (default: 1.5)
- `alignment (number)`: Alignment force strength (default: 1.0)
- `cohesion (number)`: Cohesion force strength (default: 1.0)
- `separationRadius (number)`: Detection radius for separation (default: 2.0)
- `neighborRadius (number)`: Detection radius for neighbors (default: 5.0)
- `maxSpeed (number)`: Maximum speed limit (default: 5.0)
- `maxForce (number)`: Maximum steering force limit (default: 0.1)
- `boundsWidth/Depth (number)`: Boundary dimensions (default: 50)
- `planeHeight (number)`: Vertical height of flocking plane (default: 50)
- `noise (object)`: Optional noise configuration for flow field effects

**Outputs:**

- `type`: "flockingBehavior"
- All input parameters as outputs

### Simulation & Natural System Nodes

#### L-System Node

Generates L-system strings for procedural plant generation. Implements Lindenmayer systems to create branching patterns that define plant structures. Users define an axiom and replacement rules that get applied iteratively.

**Inputs:**

- `axiom (string)`: Starting string (default: "F")
- `rule1/2/3 (string)`: Rule characters to be replaced
- `rule1/2/3Replacement (string)`: Replacement strings (default rule1: "F[+F]F[-F]F")
- `iterations (number)`: Number of rule applications (default: 3, max: 8)
- `angle (number)`: Branch angle in degrees (default: 25)
- `stepSize (number)`: Step size for drawing commands (default: 1.0)

**Outputs:**

- `type`: "lsystem"
- `axiom`, `rules`, `iterations`, `angle`, `stepSize`, `resultString`

#### Plant Node

Creates 3D plants using L-system geometry. Takes an L-system definition and renders it as a 3D plant structure with branches and leaves. Plants automatically snap their base position to terrain height.

**Inputs:**

- `positionX/Y/Z (number)`: Plant position (default: 0, auto-adjusted to terrain)
- `branchThickness (number)`: Thickness of branches (default: 0.1)
- `branchColor (string)`: Branch color in hex (default: "#8B4513")
- `leafSize (number)`: Size of leaves (default: 0.3)
- `leafColor (string)`: Leaf color in hex (default: "#228B22")
- `leafDensity (number)`: Density of leaves 0-1 (default: 0.7)
- `lsystem (object)`: L-system definition from L-System Node (required)

**Outputs:**

- `type`: "plant"
- All input parameters as outputs

#### Flower Node

Places procedural flowers on terrain using noise-based distribution. Generates a specified number of flowers distributed across an area, with optional noise input controlling placement density and clustering patterns.

**Inputs:**

- `count (number)`: Number of flowers (default: 50, max: 500)
- `spread (number)`: Distribution spread radius (default: 50.0)
- `size (number)`: Size of individual flowers (default: 1.0)
- `noise (object)`: Optional noise configuration for placement density

**Outputs:**

- `type`: "flower"
- `count`, `spread`, `size`, `noiseConfig`

### Structural / Generative Grammar Nodes

#### Building Grammar Node

Generates building structure definitions using procedural grammar. Creates architectural structures with configurable levels, rooms, and layouts. Generates complete building geometry including walls, floors, and optional staircases.

**Inputs:**

- `levels (number)`: Number of building levels (default: 3, max: 10)
- `roomsPerLevel (number)`: Number of rooms per level (default: 4, max: 16)
- `roomSize (number)`: Size of individual rooms (default: 4.0)
- `levelHeight (number)`: Height of each level (default: 3.0)
- `wallThickness (number)`: Thickness of walls (default: 0.2)
- `hasStairs (boolean)`: Include staircases (default: true)
- `roomLayout (string)`: Layout pattern - "grid", "linear", or "radial" (default: "grid")

**Outputs:**

- `type`: "buildingGrammar"
- All input parameters plus `building` object with geometry data

#### Building Node

Instantiates buildings in the world using grammar definitions. Places buildings at specified positions, automatically adjusting their base height to match terrain elevation.

**Inputs:**

- `positionX/Y/Z (number)`: Building position (default: 0, auto-adjusted to terrain)
- `color (string)`: Building color in hex (default: "#ffffff")
- `grammar (object)`: Building grammar definition from Building Grammar Node (required)

**Outputs:**

- `type`: "building"
- All input parameters as outputs

---

## Architecture

The codebase follows object-oriented design principles with a clear separation of concerns and hierarchical class structure, making it scalable and maintainable.

### Core Architecture (`src/core/`)

#### Base Classes

The foundation consists of abstract base classes that define common interfaces:

- **`algorithms/NoiseGenerator.js`**: Abstract base class for all noise generation algorithms. Provides `noise2D()`, `noise2DOctaves()`, and interpolation utilities.
- **`algorithms/Grammar.js`**: Abstract base class for grammar-based generation systems (L-systems, shape grammars, building grammars). Provides rule application and string replacement utilities.
- **`world/WorldObject.js`**: Base class for all 3D world objects. Manages Three.js groups, meshes, materials, and geometries with automatic resource disposal.
- **`world/Entity.js`**: Extends `WorldObject` for entities that can move and interact. Provides position, velocity, acceleration, and force application capabilities.

#### Configuration Classes (`src/core/config/`)

Encapsulated configuration objects providing type safety and validation:

- **`NoiseConfig.js`**: Configuration for noise generators supporting multiple noise types (Perlin, Voronoi, Simplex, Ridge, Domain Warping).
- **`FlockingConfig.js`**: Configuration for flocking behavior systems with bounds, forces, and noise integration.

#### Service Layer (`src/core/services/`)

Manager classes for system-level operations:

- **`SceneManager.js`**: Centralized management of Three.js scene, camera, renderer, and lighting.
- **`EntityManager.js`**: Manages entity lifecycle (creation, updates, disposal) with ID-based tracking.

### Algorithm Implementation (`src/algorithms/`)

All algorithms are implemented as classes extending appropriate base classes:

- **`PerlinNoise`** extends `NoiseGenerator`: Perlin noise with permutation table management
- **`LSystem`** extends `Grammar`: L-system implementation for procedural plant generation
- **`BuildingGrammar`** extends `Grammar`: Building structure generation with configurable layouts
- **`Boid`** extends `Entity`: Individual boid entity for flocking systems
- **`FlockingSystem`**: Manages boid behavior using `FlockingConfig` for configuration

### World Objects (`src/world/`)

World objects extend `WorldObject` and provide factory functions for backward compatibility:

- **`plants/Plant.js`**: Extends `WorldObject`, creates 3D plant geometry from L-systems
- **`buildings/Building.js`**: Extends `WorldObject`, creates building geometry from grammar definitions
- Factory functions (`createPlant.js`, `createBuilding.js`) wrap class instances to maintain existing API
