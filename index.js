require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const connectDatabase = require("./config/connect");
require("./models");
const router = require("./routes");
const initSocket = require("./socket");
const { Server } = require("socket.io");

const app = express();

// io server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL, methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ status: 200, message: "working grate!" });
});

app.use("/api/v1", router);

initSocket(io);

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error", status: 500 });
});

connectDatabase();
server.listen(process.env.PORT || 5000, () =>
  console.log(
    `Server has started. http://localhost:${process.env.PORT || 5000}/`
  )
);
