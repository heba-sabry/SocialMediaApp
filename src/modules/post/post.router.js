import { Router } from "express";
import * as postController from "./controller/post.js";
import { auth, roles } from "../../middleware/auth.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { validation } from "../../middleware/validation.js";
import * as validators from "./post.validation.js";
const router = Router();

router
  .route("/")
  .post(
    auth([roles.User]),
    fileUpload(fileValidation.image).single("image"),
    validation(validators.addPost),
    postController.addPost
  )
  .get(auth([roles.User]), postController.getPostAndComment);

router.get(
  "/postsYes",
  auth([roles.User]),
  validation(validators.postsYes),
  postController.postsYes
);
router.get(
  "/postsTo",
  auth([roles.User]),
  validation(validators.postsTo),
  postController.postsTo
);
router.patch(
  "/like/:id",
  auth([roles.User]),
  validation(validators.likePost),
  postController.likePost
);
router.patch(
  "/unlike/:id",
  auth([roles.User]),

  validation(validators.unlikePost),
  postController.UnlikePost
);
router.patch(
  "/changPrivacy/:id",
  auth([roles.User]),
  validation(validators.upPostPrivacy),
  postController.upPostPrivacy
);
router
  .route("/:id")
  .patch(
    auth([roles.User]),
    validation(validators.updatePost),
    postController.updatePost
  )
  .delete(
    auth([roles.User]),
    validation(validators.deletePost),
    postController.deletePost
  )
  .get(
    auth([roles.User]),
    validation(validators.getPostById),
    postController.getPostById
  );

export default router;
