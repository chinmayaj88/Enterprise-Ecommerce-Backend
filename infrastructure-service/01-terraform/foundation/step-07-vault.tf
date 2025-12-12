# ============================================================================
# STEP 7: VAULT - Production Grade
# ============================================================================
# WHY: Centralized secure storage for all service secrets
# All services (gateway, auth, product, etc.) will use this shared vault
# ============================================================================

# Shared Vault for All Services
# WHY: Centralized secret management for the entire platform
resource "oci_kms_vault" "shared_vault" {
  compartment_id = oci_identity_compartment.project_compartment.id
  display_name   = "${var.project_name}-shared-vault-${var.environment}"
  vault_type     = "DEFAULT"  # Use "VIRTUAL_PRIVATE" for enhanced security
  
  freeform_tags = var.tags
}

# Master Encryption Key
# WHY: Encrypts all secrets stored in the vault
resource "oci_kms_key" "shared_master_key" {
  compartment_id = oci_identity_compartment.project_compartment.id
  display_name   = "${var.project_name}-master-key-${var.environment}"
  management_endpoint = oci_kms_vault.shared_vault.management_endpoint
  key_shape {
    algorithm = "AES"
    length   = 32
  }
  
  freeform_tags = var.tags
}