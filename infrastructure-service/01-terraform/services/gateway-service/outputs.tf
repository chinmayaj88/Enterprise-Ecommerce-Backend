# ============================================================================
# GATEWAY-SERVICE OUTPUTS - Production Grade
# ============================================================================

output "namespace" {
  description = "Kubernetes namespace for gateway-service"
  value       = kubernetes_namespace.gateway.metadata[0].name
}

output "vault_id" {
  description = "Vault ID for gateway-service secrets (shared vault from foundation)"
  value       = var.vault_id
}

output "jwt_secret_id" {
  description = "JWT secret ID in vault"
  value       = oci_vault_secret.jwt_secret.id
  sensitive   = true
}

output "dynamic_group_id" {
  description = "Dynamic group ID for gateway-service"
  value       = oci_identity_dynamic_group.gateway_service.id
}

output "next_steps" {
  description = "Instructions for deploying gateway-service"
  value = <<-EOT
    ✅ Gateway-service infrastructure created!
    
    📋 Next Steps:
    
    1. Verify namespace:
       kubectl get namespace ${var.namespace}
    
    2. Create Kubernetes secrets from OCI vault:
       # Get JWT secret from vault
       oci vault secret get-secret-bundle --secret-id <secret-id>
    
    3. Deploy gateway-service using Kubernetes manifests:
       kubectl apply -f <path-to-k8s-manifests>
    
    4. Verify deployment:
       kubectl get pods -n ${var.namespace}
       kubectl get services -n ${var.namespace}
  EOT
}

