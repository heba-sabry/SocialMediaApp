import mongoose, { model, Schema, Types } from "mongoose";

const commentReplaySchema = new Schema(
  {
    replyBody: {
      type: String,
      required: true,
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: false },
    commentId :{
      type: Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    likes: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const commentReplayModel =
  mongoose.models.CommentReplay || model("CommentReplay", commentReplaySchema);

export default commentReplayModel;
