data "oci_kms_vault" "shared_vault" {
  vault_id = var.vault_id
}

resource "oci_vault_secret" "jwt_secret" {
  compartment_id = var.compartment_id
  vault_id       = var.vault_id
  secret_name    = "${var.service_name}-jwt-secret"
  key_id         = var.vault_master_key_id
  
  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.jwt_secret)
  }
  
  freeform_tags = var.tags
}

