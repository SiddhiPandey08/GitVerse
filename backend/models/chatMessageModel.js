import mongoose, { Schema } from "mongoose";

const ChatMessageSchema = new Schema(
  {
    channel: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "ChatMessage",
      default: null,
    },
  },
  { timestamps: true },
);

// Efficient pagination: fetch newest messages in a channel quickly.
ChatMessageSchema.index({ channel: 1, createdAt: -1 });

const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema);
export default ChatMessage;
