import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MarketintAnalystService } from './marketint-analyst.service';
import { CreateMarketintAnalystDto } from './dto/create-marketint-analyst.dto';
import { UpdateMarketintAnalystDto } from './dto/update-marketint-analyst.dto';

@Controller('marketing-analyst')
export class MarketintAnalystController {
  constructor(
    private readonly marketintAnalystService: MarketintAnalystService,
  ) {}

  @Post()
  create(@Body() createMarketintAnalystDto: CreateMarketintAnalystDto) {
    return this.marketintAnalystService.create(createMarketintAnalystDto);
  }

  @Get()
  findAll() {
    return this.marketintAnalystService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marketintAnalystService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMarketintAnalystDto: UpdateMarketintAnalystDto,
  ) {
    return this.marketintAnalystService.update(+id, updateMarketintAnalystDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marketintAnalystService.remove(+id);
  }
}
