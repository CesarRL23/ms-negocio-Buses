import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Citizen } from '../../citizen/entities/citizen.entity';

export enum AppointmentStatus {
  PENDING = 'PENDIENTE',
  CONFIRMED = 'CONFIRMADA',
  CANCELLED = 'CANCELADA',
  COMPLETED = 'COMPLETADA',
}

export enum AttentionType {
  PRESENCIAL = 'PRESENCIAL',
  VIRTUAL = 'VIRTUAL',
}

export enum ConsultationType {
  PROBLEMA_TARJETA = 'PROBLEMA_TARJETA',
  RECLAMO = 'RECLAMO',
  REEMBOLSO = 'REEMBOLSO',
  OTRO = 'OTRO',
}

@Entity('appointment')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Citizen, { nullable: true, eager: false })
  @JoinColumn()
  citizen?: Citizen;

  /** Firebase userId del ciudadano (para buscar sin JOIN pesado) */
  @Column({ nullable: true })
  citizenUserId?: string;

  /** Email del ciudadano para el correo de confirmación */
  @Column()
  citizenEmail: string;

  /** Nombre para mostrar en el correo */
  @Column()
  citizenName: string;

  @Column({ type: 'date' })
  fecha: string; // 'YYYY-MM-DD'

  @Column({ type: 'time' })
  hora: string; // 'HH:MM'

  @Column({ type: 'enum', enum: AttentionType })
  tipoAtencion: AttentionType;

  @Column({ type: 'enum', enum: ConsultationType })
  tipoConsulta: ConsultationType;

  @Column({ length: 300 })
  motivo: string;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.CONFIRMED })
  estado: AppointmentStatus;

  /** Google Calendar event ID para poder cancelar */
  @Column({ nullable: true })
  googleEventId?: string;

  /** Google Meet link (solo para citas virtuales) */
  @Column({ nullable: true })
  meetLink?: string;

  /** Email del asesor asignado */
  @Column()
  asesorEmail: string;

  @CreateDateColumn()
  creadoEn: Date;
}
