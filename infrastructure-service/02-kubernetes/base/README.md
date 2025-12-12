<div align="center">

# 🟢 Base Resources Helm Chart

[![Base](https://img.shields.io/badge/Base-Resources-blue?style=for-the-badge)](.)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Namespaces-green?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Priority](https://img.shields.io/badge/Priority-Classes-orange?style=flat-square)](.)

**Production-ready Helm chart for deploying base Kubernetes resources**

</div>

---

Production-ready Helm chart for deploying base Kubernetes resources (namespaces and priority classes).

## 🎯 Overview

This Helm chart deploys:
- **Namespaces** - Isolated namespaces for services and environments
- **Priority Classes** - Pod priority classes for scheduling

## 📋 Prerequisites

- Kubernetes 1.24+
- Helm 3.8+
- kubectl configured

## 🚀 Installation

### Production

```bash
helm install base ./base \
  -f values-prod.yaml
```

## 📊 Values Configuration

### Key Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `namespaces.enabled` | Enable namespace creation | `true` |
| `namespaces.gatewayService.enabled` | Create gateway-service namespace | `true` |
| `namespaces.authService.enabled` | Create auth-service namespace | `true` |
| `priorityClasses.enabled` | Enable priority classes | `true` |
| `priorityClasses.critical.enabled` | Create critical-priority class | `true` |

## ✅ Verification

```bash
# Check namespaces
kubectl get namespaces

# Check priority classes
kubectl get priorityclass

# Verify namespace labels
kubectl get namespace gateway-service -o yaml
```

## 📝 Notes

- Namespaces may also be created by Terraform
- Priority classes are cluster-wide resources
- This chart should be installed first before other charts

