# ============================================================================
# STEP 6: SHARED DATA SERVICES - Production Grade
# ============================================================================
# WHY: Shared data services used by all services
# ============================================================================

# Shared Redis Cluster
# WHY: Used by gateway-service for rate limiting, caching
# Shared by all services for distributed caching
resource "oci_redis_redis_cluster" "shared_redis" {
  count = var.enable_shared_redis ? 1 : 0

  compartment_id     = oci_identity_compartment.project_compartment.id
  display_name       = "${var.project_name}-shared-redis-${var.environment}"
  node_count         = var.redis_node_count
  node_memory_in_gbs = var.redis_memory_gb
  software_version   = "V7_0_5"  # Supported Redis version
  
  # Network configuration
  subnet_id = oci_core_subnet.private_subnet.id
  
  # High availability
  # Note: OCI Redis automatically handles replication and failover

  freeform_tags = merge(
    var.tags,
    {
      Purpose     = "Shared Redis for caching and rate limiting"
      Environment = var.environment
    }
  )

  lifecycle {
    prevent_destroy = false  # Set to true in production
  }
}

