import { Router } from "express";
import { auth, roles } from "../../middleware/auth.js";
import * as userController from "./controller/user.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { validation } from "../../middleware/validation.js";
import * as validators from "./user.validation.js";

const router = Router();

router.post("/signUp", validation(validators.signUp), userController.signUp);
router.patch(
  "/confirmEmail",
  validation(validators.confirmEmail),
  userController.confirmEmail
);
router.post("/signIn", validation(validators.signIn), userController.signIn);
router
  .route("/")
  .get(
    auth([roles.User]),
    validation(validators.getUserProfile),
    userController.getUserProfile
  )
  .put(
    auth([roles.User]),
    validation(validators.updateProfile),
    userController.updateProfile
  )
  .patch(
    auth([roles.User]),
    fileUpload(fileValidation.image).single("image"),
    validation(validators.profilePicture),
    userController.profilePicture
  );
router.patch(
  "/coverImages",
  auth([roles.User]),
  fileUpload(fileValidation.image).array("coverImages", 3),
  // validation(validators.coverPicture),
  userController.coverPicture
);
router.patch(
  "/video",
  auth([roles.User]),
  fileUpload(fileValidation.video).array("video"),
  validation(validators.addVideo),
  userController.addVideo
);
router.patch(
  "/softDelete",
  auth([roles.Admin]),
  validation(validators.softDelete),
  userController.softDelete
);
router.patch(
  "/updatePass",
  auth([roles.User]),
  validation(validators.updatePass),
  userController.updatePass
);
router.patch(
  "/sendCode",
  auth([roles.User]),
  validation(validators.sendCode),
  userController.sendCode
);
router.patch(
  "/resetPass",
  validation(validators.resetPass),
  userController.resetPass
);
export default router;
