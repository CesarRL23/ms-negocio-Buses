import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./message.entity";

@Entity('message_read')
export class MessageRead {
    @PrimaryGeneratedColumn()
    id?: number;

    @ManyToOne(() => Message, { onDelete: 'CASCADE' })
    @JoinColumn()
    message?: Message;

    @Column()
    userId?: string;

    @Column()
    readAt?: Date;
}
