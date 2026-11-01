// repoModel.js — defines what a Repository looks like in the database.
// Talks to: userModel.js (owner + collaborators refs), issueModel.js (issues ref).

import mongoose from "mongoose";
import { Schema } from "mongoose";

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
    // true = public (anyone can see), false = private (owner + collaborators only)
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
    // Users explicitly granted write access by the owner.
    // $addToSet in the collaborator endpoints prevents duplicates automatically.
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

const Repository = mongoose.model("Repository", RepositorySchema);
export default Repository;
