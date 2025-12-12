<div align="center">

# ☸️ OKE Cluster Architecture - Multi-Environment Detailed

[![Kubernetes](https://img.shields.io/badge/Kubernetes-OKE-blue?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![OCI](https://img.shields.io/badge/Cloud-OCI-green?style=flat-square&logo=oracle&logoColor=white)](https://www.oracle.com/cloud/)
[![Multi-Environment](https://img.shields.io/badge/Environments-All-orange?style=flat-square)](.)

**Complete detailed architecture of OKE clusters for Production, Staging, and Development environments**

</div>

---

## Multi-Environment OKE Cluster Overview

```mermaid
graph TB
    subgraph OCI["OCI OKE Clusters - Multi-Environment"]
        
        subgraph ProdOKE["🔴 Production OKE<br/>ecommerce-production-oke<br/>VCN: 10.0.0.0/16"]
            ProdNodes["3-50 Nodes<br/>VM.Standard.E4.Flex<br/>2 OCPUs, 32GB RAM<br/>11 Services, 2-20 replicas"]
            ProdScale["Full Scale<br/>High Availability<br/>Multi-AZ"]
        end
        
        subgraph StagingOKE["🟠 Staging OKE<br/>ecommerce-staging-oke<br/>VCN: 10.1.0.0/16"]
            StagingNodes["3-20 Nodes<br/>VM.Standard.E4.Flex<br/>2 OCPUs, 32GB RAM<br/>11 Services, 2-10 replicas"]
            StagingScale["Medium Scale<br/>High Availability<br/>Multi-AZ"]
        end
        
        subgraph DevOKE["🟢 Development OKE<br/>ecommerce-development-oke<br/>VCN: 10.2.0.0/16"]
            DevNodes["1-5 Nodes<br/>VM.Standard.E4.Flex<br/>2 OCPUs, 32GB RAM<br/>11 Services, 1-3 replicas"]
            DevScale["Minimal Scale<br/>Single AZ<br/>Cost Optimized"]
        end
    end
    
    style ProdOKE fill:#c62828,stroke:#b71c1c,stroke-width:4px,color:#fff
    style StagingOKE fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
    style DevOKE fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
```

## Production OKE Cluster Architecture

```mermaid
graph TB
    subgraph OCI["OCI OKE Cluster: ecommerce-production-oke"]
        subgraph ControlPlane["Control Plane (Managed by OCI)"]
            API["API Server<br/>v1.34.1"]
            etcd["etcd<br/>State Storage"]
            Scheduler["Scheduler<br/>Pod Placement"]
            Controller["Controller Manager<br/>Replica Management"]
        end
        
        subgraph NodePool["Node Pool 1: VM.Standard.E4.Flex<br/>2 OCPUs, 32GB RAM<br/>Min: 3, Max: 50 nodes"]
            
            subgraph Node1["Node 1 - FD-1<br/>IP: 10.0.2.10"]
                subgraph Pods1["Pods (8 pods)"]
                    Gateway1["gateway-pod-1<br/>CPU: 200m<br/>Mem: 512Mi"]
                    Auth1["auth-pod-1<br/>CPU: 100m<br/>Mem: 256Mi"]
                    User1["user-pod-1<br/>CPU: 100m<br/>Mem: 256Mi"]
                    Product1["product-pod-1<br/>CPU: 200m<br/>Mem: 512Mi"]
                    Order1["order-pod-1<br/>CPU: 200m<br/>Mem: 512Mi"]
                    Payment1["payment-pod-1<br/>CPU: 100m<br/>Mem: 256Mi"]
                    Ingress1["ingress-nginx-1<br/>CPU: 100m<br/>Mem: 128Mi"]
                    Metrics1["metrics-server-1<br/>CPU: 50m<br/>Mem: 64Mi"]
                end
                Kubelet1["Kubelet<br/>Pod Manager"]
                KubeProxy1["Kube-Proxy<br/>Network Proxy"]
            end
            
            subgraph Node2["Node 2 - FD-2<br/>IP: 10.0.2.11"]
                subgraph Pods2["Pods (8 pods)"]
                    Gateway2["gateway-pod-2<br/>CPU: 200m<br/>Mem: 512Mi"]
                    Auth2["auth-pod-2<br/>CPU: 100m<br/>Mem: 256Mi"]
                    Cart1["cart-pod-1<br/>CPU: 100m<br/>Mem: 256Mi"]
                    Product2["product-pod-2<br/>CPU: 200m<br/>Mem: 512Mi"]
                    Order2["order-pod-2<br/>CPU: 200m<br/>Mem: 512Mi"]
                    Notification1["notification-pod-1<br/>CPU: 200m<br/>Mem: 512Mi"]
                    Ingress2["ingress-nginx-2<br/>CPU: 100m<br/>Mem: 128Mi"]
                    ClusterAS1["cluster-autoscaler-1<br/>CPU: 50m<br/>Mem: 64Mi"]
                end
                Kubelet2["Kubelet<br/>Pod Manager"]
                KubeProxy2["Kube-Proxy<br/>Network Proxy"]
            end
            
            subgraph Node3["Node 3 - FD-3<br/>IP: 10.0.2.12"]
                subgraph Pods3["Pods (8 pods)"]
                    Gateway3["gateway-pod-3<br/>CPU: 200m<br/>Mem: 512Mi"]
                    User2["user-pod-2<br/>CPU: 100m<br/>Mem: 256Mi"]
                    Product3["product-pod-3<br/>CPU: 200m<br/>Mem: 512Mi"]
                    Cart2["cart-pod-2<br/>CPU: 100m<br/>Mem: 256Mi"]
                    Discount1["discount-pod-1<br/>CPU: 100m<br/>Mem: 256Mi"]
                    Shipping1["shipping-pod-1<br/>CPU: 100m<br/>Mem: 256Mi"]
                    Return1["return-pod-1<br/>CPU: 100m<br/>Mem: 256Mi"]
                    Ingress3["ingress-nginx-3<br/>CPU: 100m<br/>Mem: 128Mi"]
                end
                Kubelet3["Kubelet<br/>Pod Manager"]
                KubeProxy3["Kube-Proxy<br/>Network Proxy"]
            end
        end
        
        subgraph Namespace["Namespace: ecommerce"]
            subgraph Services["Services (ClusterIP)"]
                GatewaySvc["gateway-service<br/>Port: 3000<br/>Selector: app=gateway"]
                AuthSvc["auth-service<br/>Port: 3001<br/>Selector: app=auth"]
                UserSvc["user-service<br/>Port: 3002<br/>Selector: app=user"]
                ProductSvc["product-service<br/>Port: 3003<br/>Selector: app=product"]
                CartSvc["cart-service<br/>Port: 3004<br/>Selector: app=cart"]
                OrderSvc["order-service<br/>Port: 3005<br/>Selector: app=order"]
                PaymentSvc["payment-service<br/>Port: 3006<br/>Selector: app=payment"]
                NotificationSvc["notification-service<br/>Port: 3007<br/>Selector: app=notification"]
                DiscountSvc["discount-service<br/>Port: 3008<br/>Selector: app=discount"]
                ShippingSvc["shipping-service<br/>Port: 3009<br/>Selector: app=shipping"]
                ReturnSvc["return-service<br/>Port: 3010<br/>Selector: app=return"]
            end
            
            subgraph HPA["Horizontal Pod Autoscalers"]
                GatewayHPA["gateway-hpa<br/>Min: 3, Max: 20<br/>CPU: 70%, Mem: 80%"]
                AuthHPA["auth-hpa<br/>Min: 2, Max: 10<br/>CPU: 70%, Mem: 80%"]
                ProductHPA["product-hpa<br/>Min: 3, Max: 15<br/>CPU: 70%, Mem: 80%"]
                OrderHPA["order-hpa<br/>Min: 3, Max: 20<br/>CPU: 70%, Mem: 80%"]
            end
            
            subgraph PDB["Pod Disruption Budgets"]
                GatewayPDB["gateway-pdb<br/>minAvailable: 2"]
                AuthPDB["auth-pdb<br/>minAvailable: 1"]
                CriticalPDB["critical-pdb<br/>minAvailable: 1<br/>For: Order, Payment"]
            end
            
            subgraph Config["Configuration"]
                ConfigMaps["ConfigMaps<br/>Environment variables<br/>Non-sensitive config"]
                Secrets["Secrets<br/>From OCI Vault<br/>DB passwords, JWT keys"]
            end
        end
        
        subgraph System["System Components"]
            MetricsServer["Metrics Server<br/>Collects pod metrics<br/>CPU, Memory, Network"]
            ClusterAS["Cluster Autoscaler<br/>Scales nodes 3-50<br/>Based on pod demand"]
            IngressCtrl["NGINX Ingress Controller<br/>3 replicas<br/>SSL/TLS termination"]
        end
    end
    
    %% Control Plane to Nodes
    API -->|"Manages"| Kubelet1
    API -->|"Manages"| Kubelet2
    API -->|"Manages"| Kubelet3
    Scheduler -->|"Schedules Pods"| Node1
    Scheduler -->|"Schedules Pods"| Node2
    Scheduler -->|"Schedules Pods"| Node3
    
    %% Pods to Services
    Gateway1 & Gateway2 & Gateway3 --> GatewaySvc
    Auth1 & Auth2 --> AuthSvc
    User1 & User2 --> UserSvc
    Product1 & Product2 & Product3 --> ProductSvc
    Order1 & Order2 --> OrderSvc
    Payment1 --> PaymentSvc
    Cart1 & Cart2 --> CartSvc
    Notification1 --> NotificationSvc
    Discount1 --> DiscountSvc
    Shipping1 --> ShippingSvc
    Return1 --> ReturnSvc
    Ingress1 & Ingress2 & Ingress3 --> IngressCtrl
    
    %% HPA to Services
    GatewayHPA -->|"Scales"| GatewaySvc
    AuthHPA -->|"Scales"| AuthSvc
    ProductHPA -->|"Scales"| ProductSvc
    OrderHPA -->|"Scales"| OrderSvc
    
    %% Metrics Server
    MetricsServer -->|"Collects Metrics"| Gateway1
    MetricsServer -->|"Collects Metrics"| Auth1
    MetricsServer -->|"Collects Metrics"| Product1
    MetricsServer -->|"Provides Metrics"| GatewayHPA
    MetricsServer -->|"Provides Metrics"| AuthHPA
    
    %% Cluster Autoscaler
    ClusterAS -->|"Monitors"| NodePool
    ClusterAS1 -->|"Reports"| ClusterAS
    
    %% Config to Pods
    ConfigMaps -->|"Mounts"| Gateway1
    Secrets -->|"Mounts"| Auth1
    
    %% Styling
    style API fill:#1976d2,stroke:#0d47a1,stroke-width:3px,color:#fff
    style Scheduler fill:#1976d2,stroke:#0d47a1,stroke-width:2px,color:#fff
    style Node1 fill:#4caf50,stroke:#2e7d32,stroke-width:2px
    style Node2 fill:#4caf50,stroke:#2e7d32,stroke-width:2px
    style Node3 fill:#4caf50,stroke:#2e7d32,stroke-width:2px
    style GatewaySvc fill:#ff9800,stroke:#e65100,stroke-width:2px,color:#fff
    style MetricsServer fill:#9c27b0,stroke:#6a1b9a,stroke-width:2px,color:#fff
    style ClusterAS fill:#9c27b0,stroke:#6a1b9a,stroke-width:2px,color:#fff
```

## Request Flow Workflow

```mermaid
sequenceDiagram
    participant User as Internet User
    participant CDN as OCI CDN
    participant WAF as WAF
    participant LB as Load Balancer
    participant Ingress as NGINX Ingress
    participant Gateway as Gateway Service
    participant Service as Microservice
    participant Redis as Redis
    participant DB as Database
    
    User->>CDN: HTTPS Request
    CDN->>WAF: Forward Request
    WAF->>WAF: Security Check<br/>(DDoS, SQL Injection)
    WAF->>LB: Forward Safe Request
    LB->>Ingress: Route to Ingress<br/>(Round-robin)
    Ingress->>Ingress: SSL/TLS Termination
    Ingress->>Gateway: Route to Gateway Pod<br/>(Load balanced)
    Gateway->>Gateway: Rate Limiting<br/>(Check Redis)
    Gateway->>Gateway: JWT Validation
    Gateway->>Service: Forward to Service<br/>(Service Discovery)
    Service->>Redis: Check Cache
    alt Cache Hit
        Redis-->>Service: Return Cached Data
        Service-->>Gateway: Response
    else Cache Miss
        Service->>DB: Query Database
        DB-->>Service: Return Data
        Service->>Redis: Store in Cache
        Service-->>Gateway: Response
    end
    Gateway-->>Ingress: Response
    Ingress-->>LB: Response
    LB-->>WAF: Response
    WAF-->>CDN: Response
    CDN-->>User: Final Response
```

## Pod Scheduling Workflow

```mermaid
flowchart TD
    Start([New Pod Created]) --> Scheduler[Scheduler Evaluates Pod]
    
    Scheduler --> CheckResources{Check Node<br/>Resources?}
    
    CheckResources -->|"CPU Available?"| CheckCPU{CPU Available?}
    CheckResources -->|"Memory Available?"| CheckMem{Memory Available?}
    CheckResources -->|"Node Selector?"| CheckSelector{Node Selector Match?}
    
    CheckCPU -->|"Yes"| CheckMem
    CheckCPU -->|"No"| TryNextNode[Try Next Node]
    
    CheckMem -->|"Yes"| CheckSelector
    CheckMem -->|"No"| TryNextNode
    
    CheckSelector -->|"Match"| CheckAffinity{Check Affinity<br/>Rules?}
    CheckSelector -->|"No Match"| TryNextNode
    
    CheckAffinity -->|"Preferred"| ScoreNodes[Score All Nodes]
    CheckAffinity -->|"Required"| CheckRequired{Required Affinity<br/>Met?}
    
    CheckRequired -->|"Yes"| ScoreNodes
    CheckRequired -->|"No"| TryNextNode
    
    ScoreNodes --> SelectBest[Select Best Node<br/>Based on Score]
    SelectBest --> BindPod[Bind Pod to Node]
    BindPod --> Kubelet[Kubelet Creates Pod]
    Kubelet --> Running[Pod Running]
    
    TryNextNode -->|"More Nodes?"| CheckResources
    TryNextNode -->|"No Nodes Available"| Pending[Pod Pending]
    Pending --> ClusterAS[Cluster Autoscaler<br/>Adds New Node]
    ClusterAS --> CheckResources
    
    style Start fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Running fill:#4caf50,stroke:#2e7d32,stroke-width:2px,color:#fff
    style Pending fill:#ff9800,stroke:#e65100,stroke-width:2px,color:#fff
    style ClusterAS fill:#9c27b0,stroke:#6a1b9a,stroke-width:2px,color:#fff
```

## HPA Scaling Workflow

```mermaid
sequenceDiagram
    participant Metrics as Metrics Server
    participant HPA as HPA Controller
    participant Deployment as Deployment Controller
    participant ReplicaSet as ReplicaSet
    participant Scheduler as Scheduler
    participant Pod as New Pod
    participant Service as Service
    
    Note over Metrics: Every 15 seconds
    Metrics->>Metrics: Collect Pod Metrics<br/>(CPU, Memory)
    Metrics->>HPA: Provide Metrics<br/>to HPA Controller
    
    Note over HPA: Every 30 seconds
    HPA->>HPA: Calculate Current<br/>Resource Usage
    HPA->>HPA: Compare with<br/>Target Thresholds
    
    alt CPU > 70% OR Memory > 80%
        HPA->>HPA: Calculate Desired Replicas<br/>(Current * (Usage/Target))
        HPA->>Deployment: Scale Up<br/>Update replica count
        Deployment->>ReplicaSet: Update ReplicaSet
        ReplicaSet->>Scheduler: Create New Pod
        Scheduler->>Pod: Schedule Pod
        Pod->>Pod: Start Container
        Pod->>Service: Register with Service
        Service->>Service: Add to Endpoints
        Note over Service: Pod Ready<br/>Receiving Traffic
    else CPU < 50% AND Memory < 60%
        HPA->>HPA: Check Scale Down Delay<br/>(5 minutes)
        alt Scale Down Delay Met
            HPA->>Deployment: Scale Down<br/>Reduce replica count
            Deployment->>ReplicaSet: Update ReplicaSet
            ReplicaSet->>Pod: Terminate Pod<br/>(Graceful shutdown)
            Pod->>Service: Remove from Endpoints
            Service->>Service: Stop Routing Traffic
            Pod->>Pod: Container Stopped
        end
    end
```

## Metrics Server Workflow

```mermaid
flowchart LR
    subgraph Collection["Metrics Collection"]
        Kubelet1[Kubelet Node 1<br/>cAdvisor]
        Kubelet2[Kubelet Node 2<br/>cAdvisor]
        Kubelet3[Kubelet Node 3<br/>cAdvisor]
    end
    
    subgraph MetricsServer["Metrics Server"]
        Aggregator[Metrics Aggregator<br/>Every 15 seconds]
        Storage[Metrics Storage<br/>In-memory cache]
    end
    
    subgraph Consumers["Metrics Consumers"]
        HPA[HPA Controller<br/>Scaling decisions]
        Dashboard[Kubernetes Dashboard<br/>Visualization]
        Monitoring[OCI Monitoring<br/>External metrics]
    end
    
    Kubelet1 -->|"Pod Metrics"| Aggregator
    Kubelet2 -->|"Pod Metrics"| Aggregator
    Kubelet3 -->|"Pod Metrics"| Aggregator
    
    Aggregator --> Storage
    Storage -->|"Query API"| HPA
    Storage -->|"Query API"| Dashboard
    Storage -->|"Export"| Monitoring
    
    style MetricsServer fill:#9c27b0,stroke:#6a1b9a,stroke-width:3px,color:#fff
    style HPA fill:#ff9800,stroke:#e65100,stroke-width:2px,color:#fff
```

## Pod Placement Strategy

```mermaid
graph TB
    subgraph Strategy["Pod Placement Strategy"]
        subgraph AntiAffinity["Pod Anti-Affinity Rules"]
            GatewayAA["Gateway Pods<br/>preferredDuringSchedulingIgnoredDuringExecution<br/>Spread across nodes"]
            AuthAA["Auth Pods<br/>preferredDuringSchedulingIgnoredDuringExecution<br/>Spread across nodes"]
            CriticalAA["Critical Services<br/>(Order, Payment)<br/>requiredDuringSchedulingIgnoredDuringExecution<br/>Must be on different nodes"]
        end
        
        subgraph Affinity["Pod Affinity Rules"]
            ProductAff["Product Pods<br/>preferredDuringSchedulingIgnoredDuringExecution<br/>Co-locate with Gateway"]
            CacheAff["Cache-heavy Pods<br/>preferredDuringSchedulingIgnoredDuringExecution<br/>Co-locate with Redis"]
        end
        
        subgraph Taints["Node Taints & Tolerations"]
            SystemTaint["System Nodes<br/>Taint: NoSchedule<br/>Only system pods"]
            SpotTaint["Spot Nodes<br/>Taint: PreferNoSchedule<br/>Non-critical pods"]
        end
        
        subgraph Topology["Topology Spread Constraints"]
            ZoneSpread["Spread across<br/>Fault Domains"]
            NodeSpread["Spread across<br/>Nodes evenly"]
        end
    end
    
    Strategy --> Scheduler[Scheduler Applies Rules]
    Scheduler --> Placement[Pod Placement Decision]
    
    style Strategy fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Scheduler fill:#4caf50,stroke:#2e7d32,stroke-width:2px,color:#fff
```

## Cluster Autoscaler Workflow

```mermaid
sequenceDiagram
    participant PendingPods as Pending Pods
    participant ClusterAS as Cluster Autoscaler
    participant OCI as OCI API
    participant NodePool as Node Pool
    participant Scheduler as Scheduler
    participant Pods as Pods
    
    Note over PendingPods: Pods cannot be scheduled<br/>No available resources
    PendingPods->>ClusterAS: Trigger Autoscaler
    
    ClusterAS->>ClusterAS: Check Pending Pods<br/>Resource Requirements
    ClusterAS->>ClusterAS: Calculate Nodes Needed<br/>(CPU, Memory, Pod count)
    ClusterAS->>ClusterAS: Check Node Pool Limits<br/>(Current: 3, Max: 50)
    
    alt Nodes Needed < Max
        ClusterAS->>OCI: Create New Nodes<br/>VM.Standard.E4.Flex
        OCI->>NodePool: Provision Nodes
        NodePool->>NodePool: Initialize Nodes<br/>Install Kubelet, Kube-proxy
        NodePool->>Scheduler: Nodes Ready
        Scheduler->>Scheduler: Schedule Pending Pods
        Scheduler->>Pods: Create Pods on New Nodes
        Pods->>Pods: Pods Running
    else Nodes Needed >= Max
        ClusterAS->>ClusterAS: Log Warning<br/>Max nodes reached
        Note over PendingPods: Pods remain pending<br/>Manual intervention needed
    end
    
    Note over ClusterAS: Every 10 seconds<br/>Check for underutilized nodes
    ClusterAS->>ClusterAS: Check Node Utilization
    alt Node Utilization < 50%<br/>AND No Pods for 10 min
        ClusterAS->>ClusterAS: Check minNodes (3)
        alt Current Nodes > minNodes
            ClusterAS->>Scheduler: Drain Node<br/>Move pods to other nodes
            Scheduler->>Pods: Evict Pods
            Pods->>Pods: Pods Rescheduled
            ClusterAS->>OCI: Delete Node
            OCI->>NodePool: Remove Node
        end
    end
```

## Service Discovery Workflow

```mermaid
flowchart TD
    Start([Service Created]) --> CreateEndpoints[Create Endpoints Object]
    
    CreateEndpoints --> WatchPods[Watch Pods with<br/>Service Selector]
    
    WatchPods --> PodCreated{Pod Created<br/>with Label?}
    PodCreated -->|"Yes"| AddEndpoint[Add Pod IP:Port<br/>to Endpoints]
    PodCreated -->|"No"| WatchPods
    
    AddEndpoint --> UpdateDNS[Update CoreDNS<br/>Service DNS Record]
    UpdateDNS --> ServiceReady[Service Ready<br/>svc-name.namespace.svc.cluster.local]
    
    WatchPods --> PodDeleted{Pod Deleted?}
    PodDeleted -->|"Yes"| RemoveEndpoint[Remove Pod IP:Port<br/>from Endpoints]
    PodDeleted -->|"No"| WatchPods
    
    RemoveEndpoint --> UpdateDNS
    
    ServiceReady --> ClientQuery[Client Queries Service]
    ClientQuery --> DNSResolve[CoreDNS Resolves<br/>to Endpoints IPs]
    DNSResolve --> LoadBalance[Load Balancer<br/>Round-robin to Pods]
    LoadBalance --> PodResponse[Pod Responds]
    
    style ServiceReady fill:#4caf50,stroke:#2e7d32,stroke-width:2px,color:#fff
    style ClientQuery fill:#ff9800,stroke:#e65100,stroke-width:2px,color:#fff
```

## Complete Service Configuration

| Service | Port | Min Replicas | Max Replicas | CPU Request | Memory Request | CPU Limit | Memory Limit | HPA CPU | HPA Memory |
|---------|------|--------------|--------------|-------------|----------------|-----------|--------------|---------|------------|
| **Gateway** | 3000 | 3 | 20 | 200m | 512Mi | 2000m | 2Gi | 70% | 80% |
| **Auth** | 3001 | 2 | 10 | 100m | 256Mi | 1000m | 1Gi | 70% | 80% |
| **User** | 3002 | 2 | 10 | 100m | 256Mi | 1000m | 1Gi | 70% | 80% |
| **Product** | 3003 | 3 | 15 | 200m | 512Mi | 2000m | 2Gi | 70% | 80% |
| **Cart** | 3004 | 2 | 15 | 100m | 256Mi | 1000m | 1Gi | 70% | 80% |
| **Order** | 3005 | 3 | 20 | 200m | 512Mi | 2000m | 2Gi | 70% | 80% |
| **Payment** | 3006 | 2 | 10 | 100m | 256Mi | 1000m | 1Gi | 70% | 80% |
| **Notification** | 3007 | 3 | 15 | 200m | 512Mi | 2000m | 2Gi | 70% | 80% |
| **Discount** | 3008 | 2 | 10 | 100m | 256Mi | 1000m | 1Gi | 70% | 80% |
| **Shipping** | 3009 | 2 | 10 | 100m | 256Mi | 1000m | 1Gi | 70% | 80% |
| **Return** | 3010 | 2 | 10 | 100m | 256Mi | 1000m | 1Gi | 70% | 80% |

## Pod Disruption Budgets

| Service | minAvailable | maxUnavailable | Purpose |
|---------|--------------|---------------|---------|
| **Gateway** | 2 | - | Always have 2+ pods for high availability |
| **Auth** | 1 | - | Always have 1+ pod for authentication |
| **Order** | 1 | - | Critical service, always available |
| **Payment** | 1 | - | Critical service, always available |
| **All Others** | 1 | - | Basic availability guarantee |

## Node Resource Allocation

| Node | Total CPU | Total Memory | Allocated CPU | Allocated Memory | Available CPU | Available Memory |
|------|-----------|--------------|---------------|------------------|---------------|-------------------|
| **Node 1** | 2000m | 32Gi | 1050m | 2.5Gi | 950m | 29.5Gi |
| **Node 2** | 2000m | 32Gi | 1050m | 2.5Gi | 950m | 29.5Gi |
| **Node 3** | 2000m | 32Gi | 800m | 2Gi | 1200m | 30Gi |
| **Reserved** | - | - | 100m | 1Gi | - | - |
| **Total** | 6000m | 96Gi | 3000m | 8Gi | 3000m | 88Gi |

## Summary

- **Total Nodes**: 3 (can scale to 50)
- **Total Pods**: ~24 pods (11 services + system components)
- **Pod Distribution**: Evenly distributed across 3 fault domains
- **High Availability**: Pod anti-affinity ensures pods spread across nodes
- **Auto-scaling**: HPA scales pods, Cluster Autoscaler scales nodes
- **Metrics**: Metrics Server collects metrics every 15 seconds
- **Service Discovery**: CoreDNS provides DNS-based service discovery
