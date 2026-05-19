import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { Company } from '../../company/entities/company.entity';

@Entity('marketing_analyst')
export class MarketingAnalyst {
  @PrimaryGeneratedColumn()
  id?: number;

  @OneToOne(() => Person)
  @JoinColumn({ name: 'person_id' })
  person?: Person;

  @ManyToOne(() => Company, (company) => company.marketingAnalysts, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Company;
}
