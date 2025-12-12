# ============================================================================
# PRODUCT-SERVICE OUTPUTS - Production Grade
# ============================================================================

output "namespace" {
  description = "Kubernetes namespace for product-service"
  value       = kubernetes_namespace.product.metadata[0].name
}

output "vault_id" {
  description = "Vault ID for product-service secrets (shared vault from foundation)"
  value       = var.vault_id
}

output "database_url_secret_id" {
  description = "Database URL secret ID in vault"
  value       = oci_vault_secret.database_url.id
  sensitive   = true
}

output "dynamic_group_id" {
  description = "Dynamic group ID for product-service"
  value       = oci_identity_dynamic_group.product_service.id
}

output "next_steps" {
  description = "Instructions for deploying product-service"
  value = <<-EOT
    ✅ Product-service infrastructure created!
    
    📋 Next Steps:
    
    1. Verify namespace:
       kubectl get namespace ${var.namespace}
    
    2. Create Kubernetes secrets from OCI vault:
       # Get secrets from vault
       oci vault secret get-secret-bundle --secret-id <database-url-secret-id>
    
    3. Deploy product-service using Kubernetes manifests:
       kubectl apply -f <path-to-k8s-manifests>
    
    4. Verify deployment:
       kubectl get pods -n ${var.namespace}
       kubectl get services -n ${var.namespace}
  EOT
}

