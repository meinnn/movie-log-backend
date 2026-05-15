# movie-log backend

영화 기록 캘린더 앱의 RESTful API 백엔드 서버.

![Node.js](https://img.shields.io/badge/Node.js-v22-339933?logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-v11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-v7-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)

**배포 주소**: https://movie-log-backend-vrg7.onrender.com  
**Swagger UI**: https://movie-log-backend-vrg7.onrender.com/api

---

## 기술 스택

- **Framework**: NestJS v11 (Node.js v22, TypeScript)
- **ORM**: Prisma v7
- **Database**: PostgreSQL (Neon)
- **인증**: JWT (passport-jwt), bcrypt
- **배포**: Render

---

## API 엔드포인트

| Method | Endpoint                       |  인증  | 설명                |
| ------ | ------------------------------ | :----: | ------------------- |
| POST   | `/auth/signup`                 |        | 회원가입            |
| POST   | `/auth/login`                  |        | 로그인 (JWT 발급)   |
| POST   | `/records`                     | Bearer | 영화 기록 생성      |
| GET    | `/records?startDate=&endDate=` | Bearer | 날짜 범위 기록 조회 |
| GET    | `/records/:id`                 | Bearer | 기록 단건 조회      |
| PATCH  | `/records/:id`                 | Bearer | 기록 수정           |
| DELETE | `/records/:id`                 | Bearer | 기록 삭제           |

---

## 시작하기

```bash
# 패키지 설치
npm install

# 환경변수 설정
# .env 파일 생성 후 아래 값 입력
# DATABASE_URL=postgresql://...
# JWT_SECRET=your-secret-key

# DB 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run start:dev
```

실행 후 `http://localhost:3000/api` 에서 Swagger UI 확인 가능합니다.
