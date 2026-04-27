import { Nodo } from "../../nodo/entities/nodo.entity";


import { Programming } from "../../programming/entities/programming.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('route')

export class Route {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    nombre?: string;

    @Column()
    origen?: string;

    @Column()
    destino?: string;

    @Column()
    distancia?: number;

    @Column()
    duracion_estimada?: number;

    @OneToMany(() => Nodo, nodo => nodo.route)
    nodos?: Nodo[];

    @OneToMany(() => Programming, programming => programming.route)
    programming?: Programming[];

    
}
