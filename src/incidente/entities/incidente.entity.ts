import { IncidenteBus } from '../../incidente_bus/entities/incidente_bus.entity';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Shift } from '../../shift/entities/shift.entity';

export enum IncidenteEstado {
  PENDIENTE = 'pendiente',
  EN_REVISION = 'en_revision',
  RESUELTO = 'resuelto',
}

@Entity('incidente')
export class Incidente {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'datetime' })
  timestamp?: Date;

  @Column()
  tipo?: string;
    
  @Column({ nullable: true })
  gravedad?: string;
    
  @Column({ nullable: true })
  tipo_otro?: string;
    
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitud?: number;
    
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitud?: number;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: IncidenteEstado.PENDIENTE,
  })
  estado?: string;

  /** Stored as a JSON string: Array of { autor, texto, timestamp } */
  @Column({ type: 'text', nullable: true })
  comentarios?: string;
    
  @ManyToOne(() => Shift, (shift) => shift.incidentes, { nullable: true })
  @JoinColumn({ name: 'shift_id' })
  shift?: Shift;

  @OneToMany(() => IncidenteBus, (incidenteBus) => incidenteBus.incidente)
  incidenteBuses?: IncidenteBus[];
}
