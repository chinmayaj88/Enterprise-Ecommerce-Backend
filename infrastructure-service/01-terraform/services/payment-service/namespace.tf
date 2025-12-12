# ============================================================================
# PAYMENT-SERVICE KUBERNETES NAMESPACE - Production Grade
# ============================================================================
# WHY: Isolated namespace for payment-service in the shared cluster
# ============================================================================

# Kubernetes Namespace
# WHY: Isolates payment-service resources from other services
resource "kubernetes_namespace" "payment" {
  metadata {
    name = var.namespace
    labels = {
      app         = var.service_name
      environment = var.environment
      managed-by  = "terraform"
    }
    
    annotations = {
      description = "Namespace for payment-service"
    }
  }

  lifecycle {
    prevent_destroy = false
  }
}

# Resource Quota (Optional - limits resources)
# WHY: Prevents payment-service from consuming all cluster resources
resource "kubernetes_resource_quota" "payment_quota" {
  metadata {
    name      = "${var.service_name}-quota"
    namespace = kubernetes_namespace.payment.metadata[0].name
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
resource "kubernetes_limit_range" "payment_limits" {
  metadata {
    name      = "${var.service_name}-limits"
    namespace = kubernetes_namespace.payment.metadata[0].name
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

