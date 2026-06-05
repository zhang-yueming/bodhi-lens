# Bodhi Lens

Personal Buddhist art catalog — track pieces with images, provenance, dimensions, and pricing.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Ant Design |
| Backend | Spring Boot 3.2 (Java 17) + JPA + Flyway |
| Database | PostgreSQL 16 (Docker) |
| Storage | MinIO S3-compatible (Docker) |

## Services & Ports

| Service | URL / Port | Credentials |
|---------|-----------|-------------|
| Frontend | http://localhost:5173 | — |
| Backend API | http://localhost:8080/api | — |
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin |
| PostgreSQL | localhost:5432 | postgres / postgres, db: bodhi_lens |

---

## Claude Skills (Slash Commands)

Use these inside the Claude Code chat. Type the command and Claude will execute all the steps.

### `/project:start` — Start all services

Starts Docker Desktop → PostgreSQL + MinIO → Spring Boot backend → Vite frontend.
Use when: opening the project for the first time in a session.

### `/project:stop` — Stop all services

Kills the frontend (port 5173) and backend (port 8080) processes, then stops Docker containers.
Data in PostgreSQL and MinIO volumes is **preserved**.

---

## Manual Start (if not using Claude)

```bash
# 1. Start Docker infrastructure
source ~/.zshrc
docker compose up -d

# 2. Ensure MinIO bucket is public (first run only)
docker exec bodhi-lens-minio-1 mc alias set local http://localhost:9000 minioadmin minioadmin
docker exec bodhi-lens-minio-1 mc mb local/bodhi-lens 2>/dev/null || true
docker exec bodhi-lens-minio-1 mc anonymous set public local/bodhi-lens

# 3. Start backend
cd backend && mvn spring-boot:run

# 4. Start frontend (new terminal)
cd frontend && npm run dev
```

## Manual Stop

```bash
# Kill frontend and backend by port
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:8080 | xargs kill -9 2>/dev/null

# Stop Docker containers (keeps data)
source ~/.zshrc && docker compose stop
```

---

## Database Migrations

Flyway migrations live in `backend/src/main/resources/db/migration/`.
They run automatically on backend startup. Naming: `V{n}__{description}.sql`.
