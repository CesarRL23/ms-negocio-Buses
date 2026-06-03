import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsArray, ArrayMinSize } from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNotEmpty()
  @IsString()
  creatorUserId: string;

  @IsArray()
  @ArrayMinSize(2, { message: 'Se requieren al menos 2 miembros además del creador' })
  @IsString({ each: true })
  memberUserIds: string[];
}
