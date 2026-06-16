import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Unique(['groupId', 'bannedUserId'])
@Entity('group_ban')
export class GroupBan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupId: number;

  @Column()
  bannedUserId: string;

  @Column()
  bannedByUserId: string;

  @CreateDateColumn()
  createdAt: Date;
}
