<div align="center">

# 💾 Velero Helm Chart

[![Velero](https://img.shields.io/badge/Velero-Backup-blue?style=for-the-badge&logo=velero&logoColor=white)](https://velero.io/)
[![Backup](https://img.shields.io/badge/Backup-Disaster%20Recovery-green?style=flat-square)](.)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Restore-orange?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io/)

**Production-ready Helm chart for deploying Velero to Kubernetes**

</div>

---

Production-ready Helm chart for deploying Velero - Backup and disaster recovery for Kubernetes.

## 🎯 Overview

This Helm chart deploys Velero for:
- **Backup** - Backup Kubernetes resources and persistent volumes
- **Disaster Recovery** - Restore backups
- **Migration** - Migrate resources between clusters

## 📋 Prerequisites

- Kubernetes 1.24+
- Helm 3.8+
- kubectl configured
- OCI Object Storage bucket created
- OCI credentials configured

## 🚀 Installation

### Production

```bash
# Add Helm repository
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts
helm repo update

# Create OCI credentials secret
kubectl create secret generic cloud-credentials \
  --from-file=cloud=oci-credentials-file \
  -n velero

# Install Velero
helm install velero ./velero \
  --namespace velero \
  --create-namespace \
  -f values-prod.yaml \
  --set velero.configuration.backupStorageLocation.config.compartment=<COMPARTMENT_ID>
```

## 📊 Values Configuration

### Key Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `velero.enabled` | Enable Velero | `true` |
| `velero.configuration.backupStorageLocation.bucket` | OCI bucket name | `velero-backups` |
| `velero.restic.enabled` | Enable Restic for file-level backups | `true` |

## ✅ Verification

```bash
# Check Velero pods
kubectl get pods -n velero

# Check Velero status
velero version

# List backups
velero backup get

# Test backup
velero backup create test-backup --include-namespaces default
```

## 📖 Documentation

- [Velero Helm Chart](https://github.com/vmware-tanzu/helm-charts)
- [Velero Documentation](https://velero.io/docs/)

