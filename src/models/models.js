const mongoose = require("mongoose");

module.exports = {
  UserModel: () =>
    mongoose.connection
      .once("open", () => mongoose.connection.db.collection("users"))
      .collection("users"),
  SetsModel: () =>
    mongoose.connection
      .once("open", () => mongoose.connection.db.collection("sets"))
      .collection("sets"),
};
