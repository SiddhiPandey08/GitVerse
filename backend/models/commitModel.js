import Repository from "./repoModel.js";
import User from "./userModel.js";
import mongoose from "mongoose";
const commitSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    files: {
      type: [String], // MinIO/S3 object keys for this commit's files
      default: [],
    },
  },
  { timestamps: true },
);

const Commit = mongoose.model("Commit", commitSchema);

export default Commit;
