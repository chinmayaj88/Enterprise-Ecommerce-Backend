<div align="center">

# 📈 Autoscaling Helm Chart

[![Autoscaling](https://img.shields.io/badge/Autoscaling-Cluster-blue?style=for-the-badge)](.)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-HPA-green?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![VPA](https://img.shields.io/badge/VPA-Enabled-orange?style=flat-square)](.)

**Production-ready Helm chart for deploying autoscaling components to Kubernetes**

</div>

---

Production-ready Helm chart for deploying autoscaling components (Cluster Autoscaler and VPA) to Kubernetes.

## 🎯 Overview

This Helm chart deploys:
- **Cluster Autoscaler** - Automatically scales cluster nodes
- **Vertical Pod Autoscaler (VPA)** - Automatically adjusts pod resource requests/limits

## 📋 Prerequisites

- Kubernetes 1.24+
- Helm 3.8+
- kubectl configured
- OCI cluster and node pool OCIDs
- OCI IAM dynamic group for cluster autoscaler

## 🚀 Installation

### Production

```bash
helm install autoscaling ./autoscaling \
  --namespace kube-system \
  -f values-prod.yaml \
  --set clusterAutoscaler.oci.clusterId=<CLUSTER_ID> \
  --set clusterAutoscaler.oci.nodePoolId=<NODE_POOL_ID> \
  --set clusterAutoscaler.nodePool.nodePoolOCID=<NODE_POOL_OCID>
```

## 📊 Values Configuration

### Key Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `clusterAutoscaler.enabled` | Enable Cluster Autoscaler | `true` |
| `clusterAutoscaler.nodePool.minNodes` | Minimum nodes | `2` |
| `clusterAutoscaler.nodePool.maxNodes` | Maximum nodes | `10` |
| `vpa.enabled` | Enable VPA | `true` |

## ✅ Verification

```bash
# Check Cluster Autoscaler
kubectl get pods -n kube-system -l app=cluster-autoscaler

# Check VPA components
kubectl get pods -n vpa-system

# Check Cluster Autoscaler logs
kubectl logs -n kube-system deployment/cluster-autoscaler
```

## 📖 Documentation

- [Cluster Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler)
- [Vertical Pod Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler)

