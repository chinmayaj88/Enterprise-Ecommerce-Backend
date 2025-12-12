# ============================================================================
# PAYMENT-SERVICE SECRETS - Production Grade
# ============================================================================
# WHY: Store sensitive data (database credentials, Redis URL, payment gateway keys) securely
# Uses shared vault from foundation for centralized secret management
# ============================================================================

# Reference to Shared Vault from Foundation
# WHY: Use centralized vault instead of creating per-service vaults
data "oci_kms_vault" "shared_vault" {
  vault_id = var.vault_id
}

# Database URL Secret
# WHY: Database connection string (sensitive information)
resource "oci_vault_secret" "database_url" {
  compartment_id = var.compartment_id
  vault_id       = var.vault_id  # Use shared vault from foundation
  secret_name    = "${var.service_name}-database-url"
  key_id         = var.vault_master_key_id  # Use shared master key from foundation
  
  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.database_url)
  }
  
  freeform_tags = var.tags
}

# Redis URL Secret
# WHY: Redis connection string (sensitive information)
resource "oci_vault_secret" "redis_url" {
  compartment_id = var.compartment_id
  vault_id       = var.vault_id
  secret_name    = "${var.service_name}-redis-url"
  key_id         = var.vault_master_key_id
  
  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.redis_url)
  }
  
  freeform_tags = var.tags
}

# Stripe Secret Key
# WHY: Stripe API secret key for payment processing
resource "oci_vault_secret" "stripe_secret_key" {
  compartment_id = var.compartment_id
  vault_id       = var.vault_id
  secret_name    = "${var.service_name}-stripe-secret-key"
  key_id         = var.vault_master_key_id
  
  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.stripe_secret_key)
  }
  
  freeform_tags = var.tags
}

# Stripe Webhook Secret
# WHY: Stripe webhook secret for verifying webhook signatures
resource "oci_vault_secret" "stripe_webhook_secret" {
  compartment_id = var.compartment_id
  vault_id       = var.vault_id
  secret_name    = "${var.service_name}-stripe-webhook-secret"
  key_id         = var.vault_master_key_id
  
  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.stripe_webhook_secret)
  }
  
  freeform_tags = var.tags
}

# PayPal Client ID
# WHY: PayPal API client ID for payment processing
resource "oci_vault_secret" "paypal_client_id" {
  compartment_id = var.compartment_id
  vault_id       = var.vault_id
  secret_name    = "${var.service_name}-paypal-client-id"
  key_id         = var.vault_master_key_id
  
  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.paypal_client_id)
  }
  
  freeform_tags = var.tags
}

# PayPal Client Secret
# WHY: PayPal API client secret for payment processing
resource "oci_vault_secret" "paypal_client_secret" {
  compartment_id = var.compartment_id
  vault_id       = var.vault_id
  secret_name    = "${var.service_name}-paypal-client-secret"
  key_id         = var.vault_master_key_id
  
  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.paypal_client_secret)
  }
  
  freeform_tags = var.tags
}

# Additional secrets can be added here:
# - Other payment gateway credentials
# - API keys
# - External service credentials

