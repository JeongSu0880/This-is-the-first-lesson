# This-is-the-first-lesson

신한 스퀘어브릿지 청년 해커톤

## 기술 스택

- **Backend**: Fastify 5 + TypeScript + Prisma 6 + PostgreSQL 16
- **Frontend**: React 18 + Vite + Tailwind CSS

npm workspaces로 `backend`, `frontend`를 관리하는 모노레포입니다.

## 사전 요구사항

- Node.js ≥ 18
- npm ≥ 9
- Docker / Docker Compose

## 설치 및 실행 순서

### 1. 의존성 설치

```bash
npm run install:all
```

### 2. 환경변수 파일 생성

아래 [환경변수](#환경변수) 표를 참고해 `backend/.env` 파일 하나를 만듭니다. DB 컨테이너(`docker compose`)와 백엔드 앱(Prisma, OpenAI) 모두 이 파일 하나를 공유합니다.

### 3. DB 컨테이너 실행

```bash
npm run docker:ups   # Docker Compose v2 (docker compose)
# 또는
npm run docker:up    # 레거시 docker-compose 바이너리
```

### 4. Prisma 클라이언트 생성 및 마이그레이션 적용

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

### 5. 개발 서버 실행

루트 디렉터리에서:

```bash
npm run dev
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5174` (`/api` 요청은 백엔드로 프록시됩니다)

## 환경변수

모두 `backend/.env` 한 파일에 작성합니다.

| 변수 | 설명 | 예시 |
|---|---|---|
| `DB_PORT` | 호스트에 노출할 Postgres 포트 | `5432` |
| `DB_USER` | Postgres 사용자명 | `postgres` |
| `DB_PASSWORD` | Postgres 비밀번호 | `postgres` |
| `DB_NAME` | 데이터베이스 이름 | `app` |
| `DATABASE_URL` | Prisma 연결 문자열 (위 값으로 조합) | `postgresql://postgres:postgres@localhost:5432/app` |
| `OPENAI_API_KEY` | 채팅/스토리 생성용 OpenAI 키 | `sk-...` |

> `DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_NAME`은 `docker compose`가, `DATABASE_URL`/`OPENAI_API_KEY`는 백엔드 앱이 읽습니다. `docker compose` 실행 스크립트(`npm run docker:up`/`docker:ups`)는 `--env-file ../.env`로 이 파일을 함께 참조하도록 설정되어 있습니다.

## 참고

- `prisma/seed.ts`는 현재 스키마와 맞지 않아 정비가 필요합니다. 정비되기 전까지 시딩 단계는 안내에서 제외합니다.
