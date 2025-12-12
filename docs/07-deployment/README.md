<div align="center">

# 🚢 07 - Deployment Guide

[![Deployment](https://img.shields.io/badge/Deployment-Kubernetes-blue?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-green?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Infrastructure](https://img.shields.io/badge/Infrastructure-Terraform-orange?style=flat-square&logo=terraform&logoColor=white)](https://www.terraform.io/)

**Enterprise-grade deployment strategies for the monorepo microservices architecture**

</div>

---

## Overview

<div align="center">

**Each service has its own:**

</div>

| Component | Description |
|:---:|:---|
| **📦 Repository** | Independent Git repository |
| **🔄 CI/CD Pipeline** | GitHub Actions workflow |
| **🐳 Docker Image** | Built and pushed to container registry |
| **☸️ Kubernetes Deployment** | Helm chart for deployment |
| **🏗️ Infrastructure** | Terraform configuration |

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│         Deployment Flow (Per Service)           │
│                                                 │
│  Service Dir → CI/CD → Docker Image → K8s     │
│  (Monorepo)   (GitHub)   (Registry)   (Helm)  │
└─────────────────────────────────────────────────┘
```

## Prerequisites

<div align="center">

**Before deploying, ensure you have:**

</div>

| Requirement | Description |
|:---:|:---|
| **☁️ OCI Account** | With appropriate permissions |
| **☸️ Kubernetes Cluster** | OKE set up |
| **📦 Container Registry** | OCI Container Registry |
| **🏗️ Terraform** | Configured for infrastructure |
| **🔧 kubectl** | Configured for cluster access |
| **📦 Helm** | Installed |

## Deployment Steps

### Step 1: Infrastructure Setup (One-Time)

Deploy shared infrastructure using Terraform:

```bash
cd infrastructure-service/01-terraform/foundation

# Initialize Terraform
terraform init

# Review plan
terraform plan

# Apply infrastructure
terraform apply
```

This creates:
- OCI Compartments
- VCN and Networking
- Kubernetes Cluster (OKE)
- Container Registry
- Vault for secrets
- Redis
- Databases

### Step 2: Service Infrastructure (Per Service)

Set up service-specific infrastructure:

```bash
cd infrastructure-service/01-terraform/services/<service-name>

# Initialize
terraform init

# Apply
terraform apply
```

This creates:
- Service namespace
- IAM policies
- Secrets in vault

### Step 3: CI/CD Pipeline Setup

Each service directory should have a GitHub Actions workflow:

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: |
          docker build -t ${{ secrets.REGISTRY_URL }}/${{ env.SERVICE_NAME }}:${{ github.sha }} .
      - name: Push to registry
        run: |
          docker push ${{ secrets.REGISTRY_URL }}/${{ env.SERVICE_NAME }}:${{ github.sha }}
      - name: Deploy to Kubernetes
        run: |
          helm upgrade --install ${{ env.SERVICE_NAME }} \
            ./infrastructure-service/02-kubernetes/services/${{ env.SERVICE_NAME }} \
            --set image.tag=${{ github.sha }}
```

### Step 4: Manual Deployment (Alternative)

If not using CI/CD:

```bash
# 1. Build Docker image
cd <service-name>
docker build -t <registry-url>/<service-name>:<tag> .

# 2. Push to registry
docker push <registry-url>/<service-name>:<tag>

# 3. Deploy with Helm
cd infrastructure-service/02-kubernetes/services/<service-name>
helm upgrade --install <service-name> . \
  --set image.repository=<registry-url>/<service-name> \
  --set image.tag=<tag> \
  --namespace <service-namespace>
```

## Deployment Strategies

### Blue-Green Deployment

Deploy new version alongside old, then switch traffic:

```bash
# Deploy new version
helm upgrade --install <service-name> . \
  --set image.tag=new-version \
  --set replicaCount=3

# Switch traffic (update service selector)
kubectl patch service <service-name> -p '{"spec":{"selector":{"version":"new"}}}'
```

### Canary Deployment

Deploy to small percentage, gradually increase:

```yaml
# values-canary.yaml
replicaCount: 10
canary:
  enabled: true
  replicaCount: 1
  trafficPercentage: 10
```

### Rolling Update (Default)

Kubernetes default - gradual replacement:

```bash
helm upgrade --install <service-name> . \
  --set image.tag=new-version \
  --set strategy.type=RollingUpdate
```

## Environment-Specific Deployment

### Development

```bash
helm upgrade --install <service-name> . \
  -f values-dev.yaml \
  --namespace <service-name>-dev
```

### Staging

```bash
helm upgrade --install <service-name> . \
  -f values-staging.yaml \
  --namespace <service-name>-staging
```

### Production

```bash
helm upgrade --install <service-name> . \
  -f values-prod.yaml \
  --namespace <service-name>-prod
```

## Health Checks

### Verify Deployment

```bash
# Check pods
kubectl get pods -n <service-namespace>

# Check service
kubectl get svc -n <service-namespace>

# Check deployment
kubectl get deployment -n <service-namespace>

# View logs
kubectl logs -f deployment/<service-name> -n <service-namespace>
```

### Health Endpoints

```bash
# Health check
curl https://<service-url>/health

# Readiness check
curl https://<service-url>/ready

# Metrics
curl https://<service-url>/metrics
```

## Monitoring

### Prometheus Metrics

Each service exposes Prometheus metrics at `/metrics`:

```bash
# View metrics
curl https://<service-url>/metrics
```

### Grafana Dashboards

Access Grafana to view service metrics and dashboards.

### Logs

View service logs:

```bash
# Pod logs
kubectl logs -f <pod-name> -n <service-namespace>

# All pods in deployment
kubectl logs -f deployment/<service-name> -n <service-namespace>
```

## Rollback

### Rollback Deployment

```bash
# Rollback to previous version
helm rollback <service-name> -n <service-namespace>

# Or specify revision
helm rollback <service-name> <revision-number> -n <service-namespace>
```

### Emergency Rollback

```bash
# Scale down new version
kubectl scale deployment <service-name> --replicas=0 -n <service-namespace>

# Scale up previous version
kubectl scale deployment <service-name>-previous --replicas=3 -n <service-namespace>
```

## Production Checklist

<div align="center">

**Before deploying to production:**

</div>

| Category | Checklist Item |
|:---:|:---|
| **✅ Testing** | All tests passing |
| **👥 Code Review** | Code reviewed and approved |
| **⚙️ Configuration** | Environment variables configured |
| **🔐 Security** | Secrets stored in vault |
| **🗄️ Database** | Database migrations tested |
| **🏥 Health Checks** | Health checks configured |
| **📊 Monitoring** | Monitoring and alerting set up |
| **💾 Backup** | Backup strategy in place |
| **↩️ Rollback** | Rollback plan documented |
| **⚡ Performance** | Performance tested |
| **🛡️ Security Scan** | Security scan completed |
| **📚 Documentation** | Documentation updated |

## Troubleshooting

### Deployment Fails

1. **Check pod status:**
   ```bash
   kubectl describe pod <pod-name> -n <service-namespace>
   ```

2. **Check events:**
   ```bash
   kubectl get events -n <service-namespace>
   ```

3. **Check logs:**
   ```bash
   kubectl logs <pod-name> -n <service-namespace>
   ```

### Service Not Accessible

1. **Check service:**
   ```bash
   kubectl get svc -n <service-namespace>
   ```

2. **Check ingress:**
   ```bash
   kubectl get ingress -n <service-namespace>
   ```

3. **Check network policies:**
   ```bash
   kubectl get networkpolicy -n <service-namespace>
   ```

### Database Connection Issues

1. **Verify database is accessible**
2. **Check DATABASE_URL in secrets**
3. **Verify network policies allow connection**

## Best Practices

### Deployment ✅

- ✅ Use CI/CD for automated deployments
- ✅ Test in staging before production
- ✅ Use blue-green or canary deployments
- ✅ Monitor during deployment
- ✅ Have rollback plan ready

### Security ✅

- ✅ Store secrets in vault
- ✅ Use least privilege IAM policies
- ✅ Enable network policies
- ✅ Scan container images
- ✅ Use TLS/SSL

### Monitoring ✅

- ✅ Set up health checks
- ✅ Configure alerts
- ✅ Monitor metrics
- ✅ Track errors
- ✅ Review logs regularly

## Resources

- [Kubernetes Deployment](./03-kubernetes.md)
- [CI/CD Pipelines](./02-cicd.md)
- [Production Checklist](./04-production-checklist.md)
- [Infrastructure Terraform](../infrastructure-service/01-terraform/)
- [Kubernetes Helm Charts](../infrastructure-service/02-kubernetes/)

---

<div align="center">

## 🚀 Next Steps

**[CI/CD Setup →](./02-cicd.md)** | **[Kubernetes Deployment →](./03-kubernetes.md)** | **[Production Checklist →](./04-production-checklist.md)**

---

[Back to Top](#-07---deployment-guide)

</div>

