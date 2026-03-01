import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    Unique,
} from "typeorm";
import { Chat } from "./chat";

@Entity()
@Unique(["chat", "reactionKey", "user"]) // prevent duplicate reaction
export class Reaction {

    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Chat, chat => chat.reactions, {
        onDelete: "CASCADE",
    })
    chat!: Chat;

    @Column()
    reactionKey!: string;

    @Column()
    user!: string;

    @CreateDateColumn()
    createdAt!: Date;
}