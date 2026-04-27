import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateRecordDto {
  @ApiProperty({ example: 550, description: 'TMDB 영화 ID' })
  @IsInt()
  @IsNotEmpty()
  tmdbMovieId: number;

  @ApiProperty({ example: '2026-04-15', description: '관람 날짜 (ISO 8601)' })
  @IsDateString()
  @IsNotEmpty()
  watchedAt: string;

  @ApiPropertyOptional({ example: 4.5, minimum: 0, maximum: 5 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: '인생 영화' })
  @IsString()
  @IsOptional()
  memo?: string;

  @ApiPropertyOptional({ example: '아이 엠 아이언맨' })
  @IsString()
  @IsOptional()
  quote?: string;
}
