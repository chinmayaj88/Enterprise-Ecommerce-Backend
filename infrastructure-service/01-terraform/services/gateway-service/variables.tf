# ============================================================================
# GATEWAY-SERVICE VARIABLES - Production Grade
# ============================================================================
# Service-specific variables for gateway-service
# ============================================================================

# Foundation References (from foundation outputs)
variable "compartment_id" {
  description = "Compartment ID from foundation"
  type        = string
}

variable "cluster_id" {
  description = "OKE cluster ID from foundation"
  type        = string
}

variable "private_subnet_id" {
  description = "Private subnet ID from foundation"
  type        = string
}

variable "vault_id" {
  description = "Shared vault ID from foundation (required)"
  type        = string
}

variable "vault_master_key_id" {
  description = "Master encryption key ID from foundation (required)"
  type        = string
  sensitive   = true
}

variable "oci_region" {
  description = "OCI region"
  type        = string
}

variable "oci_tenancy_ocid" {
  description = "OCI tenancy OCID (required for dynamic groups)"
  type        = string
}

variable "cluster_endpoint" {
  description = "Kubernetes API endpoint from foundation"
  type        = string
}

# Project Information
variable "project_name" {
  description = "Project name"
  type        = string
  default     = "ecommerce"
}

variable "environment" {
  description = "Environment"
  type        = string
  default     = "production"
}

variable "service_name" {
  description = "Service name"
  type        = string
  default     = "gateway-service"
}

# Kubernetes Configuration
variable "namespace" {
  description = "Kubernetes namespace for gateway-service"
  type        = string
  default     = "gateway-service"
}

variable "service_replicas" {
  description = "Number of gateway-service replicas"
  type        = number
  default     = 3
  validation {
    condition     = var.service_replicas >= 2
    error_message = "Service replicas must be at least 2 for high availability"
  }
}

# Secrets Configuration
variable "jwt_secret" {
  description = "JWT secret for gateway-service (will be stored in vault)"
  type        = string
  sensitive   = true
  # Generate with: openssl rand -base64 32
}

# Tags
variable "tags" {
  description = "Tags for resources"
  type        = map(string)
  default = {
    Project     = "ecommerce"
    ManagedBy   = "terraform"
    Service     = "gateway-service"
  }
}

