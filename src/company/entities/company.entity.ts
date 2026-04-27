import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Bus } from "../../bus/entities/bus.entity";
import { Driver } from "../../driver/entities/driver.entity";

@Entity('company')
export class Company {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    name?: string;

    @Column()
    address?: string;

    @Column()
    email?: string;

    @Column()
    nit?: string;

    @Column({ default: true })
    activo?: boolean;

    
    @OneToMany(() => Bus, bus => bus.company)
    buses?: Bus[];

    @ManyToMany(() => Driver, driver => driver.companies)

    @JoinTable({
        name: 'company_driver',
        joinColumn: { name: 'company_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'driver_id', referencedColumnName: 'id' }
    })
    drivers?: Driver[];
}
