// src/services/chat.service.ts

import { AppDataSource } from "../config/data-source";
import { Chat } from "../entities/chat";
import { Room } from "../entities/Room";

export class ChatService {

    private chatRepo = AppDataSource.getRepository(Chat);
    private roomRepo = AppDataSource.getRepository(Room);

    async save(roomId: string, sender: string, message: string) {

        const room = await this.roomRepo.findOne({
            where: { id: roomId }
        });

        if (!room) throw new Error("Room not found");

        const chat = this.chatRepo.create({
            sender,
            message,
            room
        });

        return this.chatRepo.save(chat);
    }

    async getByRoom(roomId: string) {
        return this.chatRepo.find({
            where: { room: { id: roomId } },
            order: { createdAt: "ASC" }
        });
    }
}