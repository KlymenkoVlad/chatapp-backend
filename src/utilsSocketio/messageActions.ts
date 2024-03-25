import mongoose from "mongoose";
import ChatModel from "../models/ChatModel.js";
import UserModel from "../models/UserModel.js";

export const sendMsg = async (userId, msgSendToUserId, msg: string) => {
  try {
    const user = await ChatModel.findOne({ user: userId });
    const msgSendToUser = await ChatModel.findOne({ user: msgSendToUserId });

    const newMsg = {
      _id: new mongoose.Types.ObjectId(), // Automatically generated ID
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

export const startTalk = async (userId: string) => {
  try {
    const user = await UserModel.findOne({ _id: userId });

    const data = {
      messagesWith: userId,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        __v: user.__v,
      },
      lastMessage: null,
      date: null,
    };

    return { data };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export const deleteMsg = async (
  userId: string,
  msgSendToUserId: string,
  msgId: string
) => {
  try {
    console.log("Received deleteMsg event:", userId, msgSendToUserId, msgId);

    const user = await ChatModel.findOne({ user: userId });
    const msgSendToUser = await ChatModel.findOne({ user: msgSendToUserId });

    // Find the chat for the user
    const userChat = user.chats.find(
      (chat) => chat.messagesWith.toString() === msgSendToUserId
    );

    // Find the chat for the msgSendToUser
    const msgSendToUserChat = msgSendToUser.chats.find(
      (chat) => chat.messagesWith.toString() === userId
    );

    if (!userChat) {
      console.error("User chat not found");
      return { error: "User chat not found" };
    }

    if (!msgSendToUserChat) {
      console.error("Receiver chat not found");
      return { error: "Receiver chat not found" };
    }

    console.log(
      userChat.messages.findIndex((msg) => msg._id.toString() === msgId)
    );

    console.log(msgSendToUserChat.messages);

    if (!userChat || !msgSendToUserChat) {
      return { error: "Chat not found" };
    }

    // Find the index of the message in the user's chat messages array
    const userMessageIndex = userChat.messages.findIndex(
      (msg) => msg._id.toString() === msgId
    );

    if (userMessageIndex === -1) {
      return { error: "Message not found" };
    }

    // Remove the message from the user's chat messages array
    userChat.messages.splice(userMessageIndex, 1);

    // Remove the message from the msgSendToUser's chat messages array
    msgSendToUserChat.messages.splice(userMessageIndex, 1);

    // Save the updated user's chat to the database
    await user.save();

    // Save the updated msgSendToUser's chat to the database
    await msgSendToUser.save();

    console.log("message deleted ");
    return { userMessageIndex };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export const editMsg = async (
  userId: string,
  msgSendToUserId: string,
  msgId: string,
  newMsgText: string
) => {
  try {
    console.log("Received editMsg event:", userId, msgSendToUserId, msgId);

    const user = await ChatModel.findOne({ user: userId });
    const msgSendToUser = await ChatModel.findOne({ user: msgSendToUserId });

    // Find the chat for the user
    const userChat = user.chats.find(
      (chat) => chat.messagesWith.toString() === msgSendToUserId
    );

    // Find the chat for the msgSendToUser
    const msgSendToUserChat = msgSendToUser.chats.find(
      (chat) => chat.messagesWith.toString() === userId
    );

    if (!userChat) {
      console.error("User chat not found");
      return { error: "User chat not found" };
    }

    if (!msgSendToUserChat) {
      console.error("Receiver chat not found");
      return { error: "Receiver chat not found" };
    }

    // Find the index of the message in the user's chat messages array
    const userMessageIndex = userChat.messages.findIndex(
      (msg) => msg._id.toString() === msgId
    );

    if (userMessageIndex === -1) {
      return { error: "Message not found" };
    }

    // Update the message content
    userChat.messages[userMessageIndex].msg = newMsgText;
    msgSendToUserChat.messages[userMessageIndex].msg = newMsgText;

    // Save the updated user's chat to the database
    await user.save();

    // Save the updated msgSendToUser's chat to the database
    await msgSendToUser.save();

    console.log("Message edited");
    return { userMessageIndex };
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
