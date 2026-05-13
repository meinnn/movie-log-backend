import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { JwtUser } from '../auth/jwt.strategy';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';
import { DeleteRecordResponseDto } from './dto/delete-record-response.dto';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findByMonth(
    @GetUser() user: JwtUser,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ): Promise<RecordResponseDto[]> {
    return this.recordsService.findByMonth(user.userId, year, month);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @GetUser() user: JwtUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RecordResponseDto> {
    return this.recordsService.findOne(user.userId, id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @GetUser() user: JwtUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteRecordResponseDto> {
    return this.recordsService.remove(user.userId, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @GetUser() user: JwtUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecordDto,
  ): Promise<RecordResponseDto> {
    return this.recordsService.update(user.userId, id, dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @GetUser() user: JwtUser,
    @Body() dto: CreateRecordDto,
  ): Promise<RecordResponseDto> {
    return this.recordsService.create(user.userId, dto);
  }
}
