const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const searchRoutes = require("./routes/searchRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const socketHandler =
require("./socket/socketHandler");

const {
  setIO
} =
require("./socket/socketInstance");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {

  cors: {

    origin: "*",

    methods: ["GET", "POST"]

  }

});

setIO(io);
socketHandler(io);

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {

  res.send(
    "Campus Messaging Backend Running"
  );

});



server.listen(5000, () => {

  console.log(
    "Server running on port 5000"
  );

});