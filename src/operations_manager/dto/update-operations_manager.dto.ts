import { PartialType } from '@nestjs/mapped-types';
import { CreateOperationsManagerDto } from './create-operations_manager.dto';

export class UpdateOperationsManagerDto extends PartialType(CreateOperationsManagerDto) {}
