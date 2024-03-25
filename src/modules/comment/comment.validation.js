import joi from "joi";
import { generalFields } from "../../middleware/validation.js";
export const addComment = joi
  .object({
    commentBody: joi.string().min(3).required(),
    postId: generalFields.id,
  })
  .required();
export const updateComment = joi
  .object({
    commentBody: joi.string().min(3).required(),
    postId: generalFields.id,
    id: generalFields.id,
  })
  .required();
export const deleteComment = joi
  .object({
    postId: generalFields.id,
    id: generalFields.id,
  })
  .required();
export const likeComment = joi.object({
  postId: generalFields.id,
  id: generalFields.id,
});
export const unlikeComment = joi
  .object({
    postId: generalFields.id,
    id: generalFields.id,
  })
  .required();
