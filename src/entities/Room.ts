import {
    Entity,
    PrimaryColumn,
    Column,
    OneToMany,
    CreateDateColumn,
} from "typeorm";
import { FileMeta } from "./FileMeta";

@Entity()
export class Room {
    @PrimaryColumn()
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => FileMeta, (file) => file.room, {
        cascade: true,
    })
    files: FileMeta[];
}