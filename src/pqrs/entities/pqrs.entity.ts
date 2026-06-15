import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type PqrsType = 'PETICION' | 'QUEJA' | 'RECLAMO' | 'SUGERENCIA';
export type PqrsCategory = 'CONDUCTOR' | 'BUS' | 'RUTA' | 'TARJETA' | 'OTRO';
export type PqrsStatus = 'PENDIENTE' | 'EN_REVISION' | 'EN_PROCESO' | 'RESUELTO';

@Entity('pqrs')
export class Pqrs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  radicado: string;

  @Column({ type: 'enum', enum: ['PETICION', 'QUEJA', 'RECLAMO', 'SUGERENCIA'] })
  type: PqrsType;

  @Column({ type: 'enum', enum: ['CONDUCTOR', 'BUS', 'RUTA', 'TARJETA', 'OTRO'] })
  category: PqrsCategory;

  @Column({ type: 'text' })
  description: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  citizenUserId: string;

  @Column({ nullable: true })
  citizenName: string;

  @Column({
    type: 'enum',
    enum: ['PENDIENTE', 'EN_REVISION', 'EN_PROCESO', 'RESUELTO'],
    default: 'PENDIENTE',
  })
  status: PqrsStatus;

  @Column({ type: 'text', nullable: true })
  agentResponse: string;

  @Column({ type: 'json', nullable: true })
  photos: string[];

  @Column({ default: 10 })
  estimatedDays: number;

  @Column({ nullable: true, type: 'datetime' })
  resolvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
