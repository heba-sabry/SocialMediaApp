import { Router } from "express";
import { auth, roles } from "../../middleware/auth.js";
import * as commentController from "./controller/comment.js";
import { validation } from "../../middleware/validation.js";
import * as validators from "./comment.validation.js";

const router = Router();

router
  .route("/:postId")
  .post(
    auth([roles.User]),
    validation(validators.addComment),
    commentController.addComment
  );
router
  .route("/:id")
  .patch(
    auth([roles.User]),
    validation(validators.updateComment),
    commentController.updateComment
  )
  .delete(
    auth([roles.User]),
    validation(validators.deleteComment),
    commentController.deleteComment
  );
router.patch(
  "/like/:id",
  auth([roles.User]),
  validation(validators.likeComment),
  commentController.likeComment
);
router.patch(
  "/unlike/:id",
  auth([roles.User]),
  validation(validators.unlikeComment),
  commentController.unlikeComment
);

export default router;
