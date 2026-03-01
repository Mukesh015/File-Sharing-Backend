import { AppDataSource } from "../config/data-source";
import { Reaction } from "../entities/Reaction";
import { Chat } from "../entities/chat";

export class ReactionService {

    private reactionRepo = AppDataSource.getRepository(Reaction);
    private messageRepo = AppDataSource.getRepository(Chat);

    /**
     * Toggle reaction for a user on a message
     */
    async toggleReaction(
        messageId: string,
        reactionKey: string,
        user: string
    ) {
        if (!user) {
            throw new Error("Invalid user");
        }

        const message = await this.messageRepo.findOne({
            where: { id: messageId },
        });

        if (!message) {
            throw new Error("Message not found");
        }

        const existing = await this.reactionRepo.findOne({
            where: {
                chat: { id: messageId },
                reactionKey,
                user,
            },
            relations: ["chat"],
        });

        if (existing) {
            await this.reactionRepo.remove(existing);
        } else {
            const reaction = this.reactionRepo.create({
                chat: message,
                reactionKey,
                user,
            });

            await this.reactionRepo.save(reaction);
        }

        // 🔥 Always return fresh normalized array
        return this.getMessageWithReactions(messageId);
    }

    /**
     * Always return normalized Reaction[]
     */
    async getMessageWithReactions(messageId: string) {
        const message = await this.messageRepo.findOne({
            where: { id: messageId },
            relations: ["reactions"], // IMPORTANT
            order: {
                reactions: {
                    createdAt: "ASC",
                },
            },
        });

        if (!message) {
            throw new Error("Message not found");
        }

        return message;
    }

    async clearReactions(messageId: string, user: string) {
        if (!user) {
            throw new Error("Invalid user");
        }
        const message = await this.messageRepo.findOne({
            where: { id: messageId },
        });
        if (!message) {
            throw new Error("Message not found");
        }
        await this.reactionRepo.delete({
            chat: { id: messageId },
            user,
        });
    }
}