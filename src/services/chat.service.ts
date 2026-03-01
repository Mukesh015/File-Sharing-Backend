// src/services/chat.service.ts

import { AppDataSource } from "../config/data-source";
import { ChatMessageResponse } from "../dto/chat.response";
import { Chat } from "../entities/chat";
import { Room } from "../entities/Room";

export class ChatService {

    private chatRepo = AppDataSource.getRepository(Chat);
    private roomRepo = AppDataSource.getRepository(Room);

    /**
     * Save message with backend-generated UUID
     */
    async save(roomId: string, sender: string, message: string) {

        const room = await this.roomRepo.findOne({
            where: { id: roomId }
        });

        if (!room) {
            throw new Error("Room not found");
        }

        const chat = this.chatRepo.create({
            sender,
            message,
            room,
        });

        const saved = await this.chatRepo.save(chat);

        // Reload with reactions relation (empty initially)
        return this.chatRepo.findOne({
            where: { id: saved.id },
            relations: ["reactions"],
        });
    }

    /**
     * Get all messages in room (with normalized reactions array)
     */
    async getByRoom(roomId: string): Promise<ChatMessageResponse[]> {

        const messages = await this.chatRepo
            .createQueryBuilder("chat")
            .leftJoinAndSelect("chat.reactions", "reaction")
            .where("chat.roomId = :roomId", { roomId })
            .orderBy("chat.createdAt", "ASC")
            .addOrderBy("reaction.createdAt", "ASC")
            .getMany();

        return messages.map(msg => ({
            id: msg.id,
            sender: msg.sender,
            message: msg.message,
            createdAt: msg.createdAt,
            reactions: msg.reactions?.map(r => ({
                id: r.id,
                reactionKey: r.reactionKey,
                user: r.user,
                createdAt: r.createdAt,
            })) ?? [],
        }));
    }
}