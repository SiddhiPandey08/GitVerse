import express from "express";
import {
  getAllUsers,
  signUp,
  login,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/", authMiddleware, getAllUsers);
userRouter.post("/signup", signUp);
userRouter.post("/login", login);
userRouter.get("/userProfile/:id", authMiddleware, getUser);

const requireSelf = (req, res, next) => {
  if (String(req.user._id) !== String(req.params.id)) {
    return res.status(403).json({ message: "You can only modify your own profile" });
  }
  next();
};

userRouter.put("/updateProfile/:id", authMiddleware, requireSelf, updateUser);
userRouter.delete("/deleteUser/:id", authMiddleware, requireSelf, deleteUser);

export default userRouter;
