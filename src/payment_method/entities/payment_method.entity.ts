import { CitizenPaymentMethod } from "../../citizen_payment_method/entities/citizen_payment_method.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('payment_method')
export class PaymentMethod {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    type?: string; // CARD | CASH | APP

    @Column({ nullable: true })
    provider?: string; // VISA, MASTERCARD, NEQUI, DAVIPLATA

    @Column({ nullable: true })
    accountNumber?: string; // número tarjeta o celular

    @Column({ default: true })
    isActive?: boolean;

    @OneToMany(() => CitizenPaymentMethod, citizenPaymentMethod => citizenPaymentMethod.paymentMethod)
    citizenPaymentMethods?: CitizenPaymentMethod[]; 
    
    
}
