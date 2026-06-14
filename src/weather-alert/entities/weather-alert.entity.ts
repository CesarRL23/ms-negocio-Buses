import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('weather_alert')
export class WeatherAlert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  citizenUserId: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: '07:00' })
  travelTime: string;

  @Column({ default: 'Bogotá' })
  city: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
