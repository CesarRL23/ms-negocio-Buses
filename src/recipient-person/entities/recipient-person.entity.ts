import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Message } from "../../message/entities/message.entity";
import { Person } from "../../person/entities/person.entity";

@Entity('recipient_person')
export class RecipientPerson {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Message)
    @JoinColumn({ name: 'message_id' })
    message: Message;

    @ManyToOne(() => Person)
    @JoinColumn({ name: 'person_id' })
    person: Person;
}
