import { Route } from "../../route/entities/route.entity";
import { Whereabouts } from "../../whereabouts/entities/whereabout.entity";
import { ValidationRecord } from "../../record/entities/record.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity('nodo')
export class Nodo {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    orden?: number;

    @Column()
    distanciaDesdeAnterior?: number;

    @Column()
    tiempoEstimadoDesdeAnterior?: number;

    @ManyToOne(() => Whereabouts, whereabouts => whereabouts.nodos)
    stop?: Whereabouts;

    @ManyToOne(()=> Route , route => route.nodos)
    route?: Route;

    @OneToMany(() => ValidationRecord, validationRecord => validationRecord.nodo)
    validationRecords?: ValidationRecord[];

}
