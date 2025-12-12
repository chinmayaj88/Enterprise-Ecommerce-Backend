<div align="center">

# 🌐 Gateway Service Helm Chart

[![Helm](https://img.shields.io/badge/Helm-Chart-blue?style=for-the-badge&logo=helm&logoColor=white)](https://helm.sh/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Deployment-green?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Gateway Service](https://img.shields.io/badge/Service-Gateway-orange?style=flat-square)](.)

**Production-ready Helm chart for deploying the Gateway Service to Kubernetes**

</div>

---

Production-ready Helm chart for deploying the Gateway Service (API Gateway) to Kubernetes.

## 🎯 Overview

This Helm chart deploys the gateway-service with all production-grade features:
- High availability (3+ replicas)
- Horizontal Pod Autoscaling
- Pod Disruption Budgets
- Network Policies
- Health probes (startup, liveness, readiness)
- OCI IAM integration
- Prometheus monitoring

## 📋 Prerequisites

- Kubernetes 1.24+
- Helm 3.8+
- kubectl configured
- OCI Container Registry access
- Kubernetes secrets created (gateway-secrets)

## 🚀 Installation

### Development

```bash
helm install gateway-service ./gateway-service \
  --namespace ecommerce-development \
  --create-namespace \
  -f values-dev.yaml \
  --set image.tag=dev-$(git rev-parse --short HEAD) \
  --set oci.compartmentId=ocid1.compartment.oc1..xxxxx \
  --set redis.url=redis://redis-dev:6379
```

### Staging

```bash
helm install gateway-service ./gateway-service \
  --namespace ecommerce-staging \
  --create-namespace \
  -f values-staging.yaml \
  --set image.tag=staging-$(git rev-parse --short HEAD) \
  --set oci.compartmentId=ocid1.compartment.oc1..xxxxx \
  --set redis.url=redis://redis-staging:6379
```

### Production

```bash
helm install gateway-service ./gateway-service \
  --namespace ecommerce-production \
  --create-namespace \
  -f values-prod.yaml \
  --set image.tag=v1.0.0 \
  --set oci.compartmentId=ocid1.compartment.oc1..xxxxx \
  --set redis.url=redis://redis-prod:6379
```

## 🔄 Upgrade

```bash
helm upgrade gateway-service ./gateway-service \
  -f values-prod.yaml \
  --set image.tag=v1.1.0
```

## 🔙 Rollback

```bash
# Rollback to previous version
helm rollback gateway-service

# Rollback to specific revision
helm rollback gateway-service 1
```

## 📊 Values Configuration

### Key Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `3` |
| `image.repository` | Container image repository | `<OCI_REGISTRY>/gateway-service` |
| `image.tag` | Container image tag | `latest` |
| `resources.limits.cpu` | CPU limit | `2000m` |
| `resources.limits.memory` | Memory limit | `2Gi` |
| `autoscaling.enabled` | Enable HPA | `true` |
| `autoscaling.minReplicas` | Minimum replicas | `3` |
| `autoscaling.maxReplicas` | Maximum replicas | `20` |
| `ingress.enabled` | Enable ingress | `false` |

### Environment-Specific Values

- `values-dev.yaml` - Development environment
- `values-staging.yaml` - Staging environment
- `values-prod.yaml` - Production environment

## ✅ Verification

```bash
# Check deployment status
helm status gateway-service

# List all resources
kubectl get all -n ecommerce-production -l app.kubernetes.io/name=gateway-service

# Check pods
kubectl get pods -n ecommerce-production -l app.kubernetes.io/name=gateway-service

# Check HPA
kubectl get hpa -n ecommerce-production

# View logs
kubectl logs -f deployment/gateway-service-deployment -n ecommerce-production
```

## 🔍 Troubleshooting

### Pods not starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n ecommerce-production

# Check logs
kubectl logs <pod-name> -n ecommerce-production
```

### HPA not scaling

```bash
# Check HPA status
kubectl describe hpa gateway-service-hpa -n ecommerce-production

# Check metrics
kubectl top pods -n ecommerce-production
```

## 📖 Documentation

For more information, see:
- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

## 🔐 Security

- Secrets must be created before deployment
- Network policies restrict ingress/egress
- Pods run as non-root user
- Security contexts drop all capabilities

## 📝 Notes

- Update `image.repository` and `image.tag` before deployment
- Configure `oci.compartmentId` and `redis.url` from Terraform outputs
- Create TLS secrets for ingress in production
- Update service URLs when other services are deployed

