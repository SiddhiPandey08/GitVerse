import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  meetingCode: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Meeting", meetingSchema);
