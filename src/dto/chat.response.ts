export type ChatMessageResponse = {
    id: string;
    sender: string;
    message: string;
    createdAt: Date;
    reactions: {
        id: string;
        reactionKey: string;
        user: string;
        createdAt: Date;
    }[];
};