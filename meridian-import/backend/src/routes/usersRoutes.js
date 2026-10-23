import { Router } from "express";
import {
  loginUser,
  registerUser,
  addToHistory,
  getUserHistory,
  getUserInfo,
} from "../controllers/userController.js";

const router = Router();

router.route("/login").post(loginUser);
router.route("/register").post(registerUser);
router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activities").get(getUserHistory);
router.get("/get_user_info", getUserInfo);

export default router;
