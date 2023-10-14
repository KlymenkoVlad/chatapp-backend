import ChatModel from "../models/ChatModel.js";
import UserModel from "../models/UserModel.js";

export const sendMsg = async (userId, msgSendToUserId, msg: string) => {
  try {
    const user = await ChatModel.findOne({ user: userId });
    const msgSendToUser = await ChatModel.findOne({ user: msgSendToUserId });

    const newMsg = {
      sender: userId,
      receiver: msgSendToUserId,
      msg,
      date: Date.now(),
    };

    const previousChat = user.chats.find(
      (chat) => chat.messagesWith.toString() === msgSendToUserId
    );

    if (previousChat) {
      previousChat.messages.push(newMsg);
      await user.save();
    } else {
      const newChat = { messagesWith: msgSendToUserId, messages: [newMsg] };
      user.chats.unshift(newChat);
      await user.save();
    }

    const previousChatForReceiver = msgSendToUser.chats.find(
      (chat) => chat.messagesWith.toString() === userId
    );

    if (previousChatForReceiver) {
      previousChatForReceiver.messages.push(newMsg);
      await msgSendToUser.save();
    } else {
      const newChat = { messagesWith: userId, messages: [newMsg] };
      msgSendToUser.chats.unshift(newChat);
      await msgSendToUser.save();
    }

    return { newMsg };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export const loadMessages = async (userId, messagesWith) => {
  try {
    const user = await ChatModel.findOne({ user: userId }).populate(
      "chats.messagesWith"
    );

    const chat = user.chats.find(
      (chat) => chat.messagesWith._id.toString() === messagesWith
    );

    if (!chat) {
      return { error: "No chat found" };
    }

    return { chat };
  } catch (error) {
    console.error(error);
    return { error };
  }
};