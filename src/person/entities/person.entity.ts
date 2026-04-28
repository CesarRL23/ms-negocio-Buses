    import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";


    @Entity('person')
    export class Person {

        @PrimaryGeneratedColumn()
        id?: number;

        @Column()
        nombre?: string;


        @Column({ nullable: true })
        userId?: string;
        
    }