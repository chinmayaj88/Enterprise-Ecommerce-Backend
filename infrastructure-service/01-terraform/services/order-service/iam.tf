# ============================================================================
# ORDER-SERVICE IAM - Production Grade
# ============================================================================
# WHY: Service-specific IAM role and policies for order-service
# ============================================================================

# Dynamic Group for Order Service Pods
# WHY: Allows order-service pods to access OCI resources
# NOTE: Dynamic groups MUST be created in tenancy root, not sub-compartments
resource "oci_identity_dynamic_group" "order_service" {
  compartment_id = var.oci_tenancy_ocid  # Must be tenancy root
  name           = "${var.project_name}-${var.service_name}-${var.environment}"
  description    = "Dynamic group for order-service pods"
  
  # Match pods in order-service namespace
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

# Policy for Order Service
# WHY: Grants order-service specific permissions
resource "oci_identity_policy" "order_service_policy" {
  compartment_id = var.compartment_id
  name           = "${var.service_name}-policy"
  description    = "Policy for order-service to access OCI resources"
  
  statements = [
    # Allow order-service to read secrets
    "Allow dynamic-group ${oci_identity_dynamic_group.order_service.name} to read secret-family in compartment id ${var.compartment_id}",
    
    # Allow order-service to use vaults
    "Allow dynamic-group ${oci_identity_dynamic_group.order_service.name} to use vaults in compartment id ${var.compartment_id}",
    
    # Allow order-service to read container registry
    "Allow dynamic-group ${oci_identity_dynamic_group.order_service.name} to read repos in compartment id ${var.compartment_id}",
    
    # Allow order-service to write logs
    "Allow dynamic-group ${oci_identity_dynamic_group.order_service.name} to use log-content in compartment id ${var.compartment_id}",
    
    # Allow order-service to read Redis (if using OCI Redis)
    "Allow dynamic-group ${oci_identity_dynamic_group.order_service.name} to read redis-clusters in compartment id ${var.compartment_id}",
    
    # Allow order-service to publish events (if using OCI Streaming/Queue)
    "Allow dynamic-group ${oci_identity_dynamic_group.order_service.name} to use stream-push in compartment id ${var.compartment_id}",
    "Allow dynamic-group ${oci_identity_dynamic_group.order_service.name} to use queue in compartment id ${var.compartment_id}"
  ]

  freeform_tags = var.tags
}

