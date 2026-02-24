import { AppDataSource } from "../config/data-source";
import { FileMeta } from "../entities/FileMeta";
import { Room } from "../entities/Room";

export class FileService {
    private fileRepo = AppDataSource.getRepository(FileMeta);
    private roomRepo = AppDataSource.getRepository(Room);

    async createFile(data: {
        id: string;
        fileName: string;
        size: number;
        mimeType: string;
        owner: string;
        roomId: string;
    }) {
        const room = await this.roomRepo.findOne({
            where: { id: data.roomId },
        });

        if (!room) throw new Error("Room not found");

        const file = this.fileRepo.create({
            id: data.id,
            fileName: data.fileName,
            size: data.size,
            mimeType: data.mimeType,
            owner: data.owner,
            room,
        });

        return this.fileRepo.save(file);
    }

    async deleteFile(fileId: string) {
        const file = await this.fileRepo.findOne({
            where: { id: fileId },
        });

        if (!file) throw new Error("File not found");

        return this.fileRepo.remove(file);
    }
}