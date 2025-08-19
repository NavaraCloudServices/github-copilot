variable "environment" {
  description = "The deployment environment (e.g., 'dev', 'staging', 'prod')"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "The Azure region where resources will be deployed"
  type        = string
  default     = "East US"
}

variable "resource_group_name" {
  description = "The name of the resource group"
  type        = string
}

variable "postgresql_admin_username" {
  description = "The admin username for the PostgreSQL server"
  type        = string
}

variable "postgresql_admin_password" {
  description = "The admin password for the PostgreSQL server"
  type        = string
  sensitive   = true
}

variable "container_image" {
  description = "The Docker container image to deploy"
  type        = string
}
