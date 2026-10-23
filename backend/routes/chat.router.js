import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  listChannels,
  createChannel,
  getMessages,
} from "../controllers/chatControllers.js";

const chatRouter = Router();

// All chat endpoints require authentication.
chatRouter.use(authMiddleware);

chatRouter.get("/repos/:repoId/channels", listChannels);
chatRouter.post("/repos/:repoId/channels", createChannel);
chatRouter.get("/channels/:channelId/messages", getMessages);

export default chatRouter;
