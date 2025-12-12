resource "oci_identity_compartment" "project_compartment" {
  compartment_id = var.oci_tenancy_ocid
  name           = var.compartment_name
  description    = var.compartment_description
  enable_delete  = true

  freeform_tags = merge(
    var.tags,
    {
      Name        = var.compartment_name
      Environment = var.environment
      Purpose     = "E-commerce platform infrastructure"
    }
  )

  lifecycle {
    prevent_destroy = false
    create_before_destroy = true
  }
}

