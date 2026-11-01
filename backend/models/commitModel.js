// commitModel.js — Mongoose schema for a single commit in a repository.
// Extended with review-flag fields (reviewRequested, reviewedBy, reviewedAt)
// and web-revert fields (removedFiles, revertOf).

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

    // ── Review flag ──────────────────────────────────────────────────────
    // Set by the pusher when they want a code review.  Once the owner looks
    // at it, reviewedBy/reviewedAt are stamped via PATCH …/reviewed.
    reviewRequested: {
      type: Boolean,
      default: false,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },

    // ── Web-side revert ──────────────────────────────────────────────────
    // removedFiles lists file names that this commit intentionally deletes
    // (i.e. they existed before the reverted commit but not after).
    // revertOf points to the original commit being undone.
    removedFiles: {
      type: [String],
      default: [],
    },
    revertOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commit",
      default: null,
    },
  },
  { timestamps: true },
);

const Commit = mongoose.model("Commit", commitSchema);

export default Commit;
