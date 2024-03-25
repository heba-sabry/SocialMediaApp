import { StatusCodes } from "http-status-codes";
import commentReplayModel from "../../../../DB/model/CommentReplay.model.js";
import postModel from "../../../../DB/model/Post.model.js";
import userModel from "../../../../DB/model/User.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import commentModel from "../../../../DB/model/Comment.model.js";

//add comment
export const addReplayComment = asyncHandler(async (req, res, next) => {
  const { replyBody, commentId } = req.body;
  const { postId } = req.params;

  const user = await userModel.findOne({ _id: req.user._id, isDeleted: false });
  if (!user) {
    return next(
      new ErrorClass(
        `user is not found or user is softDelete`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  const post = await postModel.findOne({
    _id: postId,
    $inc: { comments: commentId },
    isDeleted: false,
  });
  if (!post) {
    return next(
      new ErrorClass(
        `post is not found or post is deleted`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  const comment = await commentModel.findOne({
    _id: commentId,
    isDeleted: false,
  });
  if (!comment) {
    return next(
      new ErrorClass(
        `comment is not found or comment is deleted`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  const replayComment = await commentReplayModel.create({
    replyBody,
    createdBy: req.user._id,
    postId,
    commentId,
  });
  comment.replies.push(replayComment._id);
  await comment.save();
  return res
    .status(StatusCodes.CREATED)
    .json({ massage: "done", replayComment });
});
//update comment
export const updateReplayComment = asyncHandler(async (req, res) => {
  const { replyBody, postId, commentId } = req.body;
  const { id } = req.params;
  const comment = await commentModel.findOne({
    _id: commentId,
    postId,
    isDeleted: false,
  });
  if (!comment) {
    return next(
      new ErrorClass(
        `comment is not found or comment and post is deleted`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  const replayComment = await commentReplayModel.findOneAndUpdate(
    { _id: id, createdBy: req.user._id, commentId },
    { replyBody },
    { new: true }
  );

  if (!replayComment) {
    return next(
      new ErrorClass(
        `in-valid ReplayComment or you can not access update this Replay`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  return res
    .status(StatusCodes.ACCEPTED)
    .json({ massage: "done", replayComment });
});
//delete comment
export const deleteReplayComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.body;
  const { id } = req.params;
  const comment = await commentModel.findOne({
    _id: commentId,
    postId,
    isDeleted: false,
  });
  if (!comment) {
    return next(
      new ErrorClass(
        `comment is not found or comment and post is deleted`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  const replayComment = await commentReplayModel.findOneAndDelete(
    { _id: id, createdBy: req.user._id, $inc: { commentId: commentId } },
    { new: true }
  );
  if (!replayComment) {
    return next(
      new ErrorClass(
        `in-valid ReplayComment or you can not access update this Replay`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  comment.replies.pop(replayComment._id);
  await comment.save();
  return res
    .status(StatusCodes.ACCEPTED)
    .json({ massage: "done", replayComment });
});
//like comment
export const likeReplayComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.body;
  const { id } = req.params;
  const comment = await commentModel.findOne({
    _id: commentId,
    isDeleted: false,
  });
  if (!comment) {
    return next(
      new ErrorClass(`comment is not found or deleted`, StatusCodes.NOT_FOUND)
    );
  }
  const replayComment = await commentReplayModel.findOneAndUpdate(
    { id, createdBy: req.user._id },
    {
      $addToSet: { likes: req.user._id },
    },
    { new: true }
  );
  return res
    .status(StatusCodes.CREATED)
    .json({ massage: "done", replayComment });
});
//unlike comment
export const unlikeReplayComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.body;
  const { id } = req.params;
  const comment = await commentModel.findOne({
    _id: commentId,
    isDeleted: false,
  });
  if (!comment) {
    return next(
      new ErrorClass(`comment is not found or deleted`, StatusCodes.NOT_FOUND)
    );
  }
  const replayComment = await commentReplayModel.findOneAndUpdate(
    { id, createdBy: req.user._id },
    {
      $pull: { likes: req.user._id },
    },
    { new: true }
  );
  return res
    .status(StatusCodes.CREATED)
    .json({ massage: "done", replayComment });
});
