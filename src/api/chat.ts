import authMiddleware from "../middlewares/authMiddleware.js";
import ChatModel from "../models/ChatModel.js";
import { CustomRequest } from "../types/types.js";

import express from "express";

const router = express.Router();

router.get("/", authMiddleware, async (req: CustomRequest, res) => {
  try {
    const { userId } = req;

    const user = await ChatModel.findOne({ user: userId }).populate(
      "chats.messagesWith"
    );

    let chatsToBeSent = [];

    if (user.chats.length > 0) {
      chatsToBeSent = await user.chats.map((chat) => ({
        messagesWith: chat.messagesWith._id,
        user: chat.messagesWith,
        lastMessage: chat.messages[chat.messages.length - 1].msg,
        date: chat.messages[chat.messages.length - 1].date,
      }));
    }
    return res.json(chatsToBeSent);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

export default router;
