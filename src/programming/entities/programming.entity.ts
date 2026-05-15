import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Route } from '../../route/entities/route.entity';
import { Bus } from '../../bus/entities/bus.entity';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { Driver } from '../../driver/entities/driver.entity';

@Entity('programming')
export class Programming {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'date', nullable: true })
  fecha?: Date;

  @Column({ nullable: true })
  horaSalida?: string;

  @Column({ nullable: true })
  horaLlegada?: string;

  @Column({ nullable: true, default: 5 })
  margenTolerancia?: number;

  @Column({ nullable: true, default: false })
  esRecurrente?: boolean;

  @Column({ nullable: true })
  tipoRecurrencia?: string;

  @Column({ nullable: true, default: 'PROGRAMADO' })
  estado?: string;

  @Column({ default: true })
  activo?: boolean;

  @ManyToOne(() => Route, (route) => route.programming)
  route?: Route;

  @ManyToOne(() => Bus, (bus) => bus.programming)
  bus?: Bus;

  @ManyToOne(() => Driver, (driver) => driver.programmings)
  driver?: Driver;

  @OneToMany(() => Ticket, (ticket) => ticket.programming)
  tickets?: Ticket[];
}
