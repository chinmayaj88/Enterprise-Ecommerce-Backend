<div align="center">

# 📝 Logging Stack Helm Chart

[![Logging](https://img.shields.io/badge/Logging-Loki-blue?style=for-the-badge&logo=loki&logoColor=white)](https://grafana.com/oss/loki/)
[![Promtail](https://img.shields.io/badge/Promtail-Shipper-green?style=flat-square)](.)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Logs-orange?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io/)

**Production-ready Helm chart for deploying the logging stack to Kubernetes**

</div>

---

Production-ready Helm chart for deploying the logging stack (Loki and Promtail) to Kubernetes.

## 🎯 Overview

This Helm chart deploys a complete logging stack:
- **Loki** - Log aggregation system
- **Promtail** - Log shipper (DaemonSet)

## 📋 Prerequisites

- Kubernetes 1.24+
- Helm 3.8+
- kubectl configured
- Persistent storage available (for Loki)

## 🚀 Installation

### Production

```bash
# Add Helm repositories
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install logging stack
helm install logging ./logging \
  --namespace logging \
  --create-namespace \
  -f values-prod.yaml
```

## 📊 Values Configuration

### Key Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `loki.enabled` | Enable Loki | `true` |
| `loki.persistence.size` | Loki storage size | `50Gi` |
| `promtail.enabled` | Enable Promtail | `true` |

## ✅ Verification

```bash
# Check all resources
kubectl get all -n logging

# Check Loki
kubectl get pods -n logging -l app.kubernetes.io/name=loki

# Check Promtail
kubectl get pods -n logging -l app.kubernetes.io/name=promtail

# Access Loki (port-forward)
kubectl port-forward svc/loki 3100:3100 -n logging
```

## 📖 Documentation

- [Loki Helm Chart](https://github.com/grafana/helm-charts/tree/main/charts/loki)
- [Promtail Helm Chart](https://github.com/grafana/helm-charts/tree/main/charts/promtail)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)

