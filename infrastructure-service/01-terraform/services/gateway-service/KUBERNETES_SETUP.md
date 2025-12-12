<div align="center">

# ☸️ Kubernetes Setup Instructions

[![Kubernetes](https://img.shields.io/badge/Kubernetes-Setup-blue?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![OCI](https://img.shields.io/badge/Cloud-OCI-green?style=flat-square&logo=oracle&logoColor=white)](https://www.oracle.com/cloud/)
[![OKE](https://img.shields.io/badge/Cluster-OKE-orange?style=flat-square)](.)

**Kubernetes provider setup for OKE cluster access**

</div>

---

## Issue

<div align="center">

**The Kubernetes provider requires kubectl to be configured with access to the OKE cluster.**

</div>

## Solution Options

### Option 1: Configure kubectl (Recommended)

1. **Install OCI CLI** (if not already installed):
   ```powershell
   # Download from: https://www.oracle.com/downloads/developer-tools/oci-cli/
   ```

2. **Configure OCI CLI Authentication**:
   ```powershell
   oci setup config
   # Follow prompts to enter:
   # - Tenancy OCID
   # - User OCID
   # - Region (ap-mumbai-1)
   # - Path to private key
   ```

3. **Generate kubeconfig**:
   ```powershell
   oci ce cluster create-kubeconfig `
     --cluster-id ocid1.cluster.oc1.ap-mumbai-1.aaaaaaaapgvqqr24wr5whmlyjdyjtqj4f2jef2baio4sscenycp4a67l6zra `
     --region ap-mumbai-1 `
     --file $env:USERPROFILE\.kube\config
   ```

4. **Verify kubectl connection**:
   ```powershell
   kubectl get nodes
   kubectl get namespaces
   ```

5. **Re-run Terraform**:
   ```powershell
   terraform apply
   ```

---

### Option 2: Create Kubernetes Resources Manually

If you prefer to create Kubernetes resources manually:

1. **Create namespace**:
   ```powershell
   kubectl create namespace gateway-service
   ```

2. **Create resource quota** (optional):
   ```yaml
   # Save as resource-quota.yaml
   apiVersion: v1
   kind: ResourceQuota
   metadata:
     name: gateway-service-quota
     namespace: gateway-service
   spec:
     hard:
       requests.cpu: "10"
       requests.memory: 20Gi
       limits.cpu: "20"
       limits.memory: 40Gi
       pods: "50"
   ```
   ```powershell
   kubectl apply -f resource-quota.yaml
   ```

3. **Create limit range** (optional):
   ```yaml
   # Save as limit-range.yaml
   apiVersion: v1
   kind: LimitRange
   metadata:
     name: gateway-service-limits
     namespace: gateway-service
   spec:
     limits:
     - default:
         cpu: 500m
         memory: 512Mi
       defaultRequest:
         cpu: 100m
         memory: 128Mi
       type: Container
   ```
   ```powershell
   kubectl apply -f limit-range.yaml
   ```

---

### Option 3: Skip Kubernetes Resources in Terraform

Temporarily comment out Kubernetes resources in `namespace.tf`:

```hcl
# Temporarily commented out - will create manually
# resource "kubernetes_namespace" "gateway" { ... }
# resource "kubernetes_resource_quota" "gateway_quota" { ... }
# resource "kubernetes_limit_range" "gateway_limits" { ... }
```

Then run:
```powershell
terraform apply
```

This will create:
- ✅ OCI Dynamic Group
- ✅ OCI Policy
- ✅ OCI Vault Secret (already created)

Then create Kubernetes resources manually using Option 2.

---

## Current Status

✅ **Created Successfully:**
- OCI Dynamic Group (`ecommerce-gateway-service-production`)
- OCI Policy (`gateway-service-policy`)
- OCI Vault Secret (`gateway-service-jwt-secret`)

❌ **Pending (Requires kubectl):**
- Kubernetes Namespace
- Kubernetes Resource Quota
- Kubernetes Limit Range

---

## Next Steps

Choose one of the options above to proceed. Once kubectl is configured or resources are created manually, you can proceed with deploying the gateway service using Kubernetes manifests.

