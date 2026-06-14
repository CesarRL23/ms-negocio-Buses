import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeatherAlert } from './entities/weather-alert.entity';
import { CreateWeatherAlertDto } from './dto/create-weather-alert.dto';
import { UpdateWeatherAlertDto } from './dto/update-weather-alert.dto';

@Injectable()
export class WeatherAlertService {
  constructor(
    @InjectRepository(WeatherAlert)
    private readonly repo: Repository<WeatherAlert>,
  ) {}

  async upsert(dto: CreateWeatherAlertDto): Promise<WeatherAlert> {
    let alert = await this.repo.findOne({
      where: { citizenUserId: dto.citizenUserId },
    });

    if (alert) {
      alert.email      = dto.email;
      alert.name       = dto.name;
      alert.enabled    = dto.enabled ?? true;
      alert.travelTime = dto.travelTime ?? alert.travelTime;
      alert.city       = dto.city ?? alert.city;
    } else {
      alert = this.repo.create({
        citizenUserId: dto.citizenUserId,
        email:       dto.email,
        name:        dto.name,
        enabled:     dto.enabled ?? true,
        travelTime:  dto.travelTime ?? '07:00',
        city:        dto.city ?? 'Bogotá',
      });
    }

    return this.repo.save(alert);
  }

  async findByUser(citizenUserId: string): Promise<WeatherAlert | null> {
    return this.repo.findOne({ where: { citizenUserId } });
  }

  async update(id: number, dto: UpdateWeatherAlertDto): Promise<WeatherAlert> {
    const alert = await this.repo.findOne({ where: { id } });
    if (!alert) throw new NotFoundException(`WeatherAlert #${id} no encontrada`);

    Object.assign(alert, dto);
    return this.repo.save(alert);
  }

  async getActiveSubscribers(): Promise<WeatherAlert[]> {
    return this.repo.find({ where: { enabled: true } });
  }

  async remove(citizenUserId: string): Promise<void> {
    const alert = await this.repo.findOne({ where: { citizenUserId } });
    if (alert) await this.repo.remove(alert);
  }
}
