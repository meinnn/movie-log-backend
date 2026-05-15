# movie-log 백엔드 CLAUDE.md

## 프로젝트 개요

영화 기록 캘린더 앱의 백엔드 서버.
유저가 본 영화를 날짜별로 기록하고, 별점/한줄평/명대사를 저장한다.

## 기술 스택

- **Runtime**: Node.js v22
- **Framework**: NestJS
- **ORM**: Prisma 7
- **DB**: PostgreSQL (Railway)
- **인증**: JWT (passport-jwt)
- **언어**: TypeScript

## 폴더 구조

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── dto/
│       ├── signup.dto.ts
│       ├── login.dto.ts
│       ├── signup-response.dto.ts
│       └── login-response.dto.ts
├── records/
│   ├── records.module.ts
│   ├── records.controller.ts
│   ├── records.service.ts
│   └── dto/
│       ├── create-record.dto.ts
│       ├── update-record.dto.ts
│       ├── record-response.dto.ts
│       └── delete-record-response.dto.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── generated/
    └── prisma/   ← prisma generate 결과물 (건드리지 말 것)
```

## DB 스키마 (Prisma)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  nickname  String
  createdAt DateTime @default(now())
  records   Record[]
}

model Record {
  id          Int      @id @default(autoincrement())
  userId      Int
  tmdbMovieId Int
  watchedAt   DateTime
  rating      Float?
  memo        String?
  quote       String?
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}
```

## API 설계

### POST /auth/signup

- **Body**: `{ email, password, nickname }`
- **Response 201**: `{ id, email, nickname }`
- **Error**: 400 유효성 실패, 409 이메일 중복

### POST /auth/login

- **Body**: `{ email, password }`
- **Response 200**: `{ accessToken }`
- **Error**: 401 이메일/비밀번호 불일치

### POST /records

- **Header**: `Authorization: Bearer {accessToken}`
- **Body**: `{ tmdbMovieId, watchedAt, rating?, memo?, quote? }`
- **Response 201**: 생성된 record 전체
- **Error**: 401

### GET /records?startDate=2026-03-30&endDate=2026-05-03

- **Header**: `Authorization: Bearer {accessToken}`
- **Query**: `startDate` (YYYY-MM-DD), `endDate` (YYYY-MM-DD)
- **설명**: 캘린더 뷰에서 보이는 첫 번째 날(일요일)부터 마지막 날(토요일)까지 조회. 이전달/다음달 날짜가 캘린더에 보이는 경우도 커버함.
- **Response 200**: record 배열
- **Error**: 401

### GET /records/:id

- **Header**: `Authorization: Bearer {accessToken}`
- **Response 200**: record 단건
- **Error**: 401, 403 (다른 유저 기록), 404

### PATCH /records/:id

- **Header**: `Authorization: Bearer {accessToken}`
- **Body**: `{ watchedAt?, rating?, memo?, quote? }` (모두 선택)
- **Response 200**: 수정된 record 전체
- **Error**: 401, 403, 404

### DELETE /records/:id

- **Header**: `Authorization: Bearer {accessToken}`
- **Response 200**: `{ id }`
- **Error**: 401, 403, 404

## 규칙

### Git

- 커밋은 기능 하나당 하나 — 작은 단위 유지
- 커밋 전 반드시 사용자 확인 후 진행 (임의 커밋 금지)
- 커밋 메시지 컨벤션:
  - `feat`: 새 기능
  - `fix`: 버그 수정
  - `refactor`: 기능 변경 없는 코드 개선
  - `chore`: 설정, 패키지 등 기타

### 아키텍처

- Controller는 요청/응답만 — 비즈니스 로직 금지
- 비즈니스 로직은 Service에서만
- DB 쿼리는 Service에서만 (Controller에서 직접 Prisma 호출 금지)
- 에러는 Service에서 NestJS HttpException으로 던지기

### 코드 스타일

- `any` 타입 금지 — 모든 반환값에 타입 명시
- 함수 하나는 하나의 역할만
- 매직 넘버 금지 — 상수로 분리
- 주석보다 자명한 네이밍 우선
- 모든 엔드포인트는 DTO + class-validator로 유효성 검사
- Response DTO는 plain class로 작성 — `@ApiProperty()` 불필요 (`@nestjs/swagger` 플러그인이 자동 추론)

### 인증

- JWT Guard로 인증 필요한 엔드포인트 보호
- JWT payload: `{ sub: userId, email }`
- 비밀번호는 bcrypt 해싱
- 다른 유저의 record 접근 시 403 반환

### Prisma

- DB 스키마 변경 시 반드시 `npx prisma migrate dev` 실행
- `src/generated/prisma`는 자동 생성 파일 — 직접 수정 금지

### 환경변수 (.env)

```
DATABASE_URL=
JWT_SECRET=
```

## 개발 명령어

```bash
npm run start        # 서버 실행
npm run start:dev    # watch 모드
npx prisma studio    # DB GUI
npx prisma migrate dev --name [name]  # 마이그레이션
npx prisma generate  # Prisma Client 재생성
```
