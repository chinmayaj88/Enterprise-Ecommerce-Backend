<div align="center">

# ☸️ 07.3 - Kubernetes Deployment

[![Kubernetes](https://img.shields.io/badge/Kubernetes-Deployment-blue?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Helm](https://img.shields.io/badge/Helm-Charts-green?style=flat-square&logo=helm&logoColor=white)](https://helm.sh/)
[![Production](https://img.shields.io/badge/Environment-Production-orange?style=flat-square)](.)

**Deploy services to Kubernetes using Helm charts**

</div>

---

## Overview

Each service has a Helm chart in:
```
infrastructure-service/02-kubernetes/services/<service-name>/
```

## Helm Chart Structure

```
<service-name>/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default values
├── values-dev.yaml         # Development values
├── values-staging.yaml     # Staging values
├── values-prod.yaml        # Production values
└── templates/
    ├── deployment.yaml     # Kubernetes Deployment
    ├── service.yaml        # Kubernetes Service
    ├── ingress.yaml        # Ingress configuration
    ├── hpa.yaml            # Horizontal Pod Autoscaler
    ├── pdb.yaml            # Pod Disruption Budget
    └── serviceaccount.yaml # Service Account
```

## Deployment Steps

### 1. Build and Push Docker Image

```bash
cd <service-name>
docker build -t <registry-url>/<service-name>:<tag> .
docker push <registry-url>/<service-name>:<tag>
```

### 2. Update Helm Values

Edit `values-prod.yaml`:

```yaml
image:
  repository: <registry-url>/<service-name>
  tag: <tag>

env:
  NODE_ENV: production
  DATABASE_URL: <from-secrets>
  REDIS_URL: <from-secrets>
```

### 3. Deploy with Helm

```bash
cd infrastructure-service/02-kubernetes/services/<service-name>

helm upgrade --install <service-name> . \
  -f values-prod.yaml \
  --namespace <service-name>-prod \
  --create-namespace
```

## Configuration

### Environment-Specific Values

**Development:**
```bash
helm upgrade --install <service-name> . \
  -f values-dev.yaml \
  --namespace <service-name>-dev
```

**Staging:**
```bash
helm upgrade --install <service-name> . \
  -f values-staging.yaml \
  --namespace <service-name>-staging
```

**Production:**
```bash
helm upgrade --install <service-name> . \
  -f values-prod.yaml \
  --namespace <service-name>-prod
```

### Override Values

```bash
helm upgrade --install <service-name> . \
  -f values-prod.yaml \
  --set replicaCount=5 \
  --set image.tag=v1.2.3
```

## Verification

### Check Deployment

```bash
# Check pods
kubectl get pods -n <service-name>-prod

# Check service
kubectl get svc -n <service-name>-prod

# Check deployment
kubectl get deployment -n <service-name>-prod
```

### View Logs

```bash
# Pod logs
kubectl logs -f deployment/<service-name> -n <service-name>-prod

# All pods
kubectl logs -f -l app=<service-name> -n <service-name>-prod
```

### Health Checks

```bash
# Port forward
kubectl port-forward svc/<service-name> 3001:3001 -n <service-name>-prod

# Test health
curl http://localhost:3001/health
```

## Scaling

### Manual Scaling

```bash
kubectl scale deployment <service-name> --replicas=5 -n <service-name>-prod
```

### Autoscaling (HPA)

HPA is configured in `templates/hpa.yaml`:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: <service-name>-hpa
spec:
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

## Rollback

### Rollback to Previous Version

```bash
# List revisions
helm history <service-name> -n <service-name>-prod

# Rollback
helm rollback <service-name> -n <service-name>-prod

# Or specific revision
helm rollback <service-name> <revision> -n <service-name>-prod
```

## Resources

- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Production Checklist](./04-production-checklist.md)

---

**Next:** [Production Checklist](./04-production-checklist.md)

