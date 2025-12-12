resource "oci_identity_dynamic_group" "oke_services" {
  compartment_id = var.oci_tenancy_ocid
  name           = "${var.project_name}-oke-services-${var.environment}"
  description    = "Dynamic group for OKE services and pods"
  
  matching_rule = <<EOF
    All {
      resource.type = 'cluster',
      resource.compartment.id = '${oci_identity_compartment.project_compartment.id}'
    }
  EOF

  freeform_tags = var.tags
}

resource "oci_identity_policy" "oke_services_policy" {
  compartment_id = oci_identity_compartment.project_compartment.id
  name           = "${var.project_name}-oke-services-policy"
  description    = "Policy for OKE services to access OCI resources"
  
  statements = [
    "Allow dynamic-group ${oci_identity_dynamic_group.oke_services.name} to manage all-resources in compartment ${oci_identity_compartment.project_compartment.name}",
    "Allow dynamic-group ${oci_identity_dynamic_group.oke_services.name} to use virtual-network-family in compartment ${oci_identity_compartment.project_compartment.name}",
    "Allow dynamic-group ${oci_identity_dynamic_group.oke_services.name} to read repos in compartment ${oci_identity_compartment.project_compartment.name}",
    "Allow dynamic-group ${oci_identity_dynamic_group.oke_services.name} to use vaults in compartment ${oci_identity_compartment.project_compartment.name}",
    "Allow dynamic-group ${oci_identity_dynamic_group.oke_services.name} to read secret-family in compartment ${oci_identity_compartment.project_compartment.name}",
    "Allow dynamic-group ${oci_identity_dynamic_group.oke_services.name} to use log-content in compartment ${oci_identity_compartment.project_compartment.name}",
    "Allow dynamic-group ${oci_identity_dynamic_group.oke_services.name} to manage objects in compartment ${oci_identity_compartment.project_compartment.name}"
  ]

  freeform_tags = var.tags
}

resource "oci_identity_policy" "cicd_policy" {
  compartment_id = oci_identity_compartment.project_compartment.id
  name           = "${var.project_name}-cicd-policy"
  description    = "Policy for CI/CD pipelines to manage infrastructure"
  
  statements = [
    "Allow group Administrators to manage all-resources in compartment ${oci_identity_compartment.project_compartment.name}"
  ]

  freeform_tags = var.tags
}

resource "oci_identity_policy" "terraform_policy" {
  compartment_id = oci_identity_compartment.project_compartment.id
  name           = "${var.project_name}-terraform-policy"
  description    = "Policy for Terraform to manage infrastructure"
  
  statements = [
    "Allow group Administrators to manage all-resources in compartment ${oci_identity_compartment.project_compartment.name}"
  ]

  freeform_tags = var.tags
}
