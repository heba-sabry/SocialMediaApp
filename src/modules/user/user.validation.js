import joi from "joi";
import { generalFields } from "../../middleware/validation.js";
export const signUp = joi
  .object({
    name: joi.string().min(3).required(),
    email: generalFields.email.required(),
    age: joi.number().min(16).max(80).integer().positive(),
    phone: joi.string().max(11),
    password: generalFields.password.required(),
    files: joi.object().keys({
      image: joi.array().items(generalFields.file).length(1).required(),
      coverImages: joi.array().items(generalFields.file).length(3),
    }),
  })
  .required();
export const confirmEmail = joi
  .object({
    email: generalFields.email.required(),
    code: joi.string().alphanum().required(),
  })
  .required();
export const signIn = joi
  .object({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  })
  .required();
export const getUserProfile = joi.object({}).required();
export const updateProfile = joi
  .object({
    ////////هنا
    age: joi.number().min(16).max(80).integer().positive(),
    phone: joi.string().max(11),
  })
  .required();
export const profilePicture = joi
  .object({
    file: generalFields.file.required(),
  })
  .required();
export const coverPicture = joi.object({
  files: joi.object().keys({
    coverImages: joi.array().items(generalFields.file).max(3),
  }),
});
export const addVideo = joi
  .object({
    files: generalFields.file,
  })
  .required();
export const updatePass = joi
  .object({
    oldPassword: generalFields.password.required(),
    newPassword: generalFields.password.required(),
  })
  .required();
export const sendCode = joi
  .object({
    email: generalFields.email.required(),
  })
  .required();
export const resetPass = joi
  .object({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    code: joi.string().required(),
  })
  .required();
export const softDelete = joi.object({}).required();
