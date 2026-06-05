variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name prefix for all resources"
  default     = "bodhi-lens"
}

variable "s3_bucket_name" {
  description = "Globally unique S3 bucket name (e.g. bodhi-lens-ym2024)"
}

variable "instance_type" {
  description = "EC2 instance type"
  default     = "t3.small"
}
