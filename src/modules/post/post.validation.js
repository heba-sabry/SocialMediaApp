import joi from "joi";
import { generalFields } from "../../middleware/validation.js";
export const addPost = joi
  .object({
    content: joi.string().min(3).required(),
    file: generalFields.file.required(),
  })
  .required();
export const updatePost = joi
  .object({
    content: joi.string().min(3).required(),
    id: generalFields.id,
  })
  .required();
export const deletePost = joi
  .object({
    id: generalFields.id,
  })
  .required();
export const updateProfile = joi
  .object({
    email: generalFields.email.required(),
    age: joi.number().min(16).max(80).integer().positive(),
    phone: joi.string().max(11),
  })
  .required();
export const getPostById = joi.object({
  id: generalFields.id,
});
export const likePost = joi.object({
  id: generalFields.id,
});
export const unlikePost = joi
  .object({
    id: generalFields.id,
  })
  .required();
export const upPostPrivacy = joi
  .object({
    privacy: joi.string().alphanum().valid("onlyMe", "Public").required(),
    id: generalFields.id,
  })
  .required();
export const postsYes = joi.object({}).required();
export const postsTo = joi.object({}).required();
