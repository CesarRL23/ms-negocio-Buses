import { IncidenteBus } from '../../incidente_bus/entities/incidente_bus.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('foto')
export class Foto {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  url?: string;

  @ManyToOne(() => IncidenteBus, (incidenteBus) => incidenteBus.fotos)
  incidenteBus?: IncidenteBus;
}
