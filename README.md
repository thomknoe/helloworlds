![helloworld.js header](https://github.com/thomknoe/helloworld.js/blob/main/public/github-cover.png)

# helloworld.js

helloworld.js is a procedural 3D world generation tool, combines procedural generation algorithms with a visual node editor to create dynamic immersive environments. It features a node-based authoring system for procedural content creation and first-person exploration mode for navigating generated worlds. Procedural terrain generation uses Perlin noise, L-System-based plant generation with customizable growth patterns, flocking behavior systems for dynamic agent movement, procedural building generation using shape grammars, and interactive flower placement driven by noise patterns. Users can switch between author mode for designing worlds and player mode for exploring them. Game designers, procedural content creators, 3D artists, students learning procedural generation, and interactive media developers are the primary users.

# Quick Start

Visit the web application at [https://thomknoe.github.io/helloworld.js/](https://thomknoe.github.io/helloworld.js/)

## Controls

### Player Mode (First-Person)

- **W / A / S / D** — Move forward/left/backward/right
- **Mouse** — Look around
- **Click** — Enable pointer lock (required for mouse look)
- **P** — Toggle to Author Mode

### Author Mode (Node Editor)

- **Click sidebar buttons** — Add nodes to the canvas
- **Drag nodes** — Reposition nodes
- **Connect handles** — Link nodes by dragging from output to input handles
- **Click nodes** — Select and configure node parameters
- **P** — Toggle back to Player Mode

# Detailed Guide

The helloworld.js application consists of multiple node components organized into four categories: Noise & Heightfields, Agent & Behavior Systems, Simulation & Natural Systems, and Structural / Generative Grammars. Each node processes inputs and generates outputs that can be connected to other nodes to create complex procedural content. The nodes communicate through ReactFlow connections, with outputs from one node feeding into inputs of another.

## Perlin Noise Node

Generates multi-octave Perlin noise for terrain heightfields and procedural placement. This node creates noise values that can be used to drive terrain height generation, flower distribution patterns, or flow field effects for flocking systems.

### Inputs:

- `seed (number)`: Random seed for noise generation (default: 42)
- `scale (number)`: Noise scale factor controlling the frequency of noise patterns (default: 0.05)
- `octaves (number)`: Number of noise layers combined for detail (default: 4, max: 8)
- `persistence (number)`: Amplitude decay per octave, controlling how much each layer contributes (default: 0.5)
- `amplitude (number)`: Height amplitude multiplier for noise values (default: 10)
- `frequency (number)`: Base frequency of the noise pattern (default: 1)

### Outputs:

- `type (string)`: Output type identifier "perlinNoise"
- `value (number)`: Sampled noise value at the seed position
- `seed (number)`: Noise seed value
- `scale (number)`: Noise scale value
- `octaves (number)`: Number of octaves used
- `persistence (number)`: Persistence value used
- `amplitude (number)`: Amplitude value used
- `frequency (number)`: Frequency value used

## Terrain Node

Creates a 3D terrain mesh using Perlin noise configuration. This node receives noise parameters from a connected Perlin Noise Node and generates a terrain heightfield that all other objects automatically snap to.

### Inputs:

- `config (object)`: Receives noise configuration from Perlin Noise Node via config handle, including seed, scale, octaves, persistence, amplitude, and frequency values

### Outputs:

- `(none)`: Terrain configuration is forwarded directly to the renderer and updates the world terrain mesh

## Agent Node

Defines agent spawn parameters for flocking systems. This node specifies how many agents to create, their initial positions, velocities, and physical properties. Multiple agents are generated per node based on the count parameter with positions distributed around the base position using the spread radius.

### Inputs:

- `count (number)`: Number of agents to spawn (default: 10, max: 200)
- `positionX (number)`: Base spawn position X coordinate (default: 0)
- `positionY (number)`: Base spawn position Y coordinate (default: 50)
- `positionZ (number)`: Base spawn position Z coordinate (default: 0)
- `velocityX (number)`: Initial velocity in X direction (default: 0)
- `velocityY (number)`: Initial velocity in Y direction (default: 0)
- `velocityZ (number)`: Initial velocity in Z direction (default: 0)
- `size (number)`: Physical size of each agent (default: 0.3)
- `spread (number)`: Spawn spread radius for distributing agents around base position (default: 20.0)
- `behavior (object)`: Flocking behavior configuration from Flocking Node (connected via behavior handle)

### Outputs:

- `type (string)`: Output type identifier "agent"
- `count (number)`: Number of agents
- `positionX (number)`: Base position X
- `positionY (number)`: Base position Y
- `positionZ (number)`: Base position Z
- `velocityX (number)`: Initial velocity X
- `velocityY (number)`: Initial velocity Y
- `velocityZ (number)`: Initial velocity Z
- `size (number)`: Agent size
- `spread (number)`: Spawn spread radius

## Flocking Node

Configures flocking behavior rules for agents using separation, alignment, and cohesion forces. This node defines how agents interact with each other and their environment, creating natural flocking patterns. Optionally accepts noise input for flow field effects that influence agent movement direction.

### Inputs:

- `separation (number)`: Separation force strength determining how strongly agents avoid each other (default: 1.5)
- `alignment (number)`: Alignment force strength determining how strongly agents match neighbor velocities (default: 1.0)
- `cohesion (number)`: Cohesion force strength determining how strongly agents move toward group center (default: 1.0)
- `separationRadius (number)`: Detection radius for separation force (default: 2.0)
- `neighborRadius (number)`: Detection radius for finding neighbors for alignment and cohesion (default: 5.0)
- `maxSpeed (number)`: Maximum speed limit for agents (default: 5.0)
- `maxForce (number)`: Maximum steering force limit (default: 0.1)
- `boundsWidth (number)`: Boundary width for containing flock movement (default: 50)
- `boundsDepth (number)`: Boundary depth for containing flock movement (default: 50)
- `planeHeight (number)`: Vertical height of the flocking plane (default: 50)
- `noise (object)`: Optional Perlin noise configuration for flow field effects (connected via noise handle)

### Outputs:

- `type (string)`: Output type identifier "flockingBehavior"
- `separation (number)`: Separation force value
- `alignment (number)`: Alignment force value
- `cohesion (number)`: Cohesion force value
- `separationRadius (number)`: Separation radius value
- `neighborRadius (number)`: Neighbor radius value
- `maxSpeed (number)`: Maximum speed value
- `maxForce (number)`: Maximum force value
- `boundsWidth (number)`: Boundary width value
- `boundsDepth (number)`: Boundary depth value
- `planeHeight (number)`: Plane height value
- `noiseConfig (object)`: Noise configuration if connected, otherwise null

## L-System Node

Generates L-system strings for procedural plant generation. This node implements Lindenmayer systems to create branching patterns that define plant structures. Users define an axiom (starting string) and replacement rules that get applied iteratively to generate complex fractal-like patterns.

### Inputs:

- `axiom (string)`: Starting string for the L-system (default: "F")
- `rule1 (string)`: First rule character to be replaced
- `rule1Replacement (string)`: Replacement string for first rule (default: "F[+F]F[-F]F")
- `rule2 (string)`: Second rule character (optional)
- `rule2Replacement (string)`: Replacement string for second rule (optional)
- `rule3 (string)`: Third rule character (optional)
- `rule3Replacement (string)`: Replacement string for third rule (optional)
- `iterations (number)`: Number of times to apply rules (default: 3, max: 8)
- `angle (number)`: Branch angle in degrees for interpreting L-system commands (default: 25)
- `stepSize (number)`: Step size for drawing commands (default: 1.0)

### Outputs:

- `type (string)`: Output type identifier "lsystem"
- `axiom (string)`: Starting axiom string
- `rules (object)`: Dictionary mapping rule characters to their replacement strings
- `iterations (number)`: Number of iterations performed
- `angle (number)`: Branch angle converted to radians
- `stepSize (number)`: Step size value
- `resultString (string)`: Generated L-system string after all iterations

## Plant Node

Creates 3D plants using L-system geometry. This node takes an L-system definition and renders it as a 3D plant structure with branches and leaves. Plants automatically snap their base position to terrain height, ensuring they sit properly on the ground.

### Inputs:

- `positionX (number)`: Plant position X coordinate (default: 0)
- `positionY (number)`: Plant position Y coordinate, automatically adjusted to terrain height
- `positionZ (number)`: Plant position Z coordinate (default: 0)
- `branchThickness (number)`: Thickness of plant branches (default: 0.1)
- `branchColor (string)`: Color of branches/bark in hex format (default: "#8B4513")
- `leafSize (number)`: Size of individual leaves (default: 0.3)
- `leafColor (string)`: Color of leaves in hex format (default: "#228B22")
- `leafDensity (number)`: Density of leaves from 0 to 1 (default: 0.7)
- `lsystem (object)`: L-system definition from L-System Node (connected via lsystem handle, required)

### Outputs:

- `type (string)`: Output type identifier "plant"
- `positionX (number)`: Plant position X
- `positionY (number)`: Plant position Y (auto-adjusted to terrain height)
- `positionZ (number)`: Plant position Z
- `branchThickness (number)`: Branch thickness value
- `branchColor (string)`: Branch color value
- `leafSize (number)`: Leaf size value
- `leafColor (string)`: Leaf color value
- `leafDensity (number)`: Leaf density value
- `lsystem (object)`: L-system definition object

## Flower Node

Places procedural flowers on terrain using noise-based distribution. This node generates a specified number of flowers distributed across an area, with optional noise input controlling placement density and clustering patterns.

### Inputs:

- `count (number)`: Number of flowers to generate (default: 50, max: 500)
- `spread (number)`: Distribution spread radius for flower placement (default: 50.0)
- `size (number)`: Size of individual flowers (default: 1.0)
- `noise (object)`: Optional Perlin noise configuration for controlling placement density (connected via noise handle)

### Outputs:

- `type (string)`: Output type identifier "flower"
- `count (number)`: Number of flowers
- `spread (number)`: Distribution spread value
- `size (number)`: Flower size value
- `noiseConfig (object)`: Noise configuration if connected, otherwise null

## Building Grammar Node

Generates building structure definitions using procedural grammar. This node creates architectural structures with configurable levels, rooms, and layouts. The grammar generates complete building geometry including walls, floors, and optional staircases.

### Inputs:

- `levels (number)`: Number of building levels/floors (default: 3, max: 10)
- `roomsPerLevel (number)`: Number of rooms per level (default: 4, max: 16)
- `roomSize (number)`: Size of individual rooms (default: 4.0)
- `levelHeight (number)`: Height of each level (default: 3.0)
- `wallThickness (number)`: Thickness of walls (default: 0.2)
- `hasStairs (boolean)`: Whether to include staircases connecting levels (default: true)
- `roomLayout (string)`: Layout pattern type: "grid", "linear", or "radial" (default: "grid")

### Outputs:

- `type (string)`: Output type identifier "buildingGrammar"
- `levels (number)`: Number of levels
- `roomsPerLevel (number)`: Rooms per level value
- `roomSize (number)`: Room size value
- `levelHeight (number)`: Level height value
- `wallThickness (number)`: Wall thickness value
- `hasStairs (boolean)`: Stairs inclusion flag
- `roomLayout (string)`: Layout type value
- `building (object)`: Generated building structure geometry data

## Building Node

Instantiates buildings in the world using grammar definitions. This node places buildings at specified positions, automatically adjusting their base height to match terrain elevation.

### Inputs:

- `positionX (number)`: Building position X coordinate (default: 0)
- `positionY (number)`: Building position Y coordinate, automatically adjusted to terrain height
- `positionZ (number)`: Building position Z coordinate (default: 0)
- `color (string)`: Building color in hex format (default: "#ffffff")
- `grammar (object)`: Building grammar definition from Building Grammar Node (connected via grammar handle, required)

### Outputs:

- `type (string)`: Output type identifier "building"
- `positionX (number)`: Building position X
- `positionY (number)`: Building position Y (auto-adjusted to terrain height)
- `positionZ (number)`: Building position Z
- `color (string)`: Building color value
- `grammar (object)`: Building grammar definition object

# Files

- `src/algorithms/`: Core procedural generation logic (perlin.js, lsystem.js, buildingGrammar.js, flocking.js)
- `src/nodes/`: ReactFlow node components for visual editor (algorithms/, environment/, core/)
- `src/world/`: Three.js scene object creation (terrain/, buildings/, plants/, flowers/, flocking/)
- `src/player/`: First-person camera and controls (PlayerView.jsx, useFirstPersonControls.js, cameraRig.js)
- `src/ui/`: Author mode interface (AuthorCanvas.jsx, AuthorSidebar.jsx, AuthorFlowCanvas.jsx)
- `src/engine/`: Three.js renderer and scene setup (createRenderer.js, loadSkybox.js, loadTexture.js)
- `src/App.jsx`: Main application orchestrator
