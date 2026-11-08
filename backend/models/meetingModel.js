import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  meetingCode: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  repoId: { type: mongoose.Schema.Types.ObjectId, ref: "Repository" },
  title: { type: String, trim: true },
  scheduledFor: { type: Date },
  status: {
    type: String,
    enum: ["scheduled", "live", "ended", "cancelled"],
    default: "live",
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  roomId: { type: String },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatMessage" },
});

export default mongoose.model("Meeting", meetingSchema);
