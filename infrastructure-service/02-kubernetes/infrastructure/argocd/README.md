<div align="center">

# 🔄 ArgoCD Helm Chart

[![ArgoCD](https://img.shields.io/badge/ArgoCD-GitOps-blue?style=for-the-badge&logo=argo&logoColor=white)](https://argo-cd.readthedocs.io/)
[![GitOps](https://img.shields.io/badge/GitOps-Continuous%20Delivery-green?style=flat-square)](.)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Deployment-orange?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io/)

**Production-ready Helm chart for deploying ArgoCD to Kubernetes**

</div>

---

Production-ready Helm chart for deploying ArgoCD - GitOps continuous delivery tool for Kubernetes.

## 🎯 Overview

This Helm chart deploys ArgoCD for:
- **GitOps** - Automated deployments from Git repositories
- **Continuous Delivery** - Sync applications automatically
- **Multi-cluster Management** - Manage multiple Kubernetes clusters

## 📋 Prerequisites

- Kubernetes 1.24+
- Helm 3.8+
- kubectl configured
- Git repository access

## 🚀 Installation

### Production

```bash
# Add Helm repository
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# Install ArgoCD
helm install argocd ./argocd \
  --namespace argocd \
  --create-namespace \
  -f values-prod.yaml
```

## 📊 Values Configuration

### Key Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `argocd.enabled` | Enable ArgoCD | `true` |
| `argocd.server.replicas` | ArgoCD server replicas | `2` |
| `argocd.server.ingress.enabled` | Enable ingress | `false` |

## ✅ Verification

```bash
# Check ArgoCD pods
kubectl get pods -n argocd

# Get ArgoCD admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Access ArgoCD UI (port-forward)
kubectl port-forward svc/argocd-server 8080:80 -n argocd
# Then access: http://localhost:8080
```

## 📖 Documentation

- [ArgoCD Helm Chart](https://github.com/argoproj/argo-helm)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)

