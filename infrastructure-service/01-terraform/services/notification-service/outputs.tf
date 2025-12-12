# ============================================================================
# NOTIFICATION-SERVICE OUTPUTS - Production Grade
# ============================================================================

output "namespace" {
  description = "Kubernetes namespace for notification-service"
  value       = kubernetes_namespace.notification.metadata[0].name
}

output "vault_id" {
  description = "Vault ID for notification-service secrets (shared vault from foundation)"
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

output "sendgrid_api_key_secret_id" {
  description = "SendGrid API key secret ID in vault"
  value       = oci_vault_secret.sendgrid_api_key.id
  sensitive   = true
}

output "twilio_account_sid_secret_id" {
  description = "Twilio Account SID secret ID in vault"
  value       = oci_vault_secret.twilio_account_sid.id
  sensitive   = true
}

output "twilio_auth_token_secret_id" {
  description = "Twilio Auth Token secret ID in vault"
  value       = oci_vault_secret.twilio_auth_token.id
  sensitive   = true
}

output "twilio_phone_number_secret_id" {
  description = "Twilio Phone Number secret ID in vault (if configured)"
  value       = length(oci_vault_secret.twilio_phone_number) > 0 ? oci_vault_secret.twilio_phone_number[0].id : null
  sensitive   = true
}

output "dynamic_group_id" {
  description = "Dynamic group ID for notification-service"
  value       = oci_identity_dynamic_group.notification_service.id
}

output "next_steps" {
  description = "Instructions for deploying notification-service"
  value = <<-EOT
    ✅ Notification-service infrastructure created!
    
    📋 Next Steps:
    
    1. Verify namespace:
       kubectl get namespace ${var.namespace}
    
    2. Create Kubernetes secrets from OCI vault:
       # Get secrets from vault
       oci vault secret get-secret-bundle --secret-id <database-url-secret-id>
       oci vault secret get-secret-bundle --secret-id <redis-url-secret-id>
       oci vault secret get-secret-bundle --secret-id <sendgrid-api-key-secret-id>
       oci vault secret get-secret-bundle --secret-id <twilio-account-sid-secret-id>
       oci vault secret get-secret-bundle --secret-id <twilio-auth-token-secret-id>
    
    3. Deploy notification-service using Kubernetes manifests:
       kubectl apply -f <path-to-k8s-manifests>
    
    4. Verify deployment:
       kubectl get pods -n ${var.namespace}
       kubectl get services -n ${var.namespace}
  EOT
}

