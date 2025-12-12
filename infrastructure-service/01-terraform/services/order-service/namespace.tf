# ============================================================================
# ORDER-SERVICE KUBERNETES NAMESPACE - Production Grade
# ============================================================================
# WHY: Isolated namespace for order-service in the shared cluster
# ============================================================================

# Kubernetes Namespace
# WHY: Isolates order-service resources from other services
resource "kubernetes_namespace" "order" {
  metadata {
    name = var.namespace
    labels = {
      app         = var.service_name
      environment = var.environment
      managed-by  = "terraform"
    }
    
    annotations = {
      description = "Namespace for order-service"
    }
  }

  lifecycle {
    prevent_destroy = false
  }
}

# Resource Quota (Optional - limits resources)
# WHY: Prevents order-service from consuming all cluster resources
resource "kubernetes_resource_quota" "order_quota" {
  metadata {
    name      = "${var.service_name}-quota"
    namespace = kubernetes_namespace.order.metadata[0].name
  }

  spec {
    hard = {
      "requests.cpu"    = "10"
      "requests.memory" = "20Gi"
      "limits.cpu"      = "20"
      "limits.memory"   = "40Gi"
      "pods"            = "50"
    }
  }
}

# Limit Range (Optional - sets default limits)
# WHY: Ensures all pods have resource limits
resource "kubernetes_limit_range" "order_limits" {
  metadata {
    name      = "${var.service_name}-limits"
    namespace = kubernetes_namespace.order.metadata[0].name
  }

  spec {
    limit {
      type = "Container"
      default_request = {
        cpu    = "100m"
        memory = "128Mi"
      }
      default = {
        cpu    = "500m"
        memory = "512Mi"
      }
    }
  }
}

