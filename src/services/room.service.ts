import { AppDataSource } from "../config/data-source";
import { Room } from "../entities/Room";
import generateRoomId from "../utils/generateRoomId";

export class RoomService {
    private roomRepo = AppDataSource.getRepository(Room);

    async createRoom() {
        const roomId = generateRoomId(6);
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