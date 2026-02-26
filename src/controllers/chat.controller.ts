// src/controllers/chat.controller.ts

import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";

const service = new ChatService();

export class ChatController {

    async create(req: Request, res: Response) {
        try {
            const { roomId, sender, message } = req.body;

            const chat = await service.save(roomId, sender, message);

            res.status(201).json(chat);

        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }

    async getByRoom(req: Request, res: Response) {
        try {
            const { roomId } = req.params;

            const chats = await service.getByRoom(roomId);

            res.json(chats);

        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }
}