import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  meetingCode: { type: String },
  UserId: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
});

const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting };
