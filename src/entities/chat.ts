// src/entities/Chat.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn
} from "typeorm";
import { Room } from "./Room";

@Entity()
export class Chat {

    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    sender!: string;

    @Column("text")
    message!: string;

    @ManyToOne(() => Room, room => room.chats, {
        onDelete: "CASCADE"
    })
    room!: Room;

    @CreateDateColumn()
    createdAt!: Date;
}