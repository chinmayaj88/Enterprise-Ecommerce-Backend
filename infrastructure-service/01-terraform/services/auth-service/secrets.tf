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

resource "oci_vault_secret" "jwt_refresh_secret" {
  compartment_id = var.compartment_id
  vault_id       = var.vault_id
  secret_name    = "${var.service_name}-jwt-refresh-secret"
  key_id         = var.vault_master_key_id
  
  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.jwt_refresh_secret)
  }
  
  freeform_tags = var.tags
}

resource "oci_vault_secret" "cookie_secret" {
  compartment_id = var.compartment_id
  vault_id       = var.vault_id
  secret_name    = "${var.service_name}-cookie-secret"
  key_id         = var.vault_master_key_id
  
  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.cookie_secret)
  }
  
  freeform_tags = var.tags
}

resource "oci_vault_secret" "database_url" {
  compartment_id = var.compartment_id
  vault_id       = var.vault_id
  secret_name    = "${var.service_name}-database-url"
  key_id         = var.vault_master_key_id
  
  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.database_url)
  }
  
  freeform_tags = var.tags
}

