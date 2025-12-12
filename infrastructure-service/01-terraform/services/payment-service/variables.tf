# ============================================================================
# PAYMENT-SERVICE VARIABLES - Production Grade
# ============================================================================
# Service-specific variables for payment-service
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
  default     = "payment-service"
}

# Kubernetes Configuration
variable "namespace" {
  description = "Kubernetes namespace for payment-service"
  type        = string
  default     = "payment-service"
}

variable "service_replicas" {
  description = "Number of payment-service replicas"
  type        = number
  default     = 2
  validation {
    condition     = var.service_replicas >= 2
    error_message = "Service replicas must be at least 2 for high availability"
  }
}

# Secrets Configuration
variable "database_url" {
  description = "Database connection URL for payment-service (will be stored in vault)"
  type        = string
  sensitive   = true
}

variable "redis_url" {
  description = "Redis connection URL for payment-service (will be stored in vault)"
  type        = string
  sensitive   = true
}

variable "stripe_secret_key" {
  description = "Stripe secret key (will be stored in vault)"
  type        = string
  sensitive   = true
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook secret (will be stored in vault)"
  type        = string
  sensitive   = true
}

variable "paypal_client_id" {
  description = "PayPal client ID (will be stored in vault)"
  type        = string
  sensitive   = true
}

variable "paypal_client_secret" {
  description = "PayPal client secret (will be stored in vault)"
  type        = string
  sensitive   = true
}

variable "order_service_url" {
  description = "Order service URL for payment-service"
  type        = string
  default     = "http://order-service:3005"
}

variable "auth_service_url" {
  description = "Auth service URL for token validation"
  type        = string
  default     = "http://auth-service:3001"
}

# Tags
variable "tags" {
  description = "Tags for resources"
  type        = map(string)
  default = {
    Project     = "ecommerce"
    ManagedBy   = "terraform"
    Service     = "payment-service"
  }
}

