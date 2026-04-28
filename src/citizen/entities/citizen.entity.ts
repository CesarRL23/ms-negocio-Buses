import { Address } from "../../address/entities/address.entity";
import { Person } from "../../person/entities/person.entity";
import { CitizenPaymentMethod } from "../../citizen_payment_method/entities/citizen_payment_method.entity";
import { Entity, JoinColumn, OneToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('citizen')
export class Citizen {

    @PrimaryGeneratedColumn()
    id?: number;

    @OneToOne(() => Person)
    @JoinColumn()
    person?: Person;

    @OneToOne(() => Address, address => address.citizen, {
    cascade: true
    })
    @JoinColumn()
    address?: Address;

    @OneToMany(() => CitizenPaymentMethod, citizenPaymentMethod => citizenPaymentMethod.citizen)
    paymentMethods?: CitizenPaymentMethod[];
}