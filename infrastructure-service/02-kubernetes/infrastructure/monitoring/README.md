<div align="center">

# 📊 Monitoring Stack Helm Chart

[![Monitoring](https://img.shields.io/badge/Monitoring-Prometheus-blue?style=for-the-badge&logo=prometheus&logoColor=white)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-Dashboards-green?style=flat-square&logo=grafana&logoColor=white)](https://grafana.com/)
[![Alertmanager](https://img.shields.io/badge/Alertmanager-Alerts-orange?style=flat-square)](.)

**Production-ready Helm chart for deploying the monitoring stack to Kubernetes**

</div>

---

Production-ready Helm chart for deploying the monitoring stack (Prometheus, Grafana, Alertmanager) to Kubernetes.

## 🎯 Overview

This Helm chart deploys a complete monitoring stack:
- **Prometheus** - Metrics collection and storage
- **Grafana** - Visualization and dashboards
- **Alertmanager** - Alert management

## 📋 Prerequisites

- Kubernetes 1.24+
- Helm 3.8+
- kubectl configured
- Persistent storage available (for Prometheus and Grafana)

## 🚀 Installation

### Production

```bash
# Add Helm repositories
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install monitoring stack
helm install monitoring ./monitoring \
  --namespace monitoring \
  --create-namespace \
  -f values-prod.yaml
```

## 📊 Values Configuration

### Key Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `prometheus.enabled` | Enable Prometheus | `true` |
| `prometheus.server.persistentVolume.size` | Prometheus storage size | `50Gi` |
| `prometheus.server.retention` | Data retention period | `30d` |
| `grafana.enabled` | Enable Grafana | `true` |
| `grafana.admin.password` | Grafana admin password | `admin` |
| `alertmanager.enabled` | Enable Alertmanager | `true` |

## ✅ Verification

```bash
# Check all resources
kubectl get all -n monitoring

# Check Prometheus
kubectl get pods -n monitoring -l app.kubernetes.io/name=prometheus

# Check Grafana
kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana

# Access Prometheus (port-forward)
kubectl port-forward svc/prometheus-server 9090:9090 -n monitoring

# Access Grafana (port-forward)
kubectl port-forward svc/grafana 3000:3000 -n monitoring
```

## 📖 Documentation

- [Prometheus Helm Chart](https://github.com/prometheus-community/helm-charts)
- [Grafana Helm Chart](https://github.com/grafana/helm-charts)
- [Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)

