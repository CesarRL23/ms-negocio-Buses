import { ValidationRecord } from "../../record/entities/record.entity";
import { Programming } from "../../programming/entities/programming.entity";
import { CitizenPaymentMethod } from "../../citizen_payment_method/entities/citizen_payment_method.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from "typeorm";

@Entity('ticket')
export class Ticket {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ unique: true })
    codigo?: string;
    @Column()
    precio?: number;

    @Column()
    fechaCompra?: Date; 

    @Column()
    FechaUso?: Date;

    @Column()
    estado?: string;
    //ACTIVO, USADO, EXPIRADO

    @Column()
    metodoPago?: string;

    @Column({ nullable: true })
    citizenPaymentMethodId?: number;

    @ManyToOne(() => Programming, programming => programming.id)
    programming?: Programming;

    @ManyToOne(() => CitizenPaymentMethod, citizenPaymentMethod => citizenPaymentMethod.tickets)
    @JoinColumn({ name: 'citizenPaymentMethodId' })
    citizenPaymentMethod?: CitizenPaymentMethod;

    @OneToMany(() => ValidationRecord, validationRecord => validationRecord.ticket)
    validationRecords?: ValidationRecord[];
    



}
