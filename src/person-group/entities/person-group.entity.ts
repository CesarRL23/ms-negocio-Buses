import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { Group } from '../../group/entities/group.entity';

@Entity('person_group')
export class PersonGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'member' })
  role: string; // 'admin' | 'member'

  @ManyToOne(() => Person, (person) => person.personGroups)
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @ManyToOne(() => Group, (group) => group.personGroups)
  @JoinColumn({ name: 'group_id' })
  group: Group;
}
