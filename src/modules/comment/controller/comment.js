import { StatusCodes } from "http-status-codes";
import commentModel from "../../../../DB/model/Comment.model.js";
import postModel from "../../../../DB/model/Post.model.js";
import userModel from "../../../../DB/model/User.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import commentReplayModel from "../../../../DB/model/CommentReplay.model.js";

//add comment
export const addComment = asyncHandler(async (req, res, next) => {
  const { commentBody } = req.body;
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
  const post = await postModel.findOne({ _id: postId, isDeleted: false });
  if (!post) {
    return next(
      new ErrorClass(
        `post is not found or post is deleted`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  const comment = await commentModel.create({
    commentBody,
    createdBy: req.user._id,
    postId,
  });
  post.comments.push(comment._id);
  await post.save();
  return res.status(StatusCodes.CREATED).json({ massage: "done", comment });
});
//update comment
export const updateComment = asyncHandler(async (req, res, next) => {
  const { commentBody, postId } = req.body;
  const { id } = req.params;
  const post = await postModel.findOne({ _id: postId, isDeleted: false });
  if (!post) {
    return next(
      new ErrorClass(
        `post is not found or post is deleted`,
        StatusCodes.NOT_FOUND
      )
    );
  }

  const comment = await commentModel.findOneAndUpdate(
    { _id: id, createdBy: req.user._id, postId },
    { commentBody },
    { new: true }
  );

  if (!comment) {
    return next(
      new ErrorClass(
        `in-valid comment or you can not access update this comment`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  return res.status(StatusCodes.ACCEPTED).json({ massage: "done", comment });
});
//delete comment
export const deleteComment = asyncHandler(async (req, res, next) => {
  const { postId } = req.body;
  const { id } = req.params;
  const post = await postModel.findOne({
    _id: postId,
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
  const comment = await commentModel.findOneAndDelete(
    { _id: id, createdBy: req.user._id, postId },
    { new: true }
  );
  if (!comment) {
    return next(
      new ErrorClass(
        `in-valid comment or you can not access delete this comment`,
        StatusCodes.BAD_REQUEST
      )
    );
  }
 await commentReplayModel.deleteOne(
    { commentId:id  }
  );
  post.comments.pop(comment._id);
  await post.save();
  return res.status(StatusCodes.ACCEPTED).json({ massage: "done", comment });
});
//like comment
export const likeComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { postId } = req.body;
  const comment = await commentModel.findOneAndUpdate(
    { id, postId },
    {
      $addToSet: { likes: req.user._id },
    },
    { new: true }
  );
  if (!comment) {
    return next(
      new ErrorClass(`post or comment not found`, StatusCodes.NOT_FOUND)
    );
  }
  return res.status(StatusCodes.CREATED).json({ massage: "done", comment });
});
//unlike comment
export const unlikeComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { postId } = req.body;
  const comment = await commentModel.findOneAndUpdate(
    { id, postId },
    {
      $pull: { likes: req.user._id },
    },
    { new: true }
  );
  if (!comment) {
    return next(
      new ErrorClass(`post or comment not found`, StatusCodes.NOT_FOUND)
    );
  }
  return res.status(StatusCodes.CREATED).json({ massage: "done", comment });
});
