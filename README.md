# F28WP-Project
Web based game group project for web programming course.

Branch `master` automatically deployed to: https://steak-game.herokuapp.com

Check out [CONTRIBUTING.md](CONTRIBUTING.md) for instructions on setting up for development as well as details on testing, deployment and style standards.

## Our Game

Our initial game idea was an asteroids-inspired deathmatch in which players pilot a ship with a cannon and try to destroy each other and avoid asteroids.

Features:
- Rolling lobby system to manage amount of players in a game instance and reduce networking load per game.
- World generation/scaling based on number of players in a lobby.
- Collision interactions between player ships, asteroids and projectiles.
- AJAX login/registration system.
- Backend MySQL database to store users, passwords and statistics.

## Implementation Overview

- **Simulation**: On the server the [World class](server/classes/world.js) handles simulating all entities in the game (using recieved player inputs for ships).
- **Networking**: The server and client communicate via [socket.io](https://github.com/socketio/socket.io) which uses TCP. On the client-side only relevant player inputs are sent to the server. On the server side, all networking is done via the [Lobby class](server/classes/lobby.js) which sends client's simulation frames/snapshots from the World for rendering as well as significant events (e.g. game start, game end). This approach has some limitations, see [issue #33](https://github.com/kymckay/F28WP-Project/issues/33) for details.
- **Rendering**: The client renders all recieved simulation frames/snapshots from the server. Each client sees only the region of space around their ship and so this entails converting from the World coordinates used by the server-side simulation to screen space coordinates (both coordinate systems are measured in pixels). The background stars are generated hourly on the server-side and injected into the served HTML files (so everyone conected will see the same starfield).
- **Game-logic**: WIP
- **Database**: Our backend data storage is using MySQL via the ["mysql" module](https://www.npmjs.com/package/mysql).
