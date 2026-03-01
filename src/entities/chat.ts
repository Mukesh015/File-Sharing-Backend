// src/entities/Chat.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    OneToMany
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

    @OneToMany(() => Reaction, reaction => reaction.chat)
    reactions!: Reaction[];

    @ManyToOne(() => Room, room => room.chats, {
        onDelete: "CASCADE"
    })
    room!: Room;

    @CreateDateColumn()
    createdAt!: Date;
}