# ============================================================================
# FOUNDATION OUTPUTS - Production Grade
# ============================================================================
# These outputs are used by service-specific Terraform and CI/CD
# ============================================================================

# OCI Configuration Outputs
output "oci_region" {
  description = "OCI region"
  value       = var.oci_region
}

# Compartment Outputs
output "compartment_id" {
  description = "ID of the created compartment"
  value       = oci_identity_compartment.project_compartment.id
}

output "compartment_name" {
  description = "Name of the compartment"
  value       = oci_identity_compartment.project_compartment.name
}

# Networking Outputs
output "vcn_id" {
  description = "VCN ID"
  value       = oci_core_vcn.main_vcn.id
}

output "vcn_cidr" {
  description = "VCN CIDR block"
  value       = oci_core_vcn.main_vcn.cidr_blocks[0]
}

output "public_subnet_id" {
  description = "Public subnet ID"
  value       = oci_core_subnet.public_subnet.id
}

output "private_subnet_id" {
  description = "Private subnet ID"
  value       = oci_core_subnet.private_subnet.id
}

# Compute Outputs
output "oke_cluster_id" {
  description = "OKE cluster ID"
  value       = oci_containerengine_cluster.main_cluster.id
}

output "oke_cluster_name" {
  description = "OKE cluster name"
  value       = oci_containerengine_cluster.main_cluster.name
}

output "cluster_endpoint" {
  description = "Kubernetes API endpoint"
  value       = oci_containerengine_cluster.main_cluster.endpoints[0].kubernetes
  sensitive   = false
}

output "node_pool_id" {
  description = "Node pool ID"
  value       = oci_containerengine_node_pool.main_node_pool.id
}

# Container Registry Outputs
output "gateway_registry_id" {
  description = "Gateway service container repository ID"
  value       = var.enable_container_registry ? oci_artifacts_container_repository.gateway_repo[0].id : null
}

output "gateway_registry_url" {
  description = "Gateway service container repository URL"
  value       = var.enable_container_registry ? "${var.oci_region}.ocir.io/${oci_artifacts_container_repository.gateway_repo[0].namespace}/${oci_artifacts_container_repository.gateway_repo[0].display_name}" : null
}

# Redis Outputs
output "redis_cluster_id" {
  description = "Shared Redis cluster ID"
  value       = var.enable_shared_redis ? oci_redis_redis_cluster.shared_redis[0].id : null
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = var.enable_shared_redis ? oci_redis_redis_cluster.shared_redis[0].primary_endpoint_ip_address : null
  sensitive   = true
}


# Vault Outputs
output "vault_id" {
  description = "Shared vault ID for storing secrets"
  value       = oci_kms_vault.shared_vault.id
}

output "vault_master_key_id" {
  description = "Master encryption key ID"
  value       = oci_kms_key.shared_master_key.id
  sensitive   = true
}

# Next Steps
output "next_steps" {
  description = "Instructions for next steps"
  value = <<-EOT
    ✅ Foundation infrastructure created successfully!
    
    📋 Next Steps:
    
    1. Configure kubectl to connect to cluster:
       oci ce cluster create-kubeconfig \
         --cluster-id ${oci_containerengine_cluster.main_cluster.id} \
         --region ${var.oci_region} \
         --file ~/.kube/config
    
    2. Verify cluster connection:
       kubectl get nodes
       kubectl get namespaces
    
    3. Deploy gateway-service infrastructure:
       cd ../services/gateway-service
       terraform init
       terraform plan
       terraform apply
    
    4. Container Registry URL:
       ${var.enable_container_registry ? "${var.oci_region}.ocir.io/${oci_artifacts_container_repository.gateway_repo[0].namespace}/${oci_artifacts_container_repository.gateway_repo[0].display_name}" : "Not enabled"}
    
    5. Redis Endpoint:
       ${var.enable_shared_redis ? "Available (check outputs)" : "Not enabled"}
  EOT
}

