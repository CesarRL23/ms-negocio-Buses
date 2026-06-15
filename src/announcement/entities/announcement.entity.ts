import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnnouncementRecipient } from './announcement-recipient.entity';

@Entity('announcement')
export class Announcement {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  title?: string;

  @Column({ type: 'text' })
  message?: string;

  @Column({ type: 'enum', enum: ['ALL', 'ROUTE', 'ZONE'] })
  scope?: 'ALL' | 'ROUTE' | 'ZONE';

  @Column({ nullable: true })
  scopeValue?: string;

  @Column({ default: false })
  isUrgent?: boolean;

  @Column({ type: 'enum', enum: ['SCHEDULED', 'SENT'], default: 'SCHEDULED' })
  status?: 'SCHEDULED' | 'SENT';

  @Column({ type: 'datetime', nullable: true })
  scheduledFor?: Date;

  @Column({ type: 'datetime', nullable: true })
  sentAt?: Date;

  @Column()
  senderUserId?: string;

  @Column({ default: 0 })
  recipientCount?: number;

  @CreateDateColumn()
  createdAt?: Date;

  @OneToMany(() => AnnouncementRecipient, (recipient) => recipient.announcement)
  recipients?: AnnouncementRecipient[];
}
