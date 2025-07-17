import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);

const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST"],
};
app.use(cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions,
});

const users = {}; // socket.id -> username

io.on("connection", (socket) => {
  console.log("Socket.io connected:", socket.id);

  // On join
  socket.on("newUser", (username) => {
    users[socket.id] = username;
    io.emit("get-users", users); // send all current users
    socket.broadcast.emit("joined", `${username} joined the chat`);
  });

  // On message
  socket.on("sendMsg", (msg) => {
    io.emit("recieveMsg", msg);
  });

  // On disconnect
  socket.on("disconnect", () => {
    const username = users[socket.id];
    delete users[socket.id];
    io.emit("get-users", users); // update active users
    socket.broadcast.emit("joined", `${username} left the chat`);
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to Socket.IO Chat");
});

server.listen(8080, () => {
  console.log("Socket Server Running on http://localhost:8080");
});
