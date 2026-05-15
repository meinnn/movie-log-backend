import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateRecordDto } from './dto/create-record.dto';
import type { UpdateRecordDto } from './dto/update-record.dto';
import { RecordsService } from './records.service';

const mockRecord = {
  id: 1,
  userId: 1,
  tmdbMovieId: 100,
  watchedAt: new Date('2026-04-01'),
  rating: 4.5,
  memo: '좋았다',
  quote: null,
  createdAt: new Date(),
};

const mockPrisma = {
  record: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('RecordsService', () => {
  let service: RecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RecordsService>(RecordsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto: CreateRecordDto = {
      tmdbMovieId: 100,
      watchedAt: '2026-04-01',
      rating: 4.5,
    };

    it('watchedAt 문자열을 Date로 변환해서 Prisma에 전달한다', async () => {
      mockPrisma.record.create.mockResolvedValue(mockRecord);

      await service.create(1, dto);

      expect(mockPrisma.record.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          tmdbMovieId: 100,
          watchedAt: new Date('2026-04-01'),
          rating: 4.5,
          memo: undefined,
          quote: undefined,
        },
      });
    });

    it('생성된 기록을 반환한다', async () => {
      mockPrisma.record.create.mockResolvedValue(mockRecord);

      const result = await service.create(1, dto);

      expect(result).toEqual(mockRecord);
    });
  });

  describe('findByDateRange', () => {
    it('날짜 범위 내 기록 목록을 반환한다', async () => {
      mockPrisma.record.findMany.mockResolvedValue([mockRecord]);

      const result = await service.findByDateRange(
        1,
        '2026-04-01',
        '2026-04-30',
      );

      expect(mockPrisma.record.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          watchedAt: {
            gte: new Date('2026-04-01'),
            lte: new Date('2026-04-30T23:59:59.999Z'),
          },
        },
        orderBy: { watchedAt: 'asc' },
      });
      expect(result).toEqual([mockRecord]);
    });
  });

  describe('findOne', () => {
    it('기록을 반환한다', async () => {
      mockPrisma.record.findUnique.mockResolvedValue(mockRecord);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockRecord);
    });

    it('존재하지 않는 id 조회 시 NotFoundException을 던진다', async () => {
      mockPrisma.record.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('다른 유저의 기록 조회 시 ForbiddenException을 던진다', async () => {
      mockPrisma.record.findUnique.mockResolvedValue({
        ...mockRecord,
        userId: 2,
      });

      await expect(service.findOne(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('기록을 수정하고 반환한다', async () => {
      const dto: UpdateRecordDto = { memo: '수정된 메모' };
      const updated = { ...mockRecord, memo: '수정된 메모' };
      mockPrisma.record.findUnique.mockResolvedValue(mockRecord);
      mockPrisma.record.update.mockResolvedValue(updated);

      const result = await service.update(1, 1, dto);

      expect(result).toEqual(updated);
    });

    it('존재하지 않는 기록 수정 시 NotFoundException을 던진다', async () => {
      mockPrisma.record.findUnique.mockResolvedValue(null);

      await expect(service.update(1, 999, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('다른 유저의 기록 수정 시 ForbiddenException을 던진다', async () => {
      mockPrisma.record.findUnique.mockResolvedValue({
        ...mockRecord,
        userId: 2,
      });

      await expect(service.update(1, 1, {})).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('기록을 삭제하고 { id }를 반환한다', async () => {
      mockPrisma.record.findUnique.mockResolvedValue(mockRecord);
      mockPrisma.record.delete.mockResolvedValue(mockRecord);

      const result = await service.remove(1, 1);

      expect(result).toEqual({ id: 1 });
    });

    it('존재하지 않는 기록 삭제 시 NotFoundException을 던진다', async () => {
      mockPrisma.record.findUnique.mockResolvedValue(null);

      await expect(service.remove(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('다른 유저의 기록 삭제 시 ForbiddenException을 던진다', async () => {
      mockPrisma.record.findUnique.mockResolvedValue({
        ...mockRecord,
        userId: 2,
      });

      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });
});
