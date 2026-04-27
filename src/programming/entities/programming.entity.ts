import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Route } from "../../route/entities/route.entity";
import { Bus } from "../../bus/entities/bus.entity";

@Entity('programming')
export class Programming {

    @PrimaryGeneratedColumn()
    id?: number;

    @ManyToOne(() => Route, route => route.programming)
    @JoinColumn({ name: 'route_id' })
    route?: Route;

    @ManyToOne(() => Bus, bus => bus.programming)
    @JoinColumn({ name: 'bus_id' })
    bus?: Bus;

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

}
