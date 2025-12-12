# ============================================================================
# STEP 4: COMPUTE (OKE Cluster) - Production Grade
# ============================================================================
# WHY: Kubernetes cluster where ALL services will run
# OKE = Oracle Kubernetes Engine
# ============================================================================

# Get availability domains (needed for node placement)
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.oci_tenancy_ocid
}

# Get OKE node image (required for node pool)
# WHY: Node pools need a specific image to boot from
data "oci_core_images" "node_images" {
  compartment_id           = oci_identity_compartment.project_compartment.id
  operating_system         = "Oracle Linux"
  operating_system_version = "8"
  shape                    = var.node_shape
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

# OKE Cluster - VCN-Native (Production Best Practice)
# WHY: This is where our gateway-service (and all services) will run
# VCN-Native: Kubernetes API endpoint is integrated with VCN for better security and performance
resource "oci_containerengine_cluster" "main_cluster" {
  compartment_id     = oci_identity_compartment.project_compartment.id
  name               = var.oke_cluster_name
  kubernetes_version = var.kubernetes_version
  vcn_id             = oci_core_vcn.main_vcn.id
  
  # VCN-Native Configuration
  # WHY: Integrates Kubernetes API endpoint with VCN (recommended best practice)
  # This makes the cluster VCN-native instead of using public endpoints
  endpoint_config {
    is_public_ip_enabled = false  # Private endpoint (VCN-native)
    subnet_id            = oci_core_subnet.private_subnet.id  # API endpoint in private subnet
  }

  # Cluster options
  options {
    # Enable Kubernetes dashboard (useful for debugging)
    add_ons {
      is_kubernetes_dashboard_enabled = true
      is_tiller_enabled               = false  # Helm 2 is deprecated
    }

    # Service Load Balancer configuration
    # WHY: Allows Kubernetes services to be exposed via load balancer
    service_lb_subnet_ids = [oci_core_subnet.public_subnet.id]

    # Kubernetes API endpoint
    kubernetes_network_config {
      pods_cidr     = "10.244.0.0/16"  # Pod network CIDR
      services_cidr = "10.96.0.0/16"   # Service network CIDR
    }
  }

  freeform_tags = merge(
    var.tags,
    {
      Name        = var.oke_cluster_name
      Environment = var.environment
      Purpose     = "Kubernetes cluster for all services"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

# Node Pool (Worker Nodes)
# WHY: These are the servers that run our containers
resource "oci_containerengine_node_pool" "main_node_pool" {
  compartment_id = oci_identity_compartment.project_compartment.id
  cluster_id     = oci_containerengine_cluster.main_cluster.id
  name           = "${var.oke_cluster_name}-node-pool"

  # Node configuration
  node_config_details {
    size = var.node_pool_size

    # Placement configuration - spread across availability domains for HA
    placement_configs {
      availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
      subnet_id          = oci_core_subnet.private_subnet.id
    }

    # Additional placement for high availability (if multiple ADs available)
    # Note: OKE will automatically distribute nodes across ADs if available
  }

  # Node shape (instance type) - OUTSIDE node_config_details
  node_shape = var.node_shape
  
  # Node shape configuration - OUTSIDE node_config_details
  node_shape_config {
    ocpus         = var.node_ocpus
    memory_in_gbs = var.node_memory_gb
  }

  # Kubernetes version
  kubernetes_version = var.kubernetes_version

  # Node source details (required - specifies the image for nodes)
  node_source_details {
    source_type = "IMAGE"
    image_id    = data.oci_core_images.node_images.images[0].id
  }

  # Initial node labels
  initial_node_labels {
    key   = "environment"
    value = var.environment
  }

  initial_node_labels {
    key   = "node-pool"
    value = "main"
  }

  freeform_tags = var.tags
}

