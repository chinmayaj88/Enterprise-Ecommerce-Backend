# ============================================================================
# STEP 3: NETWORKING - Production Grade
# ============================================================================
# WHY: All services need a network to communicate
# Creates VCN, subnets, gateways, security rules
# ============================================================================

# Virtual Cloud Network (VCN)
# WHY: Our private network in the cloud - foundation for all networking
resource "oci_core_vcn" "main_vcn" {
  compartment_id = oci_identity_compartment.project_compartment.id
  display_name   = "${var.project_name}-vcn-${var.environment}"
  cidr_blocks    = [var.vcn_cidr]
  dns_label      = "ecommerceprod"  # Lowercase alphanumeric only, no hyphens/underscores, max 15 chars

  freeform_tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-vcn"
      Environment = var.environment
      Purpose     = "Main VCN for e-commerce platform"
    }
  )

  lifecycle {
    create_before_destroy = true
    prevent_destroy       = false  # Set to true in production
  }
}

# Internet Gateway
# WHY: Allows public subnet to access internet (inbound and outbound)
resource "oci_core_internet_gateway" "main_igw" {
  compartment_id = oci_identity_compartment.project_compartment.id
  vcn_id         = oci_core_vcn.main_vcn.id
  display_name   = "${var.project_name}-igw-${var.environment}"
  enabled        = true

  freeform_tags = var.tags
}

# NAT Gateway
# WHY: Allows private subnet outbound internet (more secure - one-way)
# Used by: Worker nodes to pull images, make API calls
resource "oci_core_nat_gateway" "main_nat" {
  compartment_id = oci_identity_compartment.project_compartment.id
  vcn_id         = oci_core_vcn.main_vcn.id
  display_name   = "${var.project_name}-nat-${var.environment}"

  freeform_tags = var.tags
}

# Service Gateway
# WHY: Allows access to OCI services (Object Storage, etc.) without internet
# More secure and faster than going through internet
resource "oci_core_service_gateway" "main_sgw" {
  compartment_id = oci_identity_compartment.project_compartment.id
  vcn_id         = oci_core_vcn.main_vcn.id
  display_name   = "${var.project_name}-sgw-${var.environment}"

  services {
    service_id = data.oci_core_services.all_services.services[0].id
  }

  freeform_tags = var.tags
}

# Route Table for Public Subnet
# WHY: Routes traffic from public subnet to internet gateway
resource "oci_core_route_table" "public_rt" {
  compartment_id = oci_identity_compartment.project_compartment.id
  vcn_id         = oci_core_vcn.main_vcn.id
  display_name   = "${var.project_name}-public-rt"

  route_rules {
    network_entity_id = oci_core_internet_gateway.main_igw.id
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    description       = "Route all traffic to internet gateway"
  }

  freeform_tags = var.tags
}

# Route Table for Private Subnet
# WHY: Routes traffic from private subnet through NAT (outbound) and Service Gateway
resource "oci_core_route_table" "private_rt" {
  compartment_id = oci_identity_compartment.project_compartment.id
  vcn_id         = oci_core_vcn.main_vcn.id
  display_name   = "${var.project_name}-private-rt"

  # Route internet traffic through NAT gateway
  route_rules {
    network_entity_id = oci_core_nat_gateway.main_nat.id
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    description       = "Route internet traffic through NAT"
  }

  # Route OCI services through Service Gateway
  route_rules {
    network_entity_id = oci_core_service_gateway.main_sgw.id
    destination       = data.oci_core_services.all_services.services[0].cidr_block
    destination_type  = "SERVICE_CIDR_BLOCK"
    description       = "Route OCI services through service gateway"
  }

  freeform_tags = var.tags
}

# Security List for Public Subnet
# WHY: Firewall rules for public subnet (load balancers, NAT)
resource "oci_core_security_list" "public_sl" {
  compartment_id = oci_identity_compartment.project_compartment.id
  vcn_id         = oci_core_vcn.main_vcn.id
  display_name   = "${var.project_name}-public-sl"

  # Allow HTTP (port 80)
  ingress_security_rules {
    protocol    = "6"  # TCP
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    description = "Allow HTTP from internet"
    
    tcp_options {
      min = 80
      max = 80
    }
  }

  # Allow HTTPS (port 443)
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    description = "Allow HTTPS from internet"
    
    tcp_options {
      min = 443
      max = 443
    }
  }

  # Allow Kubernetes API (port 6443) - restrict source in production!
  ingress_security_rules {
    protocol    = "6"
    source      = var.allowed_cidr_blocks[0]  # Restrict this in production!
    source_type = "CIDR_BLOCK"
    description = "Allow Kubernetes API access"
    
    tcp_options {
      min = 6443
      max = 6443
    }
  }

  # Allow all outbound traffic
  egress_security_rules {
    protocol         = "all"
    destination      = "0.0.0.0/0"
    destination_type = "CIDR_BLOCK"
    description      = "Allow all outbound traffic"
  }

  freeform_tags = var.tags
}

# Security List for Private Subnet
# WHY: Firewall rules for private subnet (worker nodes, databases)
resource "oci_core_security_list" "private_sl" {
  compartment_id = oci_identity_compartment.project_compartment.id
  vcn_id         = oci_core_vcn.main_vcn.id
  display_name   = "${var.project_name}-private-sl"

  # Allow from public subnet (for load balancer to pods)
  ingress_security_rules {
    protocol    = "6"
    source      = var.public_subnet_cidr
    source_type = "CIDR_BLOCK"
    description = "Allow traffic from public subnet"
    
    tcp_options {
      min = 3000
      max = 65535
    }
  }

  # Allow inter-pod communication (same subnet)
  ingress_security_rules {
    protocol    = "all"
    source      = var.private_subnet_cidr
    source_type = "CIDR_BLOCK"
    description = "Allow inter-pod communication"
  }

  # Allow all outbound traffic (through NAT)
  egress_security_rules {
    protocol         = "all"
    destination      = "0.0.0.0/0"
    destination_type = "CIDR_BLOCK"
    description      = "Allow all outbound traffic through NAT"
  }

  freeform_tags = var.tags
}

# Public Subnet
# WHY: For resources that need direct internet access (load balancers)
resource "oci_core_subnet" "public_subnet" {
  compartment_id             = oci_identity_compartment.project_compartment.id
  vcn_id                     = oci_core_vcn.main_vcn.id
  display_name               = "${var.project_name}-public-subnet"
  cidr_block                 = var.public_subnet_cidr
  dns_label                  = "public"
  route_table_id             = oci_core_route_table.public_rt.id
  security_list_ids          = [oci_core_security_list.public_sl.id]
  prohibit_public_ip_on_vnic = false  # Allow public IPs

  freeform_tags = var.tags
}

# Private Subnet
# WHY: For compute resources (worker nodes) - more secure, no direct internet
resource "oci_core_subnet" "private_subnet" {
  compartment_id             = oci_identity_compartment.project_compartment.id
  vcn_id                     = oci_core_vcn.main_vcn.id
  display_name               = "${var.project_name}-private-subnet"
  cidr_block                 = var.private_subnet_cidr
  dns_label                  = "private"
  route_table_id             = oci_core_route_table.private_rt.id
  security_list_ids          = [oci_core_security_list.private_sl.id]
  prohibit_public_ip_on_vnic = true  # No public IPs (private only)

  freeform_tags = var.tags
}

# Data source for OCI services (needed for Service Gateway)
data "oci_core_services" "all_services" {
  filter {
    name   = "name"
    values = ["All .* Services In Oracle Services Network"]
    regex  = true
  }
}

