import { Bus } from "../../bus/entities/bus.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('gps')
export class Gps {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    codigo?: string;

    @Column()
    latitud?: number;

    @Column()
    longitud?: number;


    @OneToOne(() => Bus, bus => bus.gps)
    @JoinColumn()
    bus?: Bus;

}
