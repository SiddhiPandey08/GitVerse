import express from "express";
import {
  getAllUsers,
  signUp,
  login,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userControllers.js";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.post("/signup", signUp);
userRouter.post("/login", login);
userRouter.get("/userProfile/:id", getUser);
userRouter.put("/updateProfile/:id", updateUser);
userRouter.delete("/deleteUser/:id", deleteUser);

export default userRouter;
