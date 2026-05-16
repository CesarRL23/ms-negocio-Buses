import { IncidenteBus } from '../../incidente_bus/entities/incidente_bus.entity';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Shift } from '../../shift/entities/shift.entity';

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
    
  @ManyToOne(() => Shift, (shift) => shift.incidentes, { nullable: true })
  @JoinColumn({ name: 'shift_id' })
  shift?: Shift;

  @OneToMany(() => IncidenteBus, (incidenteBus) => incidenteBus.incidente)
  incidenteBuses?: IncidenteBus[];
}
