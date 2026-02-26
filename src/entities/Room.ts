import {
    Entity,
    PrimaryColumn,
    Column,
    OneToMany,
    CreateDateColumn,
} from "typeorm";
import { FileMeta } from "./FileMeta";
import { Chat } from "./chat";

@Entity()
export class Room {

    @PrimaryColumn()
    id!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @OneToMany(() => FileMeta, (file) => file.room, {
        cascade: true,
    })
    files!: FileMeta[];

    @OneToMany(() => Chat, chat => chat.room)
    chats!: Chat[];
}