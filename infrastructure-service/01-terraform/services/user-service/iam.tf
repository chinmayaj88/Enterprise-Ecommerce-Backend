# ============================================================================
# USER-SERVICE IAM - Production Grade
# ============================================================================
# WHY: Service-specific IAM role and policies for user-service
# ============================================================================

# Dynamic Group for User Service Pods
# WHY: Allows user-service pods to access OCI resources
# NOTE: Dynamic groups MUST be created in tenancy root, not sub-compartments
resource "oci_identity_dynamic_group" "user_service" {
  compartment_id = var.oci_tenancy_ocid  # Must be tenancy root
  name           = "${var.project_name}-${var.service_name}-${var.environment}"
  description    = "Dynamic group for user-service pods"
  
  # Match pods in user-service namespace
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

# Policy for User Service
# WHY: Grants user-service specific permissions
resource "oci_identity_policy" "user_service_policy" {
  compartment_id = var.compartment_id
  name           = "${var.service_name}-policy"
  description    = "Policy for user-service to access OCI resources"
  
  statements = [
    # Allow user-service to read secrets
    "Allow dynamic-group ${oci_identity_dynamic_group.user_service.name} to read secret-family in compartment id ${var.compartment_id}",
    
    # Allow user-service to use vaults
    "Allow dynamic-group ${oci_identity_dynamic_group.user_service.name} to use vaults in compartment id ${var.compartment_id}",
    
    # Allow user-service to read container registry
    "Allow dynamic-group ${oci_identity_dynamic_group.user_service.name} to read repos in compartment id ${var.compartment_id}",
    
    # Allow user-service to write logs
    "Allow dynamic-group ${oci_identity_dynamic_group.user_service.name} to use log-content in compartment id ${var.compartment_id}",
    
    # Allow user-service to read Redis (if using OCI Redis)
    "Allow dynamic-group ${oci_identity_dynamic_group.user_service.name} to read redis-clusters in compartment id ${var.compartment_id}",
    
    # Allow user-service to consume events (if using OCI Queue)
    "Allow dynamic-group ${oci_identity_dynamic_group.user_service.name} to use queue in compartment id ${var.compartment_id}"
  ]

  freeform_tags = var.tags
}

