# ============================================================================
# PROVIDER CONFIGURATION - Cart Service
# ============================================================================
# WHY: Configures providers needed for cart-service infrastructure
# ============================================================================

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

provider "oci" {
  region = var.oci_region
}

provider "kubernetes" {
  # Use kubeconfig file (configure kubectl first)
  # To configure kubectl, run:
  # oci ce cluster create-kubeconfig --cluster-id <cluster-id> --region <region> --file ~/.kube/config
  # Or manually create kubeconfig file
  config_path = "~/.kube/config"
  
  # Alternative: Use OCI exec authentication (requires OCI CLI to be properly configured)
  # Uncomment below and comment out config_path if OCI CLI is working
  # exec {
  #   api_version = "client.authentication.k8s.io/v1beta1"
  #   command     = "oci"
  #   args        = ["ce", "cluster", "generate-token", "--cluster-id", var.cluster_id, "--region", var.oci_region]
  # }
  # host = var.cluster_endpoint
}

