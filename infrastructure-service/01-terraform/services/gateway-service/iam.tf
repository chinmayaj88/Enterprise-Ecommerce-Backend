resource "oci_identity_dynamic_group" "gateway_service" {
  compartment_id = var.oci_tenancy_ocid
  name           = "${var.project_name}-${var.service_name}-${var.environment}"
  description    = "Dynamic group for gateway-service pods"
  
  matching_rule = <<EOF
    All {
      resource.type = 'pod',
      resource.compartment.id = '${var.compartment_id}',
      tag.Namespace.value = '${var.namespace}'
    }
  EOF

  freeform_tags = merge(
    var.tags,
    {
      Service     = var.service_name
      Environment = var.environment
    }
  )
}

resource "oci_identity_policy" "gateway_service_policy" {
  compartment_id = var.compartment_id
  name           = "${var.service_name}-policy"
  description    = "Policy for gateway-service to access OCI resources"
  
  statements = [
    "Allow dynamic-group ${oci_identity_dynamic_group.gateway_service.name} to read secret-family in compartment id ${var.compartment_id}",
    "Allow dynamic-group ${oci_identity_dynamic_group.gateway_service.name} to use vaults in compartment id ${var.compartment_id}",
    "Allow dynamic-group ${oci_identity_dynamic_group.gateway_service.name} to read repos in compartment id ${var.compartment_id}",
    "Allow dynamic-group ${oci_identity_dynamic_group.gateway_service.name} to use log-content in compartment id ${var.compartment_id}",
    "Allow dynamic-group ${oci_identity_dynamic_group.gateway_service.name} to read redis-clusters in compartment id ${var.compartment_id}"
  ]

  freeform_tags = var.tags
}

