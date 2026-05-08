import { Bus } from '../../bus/entities/bus.entity';
import { Incidente } from '../../incidente/entities/incidente.entity';
import { Foto } from '../../foto/entities/foto.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('incidente_bus')
export class IncidenteBus {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Bus, (bus) => bus.id, { eager: true })
  bus?: Bus;

  @ManyToOne(() => Incidente, (incidente) => incidente.incidenteBuses)
  incidente?: Incidente;

  @OneToMany(() => Foto, (foto) => foto.incidenteBus)
  fotos?: Foto[];

  @Column({ type: 'text', nullable: true })
  notas?: string;
}
