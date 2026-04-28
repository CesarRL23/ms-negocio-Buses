import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Route } from "../../route/entities/route.entity";
import { Bus } from "../../bus/entities/bus.entity";
import { Ticket } from "../../ticket/entities/ticket.entity";

@Entity('programming')
export class Programming {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    fechaInicio?: Date;

    @Column()
    fechaFin?: Date;

    @Column()
    horaSalida?: string;

    @Column()
    horaLlegada?: string;

    @Column({ default: true })
    activo?: boolean;

    @ManyToOne(() => Route, route => route.programming)
    route?: Route;

    @ManyToOne(() => Bus, bus => bus.programming)
    bus?: Bus;

    @OneToMany(() => Ticket, ticket => ticket.programming)
    tickets?: Ticket[];

}

