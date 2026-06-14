import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeatherAlert } from './entities/weather-alert.entity';
import { WeatherAlertService } from './weather-alert.service';
import { WeatherAlertController } from './weather-alert.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WeatherAlert])],
  controllers: [WeatherAlertController],
  providers: [WeatherAlertService],
})
export class WeatherAlertModule {}
