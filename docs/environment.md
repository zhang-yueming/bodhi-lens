# Environment Setup

## Required Tools

| Tool | Version | Status |
|------|---------|--------|
| Java | 17 (OpenJDK via Homebrew) | pre-installed |
| Node.js | v25.9.0 | pre-installed |
| npm | 11.12.1 | pre-installed |
| Maven | 3.9.6 | installed manually |
| Docker Desktop | - | pre-installed |

## Changes Made to This Machine

### Maven 3.9.6
- Downloaded from: https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.tar.gz
- Installed to: `~/tools/maven/`
- Added to PATH in `~/.zshrc`: `export PATH="$HOME/tools/maven/bin:$PATH"`

### Docker PATH
- Docker Desktop binary is at `/Applications/Docker.app/Contents/Resources/bin/`
- Added to PATH in `~/.zshrc`: `export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"`
- **Note**: Docker Desktop must be running for the `docker` command to work

## Local Dev Services (via Docker Compose)

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL 16 | 5432 | Database |
| MinIO | 9000 | S3-compatible image storage (API) |
| MinIO Console | 9001 | MinIO web UI |

### MinIO credentials (local only)
- Access key: `minioadmin`
- Secret key: `minioadmin`
- Bucket: `bodhi-lens`
- Web console: http://localhost:9001

### npm SSL configuration
- Disabled strict SSL to work around local certificate issue: `npm config set strict-ssl false`
- This is stored in `~/.npmrc` and applies globally to this machine

## Reload Shell

After setup, run: `source ~/.zshrc`