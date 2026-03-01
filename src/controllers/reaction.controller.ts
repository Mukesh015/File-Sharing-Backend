import { Request, Response } from "express";
import { ReactionService } from "../services/reaction.service";
import { getIO } from "../socket/socket";

const reactionService = new ReactionService();

export class ReactionController {

    async toggle(req: Request, res: Response) {
        try {
            const { messageId, reactionKey, user, roomId } = req.body;

            if (!messageId || !reactionKey || !user || !roomId) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            // 🔥 Toggle reaction
            await reactionService.toggleReaction(
                messageId,
                reactionKey,
                user
            );

            // 🔥 Get updated message with reactions
            const updatedMessage = await reactionService.getMessageWithReactions(messageId);

            if (!updatedMessage) {
                return res.status(404).json({ message: "Message not found" });
            }

            // Normalize reaction output (ARRAY)
            const normalizedReactions = updatedMessage.reactions?.map(r => ({
                id: r.id,
                reactionKey: r.reactionKey,
                user: r.user,
                createdAt: r.createdAt,
            })) ?? [];

            const io = getIO();

            // 🔥 Emit consistent structure
            io.to(roomId).emit("reaction-updated", {
                messageId,
                reactions: normalizedReactions,
            });

            // Return full updated message
            res.json({
                ...updatedMessage,
                reactions: normalizedReactions,
            });

        } catch (error) {
            console.error("Error toggling reaction:", error);
            res.status(500).json({ message: "Reaction error" });
        }
    }

    async get(req: Request, res: Response) {
        try {
            const { messageId } = req.params;

            const message = await reactionService.getMessageWithReactions(messageId);

            if (!message) {
                return res.status(404).json({ message: "Message not found" });
            }

            res.json({
                ...message,
                reactions: message.reactions ?? [],
            });

        } catch (error) {
            res.status(500).json({ message: "Fetch error" });
        }
    }

    async clear(req: Request, res: Response) {
        try {
            const { messageId, user, roomId } = req.body;

            await reactionService.clearReactions(messageId, user);

            const io = getIO();
            io.to(roomId).emit("reaction-cleared", {
                messageId,
                user,
            });

            res.json({ message: "Reaction cleared successfully" });
        } catch (error) {
            console.error("Error clearing reaction:", error);
            res.status(500).json({ message: "Clear reaction error" });
        }
    }
}