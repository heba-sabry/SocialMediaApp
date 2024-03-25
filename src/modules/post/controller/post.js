import { StatusCodes } from "http-status-codes";
import postModel from "../../../../DB/model/Post.model.js";
import userModel from "../../../../DB/model/User.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import cloudinary from "../../../utils/cloudinary.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";
import { endOfDay, startOfDay, subDays } from "date-fns";

// add post
export const addPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return next(new ErrorClass(`user is not found`, StatusCodes.NOT_FOUND));
    }
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: "Exam/post/image" }
    );
    const post = await postModel.create({
      content,
      createdBy: req.user._id,
      image: { public_id, secure_url },
      postTime: new Date(),
    });
    user.posts.push(post._id);
    await user.save();
    return res.status(StatusCodes.CREATED).json({ massage: "done", post });
  } catch (error) {
    return res.json({ message: "Catch Error", error, stack: error.stack });
  }
};
//update post
export const updatePost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { id } = req.params;
  const post = await postModel.findOneAndUpdate(
    { _id: id, createdBy: req.user._id },
    { content },
    { new: true }
  );
  if (!post) {
    return next(
      new ErrorClass(
        `in-valid post or you can not access update this post`,
        StatusCodes.BAD_REQUEST
      )
    );
  }
  return res.status(StatusCodes.ACCEPTED).json({ massage: "done", post });
});
//delete post
export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isExist = await postModel.findOneAndDelete({
    _id: id,
    createdBy: req.user._id,
  });
  if (!isExist) {
    return next(
      new ErrorClass(
        `in-valid post or you are not allowed delete this post`,
        StatusCodes.BAD_REQUEST
      )
    );
  }
  await cloudinary.uploader.destroy(isExist.image.public_id);
const user = await  userModel.findOne({_id:req.user._id,$inc:{posts:isExist._id}})
user.posts.pop(isExist._id)
await user.save()
  return res.status(StatusCodes.ACCEPTED).json({ massage: "done" });
});
//get all posts
export const getPostAndComment = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user._id);
  if (!user) {
    return next(new ErrorClass(`user is not found`, StatusCodes.NOT_FOUND));
  }
  if (user.isDeleted === true) {
    return next(
      new ErrorClass(
        `you can not access to get any posts`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  const Query = postModel.find({ createdBy: req.user._id }).populate([
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
  ]);
  if (!Query) {
    return next(
      new ErrorClass(` not found any posts for you`, StatusCodes.NOT_FOUND)
    );
  }
  const apiFeatures = new ApiFeatures(Query, req.query)
    .pagination(postModel)
    .filter()
    .sort()
    .select()
    .search();
  const post = await apiFeatures.mongooseQuery;
  return res.status(StatusCodes.ACCEPTED).json({
    message: "Done",
    post,
    count: apiFeatures.queryData.count,
    totalPage: apiFeatures.queryData.totalPage,
    next: apiFeatures.queryData.next,
    previous: apiFeatures.queryData.previous,
  });
});
//get post by id
export const getPostById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await postModel.findById({ _id: id, createdBy: req.user._id });
  if (!post) {
    return next(new ErrorClass(`post is not found`, StatusCodes.NOT_FOUND));
  }
  return res.status(StatusCodes.ACCEPTED).json({ massage: "done", post });
});
//like post
export const likePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await postModel.findByIdAndUpdate(
    id,
    {
      $addToSet: { likes: req.user._id },
    },
    { new: true }
  );
  if (!post) {
    return next(new ErrorClass(`post not found`, StatusCodes.NOT_FOUND));
  }
  return res.status(StatusCodes.CREATED).json({ massage: "done", post });
});
//unlike post
export const UnlikePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await postModel.findByIdAndUpdate(
    id,
    {
      $pull: { likes: req.user._id },
    },
    { new: true }
  );
  if (!post) {
    return next(new ErrorClass(`post not found`, StatusCodes.NOT_FOUND));
  }
  return res.status(StatusCodes.CREATED).json({ massage: "done", post });
});
//update post privacy
export const upPostPrivacy = asyncHandler(async (req, res, next) => {
  const { privacy } = req.body;
  const { id } = req.params;
  const post = await postModel.findOneAndUpdate(
    { _id: id, createdBy: req.user._id },
    { privacy },
    { new: true }
  );
  if (!post) {
    return next(
      new ErrorClass(
        `in-valid post or you can not access update this post`,
        StatusCodes.BAD_REQUEST
      )
    );
  }
  return res.status(StatusCodes.ACCEPTED).json({ massage: "done", post });
});
//get posts created yesterday
export const postsYes = async (req, res, next) => {
  const yesterday = subDays(new Date(), 1);
  const startYesterday = startOfDay(yesterday);
  const endYesterday = endOfDay(yesterday);
  const posts = await postModel.find({
    createdAt: { $gte: startYesterday, $lte: endYesterday },
    createdBy: req.user._id,
  });
  if (posts == []) {
    return next(
      new ErrorClass(
        `in-valid post nothing on yesterday`,
        StatusCodes.BAD_REQUEST
      )
    );
  }
  return res.status(StatusCodes.ACCEPTED).json({ massage: "done", posts });
};
//get posts created today
export const postsTo = async (req, res, next) => {
  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  const posts = await postModel.find({
    createdAt: { $gte: start, $lte: end },
    createdBy: req.user._id,
  });
  if (!posts) {
    return next(
      new ErrorClass(`in-valid post nothing on today`, StatusCodes.BAD_REQUEST)
    );
  }
  return res.status(StatusCodes.ACCEPTED).json({ massage: "done", posts });
};
