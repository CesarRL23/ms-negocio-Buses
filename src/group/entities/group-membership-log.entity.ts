import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('group_membership_log')
export class GroupMembershipLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupId: number;

  @Column()
  action: string; // 'added' | 'removed' | 'promoted' | 'banned'

  @Column()
  actorUserId: string;

  @Column()
  actorName: string;

  @Column()
  targetUserId: string;

  @Column()
  targetName: string;

  @CreateDateColumn()
  createdAt: Date;
}
