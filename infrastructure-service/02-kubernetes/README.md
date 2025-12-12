<div align="center">

# ☸️ Helm Charts for Ecommerce Platform

[![Kubernetes](https://img.shields.io/badge/Kubernetes-Helm-blue?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Helm](https://img.shields.io/badge/Helm-Charts-green?style=flat-square&logo=helm&logoColor=white)](https://helm.sh/)
[![Production](https://img.shields.io/badge/Ready-Production-orange?style=flat-square)](.)

**Production-ready Helm charts organized by deployment priority and responsibility**

</div>

---

## 📁 Structure

```
helm-charts/
├── base/                    # 🟢 STEP 1: Base resources (MUST install first)
│   └── namespaces, priority-classes
│
├── cluster/                 # 🟡 STEP 2: Cluster-level components
│   ├── autoscaling/        # Cluster autoscaler, VPA
│   └── security/           # Pod security, RBAC, Trivy
│
├── infrastructure/          # 🟡 STEP 3: Platform infrastructure
│   ├── monitoring/         # Prometheus, Grafana, Alertmanager
│   ├── logging/           # Loki, Promtail
│   ├── velero/            # Backup & disaster recovery
│   └── argocd/            # GitOps continuous delivery
│
└── services/               # 🔵 STEP 4: Application services
    ├── gateway-service/    # API Gateway
    └── auth-service/       # Authentication & Authorization
```

## 🚀 Deployment Order

### Step 1: Base Resources (REQUIRED FIRST)
```bash
# Install base resources (namespaces, priority classes)
helm install base ./base -f base/values-prod.yaml
```

### Step 2: Cluster Components
```bash
# Security policies
helm install security ./cluster/security -f cluster/security/values-prod.yaml

# Autoscaling
helm install autoscaling ./cluster/autoscaling -f cluster/autoscaling/values-prod.yaml \
  --set clusterAutoscaler.oci.clusterId=<CLUSTER_ID> \
  --set clusterAutoscaler.oci.nodePoolId=<NODE_POOL_ID>
```

### Step 3: Infrastructure
```bash
# Add Helm repositories
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# Monitoring
helm install monitoring ./infrastructure/monitoring -n monitoring --create-namespace \
  -f infrastructure/monitoring/values-prod.yaml

# Logging
helm install logging ./infrastructure/logging -n logging --create-namespace \
  -f infrastructure/logging/values-prod.yaml

# Backup
helm install velero ./infrastructure/velero -n velero --create-namespace \
  -f infrastructure/velero/values-prod.yaml

# GitOps
helm install argocd ./infrastructure/argocd -n argocd --create-namespace \
  -f infrastructure/argocd/values-prod.yaml
```

### Step 4: Application Services
```bash
# Gateway Service
helm install gateway-service ./services/gateway-service \
  -n ecommerce-production --create-namespace \
  -f services/gateway-service/values-prod.yaml

# Auth Service
helm install auth-service ./services/auth-service \
  -n ecommerce-production --create-namespace \
  -f services/auth-service/values-prod.yaml
```

## 📦 Chart Categories

### 🟢 Base (`base/`)

<div align="center">

**Foundation resources required before anything else**

</div>

| Component | Description | Install Order |
|:---:|:---|:---:|
| **📦 Namespaces** | gateway-service, auth-service, monitoring, logging, etc. | **1️⃣ First** |
| **⚡ Priority Classes** | critical-priority, high-priority, medium-priority | **1️⃣ First** |
| **Frequency** | Once per cluster | - |

### 🟡 Cluster (`cluster/`)

<div align="center">

**Cluster-level tools and policies**

</div>

| Component | Description | Install Order |
|:---:|:---|:---:|
| **📈 autoscaling/** | Cluster Autoscaler, VPA | **2️⃣ Second** |
| **🔒 security/** | Pod Security Standards, RBAC, Trivy scanner | **2️⃣ Second** |
| **Frequency** | Once per cluster | - |

### 🟡 Infrastructure (`infrastructure/`)

<div align="center">

**Platform infrastructure components**

</div>

| Component | Description | Install Order |
|:---:|:---|:---:|
| **📊 monitoring/** | Prometheus, Grafana, Alertmanager | **3️⃣ Third** |
| **📝 logging/** | Loki, Promtail | **3️⃣ Third** |
| **💾 velero/** | Backup and disaster recovery | **3️⃣ Third** |
| **🔄 argocd/** | GitOps continuous delivery | **3️⃣ Third** |
| **Frequency** | Once per cluster (updates as needed) | - |

### 🔵 Services (`services/`)

<div align="center">

**Application microservices**

</div>

| Component | Description | Install Order |
|:---:|:---|:---:|
| **🌐 gateway-service/** | API Gateway | **4️⃣ Fourth** |
| **🔐 auth-service/** | Authentication & Authorization | **4️⃣ Fourth** |
| **Frequency** | Frequent updates (new versions, config changes) | - |

## 🔧 Common Operations

### Upgrade
```bash
helm upgrade <release-name> ./<path-to-chart> -f <path-to-chart>/values-prod.yaml
```

### Rollback
```bash
helm rollback <release-name>
```

### Uninstall
```bash
helm uninstall <release-name> -n <namespace>
```

### List All Releases
```bash
helm list -A
```

## ✅ Verification

```bash
# Check base resources
kubectl get namespaces
kubectl get priorityclass

# Check cluster components
kubectl get pods -n kube-system -l app=cluster-autoscaler
kubectl get pods -n trivy-system

# Check infrastructure
kubectl get pods -n monitoring
kubectl get pods -n logging
kubectl get pods -n velero
kubectl get pods -n argocd

# Check services
kubectl get pods -n ecommerce-production
```

## 📖 Documentation

- [Base Resources](./base/README.md)
- [Cluster Components](./cluster/autoscaling/README.md)
- [Infrastructure](./infrastructure/monitoring/README.md)
- [Services](./services/gateway-service/README.md)

## 🎯 Best Practices

1. **Always install in order:** base → cluster → infrastructure → services
2. **Use environment-specific values files** (values-prod.yaml, values-staging.yaml)
3. **Version your images** - Never use `latest` in production
4. **Test in staging first** - Never deploy directly to production
5. **Use Helm rollback** - Keep previous versions for quick recovery
6. **Monitor deployments** - Watch pods and metrics after deployment
7. **Secure secrets** - Never commit secrets to git
