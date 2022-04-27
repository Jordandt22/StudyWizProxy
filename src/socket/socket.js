const { Server } = require("socket.io");
const { favoriteSet, favoriteTerm } = require("./socket.handlers");
const { authSocket } = require("./socket.mw");
const { WEB_URL, NODE_ENV } = process.env;

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: NODE_ENV === "production" ? WEB_URL : "http://localhost:3000",
    },
  });
  console.log("Connected to Socket.io...");

  // API Namespace
  const APINamespace = io.of("/api");

  // Auth -> Firebase Token
  APINamespace.use(authSocket);

  // Connection to API Namespace
  APINamespace.on("connection", (socket) => {
    console.log(`${socket.id} Connected to API Namespace.`);

    // Favorite a set -> fbId, setId
    socket.on("favorite-set", (data) => favoriteSet(socket, data));

    // Favorite a set -> fbId, setId, termId
    socket.on("favorite-term", (data) => favoriteTerm(socket, data));

    // Disconnection
    socket.on("disconnect", () =>
      console.log(`${socket.id} has disconnected from API Namespace.`)
    );
  });
};
