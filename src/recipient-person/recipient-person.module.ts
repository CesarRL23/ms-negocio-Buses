import { Module } from '@nestjs/common';
import { RecipientPersonService } from './recipient-person.service';
import { RecipientPersonController } from './recipient-person.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipientPerson } from './entities/recipient-person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecipientPerson])],
  controllers: [RecipientPersonController],
  providers: [RecipientPersonService],
})
export class RecipientPersonModule {}
