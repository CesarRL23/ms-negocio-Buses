import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from "typeorm";
import { Ticket } from "../../ticket/entities/ticket.entity";
import { Nodo } from "../../nodo/entities/nodo.entity";

@Entity('record')
export class ValidationRecord {

    @PrimaryGeneratedColumn()
    id?: number;

    @ManyToOne(() => Ticket, ticket => ticket.validationRecords)
    ticket?: Ticket;

    @ManyToOne(() => Nodo, nodo => nodo.validationRecords)
    nodo?: Nodo;

    @Column()
    timestamp?: Date;

    @Column()
    type?: string; // BOARDING | ALIGHTING
}