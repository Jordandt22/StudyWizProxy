require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const rateLimiter = require("express-rate-limit");
const slowDown = require("express-slow-down");
const {
  createProxyMiddleware,
  fixRequestBody,
} = require("http-proxy-middleware");
const { checkProxyAuth } = require("./middleware/auth.mw");
const { getAPIServerURI } = require("./config/url");
const connectMongoose = require("./models/db");
const connectSocket = require("./socket/socket");
const app = express();

// Middleware
const { NODE_ENV, WEB_URL } = process.env;
const isProduction = NODE_ENV === "production";
app.use(helmet());
app.use(
  cors({
    origin: !isProduction ? "http://localhost:3000" : WEB_URL,
  })
);
app.use(express.json());
if (!isProduction) {
  app.use(morgan("dev"));
} else {
  app.enable("trust proxy");
  app.set("trust proxy", 1);
}

// Mongoose Connection
connectMongoose();

const timeLimit = 1000 * 60 * 5;
const limiter = rateLimiter({
  windowMs: timeLimit,
  max: 250,
});

const speedLimiter = slowDown({
  windowMs: timeLimit,
  delayAfter: 100,
  delayMs: 500,
});

// Rate & Speed Limiters
app.use(speedLimiter);
app.use(limiter);

// Routes

// Landing Page Route
app.get("/", (req, res) => {
  res.send("Proxy Server for StudyWiz is up and running...");
});

// Proxy Route
app.use(
  "/",
  // checkProxyAuth,
  createProxyMiddleware({
    target: getAPIServerURI(),
    changeOrigin: true,
    onProxyReq: fixRequestBody,
    router: () => getAPIServerURI(),
  })
);

// PORT and Sever
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`CORS Enabled Server, Listening to port: ${PORT}...`);
});
connectSocket(server);

// Export the Express API
module.exports = server;
