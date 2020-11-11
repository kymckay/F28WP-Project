const World = require('./world');

class Lobby {
  constructor(io) {
    this.io = io;

    // ID will be used as room for sockets
    this.id = `${Lobby.lobbyID++}`;

    this.world = new World();
    this.inProgress = false;
    this.players = {};
  }

  join(socket) {
    this.players[socket.id] = socket;

    // Give the player a ship in the world
    const ship = this.world.addPlayer(socket.id);
    socket.emit('player setup', {
      id: ship.id,
      pos: ship.pos,
      dir: ship.angle,
    });

    // Tell everyone in the room this player has joined
    this.io.to(this.id).emit('joined lobby', socket.id);
    socket.join(this.id); // join the room
  }

  leave(socket) {
    this.world.removePlayer(socket.id);
    delete this.players[socket.id];

    // TODO handle this client-side
    this.io.to(this.id).emit('left lobby', socket.id);
  }

  startGame() {
    this.inProgress = true;
    this.world.startGame();

    // TODO in world
    // const asteroids = [];
    // for (let i = 0; i < 10; i += 1) {
    //   const ast = new Asteroid(
    //     [Math.random() * 1000, Math.random() * 1000],
    //     50 + Math.random() * 50
    //   );
    //   asteroids.push({
    //     id: ast.id,
    //     pos: ast.pos,
    //     vel: ast.velocity,
    //     size: ast.size,
    //   });
    // }

    this.io.to(this.id).emit('game start', {
      world: [this.world.width, this.world.height],
      asteroids: [],
    });
  }
}
Lobby.lobbyID = 0;

module.exports = Lobby;
