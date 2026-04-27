import { Person } from "../../person/entities/person.entity";
import { Company } from "../../company/entities/company.entity";
import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, ManyToMany, OneToMany } from "typeorm";
import { Shift } from "../../shift/entities/shift.entity";

@Entity('drivers')
export class Driver {

    @PrimaryGeneratedColumn()
    id?: number;

    @OneToOne(() => Person)
    @JoinColumn()
    person?: Person;

    @ManyToMany(() => Company, company => company.drivers)
    companies?: Company[];

    @OneToMany(() => Shift, shift => shift.driver)
    shifts?: Shift[];
}
