import { Person } from "../../person/entities/person.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('message')
export class Message {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ length: 500 })
    contenido?: string;

    @Column()
    fechaDeEnvio?: Date;

    @Column()
    emisor?: string;

    @Column({ nullable: true })
    receptor?: string;

    @Column({ default: false })
    leido?: boolean;

    @Column({ nullable: true })
    fechaLectura?: Date;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    latitud?: number;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    longitud?: number;

    @Column({ type: 'enum', enum: ['CHAT', 'ANNOUNCEMENT'], default: 'CHAT' })
    messageType?: 'CHAT' | 'ANNOUNCEMENT';

    @Column({ nullable: true })
    announcementId?: number;

    @Column({ default: false })
    isUrgent?: boolean;

    @Column({ type: 'enum', enum: ['citizen', 'driver'], default: 'citizen' })
    senderRole?: 'citizen' | 'driver';

    @Column({ nullable: true })
    deletedAt?: Date;

    @Column({ nullable: true })
    deletedBy?: string;

    @ManyToOne(() => Person, (person) => person.messages, { nullable: true })
    person?: Person;
}