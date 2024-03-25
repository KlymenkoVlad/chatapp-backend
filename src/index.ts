import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";

import signup from "./api/signup.js";
import login from "./api/login.js";
import chat from "./api/chat.js";
import user from "./api/user.js";

import connectDb from "./utils/connectDb.js";
import {
  addUser,
  findConnectedUser,
  removeUser,
} from "./utilsSocketio/roomActions.js";
import {
  deleteMsg,
  editMsg,
  loadMessages,
  sendMsg,
  startTalk,
} from "./utilsSocketio/messageActions.js";
import ExpressMongoSanitize from "express-mongo-sanitize";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: "*",
  })
);

app.use(helmet());
app.use(helmet());

const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(ExpressMongoSanitize());

app.use(compression());

app.use(bodyParser.json());

dotenv.config({ path: "./.env" });
const PORT = process.env.PORT || 3001;

connectDb();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    allowedHeaders: "*",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join", async ({ userId }) => {
    console.log("join");
    const users = await addUser(userId, socket.id);

    setInterval(() => {
      socket.emit("connectedUsers", {
        users: users.filter((user) => user.userId !== userId),
      });
    }, 10000);
  });

  socket.on("typing", (userId, msgSendToUserId) => {
    // Use the findConnectedUser function to get the recipient's socket
    const receiverSocket = findConnectedUser(msgSendToUserId);
    if (receiverSocket) {
      // Emit the 'userTyping' event to the specific recipient

      io.to(receiverSocket.socketId).emit("userTyping", userId);
    }
  });

  socket.on("stopTyping", () => {
    // Broadcast the 'stopTyping' event to all connected clients
    // console.log("stopTyping");
    socket.broadcast.emit("userStoppedTyping");
  });

  socket.on("loadMessages", async ({ userId, messagesWith }) => {
    const { chat, error } = await loadMessages(userId, messagesWith);

    !error
      ? socket.emit("messagesLoaded", { chat })
      : socket.emit("noChatFound");
  });

  socket.on("sendNewMsg", async ({ userId, msgSendToUserId, msg }) => {
    const { newMsg, error } = await sendMsg(userId, msgSendToUserId, msg);
    const receiverSocket = findConnectedUser(msgSendToUserId);

    if (receiverSocket) {
      // WHEN YOU WANT TO SEND MESSAGE TO A PARTICULAR SOCKET
      io.to(receiverSocket.socketId).emit("newMsgReceived", { newMsg });
    }

    !error && socket.emit("msgSent", { newMsg });
  });

  socket.on("deleteMsg", async ({ userId, msgSendToUserId, msgId }) => {
    const { error, userMessageIndex } = await deleteMsg(
      userId,
      msgSendToUserId,
      msgId
    );
    if (error) throw new Error(error);

    const receiverSocket = findConnectedUser(msgSendToUserId);
    const senderSocket = findConnectedUser(userId);

    // console.log(msgSendToUserId, userId);
    // console.log("warn", receiverSocket, senderSocket);

    if (receiverSocket) {
      // WHEN YOU WANT TO SEND MESSAGE TO A PARTICULAR SOCKET
      io.to(receiverSocket.socketId).emit("msgDeletedReceived", {
        userMessageIndex,
      });
    }
    if (senderSocket) {
      io.to(senderSocket.socketId).emit("msgDeletedReceived", {
        userMessageIndex,
      });
    }
  });

  socket.on("start-talk", async ({ userIdReceiver, userId }) => {
    // console.log(data.messagesWith, "data");
    // console.log(data, "data");

    const receiverSocket = findConnectedUser(userIdReceiver);

    const { error, data } = await startTalk(userId);
    console.log(data);

    console.log("start-talk");
    // console.log(receiverSocket.socketId);
    if (receiverSocket) {
      console.log("all good");

      // WHEN YOU WANT TO SEND MESSAGE TO A PARTICULAR SOCKET
      io.to(receiverSocket.socketId).emit("newChatAccept", data);
    }
  });

  socket.on(
    "editMsg",
    async ({ userId, msgSendToUserId, msgId, newMsgText }) => {
      const { error, userMessageIndex } = await editMsg(
        userId,
        msgSendToUserId,
        msgId,
        newMsgText
      );
      if (error) throw new Error(error);

      const receiverSocket = findConnectedUser(msgSendToUserId);
      const senderSocket = findConnectedUser(userId);

      // console.log(msgSendToUserId, userId);
      // console.log("warn", receiverSocket, senderSocket);

      if (receiverSocket) {
        // WHEN YOU WANT TO SEND MESSAGE TO A PARTICULAR SOCKET
        io.to(receiverSocket.socketId).emit("msgEditedReceived", {
          userMessageIndex,
          msgId,
          newMsgText,
        });
      }
      if (senderSocket) {
        io.to(senderSocket.socketId).emit("msgEditedReceived", {
          userMessageIndex,
          msgId,
          newMsgText,
        });
      }
    }
  );

  socket.on("userDisconnect", () => removeUser(socket.id));
});

app.get("/", (req, res) => {
  res.send("Welcome to the root path!");
});

app.use("/api/signup", signup);
app.use("/api/login", login);
app.use("/api/chat", chat);
app.use("/api/user", user);

server.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`); // Correct the port number in the log message
});
