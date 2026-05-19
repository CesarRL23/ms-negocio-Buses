import { PartialType } from '@nestjs/mapped-types';
import { CreateMarketintAnalystDto } from './create-marketint-analyst.dto';

export class UpdateMarketintAnalystDto extends PartialType(CreateMarketintAnalystDto) {}
