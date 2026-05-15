import { Module } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { Person } from './entities/person.entity';
import { Citizen } from '../citizen/entities/citizen.entity';
import { Driver } from '../driver/entities/driver.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Person, Citizen, Driver])],
  controllers: [PersonController],
  providers: [PersonService],
})
export class PersonModule {}
