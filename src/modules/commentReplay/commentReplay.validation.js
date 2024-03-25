import joi from "joi";
import { generalFields } from "../../middleware/validation.js";
export const addReplayComment = joi
  .object({
    replyBody: joi.string().min(3).required(),
    commentId: generalFields.id,
    postId: generalFields.id,
  })
  .required();
export const updateReplayComment = joi
  .object({
    replyBody: joi.string().min(3).required(),
    commentId: generalFields.id,
    postId: generalFields.id,
    id: generalFields.id,
  })
  .required();
export const deleteReplayComment = joi
  .object({
    commentId: generalFields.id,
    postId: generalFields.id,
    id: generalFields.id,
  })
  .required();
export const likeReplayComment = joi.object({
  commentId: generalFields.id,

  id: generalFields.id,
});
export const unlikeReplayComment = joi
  .object({
    commentId: generalFields.id,
    id: generalFields.id,
  })
  .required();
