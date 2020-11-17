const performance = require('perf_hooks');
const Ship = require('./ship');
const Asteroid = require('./asteroid');

class World {
  constructor() {
    // Need at least enough cells for minPlayers
    const gridDims = Math.ceil(Math.sqrt(World.minPlayers));

    // World spatial extent always square
    this.width = gridDims * World.cellSize;
    this.height = this.width;

    // Players will spawn spaced out
    this.spawnPositions = [];
    for (let i = 0; i < gridDims; i++) {
      for (let j = 0; j < gridDims; j++) {
        this.spawnPositions.push([
          i * World.cellSize + World.cellSize / 2,
          j * World.cellSize + World.cellSize / 2,
        ]);
      }
    }

    // Entites stores in objects as they'll be accessed by ID
    this.asteroids = {};
    this.ships = {};
    this.projectiles = {};
  }

  addPlayer(id) {
    if (this.spawnPositions.length === 0) {
      this.expandWorld();
    }

    // Players should not be spawned in any particular pattern
    const pos = this.spawnPositions.splice(
      Math.floor(Math.random() * this.spawnPositions.length),
      1
    )[0];

    const ship = new Ship(pos, true);
    ship.id = id;

    this.ships[id] = ship;

    return ship;
  }

  removePlayer(id) {
    // TODO free spawn pos if game not yet started
    delete this.ships[id];
  }

  // If more space is needed another column and row are added
  expandWorld() {
    this.width += World.cellSize;
    this.height += World.cellSize;

    // Will always be a multiple so this is an int
    const gridDims = this.width / World.cellSize;
    const offset = this.width - World.cellSize / 2;

    for (let i = 0; i < gridDims; i++) {
      // All new column cells
      this.spawnPositions.push([
        offset,
        i * World.cellSize + World.cellSize / 2,
      ]);

      // Lower right cell is in both column and row
      // Don't duplicate
      if (i === gridDims - 1) {
        break;
      }

      // All new row cells
      this.spawnPositions.push([
        i * World.cellSize + World.cellSize / 2,
        offset,
      ]);
    }
  }

  genAsteroids() {
    // Generate asteroids in each cell (avoiding spawn position)
    for (let a = 0; a < World.astFrequency; a++) {
      for (let i = 0; i < this.width; i += World.cellSize) {
        for (let j = 0; j < this.height; j += World.cellSize) {
          // rejection sampling to find points away from cell centre
          let x;
          let y;
          do {
            x = Math.random() * World.cellSize;
            y = Math.random() * World.cellSize;
          } while (
            Math.abs(World.cellSize / 2 - x) < World.clearRadius
            || Math.abs(World.cellSize / 2 - y) < World.clearRadius
          );

          // All asteroids start randomly sized and distributed
          const ast = new Asteroid(
            [i + x, j + y],
            [Math.random() * 6 - 3, Math.random() * 6 - 3], // x,y are within the cell i,j
            Asteroid.minSize + Math.random() * (Asteroid.maxSize - Asteroid.minSize)
          );

          this.asteroids[ast.id] = ast;
        }
      }
    }
  }

  genAIShips() {
    // Any remaining spawn positions become an AI
    this.spawnPositions.forEach((pos) => {
      const ai = new Ship(pos, false);

      this.ships[ai.id] = ai;
    });
  }

  playerInput(playerID, input) {
    const ship = this.ships[playerID];

    // TODO track active input of the ships and simulate their controls
  }

  start() {
    // this.genAIShips();
    this.genAsteroids();

    // TODO start simulation
    this.loopInterval = setInterval(() => { this.simulate(); }, 50);
  }

  simulate() {
    this.asteroids.forEach((e) => {
      e.pos[0] += e.vel[0];
      e.pos[1] += e.vel[1];
    });

    this.ships.forEach((e) => {
      e.pos[0] += e.vel[0];
      e.pos[1] += e.vel[1];
    });
  }

  end() {
    clearInterval(this.loopInterval);
  }

  // addEntity() {}

  // removeEntity() {}

  serialize() {
    // Using ES6 computed property names and the spread operator
    // We essentially have a .map method for objects
    const asteroids = Object.assign(
      {},
      ...Object.keys(this.asteroids).map(
        (k) => ({ [k]: this.asteroids[k].serialize() })
      )
    );
    const ships = Object.assign(
      {},
      ...Object.keys(this.ships).map(
        (k) => ({ [k]: this.ships[k].serialize() })
      )
    );

    return {
      world: [this.width, this.height],
      time: performance.now(),
      asteroids,
      ships,
    };
  }
}
World.minPlayers = 10; // a world will scale for at least this many players
World.cellSize = 2000; // px (player starts in each cell)
World.clearRadius = 100; // px (clear space around spawn positions)
World.astFrequency = 5; // asteroids per grid cell

module.exports = World;