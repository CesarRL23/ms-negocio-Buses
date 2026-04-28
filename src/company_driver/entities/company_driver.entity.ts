import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Company } from "../../company/entities/company.entity";
import { Driver } from "../../driver/entities/driver.entity";

@Entity('company_driver')
export class CompanyDriver {

    @PrimaryGeneratedColumn()
    id?: number;

    @ManyToOne(() => Company, company => company.companyDrivers)
    @JoinColumn({ name: 'company_id' })
    company?: Company;

    @ManyToOne(() => Driver, driver => driver.companyDrivers)
    @JoinColumn({ name: 'driver_id' })
    driver?: Driver;
}
