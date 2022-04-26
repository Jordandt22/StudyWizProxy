const { UserModel } = require("../models/models");
const User = UserModel();
const { cacheData } = require("../redis/redis.mw");
const { USER_KEY } = require("../redis/redis.keys");
const { emitSocketError } = require("../utils/global.utils");
const { getSocketUser } = require("../utils/socket.utils");

// Update User
const updateUserCache = async (fbId, updatedUser) =>
  await cacheData(USER_KEY, { fbId }, updatedUser);

module.exports = {
  favoriteSet: async (socket, data) => {
    const ERROR_EVENT = "favorite-set-response-error";

    // Getting the Socket User's Data
    const { data: socketUserData, error } = await getSocketUser(socket);
    if (error)
      return emitSocketError(socket, ERROR_EVENT, error.status, error.message);

    // Checking if the Set Exists
    const { sets } = socketUserData;
    const { fbId, setId } = data;
    const setExist = sets.filter((set) => set.setId === setId)[0];
    if (!setExist)
      return emitSocketError(socket, ERROR_EVENT, 404, "UNABLE TO FIND SET");

    // Favoriting / Unfavoriting a set
    const { favorite } = setExist;
    const updatingUser = await User.findOneAndUpdate(
      { fbId, "sets.setId": setId },
      {
        $set: { "sets.$.favorite": !favorite },
      },
      { returnDocument: "after" }
    );

    // Update Redis Cache
    const updatedUser = updatingUser.value;
    if (!updatedUser)
      return emitSocketError(socket, ERROR_EVENT, 404, "UNABLE TO FIND USER");

    await updateUserCache(fbId, updatedUser);
    socket.emit("favorite-set-response", {
      user: { sets: updatedUser.sets },
      dataSent: data,
    });
  },
  favoriteTerm: async (socket, data) => {
    const ERROR_EVENT = "favorite-term-response-error";

    // Getting the Socket User's Data
    const { data: socketUserData, error } = await getSocketUser(socket);
    if (error)
      return emitSocketError(socket, ERROR_EVENT, error.status, error.message);

    // Checking if the Set Exists
    const { sets } = socketUserData;
    const { fbId, setId, termId } = data;
    const setExist = sets.filter((set) => set.setId === setId)[0];
    if (!setExist)
      return emitSocketError(socket, ERROR_EVENT, 404, "UNABLE TO FIND SET");

    // Checking if term is already favorited
    const { favoriteTerms } = setExist;
    const alreadyFavorited = favoriteTerms.some(
      (term) => term.termId === termId
    );

    // Favorite Term
    const updatingUser = await User.findOneAndUpdate(
      { fbId, "sets.setId": setId },
      !alreadyFavorited
        ? {
            $push: { "sets.$.favoriteTerms": { termId } },
          }
        : {
            $pull: { "sets.$.favoriteTerms": { termId } },
          },
      { returnDocument: "after" }
    );

    // Update Redis Cache
    const updatedUser = updatingUser.value;
    if (!updatedUser)
      return emitSocketError(socket, ERROR_EVENT, 404, "UNABLE TO FIND USER");

    await updateUserCache(fbId, updatedUser);
    socket.emit("favorite-term-response", {
      user: { sets: updatedUser.sets },
      dataSent: data,
    });
  },
};
