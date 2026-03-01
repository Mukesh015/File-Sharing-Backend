import { Router } from "express";
import { ReactionController } from "../controllers/reaction.controller";

const router = Router();
const controller = new ReactionController();

router.post("/toggle", controller.toggle);
router.get("/:messageId", controller.get);
router.post("/clear", controller.clear);

export default router;