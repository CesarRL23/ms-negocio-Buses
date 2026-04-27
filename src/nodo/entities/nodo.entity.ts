import { Route } from "../../route/entities/route.entity";
import { Whereabouts } from "../../whereabouts/entities/whereabout.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('nodo')
export class Nodo {

    @PrimaryGeneratedColumn()
    id?: number;

    @ManyToOne(() => Whereabouts, whereabouts => whereabouts.nodos)
    stop?: Whereabouts;

    @ManyToOne(()=> Route , route => route.nodos)
    route?: Route;

    @Column()
    orden?: number;

    @Column()
    distanciaDesdeAnterior?: number;

    @Column()
    tiempoEstimadoDesdeAnterior?: number;


}
