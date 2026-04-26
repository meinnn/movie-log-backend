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
  @IsInt()
  @IsNotEmpty()
  tmdbMovieId: number;

  @IsDateString()
  @IsNotEmpty()
  watchedAt: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsString()
  @IsOptional()
  memo?: string;

  @IsString()
  @IsOptional()
  quote?: string;
}
