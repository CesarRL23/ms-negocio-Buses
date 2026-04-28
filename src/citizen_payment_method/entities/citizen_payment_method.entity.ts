import { Citizen } from "../../citizen/entities/citizen.entity";
import { PaymentMethod } from "../../payment_method/entities/payment_method.entity";
import { Ticket } from "../../ticket/entities/ticket.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from "typeorm";

@Entity('citizen_payment_method')
export class CitizenPaymentMethod {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    citizenId?: number;

    @Column()
    paymentMethodId?: number;

    @ManyToOne(() => Citizen, citizen => citizen.paymentMethods)
    @JoinColumn({ name: 'citizenId' })
    citizen?: Citizen;

    @ManyToOne(() => PaymentMethod, paymentMethod => paymentMethod.citizenPaymentMethods)
    @JoinColumn({ name: 'paymentMethodId' })
    paymentMethod?: PaymentMethod;

    @OneToMany(() => Ticket, ticket => ticket.citizenPaymentMethod)
    tickets?: Ticket[];
    

}
