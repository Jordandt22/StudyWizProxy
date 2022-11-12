module.exports = {
  getAPIServerURI: () => {
    const { NODE_ENV } = process.env;
    // const randomNum = Math.floor(Math.random() * 1) + 1;
    const randomNum = 1;
    const APIServerURI = process.env[`API_SERVER_URI_${randomNum}`];
    return NODE_ENV === "production" ? APIServerURI : "http://localhost:5050";
  },
};
