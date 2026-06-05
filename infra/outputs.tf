output "ec2_public_ip" {
  description = "EC2 Elastic IP — set as EC2_HOST in GitHub Secrets"
  value       = aws_eip.bodhi.public_ip
}

output "ecr_registry" {
  description = "ECR registry URL — set as ECR_REGISTRY in EC2 .env and GitHub Secrets"
  value       = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}

output "ecr_backend_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_nginx_url" {
  value = aws_ecr_repository.nginx.repository_url
}

output "s3_bucket" {
  value = aws_s3_bucket.bodhi.bucket
}

output "s3_public_url" {
  description = "Base URL for public images — set as S3_PUBLIC_URL in EC2 .env"
  value       = "https://${aws_s3_bucket.bodhi.bucket}.s3.${var.aws_region}.amazonaws.com"
}

output "github_actions_access_key_id" {
  description = "Set as AWS_ACCESS_KEY_ID in GitHub Secrets"
  value       = aws_iam_access_key.github_actions.id
}

output "github_actions_secret_access_key" {
  description = "Set as AWS_SECRET_ACCESS_KEY in GitHub Secrets"
  value       = aws_iam_access_key.github_actions.secret
  sensitive   = true
}

output "ssh_key_path" {
  description = "SSH private key saved locally — use for EC2_SSH_KEY GitHub Secret"
  value       = local_file.ssh_private_key.filename
}

data "aws_caller_identity" "current" {}
