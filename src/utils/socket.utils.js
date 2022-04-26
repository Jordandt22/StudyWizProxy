const { getCache } = require("../redis/redis.mw");
const { USER_KEY } = require("../redis/redis.keys");
const { UserModel } = require("../models/models");
const User = UserModel();

module.exports = {
  getSocketUser: async (socket, ERROR_EVENT) => {
    const socketUser = socket.data.user;
    const { uid: fbId } = socketUser;

    // Getting Cached User
    const cachedUser = await getCache(USER_KEY, { fbId });
    if (cachedUser) {
      const cachedUserData = JSON.parse(cachedUser);
      return { data: { ...socketUser, ...cachedUserData }, error: null };
    }

    // Getting Database Uer
    const dbUser = await User.findOne({ fbId });
    if (!dbUser)
      return {
        data: null,
        error: { status: 404, message: "UNABLE TO FIND USER" },
      };

    return { data: { ...socketUser, ...dbUser }, error: null };
  },
};
