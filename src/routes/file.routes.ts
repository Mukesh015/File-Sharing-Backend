import { Router } from "express";
import { FileController } from "../controllers/file.controller";

const router = Router();
const controller = new FileController();

router.post("/", controller.create.bind(controller));
router.delete("/:fileId", controller.delete.bind(controller));
router.get("/room/:roomId", controller.get);

export default router;