import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Announcement } from './announcement.entity';

@Entity('announcement_recipient')
export class AnnouncementRecipient {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Announcement, (announcement) => announcement.recipients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'announcementId' })
  announcement?: Announcement;

  @Column()
  userId?: string;

  @Column({ default: false })
  delivered?: boolean;

  @Column({ type: 'datetime', nullable: true })
  deliveredAt?: Date;

  @Column({ default: false })
  read?: boolean;

  @Column({ type: 'datetime', nullable: true })
  readAt?: Date;
}
