# ============================================================================
# SHIPPING-SERVICE OUTPUTS - Production Grade
# ============================================================================

output "namespace" {
  description = "Kubernetes namespace for shipping-service"
  value       = kubernetes_namespace.shipping.metadata[0].name
}

output "vault_id" {
  description = "Vault ID for shipping-service secrets (shared vault from foundation)"
  value       = var.vault_id
}

output "database_url_secret_id" {
  description = "Database URL secret ID in vault"
  value       = oci_vault_secret.database_url.id
  sensitive   = true
}

output "redis_url_secret_id" {
  description = "Redis URL secret ID in vault"
  value       = oci_vault_secret.redis_url.id
  sensitive   = true
}

output "dynamic_group_id" {
  description = "Dynamic group ID for shipping-service"
  value       = oci_identity_dynamic_group.shipping_service.id
}

output "next_steps" {
  description = "Instructions for deploying shipping-service"
  value = <<-EOT
    ✅ Shipping-service infrastructure created!
    
    📋 Next Steps:
    
    1. Verify namespace:
       kubectl get namespace ${var.namespace}
    
    2. Create Kubernetes secrets from OCI vault:
       # Get secrets from vault
       oci vault secret get-secret-bundle --secret-id <database-url-secret-id>
       oci vault secret get-secret-bundle --secret-id <redis-url-secret-id>
    
    3. Deploy shipping-service using Kubernetes manifests:
       kubectl apply -f <path-to-k8s-manifests>
    
    4. Verify deployment:
       kubectl get pods -n ${var.namespace}
       kubectl get services -n ${var.namespace}
  EOT
}

