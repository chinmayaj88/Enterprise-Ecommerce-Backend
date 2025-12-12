# ============================================================================
# NOTIFICATION-SERVICE SECRETS - Production Grade
# ============================================================================
# WHY: Store sensitive data (database credentials, Redis URL, notification provider keys) securely
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

# SendGrid API Key
# WHY: SendGrid API key for email notifications
resource "oci_vault_secret" "sendgrid_api_key" {
  compartment_id = var.compartment_id
  vault_id       = var.vault_id
  secret_name    = "${var.service_name}-sendgrid-api-key"
  key_id         = var.vault_master_key_id
  
  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.sendgrid_api_key)
  }
  
  freeform_tags = var.tags
}

# Twilio Account SID
# WHY: Twilio Account SID for SMS notifications
resource "oci_vault_secret" "twilio_account_sid" {
  compartment_id = var.compartment_id
  vault_id       = var.vault_id
  secret_name    = "${var.service_name}-twilio-account-sid"
  key_id         = var.vault_master_key_id
  
  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.twilio_account_sid)
  }
  
  freeform_tags = var.tags
}

# Twilio Auth Token
# WHY: Twilio Auth Token for SMS notifications
resource "oci_vault_secret" "twilio_auth_token" {
  compartment_id = var.compartment_id
  vault_id       = var.vault_id
  secret_name    = "${var.service_name}-twilio-auth-token"
  key_id         = var.vault_master_key_id
  
  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.twilio_auth_token)
  }
  
  freeform_tags = var.tags
}

# Twilio Phone Number (optional)
# WHY: Twilio phone number for SMS notifications
resource "oci_vault_secret" "twilio_phone_number" {
  count          = var.twilio_phone_number != "" ? 1 : 0
  compartment_id = var.compartment_id
  vault_id       = var.vault_id
  secret_name    = "${var.service_name}-twilio-phone-number"
  key_id         = var.vault_master_key_id
  
  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.twilio_phone_number)
  }
  
  freeform_tags = var.tags
}

# Additional secrets can be added here:
# - Other notification provider credentials
# - API keys
# - External service credentials

