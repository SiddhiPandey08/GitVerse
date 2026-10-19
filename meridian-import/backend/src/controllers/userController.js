import httpStatus from "http-status";
import { User } from "../models/userModel.js";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meetingModel.js";

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Username and password are required" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    if (await bcrypt.compare(password, user.password)) {
      let token = crypto.randomBytes(64).toString("hex");
      user.token = token;
      await user.save();
      return res
        .status(httpStatus.OK)
        .json({ message: "Login successful", token, name: user.name });
    } else {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid password" });
    }
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Server error" });
  }
};

const registerUser = async (req, res) => {
  const { name, username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name,
      username: username,
      password: hashedPassword,
    });
    await newUser.save();
    res
      .status(httpStatus.CREATED)
      .json({ message: "User registered successfully" });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Server error" });
  }
};
const getUserHistory = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token: token });
    const meetings = await Meeting.find({ UserId: user.username });
    res.json(meetings);
  } catch (e) {
    res.json({ message: `Something went wrong ${e}` });
  }
};

const addToHistory = async (req, res) => {
  const { token, meeting_code } = req.body;

  try {
    const user = await User.findOne({ token: token });

    const newMeeting = new Meeting({
      UserId: user.username,
      meetingCode: meeting_code,
    });

    await newMeeting.save();

    res.status(httpStatus.CREATED).json({ message: "Added code to history" });
  } catch (e) {
    res.json({ message: `Something went wrong ${e}` });
  }
};
const getUserInfo = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    res
      .status(httpStatus.OK)
      .json({ name: user.name, username: user.username });
  } catch (e) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong" });
  }
};

export { loginUser, registerUser, getUserHistory, addToHistory, getUserInfo };
