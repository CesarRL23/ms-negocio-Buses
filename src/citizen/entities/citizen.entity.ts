import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import { Person } from "../../person/entities/person.entity";

@Entity('citizen')
export class Citizen {

    @PrimaryGeneratedColumn()
    id?: number;

    @OneToOne(() => Person)
    @JoinColumn()
    person?: Person;
}