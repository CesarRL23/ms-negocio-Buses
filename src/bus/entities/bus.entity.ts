import { Gps } from "../../gps/entities/gps.entity";
import { Company } from "../../company/entities/company.entity";
import { Programming } from "../../programming/entities/programming.entity";
import { Column, Entity, JoinColumn, OneToOne, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Shift } from "../../shift/entities/shift.entity";

@Entity('buses')
export class Bus {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    placa?: string;
    @Column()
    modelo?: string;
    @Column()
    capacidad?: number;
    @Column()
    marca?: string;
    @Column()
    estado?: string;

    @ManyToOne(() => Company, company => company.buses)
    @JoinColumn({ name: 'company_id' })
    company?: Company;

    @OneToOne(() => Gps, gps => gps.bus)
    gps?: Gps;
    
    @OneToMany(() => Shift, shift => shift.bus)
    shifts?: Shift[];

    @OneToMany(() => Programming, programming => programming.bus)
    programming?: Programming[];
}