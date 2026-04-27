import { Nodo } from "../../nodo/entities/nodo.entity";
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";


@Entity('whereabouts')
export class Whereabouts {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    nombre?: string;

    @Column('decimal', { precision: 10, scale: 7 })
    latitud?: number;

    @Column('decimal', { precision: 10, scale: 7 })
    longitud?: number;  

    @Column()
    direccion?: string;

    @Column({ default: true })
    activo?: boolean;

    // relación clave
    @OneToMany(() => Nodo, nodo => nodo.stop)
    nodos?: Nodo[];

}
