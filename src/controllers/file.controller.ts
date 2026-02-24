import { Request, Response } from "express";
import { FileService } from "../services/file.service";

const fileService = new FileService();

export class FileController {
    async create(req: Request, res: Response) {
        try {
            const file = await fileService.createFile(req.body);
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
}