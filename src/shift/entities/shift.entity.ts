import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Driver } from "../../driver/entities/driver.entity";
import { Bus } from "../../bus/entities/bus.entity";

@Entity('shift')
export class Shift {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    fecha?: Date;

    @Column()
    hora_inicio?: Date;

    @Column()
    hora_fin?: Date;

    @Column()
    estado?: string;

    // 🔥 RELACIONES CORRECTAS

    @ManyToOne(() => Driver, driver => driver.shifts)
    @JoinColumn({ name: 'driver_id' })
    driver?: Driver;

    @ManyToOne(() => Bus, bus => bus.shifts)
    @JoinColumn({ name: 'bus_id' })
    bus?: Bus;
}