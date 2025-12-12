# ============================================================================
# PAYMENT-SERVICE OUTPUTS - Production Grade
# ============================================================================

output "namespace" {
  description = "Kubernetes namespace for payment-service"
  value       = kubernetes_namespace.payment.metadata[0].name
}

output "vault_id" {
  description = "Vault ID for payment-service secrets (shared vault from foundation)"
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

output "stripe_secret_key_secret_id" {
  description = "Stripe secret key secret ID in vault"
  value       = oci_vault_secret.stripe_secret_key.id
  sensitive   = true
}

output "stripe_webhook_secret_secret_id" {
  description = "Stripe webhook secret secret ID in vault"
  value       = oci_vault_secret.stripe_webhook_secret.id
  sensitive   = true
}

output "paypal_client_id_secret_id" {
  description = "PayPal client ID secret ID in vault"
  value       = oci_vault_secret.paypal_client_id.id
  sensitive   = true
}

output "paypal_client_secret_secret_id" {
  description = "PayPal client secret secret ID in vault"
  value       = oci_vault_secret.paypal_client_secret.id
  sensitive   = true
}

output "dynamic_group_id" {
  description = "Dynamic group ID for payment-service"
  value       = oci_identity_dynamic_group.payment_service.id
}

output "next_steps" {
  description = "Instructions for deploying payment-service"
  value = <<-EOT
    ✅ Payment-service infrastructure created!
    
    📋 Next Steps:
    
    1. Verify namespace:
       kubectl get namespace ${var.namespace}
    
    2. Create Kubernetes secrets from OCI vault:
       # Get secrets from vault
       oci vault secret get-secret-bundle --secret-id <database-url-secret-id>
       oci vault secret get-secret-bundle --secret-id <redis-url-secret-id>
       oci vault secret get-secret-bundle --secret-id <stripe-secret-key-secret-id>
       oci vault secret get-secret-bundle --secret-id <stripe-webhook-secret-secret-id>
       oci vault secret get-secret-bundle --secret-id <paypal-client-id-secret-id>
       oci vault secret get-secret-bundle --secret-id <paypal-client-secret-secret-id>
    
    3. Deploy payment-service using Kubernetes manifests:
       kubectl apply -f <path-to-k8s-manifests>
    
    4. Verify deployment:
       kubectl get pods -n ${var.namespace}
       kubectl get services -n ${var.namespace}
  EOT
}

