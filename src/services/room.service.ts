import { AppDataSource } from "../config/data-source";
import { Room } from "../entities/Room";

export class RoomService {
    private roomRepo = AppDataSource.getRepository(Room);

    async createRoom(roomId: string) {
        const existing = await this.roomRepo.findOne({
            where: { id: roomId },
        });

        if (existing) {
            throw new Error("Room already exists");
        }

        const room = this.roomRepo.create({ id: roomId });
        return this.roomRepo.save(room);
    }

    async getRoom(roomId: string) {
        return this.roomRepo.findOne({
            where: { id: roomId },
            relations: ["files"],
        });
    }

    async deleteRoom(roomId: string) {
        const room = await this.getRoom(roomId);
        if (!room) throw new Error("Room not found");
        return this.roomRepo.remove(room);
    }

    async getAllRooms() {
        return this.roomRepo.find();
    }
}