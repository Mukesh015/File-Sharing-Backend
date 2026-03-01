// src/entities/Chat.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    OneToMany,
    JoinColumn
} from "typeorm";
import { Room } from "./Room";
import { Reaction } from "./Reaction";

@Entity()
export class Chat {

    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    sender!: string;

    @Column("text")
    message!: string;

    @Column("simple-json", { nullable: true })
    mentions?: string[] | null;

    // 🔥 NEW: reply reference
    @ManyToOne(() => Chat, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "replyToId" })
    replyTo?: Chat | null;

    @Column({ nullable: true })
    replyToId?: string | null;

    @OneToMany(() => Reaction, reaction => reaction.chat)
    reactions!: Reaction[];

    @ManyToOne(() => Room, room => room.chats, {
        onDelete: "CASCADE"
    })
    room!: Room;

    @CreateDateColumn()
    createdAt!: Date;
}