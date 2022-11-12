const admin = require("./firebase.admin");
const { socketErrorHandler } = require("../utils/global.utils");

module.exports = {
  verifyAccessToken: async (accessToken) =>
    await admin
      .auth()
      .verifyIdToken(accessToken)
      .then((data) => data)
      .catch((err) => {
        const errorInfo = err.errorInfo;
        if (process.env.NODE_ENV === "development" && errorInfo)
          console.log(errorInfo.code, errorInfo.message);

        switch (errorInfo.code) {
          case "auth/argument-error":
          case "auth/invalid-id-token":
          case "auth/id-token-revoked":
            return socketErrorHandler(
              400,
              "FIREBASE AUTH",
              "INVALID ACCESS TOKEN",
              err.errorInfo
            );

          case "auth/id-token-expired":
            return socketErrorHandler(
              400,
              "FIREBASE AUTH",
              "EXPIRED ACCESS TOKEN",
              err.errorInfo
            );

          default:
            return socketErrorHandler(
              500,
              "FIREBASE AUTH",
              "ERROR OCCURED - VERIFYING AN ACCESS TOKEN"
            );
        }
      }),
  getFBUser: async (fbId) =>
    await admin
      .auth()
      .getUser(fbId)
      .then((data) => data)
      .catch((err) => {
        const errorInfo = err.errorInfo;
        if (process.env.NODE_ENV === "development" && errorInfo)
          console.log(errorInfo.code, errorInfo.message);

        switch (errorInfo.code) {
          case "auth/user-not-found":
            return socketErrorHandler(
              404,
              "FIREBASE AUTH",
              "UNABLE TO FIND USER"
            );

          default:
            return socketErrorHandler(
              500,
              "FIREBASE AUTH",
              "ERROR OCCURED - GETTING A USER"
            );
        }
      }),
  getMultipleFBUsers: async (users) =>
    await admin
      .auth()
      .getUsers(
        users.map((user) => ({
          uid: user.fbId,
        }))
      )
      .then((data) => data)
      .catch((err) => {
        const errorInfo = err.errorInfo;
        if (process.env.NODE_ENV === "development" && errorInfo)
          console.log(errorInfo.code, errorInfo.message);

        switch (errorInfo.code) {
          default:
            return socketErrorHandler(
              500,
              "FIREBASE AUTH",
              "ERROR OCCURED - GETTING MULTIPLE USERS"
            );
        }
      }),
};
