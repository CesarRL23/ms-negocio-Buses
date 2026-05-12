import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Bus } from '../../bus/entities/bus.entity';
import { Driver } from '../../driver/entities/driver.entity';
import { CompanyDriver } from '../../company_driver/entities/company_driver.entity';
import { CompanyAdmin } from '../../company_admin/entities/company_admin.entity';

@Entity('company')
export class Company {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;

  @Column()
  address?: string;

  @Column()
  email?: string;

  @Column()
  nit?: string;

  @Column({ default: true })
  activo?: boolean;

  @OneToMany(() => Bus, (bus) => bus.company)
  buses?: Bus[];

  @OneToMany(() => CompanyDriver, (companyDriver) => companyDriver.company)
  companyDrivers?: CompanyDriver[];

  @OneToMany(() => CompanyAdmin, (companyAdmin) => companyAdmin.company)
  companyAdmins?: CompanyAdmin[];
}
