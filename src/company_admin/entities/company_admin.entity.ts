import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { Company } from '../../company/entities/company.entity';

@Entity('company_admin')
export class CompanyAdmin {
  @PrimaryGeneratedColumn()
  id?: number;

  @OneToOne(() => Person)
  @JoinColumn({ name: 'person_id' })
  person?: Person;

  @ManyToOne(() => Company, (company) => company.companyAdmins)
  @JoinColumn({ name: 'company_id' })
  company?: Company;
}
