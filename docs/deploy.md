# Bodhi Lens — Deployment Guide

## Architecture

```
GitHub (main branch)
    │
    └─ GitHub Actions
         ├─ Build backend Docker image → ECR
         ├─ Build nginx+frontend image → ECR
         └─ SSH to EC2 → docker compose pull → up -d
                              │
                         EC2 t3.small
                         ├─ nginx:80  (reverse proxy + static frontend)
                         ├─ backend:8080 (Spring Boot)
                         └─ postgres (Docker volume)
                              │
                         S3 bucket (images & attachments, public read on images/)
```

## One-time AWS Resources (Terraform)

| Resource | Purpose |
|---|---|
| EC2 t3.small + Elastic IP | Application server |
| S3 bucket | File storage (replaces MinIO) |
| ECR (2 repos) | Docker image registry |
| IAM EC2 role | EC2 → S3 + ECR pull (no credentials on server) |
| IAM user (github-actions) | GitHub Actions → ECR push |
| Key pair | SSH access |

## CI/CD Flow

Every `git push origin main`:
1. Build `bodhi-lens-backend:latest` → ECR
2. Build `bodhi-lens-nginx:latest` (includes compiled frontend) → ECR
3. SCP `docker-compose.prod.yml` to EC2
4. SSH: `docker compose pull && docker compose up -d`
5. Flyway migrations run automatically on Spring Boot startup

## Setup Steps

### Prerequisites
```bash
brew install terraform awscli
aws configure   # Access Key, Secret, region: us-east-1
```

### 1. Provision infrastructure
```bash
cd infra
terraform init
terraform apply -var="s3_bucket_name=bodhi-lens-<unique-suffix>"
```

### 2. Record outputs
```bash
terraform output                                            # all values
terraform output -raw github_actions_secret_access_key     # secret key
```

### 3. Configure EC2
```bash
ssh -i infra/bodhi-deploy.pem ec2-user@$(terraform output -raw ec2_public_ip)

# On EC2:
cat > /opt/bodhi-lens/.env << 'EOF'
ECR_REGISTRY=<ecr_registry output>
DB_USER=bodhi
DB_PASSWORD=<strong password>
S3_BUCKET=<s3_bucket output>
AWS_REGION=us-east-1
S3_PUBLIC_URL=<s3_public_url output>
EOF
```

### 4. Set GitHub Secrets
Repository → Settings → Secrets → Actions:

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | `terraform output github_actions_access_key_id` |
| `AWS_SECRET_ACCESS_KEY` | `terraform output -raw github_actions_secret_access_key` |
| `AWS_REGION` | `us-east-1` |
| `EC2_HOST` | `terraform output -raw ec2_public_ip` |
| `EC2_SSH_KEY` | contents of `infra/bodhi-deploy.pem` |

### 5. Deploy
```bash
git push origin main   # triggers GitHub Actions
```

Access at: `http://<ec2_public_ip>`

## Domain & HTTPS (after DNS setup)

```bash
# SSH to EC2, then:
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Update `nginx/nginx.conf` to add `server_name yourdomain.com;` and redeploy.

## Local Development

See `docs/environment.md` and use `docker-compose.yml` (MinIO + PostgreSQL).

## Rollback

```bash
# SSH to EC2
cd /opt/bodhi-lens
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Or specify a previous image tag (each deploy tags with git SHA).
