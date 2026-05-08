import { IncidenteBus } from '../../incidente_bus/entities/incidente_bus.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('incidente')
export class Incidente {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'datetime' })
  timestamp?: Date;

  @Column()
  tipo?: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @OneToMany(() => IncidenteBus, (incidenteBus) => incidenteBus.incidente)
  incidenteBuses?: IncidenteBus[];
}
