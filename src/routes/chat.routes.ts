// src/routes/chat.routes.ts

import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";

const router = Router();
const controller = new ChatController();

router.post("/", controller.create);
router.get("/:roomId", controller.getByRoom);

export default router;