import { AppDataSource } from "../config/data-source";
import { FileMeta } from "../entities/FileMeta";
import { Room } from "../entities/Room";
import generateUid from "../utils/generateUid";

export class FileService {
    private fileRepo = AppDataSource.getRepository(FileMeta);
    private roomRepo = AppDataSource.getRepository(Room);

    async createFile(data: {
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
            id: generateUid(10),
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

    async getFiles(roomId: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [files, total] = await this.fileRepo.findAndCount({
            where: {
                room: { id: roomId }, // using relation (better)
            },
            order: { createdAt: "DESC" },
            skip,
            take: limit,
            relations: ["room"], // optional (remove if not needed)
        });

        return {
            roomId,
            page,
            limit,
            total,
            hasNext: skip + files.length < total,
            hasPrev: page > 1,
            files: files.map((f) => ({
                id: f.id,
                fileName: f.fileName,
                size: Number(f.size),
                mimeType: f.mimeType,
                owner: f.owner,
                createdAt: f.createdAt,
            })),
        };
    }
}