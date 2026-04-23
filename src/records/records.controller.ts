import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { JwtUser } from '../auth/jwt.strategy';
import { RecordsService, RecordResult } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findByMonth(
    @GetUser() user: JwtUser,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ): Promise<RecordResult[]> {
    return this.recordsService.findByMonth(user.userId, year, month);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @GetUser() user: JwtUser,
    @Body() dto: CreateRecordDto,
  ): Promise<RecordResult> {
    return this.recordsService.create(user.userId, dto);
  }
}
