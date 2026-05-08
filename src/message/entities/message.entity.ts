import { Person } from "../../person/entities/person.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('message')
export class Message {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    contenido?: string;

    @Column()
    fechaDeEnvio?: Date;

    @Column()
    emisor?: string;

    @ManyToOne(() => Person, (person) => person.messages)
    person?: Person;
}