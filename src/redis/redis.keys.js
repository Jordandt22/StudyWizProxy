module.exports = {
  USER_KEY: {
    name: "user",
    params: ["fbId"],
    expiresIn: 60 * 60,
    callback: (data, req, next) => {
      if (!data) return next();

      const cachedData = JSON.parse(data);
      req.user = cachedData;
      return next();
    },
  },
  SET_KEY: {
    name: "set",
    params: ["setId"],
    expiresIn: 60 * 60 * 12,
  },
};
