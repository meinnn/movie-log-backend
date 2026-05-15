import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetRecordsQueryDto {
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
