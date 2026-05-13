export class RecordResponseDto {
  id: number;
  userId: number;
  tmdbMovieId: number;
  watchedAt: Date;
  rating?: number | null;
  memo?: string | null;
  quote?: string | null;
  createdAt: Date;
}
