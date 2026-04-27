import { PartialType } from '@nestjs/mapped-types';
import { CreateWhereaboutDto } from './create-whereabout.dto';

export class UpdateWhereaboutDto extends PartialType(CreateWhereaboutDto) {}
