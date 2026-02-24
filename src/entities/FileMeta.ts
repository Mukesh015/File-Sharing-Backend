import {
    Entity,
    PrimaryColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from "typeorm";
import { Room } from "./Room";

@Entity()
export class FileMeta {
    @PrimaryColumn()
    id!: string;

    @Column()
    roomId!: string;

    @Column()
    fileName!: string;

    @Column("bigint")
    size!: number;

    @Column()
    mimeType!: string;

    @Column()
    owner!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => Room, (room) => room.files, {
        onDelete: "CASCADE",
    })
    room!: Room;
}