<div align="center">

# 🔒 Security Helm Chart

[![Security](https://img.shields.io/badge/Security-Policies-blue?style=for-the-badge)](.)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-RBAC-green?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Trivy](https://img.shields.io/badge/Scanner-Trivy-orange?style=flat-square)](.)

**Production-ready Helm chart for deploying security components to Kubernetes**

</div>

---

Production-ready Helm chart for deploying security components (Pod Security Standards, RBAC, Trivy) to Kubernetes.

## 🎯 Overview

This Helm chart deploys:
- **Pod Security Standards** - Enforces security policies on namespaces
- **RBAC Policies** - Role-based access control
- **Trivy Scanner** - Container image vulnerability scanning

## 📋 Prerequisites

- Kubernetes 1.24+
- Helm 3.8+
- kubectl configured

## 🚀 Installation

### Production

```bash
helm install security ./security \
  -f values-prod.yaml
```

## 📊 Values Configuration

### Key Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `podSecurity.enabled` | Enable pod security standards | `true` |
| `podSecurity.enforce` | Enforcement level (restricted/baseline/privileged) | `restricted` |
| `trivy.enabled` | Enable Trivy scanner | `true` |

## ✅ Verification

```bash
# Check pod security labels
kubectl get namespaces --show-labels

# Check Trivy deployment
kubectl get pods -n trivy-system

# Access Trivy (port-forward)
kubectl port-forward svc/trivy-scanner 8080:8080 -n trivy-system
```

## 📖 Documentation

- [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)

