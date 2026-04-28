import { Citizen } from "../../citizen/entities/citizen.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('address')
export class Address {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    street?: string; //calle

    @Column()
    number?: string; // Número (ej: #45-23)

    @Column()
    neighborhood?: string; // Barrio

    @Column()
    city?: string; 

    @Column({ nullable: true })
    additionalInfo?: string; // Apto, torre, etc


    @OneToOne(() => Citizen, citizen => citizen.address)
    citizen?: Citizen;
}
