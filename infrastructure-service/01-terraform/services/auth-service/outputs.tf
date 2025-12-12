# ============================================================================
# AUTH-SERVICE OUTPUTS - Production Grade
# ============================================================================

output "namespace" {
  description = "Kubernetes namespace for auth-service"
  value       = kubernetes_namespace.auth.metadata[0].name
}

output "vault_id" {
  description = "Vault ID for auth-service secrets (shared vault from foundation)"
  value       = var.vault_id
}

output "jwt_secret_id" {
  description = "JWT secret ID in vault"
  value       = oci_vault_secret.jwt_secret.id
  sensitive   = true
}

output "jwt_refresh_secret_id" {
  description = "JWT refresh secret ID in vault"
  value       = oci_vault_secret.jwt_refresh_secret.id
  sensitive   = true
}

output "cookie_secret_id" {
  description = "Cookie secret ID in vault"
  value       = oci_vault_secret.cookie_secret.id
  sensitive   = true
}

output "database_url_secret_id" {
  description = "Database URL secret ID in vault"
  value       = oci_vault_secret.database_url.id
  sensitive   = true
}

output "dynamic_group_id" {
  description = "Dynamic group ID for auth-service"
  value       = oci_identity_dynamic_group.auth_service.id
}

output "next_steps" {
  description = "Instructions for deploying auth-service"
  value = <<-EOT
    ✅ Auth-service infrastructure created!
    
    📋 Next Steps:
    
    1. Verify namespace:
       kubectl get namespace ${var.namespace}
    
    2. Create Kubernetes secrets from OCI vault:
       # Get secrets from vault
       oci vault secret get-secret-bundle --secret-id <jwt-secret-id>
       oci vault secret get-secret-bundle --secret-id <jwt-refresh-secret-id>
       oci vault secret get-secret-bundle --secret-id <cookie-secret-id>
       oci vault secret get-secret-bundle --secret-id <database-url-secret-id>
    
    3. Deploy auth-service using Kubernetes manifests:
       kubectl apply -f <path-to-k8s-manifests>
    
    4. Verify deployment:
       kubectl get pods -n ${var.namespace}
       kubectl get services -n ${var.namespace}
  EOT
}

