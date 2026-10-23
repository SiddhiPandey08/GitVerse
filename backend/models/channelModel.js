import mongoose, { Schema } from "mongoose";

const ChannelSchema = new Schema(
  {
    repo: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Enforce one channel name per repository.
ChannelSchema.index({ repo: 1, name: 1 }, { unique: true });

const Channel = mongoose.model("Channel", ChannelSchema);
export default Channel;
