import authMiddleware from "../middlewares/authMiddleware.js";
import ChatModel from "../models/ChatModel.js";
import UserModel from "../models/UserModel.js";
import express from "express";
const router = express.Router();
//Get all chats
router.get("/", authMiddleware, async (req, res) => {
    try {
        const { userId } = req;
        const user = await ChatModel.findOne({ user: userId }).populate("chats.messagesWith");
        let chatsToBeSent = [];
        if (user.chats.length > 0) {
            chatsToBeSent = await user.chats.map((chat) => ({
                messagesWith: chat.messagesWith._id,
                user: chat.messagesWith,
                lastMessage: chat?.messages?.length > 0
                    ? chat.messages[chat.messages.length - 1].msg
                    : null,
                date: chat?.messages?.length > 0
                    ? chat.messages[chat.messages.length - 1].date
                    : null,
            }));
        }
        return res.json(chatsToBeSent);
    }
    catch (error) {
        console.error(error);
        return res.status(500).send("Server Error");
    }
});
//Create chat
router.post("/", async (req, res) => {
    const { userId, msgSendToUserId } = req.body;
    try {
        const user = await ChatModel.findOne({ user: userId });
        const msgSendToUser = await ChatModel.findOne({ user: msgSendToUserId });
        const previousChat = user.chats.find((chat) => chat.messagesWith.toString() === msgSendToUserId);
        if (!previousChat) {
            const newChat = { messagesWith: msgSendToUserId, messages: [] };
            user.chats.unshift(newChat);
            await user.save();
        }
        const previousChatForReceiver = msgSendToUser.chats.find((chat) => chat.messagesWith.toString() === userId);
        if (!previousChatForReceiver) {
            const newChat = { messagesWith: userId, messages: [] };
            msgSendToUser.chats.unshift(newChat);
            await msgSendToUser.save();
        }
        if (previousChat) {
            return res.status(200).json({ message: "Ok" });
        }
        const userData = await UserModel.findById(msgSendToUserId);
        const ChatObj = {
            messagesWith: msgSendToUserId,
            user: userData,
        };
        return res.status(200).json(ChatObj);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
router.delete("/deleteMsg", async (req, res) => {
    const { userId, msgSendToUserId, msgId } = req.body;
    try {
        const user = await ChatModel.findOne({ user: userId });
        const msgSendToUser = await ChatModel.findOne({ user: msgSendToUserId });
        // Find the chat for the user
        const userChat = user.chats.find((chat) => chat.messagesWith.toString() === msgSendToUserId);
        // Find the chat for the msgSendToUser
        const msgSendToUserChat = msgSendToUser.chats.find((chat) => chat.messagesWith.toString() === userId);
        if (!userChat || !msgSendToUserChat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        // Find the index of the message in the user's chat messages array
        const userMessageIndex = userChat.messages.findIndex((msg) => msg._id.toString() === msgId);
        // Find the index of the message in the msgSendToUser's chat messages array
        const msgSendToUserMessageIndex = msgSendToUserChat.messages.findIndex((msg) => msg._id.toString() === msgId);
        if (userMessageIndex === -1 || msgSendToUserMessageIndex === -1) {
            return res.status(404).json({ error: "Message not found" });
        }
        // Remove the message from the user's chat messages array
        userChat.messages.splice(userMessageIndex, 1);
        // Remove the message from the msgSendToUser's chat messages array
        msgSendToUserChat.messages.splice(msgSendToUserMessageIndex, 1);
        // Save the updated user's chat to the database
        await user.save();
        // Save the updated msgSendToUser's chat to the database
        await msgSendToUser.save();
        res.json({ message: "Message deleted successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
export default router;
//# sourceMappingURL=chat.js.map