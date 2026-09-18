import mongoose from "mongoose";
import { Schema } from "mongoose";
import User from "./userModel.js";

const RepositorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    content: {
      type: String,
    },
    visibility: {
      type: Boolean,
      default: true,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issues: [
      {
        type: Schema.Types.ObjectId,
        ref: "Issue",
      },
    ],
  },
  { timestamps: true },
);

const Repository = mongoose.model("Repository", RepositorySchema);
export default Repository;
