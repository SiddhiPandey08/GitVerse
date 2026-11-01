// issueModel.js — defines what an Issue looks like in the database.
// Talks to: repoModel.js (repository ref), userModel.js (author ref).

import mongoose from "mongoose";
import { Schema } from "mongoose";

const IssueSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    // Who opened this issue — always set from req.user on the server, never trusted from the client.
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // If true, the person opening the issue wants to be added as a collaborator.
    // The repo owner can then use POST /issues/:id/grant-collaborator to approve it.
    requestCollaboration: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Issue = mongoose.model("Issue", IssueSchema);
export default Issue;
