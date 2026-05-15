import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';
import { DeleteRecordResponseDto } from './dto/delete-record-response.dto';

@Injectable()
export class RecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByDateRange(
    userId: number,
    startDate: string,
    endDate: string,
  ): Promise<RecordResponseDto[]> {
    return this.prisma.record.findMany({
      where: {
        userId,
        watchedAt: {
          gte: new Date(startDate),
          lte: new Date(`${endDate}T23:59:59.999Z`),
        },
      },
      orderBy: { watchedAt: 'asc' },
    });
  }

  async findOne(userId: number, id: number): Promise<RecordResponseDto> {
    const record = await this.prisma.record.findUnique({ where: { id } });

    if (!record) {
      throw new NotFoundException('기록을 찾을 수 없습니다.');
    }

    if (record.userId !== userId) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    return record;
  }

  async remove(userId: number, id: number): Promise<DeleteRecordResponseDto> {
    await this.findOne(userId, id);

    await this.prisma.record.delete({ where: { id } });

    return { id };
  }

  async update(
    userId: number,
    id: number,
    dto: UpdateRecordDto,
  ): Promise<RecordResponseDto> {
    await this.findOne(userId, id);

    return this.prisma.record.update({
      where: { id },
      data: {
        ...dto,
        watchedAt: dto.watchedAt ? new Date(dto.watchedAt) : undefined,
      },
    });
  }

  async create(
    userId: number,
    dto: CreateRecordDto,
  ): Promise<RecordResponseDto> {
    return this.prisma.record.create({
      data: {
        userId,
        tmdbMovieId: dto.tmdbMovieId,
        watchedAt: new Date(dto.watchedAt),
        rating: dto.rating,
        memo: dto.memo,
        quote: dto.quote,
      },
    });
  }
}
