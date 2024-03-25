import authMiddleware from "../middlewares/authMiddleware.js";
import ChatModel from "../models/ChatModel.js";
import UserModel from "../models/UserModel.js";
import { CustomRequest } from "../types/types.js";

export interface IUser {
  _id: string;
  name: string;
  lastname?: string;
  mainPicture?: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IChat {
  messagesWith: string;
  user: IUser;
  lastMessage?: string;
  date?: string;
}

export interface IMessage {
  date: string;
  _id: string;
  msg: string;
  receiver: string;
  sender: string;
}

import express from "express";

const router = express.Router();

//Get all chats
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
        lastMessage:
          chat?.messages?.length > 0
            ? chat.messages[chat.messages.length - 1].msg
            : null,
        date:
          chat?.messages?.length > 0
            ? chat.messages[chat.messages.length - 1].date
            : null,
      }));
    }
    return res.json(chatsToBeSent);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

//Create chat
router.post("/", authMiddleware, async (req, res) => {
  const { userId, msgSendToUserId } = req.body;

  try {
    const user = await ChatModel.findOne({ user: userId });
    const msgSendToUser = await ChatModel.findOne({ user: msgSendToUserId });

    const previousChat = user.chats.find(
      (chat) => chat.messagesWith.toString() === msgSendToUserId
    );

    if (!previousChat) {
      const newChat = { messagesWith: msgSendToUserId, messages: [] };
      user.chats.unshift(newChat);
      await user.save();
    }

    const previousChatForReceiver = msgSendToUser.chats.find(
      (chat) => chat.messagesWith.toString() === userId
    );

    if (!previousChatForReceiver) {
      const newChat = { messagesWith: userId, messages: [] };
      msgSendToUser.chats.unshift(newChat);
      await msgSendToUser.save();
    }

    if (previousChat) {
      return res.status(200).json({ message: "Chat already exists" });
    }
    const userData = await UserModel.findById(msgSendToUserId);

    const ChatObj = {
      messagesWith: msgSendToUserId,
      user: userData,
    };

    return res.status(201).json(ChatObj);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
