    import { Message } from "../../message/entities/message.entity";
import { PersonGroup } from "../../person-group/entities/person-group.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";


    @Entity('person')
    export class Person {

        @PrimaryGeneratedColumn()
        id?: number;

        @Column()
        nombre?: string;


        @Column({ nullable: true })
        userId?: string;

        @OneToMany(() => Message, message => message.emisor)
        messages?: Message[];

        @OneToMany(() => PersonGroup, (personGroup) => personGroup.person)
        personGroups: PersonGroup[];
        
    }