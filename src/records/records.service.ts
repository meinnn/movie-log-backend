import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';

export interface RecordResult {
  id: number;
  userId: number;
  tmdbMovieId: number;
  watchedAt: Date;
  rating: number | null;
  memo: string | null;
  quote: string | null;
  createdAt: Date;
}

@Injectable()
export class RecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByMonth(
    userId: number,
    year: number,
    month: number,
  ): Promise<RecordResult[]> {
    return this.prisma.record.findMany({
      where: {
        userId,
        watchedAt: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      orderBy: { watchedAt: 'asc' },
    });
  }

  async create(userId: number, dto: CreateRecordDto): Promise<RecordResult> {
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
