import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './entities/person.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

import { Citizen } from '../citizen/entities/citizen.entity';
import { Driver } from '../driver/entities/driver.entity';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(Citizen)
    private readonly citizenRepository: Repository<Citizen>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    const person = this.personRepository.create(createPersonDto);
    return await this.personRepository.save(person);
  }

  async sync(createPersonDto: CreatePersonDto): Promise<Person> {
    const userId = createPersonDto.userId;
    let person: Person;

    if (userId) {
      const existing = await this.personRepository.findOne({
        where: { userId },
      });
      if (existing) {
        const nextNombre = createPersonDto.nombre || existing.nombre;
        if (nextNombre && nextNombre !== existing.nombre) {
          existing.nombre = nextNombre;
          person = await this.personRepository.save(existing);
        } else {
          person = existing;
        }
      } else {
        person = this.personRepository.create(createPersonDto);
        person = await this.personRepository.save(person);
      }

      // Automatically sync Citizen / Driver based on passed roles
      try {
        const userRoles = createPersonDto.roles || [];
        const roleNames = userRoles.map((r: string) => r.toUpperCase());

        // Si el usuario tiene rol CITIZEN o CIUDADANO
        if (roleNames.includes('CITIZEN') || roleNames.includes('CIUDADANO')) {
          const existingCitizen = await this.citizenRepository.findOne({ where: { person: { id: person.id } } });
          if (!existingCitizen) {
            const citizen = this.citizenRepository.create({ person: { id: person.id } });
            await this.citizenRepository.save(citizen);
          }
        }

        // Si el usuario tiene rol DRIVER o CONDUCTOR
        if (roleNames.includes('DRIVER') || roleNames.includes('CONDUCTOR')) {
          const existingDriver = await this.driverRepository.findOne({ where: { person: { id: person.id } } });
          if (!existingDriver) {
            const driver = this.driverRepository.create({ person: { id: person.id } });
            await this.driverRepository.save(driver);
          }
        }
      } catch (err) {
        console.warn('Error syncing roles in PersonService:', err);
      }

      return person;
    }

    person = this.personRepository.create(createPersonDto);
    return await this.personRepository.save(person);
  }

  async findAll(): Promise<Person[]> {
    return await this.personRepository.find();
  }

  async findOne(id: number): Promise<Person> {
    const person = await this.personRepository.findOne({ where: { id } });
    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    return person;
  }

  async update(id: number, updatePersonDto: UpdatePersonDto): Promise<Person> {
    await this.findOne(id);
    await this.personRepository.update(id, updatePersonDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const person = await this.findOne(id);
    await this.personRepository.remove(person);
  }
}
