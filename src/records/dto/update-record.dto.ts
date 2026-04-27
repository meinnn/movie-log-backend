import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateRecordDto {
  @ApiPropertyOptional({ example: '2026-04-20' })
  @IsDateString()
  @IsOptional()
  watchedAt?: string;

  @ApiPropertyOptional({ example: 3.5, minimum: 0, maximum: 5 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: '생각보다 별로였다' })
  @IsString()
  @IsOptional()
  memo?: string;

  @ApiPropertyOptional({ example: '명대사' })
  @IsString()
  @IsOptional()
  quote?: string;
}
