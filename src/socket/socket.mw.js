const { verifyAccessToken } = require("../firebase/firebase.utils");
const { socketErrorHandler } = require("../utils/global.utils");
const { getCache } = require("../redis/redis.mw");
const { USER_KEY } = require("../redis/redis.keys");
const { UserModel } = require("../models/models");
const User = UserModel();

module.exports = {
  authSocket: async (socket, next) => {
    const user = await verifyAccessToken(socket.handshake.auth.token);
    const userError = user.error;
    if (userError) return next(userError);

    socket.data.user = user;
    next();
  },
  getSocketUser: async (socket, next) => {
    const socketUser = socket.data.user;
    const { uid: fbId } = socketUser;

    // Getting Cached User
    const cachedUser = await getCache(USER_KEY, { fbId });
    if (cachedUser) {
      const cachedUserData = JSON.parse(cachedUser);
      socket.data.user = { ...socketUser, ...cachedUserData };
      return next();
    }

    // Getting Database Uer
    const dbUser = await User.findOne({ fbId });
    if (!dbUser)
      return next(
        socketErrorHandler(404, "REDIS", "UNABLE TO FIND USER IN DATABASE")
          .error
      );

    socket.data.user = { ...socketUser, ...dbUser };
    next();
  },
};
