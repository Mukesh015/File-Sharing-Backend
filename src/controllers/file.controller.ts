import { Request, Response } from "express";
import { FileService } from "../services/file.service";
import { getIO } from "../socket/socket";

const fileService = new FileService();

export class FileController {
    async create(req: Request, res: Response) {
        try {
            const file = await fileService.createFile(req.body);
            console.log('first', file)
            // 🔥 Emit realtime event
            const io = getIO();
            console.log("🔥 Emitting file-meta to room:", file.roomId);
            io.to(file.roomId).emit("file-meta", {
                id: file.id,
                fileName: file.fileName,
                size: file.size,
                mimeType: file.mimeType,
                owner: file.owner,
            });
            res.status(201).json(file);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await fileService.deleteFile(req.params.fileId);
            res.json({ message: "Deleted" });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async get(req: Request, res: Response) {
        try {
            const { roomId } = req.params;

            const page = Number(req.query.page ?? 1);
            const limit = Number(req.query.limit ?? 10);

            const data = await fileService.getFiles(roomId, page, limit);

            res.json(data);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}