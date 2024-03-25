import connectDB from "../DB/connection.js";
import userRouter from "./modules/user/user.router.js";
import postRouter from "./modules/post/post.router.js";
import commentRouter from "./modules/comment/comment.router.js";
import commentReplayRouter from "./modules/commentReplay/commentReplay.router.js";
import { globalErrorHandling } from "./utils/errorHandling.js";

const initApp = (app, express) => {
  //convert Buffer Data
  app.use(express.json({}));
  //Setup API Routing
  app.use(`/user`, userRouter);
  app.use(`/comment`, commentRouter);
  app.use(`/post`, postRouter);
    app.use(`/commentReplay`, commentReplayRouter);

  app.all("*", (req, res, next) => {
    res.send("In-valid Routing Plz check url  or  method");
  });
  app.use(globalErrorHandling);

  connectDB();
};

export default initApp;
