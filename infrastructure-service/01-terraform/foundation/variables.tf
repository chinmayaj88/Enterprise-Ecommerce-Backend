# ============================================================================
# FOUNDATION VARIABLES - Production Grade
# ============================================================================
# These variables define the foundation infrastructure (shared by all services)
# ============================================================================

# Project Information
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "ecommerce"
}

variable "environment" {
  description = "Environment (production, staging, development)"
  type        = string
  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be production, staging, or development"
  }
}

# OCI Configuration
variable "oci_region" {
  description = "OCI region (e.g., us-ashburn-1, ap-mumbai-1, eu-frankfurt-1)"
  type        = string
}

variable "oci_tenancy_ocid" {
  description = "OCI Tenancy OCID"
  type        = string
  sensitive   = true
}

# Compartment Configuration
variable "compartment_name" {
  description = "Name of the compartment for this project"
  type        = string
  default     = "ecommerce-compartment"
}

variable "compartment_description" {
  description = "Description of the compartment"
  type        = string
  default     = "Compartment for e-commerce platform infrastructure"
}

# Networking Configuration
variable "vcn_cidr" {
  description = "CIDR block for VCN"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR for public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  description = "CIDR for private subnet"
  type        = string
  default     = "10.0.2.0/24"
}

# Compute Configuration (OKE)
variable "oke_cluster_name" {
  description = "Name of OKE cluster"
  type        = string
  default     = "ecommerce-oke-cluster"
}

variable "node_pool_size" {
  description = "Number of worker nodes (minimum 2 recommended, 3+ for HA)"
  type        = number
  default     = 2
  validation {
    condition     = var.node_pool_size >= 1
    error_message = "Node pool size must be at least 1"
  }
}

variable "node_shape" {
  description = "Shape for worker nodes"
  type        = string
  default     = "VM.Standard.E4.Flex"
}

variable "node_ocpus" {
  description = "OCPUs per node"
  type        = number
  default     = 4
  validation {
    condition     = var.node_ocpus >= 2
    error_message = "Node OCPUs must be at least 2"
  }
}

variable "node_memory_gb" {
  description = "Memory in GB per node"
  type        = number
  default     = 32
  validation {
    condition     = var.node_memory_gb >= 16
    error_message = "Node memory must be at least 16 GB"
  }
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "v1.29.1"
}

# Container Registry Configuration
variable "enable_container_registry" {
  description = "Enable container registry"
  type        = bool
  default     = true
}

variable "registry_repositories" {
  description = "List of container repository names to create"
  type        = list(string)
  default     = ["gateway-service"]
}

# Shared Data Services
variable "enable_shared_redis" {
  description = "Enable shared Redis cluster"
  type        = bool
  default     = true
}

variable "redis_node_count" {
  description = "Number of Redis nodes (minimum 3 for HA)"
  type        = number
  default     = 3
  validation {
    condition     = var.redis_node_count >= 3
    error_message = "Redis node count must be at least 3 for high availability"
  }
}

variable "redis_memory_gb" {
  description = "Memory per Redis node in GB"
  type        = number
  default     = 1
}

# Security Configuration
variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access resources (restrict in production!)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# Monitoring Configuration
variable "enable_monitoring" {
  description = "Enable monitoring and logging"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "Number of days to retain logs"
  type        = number
  default     = 90
  validation {
    condition     = var.log_retention_days >= 30
    error_message = "Log retention must be at least 30 days for production"
  }
}

# Tags
variable "tags" {
  description = "Tags for all resources"
  type        = map(string)
  default = {
    Project     = "ecommerce"
    ManagedBy   = "terraform"
    CostCenter  = "engineering"
  }
}

