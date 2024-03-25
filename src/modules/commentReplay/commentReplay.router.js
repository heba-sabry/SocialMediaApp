import { Router } from "express";
import { auth, roles } from "../../middleware/auth.js";
import * as commentReplayController from "./controller/commentReplay.js";
import { validation } from "../../middleware/validation.js";
import * as validators from "./commentReplay.validation.js";

const router = Router();

router
  .route("/:postId")
  .post(
    auth([roles.User]),
    validation(validators.addReplayComment),
    commentReplayController.addReplayComment
  );
router
  .route("/:id")
  .patch(
    auth([roles.User]),
    validation(validators.updateReplayComment),
    commentReplayController.updateReplayComment
  )
  .delete(
    auth([roles.User]),
    validation(validators.deleteReplayComment),
    commentReplayController.deleteReplayComment
  );
router.patch(
  "/like/:id",
  auth([roles.User]),
  validation(validators.likeReplayComment),
  commentReplayController.likeReplayComment
);
router.patch(
  "/unlike/:id",
  auth([roles.User]),
  validation(validators.unlikeReplayComment),
  commentReplayController.unlikeReplayComment
);

export default router;
