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
  config_path = "~/.kube/config"
}

