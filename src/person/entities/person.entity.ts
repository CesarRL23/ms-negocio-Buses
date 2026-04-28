import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";


@Entity('person')
export class Person {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    nombre?: string;

    @Column({ unique: true })
    email?: string;

    @Column()
    password?: string;

    @Column({ nullable: true })
    userId?: number;
    
}