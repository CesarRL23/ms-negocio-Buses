import { Nodo } from "../../nodo/entities/nodo.entity";


import { Programming } from "../../programming/entities/programming.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Company } from "../../company/entities/company.entity";

@Entity('route')

export class Route {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    nombre?: string;

    @Column({ type: 'text', nullable: true })
    descripcion?: string;

    @Column()
    origen?: string;

    @Column()
    destino?: string;

    @Column()
    distancia?: number;

    @Column()
    duracion_estimada?: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    tarifa?: number;

    @OneToMany(() => Nodo, nodo => nodo.route)
    nodos?: Nodo[];

    @OneToMany(() => Programming, programming => programming.route)
    programming?: Programming[];

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company?: Company;

    
}
