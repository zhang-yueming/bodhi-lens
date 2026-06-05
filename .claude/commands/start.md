# Start Bodhi Lens

Start all services for local development. Execute the following steps in order:

## 1. Start Docker Desktop (if not running)

```bash
source ~/.zshrc
if ! docker info &>/dev/null; then
  open /Applications/Docker.app
  echo "Waiting for Docker to start..."
  for i in $(seq 1 30); do docker info &>/dev/null && echo "Docker ready" && break || sleep 2; done
else
  echo "Docker already running"
fi
```

## 2. Start infrastructure (PostgreSQL + MinIO)

```bash
source ~/.zshrc && cd /Users/zhangyueming/Documents/workspace/bodhi-lens && docker compose up -d
```

Wait for PostgreSQL to be ready:
```bash
source ~/.zshrc
for i in $(seq 1 15); do docker exec bodhi-lens-postgres-1 pg_isready -U postgres &>/dev/null && echo "PostgreSQL ready" && break || sleep 2; done
```

Ensure the MinIO bucket exists and is public:
```bash
source ~/.zshrc
docker exec bodhi-lens-minio-1 mc alias set local http://localhost:9000 minioadmin minioadmin 2>/dev/null || true
docker exec bodhi-lens-minio-1 mc mb local/bodhi-lens 2>/dev/null || echo "Bucket already exists"
docker exec bodhi-lens-minio-1 mc anonymous set public local/bodhi-lens
```

## 3. Start Spring Boot backend

```bash
source ~/.zshrc && cd /Users/zhangyueming/Documents/workspace/bodhi-lens/backend && mvn spring-boot:run > /tmp/bodhi-backend.log 2>&1 &
echo "Backend PID: $!"
```

Wait until backend is ready (check port 8080):
```bash
for i in $(seq 1 40); do curl -s http://localhost:8080/api/items &>/dev/null && echo "Backend ready" && break || sleep 3; done
```

Check for errors:
```bash
grep -i "error\|exception" /tmp/bodhi-backend.log | tail -10 || true
```

## 4. Start Vite frontend

```bash
cd /Users/zhangyueming/Documents/workspace/bodhi-lens/frontend && npm run dev > /tmp/bodhi-frontend.log 2>&1 &
echo "Frontend PID: $!"
sleep 4 && cat /tmp/bodhi-frontend.log
```

## Done

Once all services are up, open: http://localhost:5173

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| MinIO Console | http://localhost:9001 (minioadmin / minioadmin) |
| PostgreSQL | localhost:5432 (postgres / postgres, db: bodhi_lens) |
