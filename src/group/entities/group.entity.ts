import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PersonGroup } from '../../person-group/entities/person-group.entity';

@Entity('group')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  creatorUserId: string;

  @OneToMany(() => PersonGroup, (personGroup) => personGroup.group)
  personGroups: PersonGroup[];
}
