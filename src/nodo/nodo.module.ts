import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodoService } from './nodo.service';
import { NodoController } from './nodo.controller';
import { Nodo } from './entities/nodo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nodo])],
  controllers: [NodoController],
  providers: [NodoService],
  exports: [NodoService],
})
export class NodoModule {}
