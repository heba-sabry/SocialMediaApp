import mongoose from "mongoose";
import { model, Schema, Types } from "mongoose";

const commentSchema = new Schema(
  {
    commentBody: {
      type: String,
      required: true,
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: false },
    postId: {
      type: Types.ObjectId,
      ref: "Post",
      required: true,
    },
    replies: [
      {
        type: Types.ObjectId,
        ref: "CommentReplay",
        required: true,
      },
    ],
    likes: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const commentModel = mongoose.models.Comment || model("Comment", commentSchema);

export default commentModel;
