import mongoose, { model, Schema, Types } from "mongoose";

const postSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    image: { type: Object },
    video: { type: Array },
    likes: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    comments: [
      {
        type: Types.ObjectId,
        ref: "Comment",
        required: true,
      },
    ],
    privacy: {
      type: String,
      enum: ["onlyMe", "Public"],
      default: "Public",
    },
    createdBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const postModel = model("Post", postSchema);

export default postModel;
