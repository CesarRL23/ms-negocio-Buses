import { Person } from "../../person/entities/person.entity";
import { Company } from "../../company/entities/company.entity";
import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, ManyToMany, OneToMany } from "typeorm";
import { Shift } from "../../shift/entities/shift.entity";
import { CompanyDriver } from "../../company_driver/entities/company_driver.entity";

@Entity('drivers')
export class Driver {

    @PrimaryGeneratedColumn()
    id?: number;

    @OneToOne(() => Person)
    @JoinColumn()
    person?: Person;

    @OneToMany(() => Shift, shift => shift.driver)
    shifts?: Shift[];

    @OneToMany(() => CompanyDriver, companyDriver => companyDriver.driver)
    companyDrivers?: CompanyDriver[];
}
