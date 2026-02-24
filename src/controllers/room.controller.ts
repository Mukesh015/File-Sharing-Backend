import { Request, Response } from "express";
import { RoomService } from "../services/room.service";

const roomService = new RoomService();

export class RoomController {
    async create(req: Request, res: Response) {
        try {
            const { roomId } = req.body;
            const room = await roomService.createRoom(roomId);
            res.status(201).json(room);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async get(req: Request, res: Response) {
        try {
            const room = await roomService.getRoom(req.params.roomId);
            if (!room) return res.status(404).json({ message: "Not found" });
            res.json(room);
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await roomService.deleteRoom(req.params.roomId);
            res.json({ message: "Deleted" });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async list(req: Request, res: Response) {
        const rooms = await roomService.getAllRooms();
        res.json(rooms);
    }
}