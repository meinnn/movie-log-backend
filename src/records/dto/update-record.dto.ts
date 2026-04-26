import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateRecordDto {
  @IsDateString()
  @IsOptional()
  watchedAt?: string;

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
