import { Router } from "express";
import { RoomController } from "../controllers/room.controller";

const router = Router();
const controller = new RoomController();

router.post("/", controller.create.bind(controller));
router.get("/", controller.list.bind(controller));
router.get("/:roomId", controller.get.bind(controller));
router.delete("/:roomId", controller.delete.bind(controller));

export default router;