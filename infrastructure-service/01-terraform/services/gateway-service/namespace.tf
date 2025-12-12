resource "kubernetes_namespace" "gateway" {
  metadata {
    name = var.namespace
    labels = {
      app         = var.service_name
      environment = var.environment
      managed-by  = "terraform"
    }
    
    annotations = {
      description = "Namespace for gateway-service"
    }
  }

  lifecycle {
    prevent_destroy = false
  }
}

resource "kubernetes_resource_quota" "gateway_quota" {
  metadata {
    name      = "${var.service_name}-quota"
    namespace = kubernetes_namespace.gateway.metadata[0].name
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

resource "kubernetes_limit_range" "gateway_limits" {
  metadata {
    name      = "${var.service_name}-limits"
    namespace = kubernetes_namespace.gateway.metadata[0].name
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

