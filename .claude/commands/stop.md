# Stop Bodhi Lens

Stop all running Bodhi Lens services.

## 1. Stop frontend (Vite dev server on port 5173)

```bash
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "Frontend stopped" || echo "Frontend was not running"
```

## 2. Stop backend (Spring Boot on port 8080)

```bash
pkill -f "spring-boot:run" 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null && echo "Backend stopped" || echo "Backend was not running"
```

## 3. Stop Docker infrastructure (PostgreSQL + MinIO)

```bash
source ~/.zshrc && cd /Users/zhangyueming/Documents/workspace/bodhi-lens && docker compose stop
```

(Use `docker compose down` instead if you want to also remove the containers, but note this does NOT delete volumes/data.)

## Done

All services stopped. Data in PostgreSQL and MinIO volumes is preserved.
