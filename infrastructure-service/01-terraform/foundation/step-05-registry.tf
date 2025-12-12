# ============================================================================
# STEP 5: CONTAINER REGISTRY - Production Grade
# ============================================================================
# WHY: Where we store container images for all services
# Shared by all services - one registry for the entire platform
# ============================================================================

# Container Registry Repository for Gateway Service
# WHY: Stores gateway-service Docker images
resource "oci_artifacts_container_repository" "gateway_repo" {
  count = var.enable_container_registry ? 1 : 0

  compartment_id = oci_identity_compartment.project_compartment.id
  display_name   = "gateway-service"
  is_public      = false  # Private registry - more secure
  
  # Repository settings
  readme {
    content  = "Gateway Service Container Repository"
    format   = "text/plain"
  }

  freeform_tags = merge(
    var.tags,
    {
      Service     = "gateway-service"
      Environment = var.environment
    }
  )
}

# Optional: Create additional repositories for future services
# Uncomment when needed:
# resource "oci_artifacts_container_repository" "auth_repo" {
#   compartment_id = oci_identity_compartment.project_compartment.id
#   display_name   = "auth-service"
#   is_public      = false
#   freeform_tags  = var.tags
# }

