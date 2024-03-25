import { StatusCodes } from "http-status-codes";
import userModel from "../../../../DB/model/User.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import CryptoJS from "crypto-js";
import { compare, hash } from "../../../utils/HashAndCompare.js";
import cloudinary from "../../../utils/cloudinary.js";
import sendEmail, { createHtml } from "../../../utils/email.js";
import { nanoid } from "nanoid";
import { generateToken } from "../../../utils/GenerateAndVerifyToken.js";
import bcrypt from "bcryptjs";
import postModel from "../../../../DB/model/Post.model.js";
//sign up
export const signUp = asyncHandler(async (req, res, next) => {
  const isEmailExist = await userModel.findOne({ email: req.body.email });
  if (isEmailExist) {
    return next(new ErrorClass(`email is already exist`, StatusCodes.CONFLICT));
  }
  req.body.phone = CryptoJS.AES.encrypt(
    req.body.phone,
    process.env.ENCRYPTION_KEY
  ).toString();
  req.body.password = bcrypt.hashSync(
    req.body.password,
    parseInt(process.env.SALT_ROUND)
  );
  const code = nanoid(6);
  const html = createHtml(code);
  sendEmail({ to: req.body.email, subject: `confirm email`, html });
  req.body.code = code;
  // req.body.name;
  const newUser = new userModel(req.body);
  const user = await newUser.save();
  return res.status(StatusCodes.CREATED).json({ massage: "done", user });
});
//confirm Email
export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, code } = req.body;
  const isEmailExist = await userModel.findOne({ email: req.body.email });
  if (!isEmailExist) {
    return next(new ErrorClass(`${email} is not found`, StatusCodes.NOT_FOUND));
  }
  if (code != isEmailExist.code) {
    return next(new ErrorClass(`in_valid code`, StatusCodes.BAD_REQUEST));
  }
  const newCode = nanoid(6);

  const confirmedUser = await userModel.updateOne(
    { email },
    { confirmEmail: true, code: newCode }
  );
  return res.status(StatusCodes.OK).json({ massage: "done", confirmedUser });
});
//sign in
export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(
      new ErrorClass(`in valid user information`, StatusCodes.NOT_ACCEPTABLE)
    );
  }
  const match = bcrypt.compareSync(password, user.password);
  if (!match) {
    return next(
      new ErrorClass(`in valid user information`, StatusCodes.NOT_ACCEPTABLE)
    );
  }
  if (user.confirmEmail == false) {
    return next(
      new ErrorClass(`confirm your email first`, StatusCodes.NOT_ACCEPTABLE)
    );
  }
  if (user.isDeleted == true) {
    return next(new ErrorClass(`user is deleted `, StatusCodes.NOT_ACCEPTABLE));
  }
  const payload = {
    id: user._id,
    email: user.email,
  };
  const accessToken = generateToken({ payload, expiresIn: 60 * 30 });
  const RefreshToken = generateToken({
    payload,
    expiresIn: 60 * 60 * 20 * 365,
  });
  return res
    .status(StatusCodes.ACCEPTED)
    .json({ massage: "done", accessToken, RefreshToken });
});
//get user profile
export const getUserProfile = async (req, res, next) => {
  const user = await userModel
    .findOne({ _id: req.user._id, isDeleted: false })
    .populate([
      {
        path: "posts",
        select: "content likes",
        populate: [
          {
            path: "comments",
            select: "commentBody likes",
            populate: [
              {
                path: "replies",
                select: "replyBody likes",
              },
            ],
          },
        ],
      },
    ]);
  if (!user) {
    return next(
      new ErrorClass(
        `in valid user or this account is soft delete`,
        StatusCodes.NOT_ACCEPTABLE
      )
    );
  }
  return res.status(StatusCodes.ACCEPTED).json({ massage: "done", user });
};
//update profile
export const updateProfile = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOne({ _id: req.user._id, isDeleted: false });
  if (!user) {
    return next(
      new ErrorClass(
        `user is not found or this account is soft delete`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  if (req.body.email) {
    const checkEmail = await userModel.findOne({
      email: req.body.email,
      _id: req.user._id,
    });
    if (checkEmail) {
      return next(
        new ErrorClass(
          `sorry cannot update your email because some this ${req.body.email}`,
          StatusCodes.BAD_REQUEST
        )
      );
    }
    const code = nanoid(6);
    const html = createHtml(code);
    sendEmail({ to: req.body.email, subject: `confirm email`, html });
    user.email = req.body.email;
    user.code = code;
    user.confirmEmail = false;
  }
  user.age = req.body.age;
  if (req.body.phone) {
    user.phone = CryptoJS.AES.encrypt(
      req.body.phone,
      process.env.ENCRYPTION_KEY
    ).toString();
  }
  await user.save();
  return res.status(StatusCodes.ACCEPTED).json({ massage: "done", user });
});
//add profile pictures
export const profilePicture = async (req, res, next) => {
  let { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: "Exam/user/profile" }
  );
  const user = await userModel.findOne({ _id: req.user._id, isDeleted: false });
  if (!user) {
    return next(
      new ErrorClass(
        `user is not found or this account is soft delete`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  // await cloudinary.uploader.destroy(user.image?.public_id);
  user.image = { public_id, secure_url };
  await user.save();
  return res.status(StatusCodes.CREATED).json({ massage: "done", user });
};
//add cover pictures
export const coverPicture = asyncHandler(async (req, res, next) => {
  const coverImages = [];
  for (const file of req.files) {
    let { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: "Exam/user/coverImages" }
    );
    coverImages.push({ secure_url, public_id });
  }
  const user = await userModel.findOneAndUpdate(
    { _id: req.user._id, isDeleted: false },
    { coverImages },
    {
      new: true,
    }
  );
  if (!user) {
    return next(
      new ErrorClass(
        `user is not found or this account is soft delete`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  return res.status(StatusCodes.CREATED).json({ massage: "done", user });
});
//add video for post
export const addVideo = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOne({
    _id: req.user._id,
    isDeleted: false,
  });
  if (!user) {
    return next(
      new ErrorClass(
        `user is not found or this account is soft delete`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  const videoArr = [];
  for (let i = 0; i < req.files?.length; i++) {
    let { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files[i].path,
      {
        resource_type: "video",
        folder: "Exam/user/video",
      }
    );
    videoArr.push({ secure_url, public_id });
  }

  const post = await postModel.findOneAndUpdate(
    { createdBy: req.user._id, isDeleted: false },
    { video: videoArr }
  );
  if (!post) {
    return next(
      new ErrorClass(
        `create post first and then upload video`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  return res.status(StatusCodes.CREATED).json({ massage: "done", post });
});
// 3-update password
export const updatePass = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const user = await userModel.findById({ _id: req.user._id });
  if (!user) {
    return next(new ErrorClass(`in_valid account`, StatusCodes.NOT_FOUND));
  }
  const match = bcrypt.compareSync(oldPassword, user.password);
  if (!match) {
    return next(
      new ErrorClass(
        `old password mis match your password`,
        StatusCodes.BAD_REQUEST
      )
    );
  }
  const hashPassword = bcrypt.hashSync(newPassword, 6);
  const updateP = await userModel.findOneAndUpdate(
    { _id: user._id, isDeleted: false },
    { password: hashPassword },
    { new: true }
  );
  if (!updateP) {
    return next(
      new ErrorClass(
        `user is not found or this account is soft delete`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  return res.status(StatusCodes.CREATED).json({ massage: "done", updateP });
});
//steep forget password
//1-send code
export const sendCode = async (req, res, next) => {
  const { email } = req.body;
  const isEmailExist = await userModel.findOne({ email });
  if (!isEmailExist) {
    return next(new ErrorClass(`${email} not found`, StatusCodes.NOT_FOUND));
  }
  const code = nanoid(6);
  const html = createHtml(code);
  sendEmail({ to: email, subject: `forget password`, html });
  await userModel.updateOne({ email }, { code });
  return res.status(StatusCodes.ACCEPTED).json({ massage: "done" });
};
//2-reset password
export const resetPass = async (req, res, next) => {
  try {
    let { email, code, password } = req.body;
    const isEmailExist = await userModel.findOne({ email });
    if (!isEmailExist) {
      return next(new ErrorClass(`${email} not found`, StatusCodes.NOT_FOUND));
    }
    if (code != isEmailExist.code) {
      return next(new ErrorClass(`in_valid code`, StatusCodes.BAD_REQUEST));
    }
    password = bcrypt.hashSync(password, parseInt(process.env.SALT_ROUND));
    await userModel.updateOne({ email }, { $set: { code: null } });
    return res.status(StatusCodes.ACCEPTED).json({ massage: "done" });
  } catch (error) {
    return res.json({ masg: error.massage, stack: error.stack, error });
  }
};
//soft delete
export const softDelete = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user._id);
  if (!user) {
    return next(new ErrorClass(`in_valid account`, StatusCodes.NOT_FOUND));
  }
  const softDelUser = await userModel.findOneAndUpdate(
    { _id: user.id },
    { isDeleted: true },
    { new: true }
  );
  return res.status(StatusCodes.CREATED).json({ massage: "done", softDelUser });
});
