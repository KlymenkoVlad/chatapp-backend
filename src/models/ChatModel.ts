import mongoose from "mongoose";

const { Schema } = mongoose;

const ChatSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },

  chats: [
    {
      messagesWith: { type: Schema.Types.ObjectId, ref: "User" },
      messages: [
        {
          _id: {
            type: Schema.Types.ObjectId,
            default: mongoose.Types.ObjectId,
          },

          msg: { type: String, required: true },
          sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
          receiver: { type: Schema.Types.ObjectId, required: true },
          date: { type: Date || Number, default: Date.now, required: false },
        },
      ],
    },
  ],
});

const ChatModel = mongoose.model("Chat", ChatSchema);

export default ChatModel;
