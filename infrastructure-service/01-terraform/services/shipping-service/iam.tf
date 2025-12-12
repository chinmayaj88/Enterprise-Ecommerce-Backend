# ============================================================================
# SHIPPING-SERVICE IAM - Production Grade
# ============================================================================
# WHY: Service-specific IAM role and policies for shipping-service
# ============================================================================

# Dynamic Group for Shipping Service Pods
# WHY: Allows shipping-service pods to access OCI resources
# NOTE: Dynamic groups MUST be created in tenancy root, not sub-compartments
resource "oci_identity_dynamic_group" "shipping_service" {
  compartment_id = var.oci_tenancy_ocid  # Must be tenancy root
  name           = "${var.project_name}-${var.service_name}-${var.environment}"
  description    = "Dynamic group for shipping-service pods"
  
  # Match pods in shipping-service namespace
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

# Policy for Shipping Service
# WHY: Grants shipping-service specific permissions
resource "oci_identity_policy" "shipping_service_policy" {
  compartment_id = var.compartment_id
  name           = "${var.service_name}-policy"
  description    = "Policy for shipping-service to access OCI resources"
  
  statements = [
    # Allow shipping-service to read secrets
    "Allow dynamic-group ${oci_identity_dynamic_group.shipping_service.name} to read secret-family in compartment id ${var.compartment_id}",
    
    # Allow shipping-service to use vaults
    "Allow dynamic-group ${oci_identity_dynamic_group.shipping_service.name} to use vaults in compartment id ${var.compartment_id}",
    
    # Allow shipping-service to read container registry
    "Allow dynamic-group ${oci_identity_dynamic_group.shipping_service.name} to read repos in compartment id ${var.compartment_id}",
    
    # Allow shipping-service to write logs
    "Allow dynamic-group ${oci_identity_dynamic_group.shipping_service.name} to use log-content in compartment id ${var.compartment_id}",
    
    # Allow shipping-service to read Redis (if using OCI Redis)
    "Allow dynamic-group ${oci_identity_dynamic_group.shipping_service.name} to read redis-clusters in compartment id ${var.compartment_id}"
  ]

  freeform_tags = var.tags
}

