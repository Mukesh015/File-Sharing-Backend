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
    async save(
        roomId: string,
        sender: string,
        message: string,
        replyToId?: string,
        mentions?: string[] | null
    ) {
        const room = await this.roomRepo.findOne({
            where: { id: roomId }
        });

        if (!room) {
            throw new Error("Room not found");
        }

        let replyTo: Chat | null = null;

        if (replyToId) {
            replyTo = await this.chatRepo.findOne({
                where: { id: replyToId }
            });

            if (!replyTo) {
                throw new Error("Reply message not found");
            }
        }

        const chat = this.chatRepo.create({
            sender,
            message,
            room,
            replyTo,
            mentions: mentions ?? [],
        });

        const saved = await this.chatRepo.save(chat);

        return this.chatRepo.findOne({
            where: { id: saved.id },
            relations: ["reactions", "replyTo"],
        });
    }

    /**
     * Get all messages in room (with normalized reactions array)
     */
    async getByRoom(roomId: string): Promise<ChatMessageResponse[]> {

        const messages = await this.chatRepo
            .createQueryBuilder("chat")
            .leftJoinAndSelect("chat.reactions", "reaction")
            .leftJoinAndSelect("chat.replyTo", "replyTo")
            .where("chat.roomId = :roomId", { roomId })
            .orderBy("chat.createdAt", "ASC")
            .addOrderBy("reaction.createdAt", "ASC")
            .getMany();

        return messages.map(msg => ({
            id: msg.id,
            sender: msg.sender,
            message: msg.message,
            createdAt: msg.createdAt,

            // 🔥 Reply (minimal safe data only)
            replyTo: msg.replyTo
                ? {
                    id: msg.replyTo.id,
                    sender: msg.replyTo.sender,
                    message: msg.replyTo.message,
                }
                : null,

            // 🔥 Mentions
            mentions: msg.mentions ?? [],

            // 🔥 Reactions
            reactions: msg.reactions?.map(r => ({
                id: r.id,
                reactionKey: r.reactionKey,
                user: r.user,
                createdAt: r.createdAt,
            })) ?? [],
        }));
    }
}