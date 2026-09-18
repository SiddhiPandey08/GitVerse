import express from "express";
import userRouter from "./user.routes.js";
import repoRouter from "./repo.router.js";
import issueRouter from "./issue.router.js";
import activityRouter from "./activity.router.js";

const mainRouter = express.Router();

mainRouter.use("/users", userRouter);
mainRouter.use("/repositories", repoRouter);
mainRouter.use("/issues", issueRouter);
mainRouter.use("/activity", activityRouter);

mainRouter.get("/", (req, res) => {
  res.send("Welcome to the main route");
});

export default mainRouter;
