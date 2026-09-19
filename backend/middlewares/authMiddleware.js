import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Verifies the JWT issued by /users/login or /users/signup.
// Both the web app and the CLI send this same
// `Authorization: Bearer <token>` header, so this becomes the shared
// identity mechanism between the two.
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
