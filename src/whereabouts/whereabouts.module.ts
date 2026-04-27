import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhereaboutsService } from './whereabouts.service';
import { WhereaboutsController } from './whereabouts.controller';
import { Whereabouts } from './entities/whereabout.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Whereabouts])],
  controllers: [WhereaboutsController],
  providers: [WhereaboutsService],
  exports: [WhereaboutsService],
})
export class WhereaboutsModule {}
