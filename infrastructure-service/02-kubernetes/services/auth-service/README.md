<div align="center">

# 🔐 Auth Service Helm Chart

[![Helm](https://img.shields.io/badge/Helm-Chart-blue?style=for-the-badge&logo=helm&logoColor=white)](https://helm.sh/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Deployment-green?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Auth Service](https://img.shields.io/badge/Service-Auth-orange?style=flat-square)](.)

**Production-ready Helm chart for deploying the Auth Service to Kubernetes**

</div>

---

Production-ready Helm chart for deploying the Auth Service (Authentication & Authorization) to Kubernetes.

## 🎯 Overview

This Helm chart deploys the auth-service with all production-grade features:
- High availability (3+ replicas)
- Horizontal Pod Autoscaling
- Pod Disruption Budgets
- Network Policies
- Health probes (startup, liveness, readiness)
- OCI IAM integration
- Prometheus monitoring
- Distributed tracing (Jaeger)

## 📋 Prerequisites

- Kubernetes 1.24+
- Helm 3.8+
- kubectl configured
- OCI Container Registry access
- Kubernetes secrets created (auth-secrets)
- PostgreSQL database
- Redis (optional but recommended)

## 🚀 Installation

### Development

```bash
helm install auth-service ./auth-service \
  --namespace ecommerce-development \
  --create-namespace \
  -f values-dev.yaml \
  --set image.tag=dev-$(git rev-parse --short HEAD) \
  --set oci.compartmentId=ocid1.compartment.oc1..xxxxx \
  --set redis.url=redis://redis-dev:6379 \
  --set secrets.name=auth-secrets
```

### Staging

```bash
helm install auth-service ./auth-service \
  --namespace ecommerce-staging \
  --create-namespace \
  -f values-staging.yaml \
  --set image.tag=staging-$(git rev-parse --short HEAD) \
  --set oci.compartmentId=ocid1.compartment.oc1..xxxxx \
  --set redis.url=redis://redis-staging:6379 \
  --set secrets.name=auth-secrets
```

### Production

```bash
helm install auth-service ./auth-service \
  --namespace ecommerce-production \
  --create-namespace \
  -f values-prod.yaml \
  --set image.tag=v1.0.0 \
  --set oci.compartmentId=ocid1.compartment.oc1..xxxxx \
  --set redis.url=redis://redis-prod:6379 \
  --set secrets.name=auth-secrets
```

## 🔄 Upgrade

```bash
helm upgrade auth-service ./auth-service \
  -f values-prod.yaml \
  --set image.tag=v1.1.0
```

## 🔙 Rollback

```bash
# Rollback to previous version
helm rollback auth-service

# Rollback to specific revision
helm rollback auth-service 1
```

## 📊 Values Configuration

### Key Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `3` |
| `image.repository` | Container image repository | `<OCI_REGISTRY>/auth-service` |
| `image.tag` | Container image tag | `latest` |
| `resources.limits.cpu` | CPU limit | `2000m` |
| `resources.limits.memory` | Memory limit | `2Gi` |
| `autoscaling.enabled` | Enable HPA | `true` |
| `autoscaling.minReplicas` | Minimum replicas | `3` |
| `autoscaling.maxReplicas` | Maximum replicas | `20` |
| `ingress.enabled` | Enable ingress | `false` |
| `tracing.enabled` | Enable Jaeger tracing | `true` |

### Secrets Required

The following secrets must be created in the namespace before deployment:

```bash
kubectl create secret generic auth-secrets \
  --from-literal=database-url='postgresql://user:pass@host:5432/db' \
  --from-literal=jwt-secret='your-jwt-secret' \
  --from-literal=jwt-refresh-secret='your-refresh-secret' \
  --from-literal=cookie-secret='your-cookie-secret' \
  -n ecommerce-production
```

### Environment-Specific Values

- `values-dev.yaml` - Development environment
- `values-staging.yaml` - Staging environment
- `values-prod.yaml` - Production environment

## ✅ Verification

```bash
# Check deployment status
helm status auth-service

# List all resources
kubectl get all -n ecommerce-production -l app.kubernetes.io/name=auth-service

# Check pods
kubectl get pods -n ecommerce-production -l app.kubernetes.io/name=auth-service

# Check HPA
kubectl get hpa -n ecommerce-production

# View logs
kubectl logs -f deployment/auth-service-deployment -n ecommerce-production

# Test health endpoint
kubectl port-forward svc/auth-service 3001:3001 -n ecommerce-production
curl http://localhost:3001/health
```

## 🔍 Troubleshooting

### Pods not starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n ecommerce-production

# Check logs
kubectl logs <pod-name> -n ecommerce-production

# Check database connection
kubectl exec -it <pod-name> -n ecommerce-production -- env | grep DATABASE_URL
```

### Database connection issues

```bash
# Verify database secret
kubectl get secret auth-secrets -n ecommerce-production -o yaml

# Test database connectivity from pod
kubectl exec -it <pod-name> -n ecommerce-production -- sh
# Inside pod: psql $DATABASE_URL
```

### HPA not scaling

```bash
# Check HPA status
kubectl describe hpa auth-service-hpa -n ecommerce-production

# Check metrics
kubectl top pods -n ecommerce-production
```

## 📖 Documentation

For more information, see:
- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🔐 Security

- Secrets must be created before deployment
- Network policies restrict ingress/egress
- Pods run as non-root user
- Security contexts drop all capabilities
- JWT secrets must be strong (minimum 32 characters)

## 📝 Notes

- Update `image.repository` and `image.tag` before deployment
- Configure `oci.compartmentId` and `redis.url` from Terraform outputs
- Create TLS secrets for ingress in production
- Update service URLs when other services are deployed
- Ensure database migrations are run before deployment
- Configure Jaeger tracing configMap if using distributed tracing

