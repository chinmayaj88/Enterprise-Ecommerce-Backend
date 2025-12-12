<div align="center">

# 🏛️ OCI Production Architecture - Complete Master Diagram

[![Architecture](https://img.shields.io/badge/Architecture-Master-blue?style=for-the-badge)](.)
[![OCI](https://img.shields.io/badge/Cloud-OCI-green?style=flat-square&logo=oracle&logoColor=white)](https://www.oracle.com/cloud/)
[![Production](https://img.shields.io/badge/Environment-Production-orange?style=flat-square)](.)

**Single Source of Truth for E-Commerce Platform**

**Primary Region: IN-HYDERABAD-1 | DR Region: IN-MUMBAI-1**

</div>

---

> **This is the comprehensive master architecture diagram containing all production features, disaster recovery, high availability, backup strategies, and operational procedures. This document serves as the single source of truth for understanding the entire e-commerce platform infrastructure.**

```mermaid
graph TB
        subgraph OCI["Oracle Cloud Infrastructure OCI"]
        subgraph Region["Region: IN-HYDERABAD-1 India Central"]
            subgraph VCN["VCN: ecommerce-production-vcn<br/>CIDR: 10.0.0.0/16"]
                
                subgraph AD1["Availability Domain 1 AD-1"]
                    subgraph PublicSubnet1["Public Subnet 10.0.1.0/24"]
                        LB["OCI Load Balancer<br/>Flexible: 100-1000 Mbps<br/>Auto-scales to 10 Gbps<br/>HTTP/HTTPS Port 80/443"]
                        NAT["NAT Gateway<br/>Outbound Internet Access"]
                        SGW["Service Gateway<br/>OCI Services Access"]
                    end
                    
                    subgraph PrivateSubnet1["Private Subnet 10.0.2.0/24"]
                        subgraph OKE1["OKE Cluster v1.34.1"]
                            CP1["Control Plane<br/>Managed by OCI"]
                            
                            subgraph NodePool1["Node Pool 1<br/>VM.Standard.E4.Flex<br/>2 OCPUs, 32GB RAM"]
                                subgraph FD1["Fault Domain 1"]
                                    Node1["Node 1 Worker"]
                                    subgraph K8s1["Kubernetes Namespace: ecommerce"]
                                        Ingress1["NGINX Ingress Controller<br/>SSL/TLS Termination"]
                                        Gateway1["Gateway Service<br/>Port 3000<br/>3-20 replicas HPA<br/>Rate Limiting, Auth"]
                                        Auth1["Auth Service<br/>Port 3001<br/>2-10 replicas HPA"]
                                        User1["User Service<br/>Port 3002<br/>2-10 replicas HPA"]
                                        Product1["Product Service<br/>Port 3003<br/>3-15 replicas HPA"]
                                        Cart1["Cart Service<br/>Port 3004<br/>2-10 replicas HPA"]
                                        Order1["Order Service<br/>Port 3005<br/>3-20 replicas HPA"]
                                        Payment1["Payment Service<br/>Port 3006<br/>2-10 replicas HPA"]
                                        Notification1["Notification Service<br/>Port 3007<br/>3-15 replicas HPA"]
                                        Discount1["Discount Service<br/>Port 3008<br/>2-10 replicas HPA"]
                                        Shipping1["Shipping Service<br/>Port 3009<br/>2-10 replicas HPA"]
                                        Return1["Return Service<br/>Port 3010<br/>2-10 replicas HPA"]
                                        Metrics1["Metrics Server<br/>HPA Metrics"]
                                        PDB1["Pod Disruption Budgets<br/>High Availability"]
                                        ClusterAS1["Cluster Autoscaler<br/>3-50 nodes"]
                                        CircuitBreaker1["Circuit Breakers<br/>Cascade Failure Prevention"]
                                    end
                                end
                                
                                subgraph FD2["Fault Domain 2"]
                                    Node2["Node 2 Worker<br/>Similar Pod Distribution"]
                                end
                                
                                subgraph FD3["Fault Domain 3"]
                                    Node3["Node 3 Worker<br/>Similar Pod Distribution"]
                                end
                            end
                        end
                    end
                    
                    subgraph DatabaseSubnet1["Database Subnet 10.0.3.0/24"]
                        subgraph ADB["Autonomous Databases PostgreSQL"]
                            AuthDB["Auth DB<br/>2-128 OCPUs<br/>2TB+ Storage<br/>Auto-scaling<br/>2-5 Read Replicas"]
                            UserDB["User DB<br/>2-128 OCPUs<br/>2TB+ Storage<br/>Auto-scaling<br/>2-5 Read Replicas"]
                            ProductDB["Product DB<br/>2-128 OCPUs<br/>2TB+ Storage<br/>Auto-scaling<br/>2-5 Read Replicas"]
                            CartDB["Cart DB<br/>2-128 OCPUs<br/>2TB+ Storage<br/>Auto-scaling<br/>2-5 Read Replicas"]
                            OrderDB["Order DB<br/>2-128 OCPUs<br/>2TB+ Storage<br/>Auto-scaling<br/>2-5 Read Replicas"]
                            PaymentDB["Payment DB<br/>2-128 OCPUs<br/>2TB+ Storage<br/>Auto-scaling<br/>2-5 Read Replicas"]
                            NotificationDB["Notification DB<br/>2-128 OCPUs<br/>2TB+ Storage<br/>Auto-scaling<br/>2-5 Read Replicas"]
                            DiscountDB["Discount DB<br/>2-128 OCPUs<br/>2TB+ Storage<br/>Auto-scaling<br/>2-5 Read Replicas"]
                            ShippingDB["Shipping DB<br/>2-128 OCPUs<br/>2TB+ Storage<br/>Auto-scaling<br/>2-5 Read Replicas"]
                            ReturnDB["Return DB<br/>2-128 OCPUs<br/>2TB+ Storage<br/>Auto-scaling<br/>2-5 Read Replicas"]
                        end
                        
                        Redis["Redis Cluster<br/>3-10 nodes<br/>24GB RAM each<br/>Version 7.0.5<br/>Cluster Mode<br/>High Availability"]
                    end
                end
                
                subgraph AD2["Availability Domain 2 AD-2"]
                    PublicSubnet2["Public Subnet<br/>Similar Structure"]
                    PrivateSubnet2["Private Subnet<br/>OKE Nodes<br/>Similar Pod Distribution"]
                    DatabaseSubnet2["Database Subnet<br/>Read Replicas"]
                end
                
                subgraph AD3["Availability Domain 3 AD-3"]
                    PublicSubnet3["Public Subnet<br/>Similar Structure"]
                    PrivateSubnet3["Private Subnet<br/>OKE Nodes<br/>Similar Pod Distribution"]
                    DatabaseSubnet3["Database Subnet<br/>Read Replicas"]
                end
            end
        end
        
        subgraph Messaging["Messaging Services"]
            Streaming["OCI Streaming Kafka-like<br/>user-events 1-10 partitions<br/>order-events 1-20 partitions<br/>payment-events 1-10 partitions<br/>product-events 1-10 partitions<br/>Auto-scaling<br/>Millions msg/sec"]
            Queue["OCI Queue<br/>user-service-events<br/>order-service-events<br/>payment-service-events<br/>product-service-events<br/>notification-service-events"]
        end
        
        subgraph Registry["Container Registry"]
            Repos["11 Private Repositories<br/>ecommerce-production-{service}<br/>All 11 services"]
        end
        
        subgraph Security["Security & Identity"]
            IAM["IAM<br/>Dynamic Groups<br/>Policies<br/>Service Accounts"]
            KMS["KMS Vault<br/>Encryption Keys<br/>AES-256"]
            Vault["OCI Vault<br/>Secrets Management<br/>Database URLs<br/>JWT Secrets<br/>Synced to K8s"]
            WAF["WAF<br/>DDoS Protection 10 Tbps<br/>SQL Injection Protection<br/>XSS Protection<br/>Rate Limiting<br/>Bot Management<br/>Geographic Blocking"]
        end
        
        subgraph Monitoring["Monitoring & Observability"]
            OCI_Monitoring["OCI Monitoring<br/>Real-time Metrics<br/>CPU, Memory, Network<br/>Custom Alarms"]
            Notifications["OCI Notifications<br/>Email Alerts<br/>devops@example.com<br/>oncall@example.com"]
            FlowLogs["VCN Flow Logs<br/>Network Traffic Logs<br/>90-day Retention<br/>OCI Object Storage"]
            Logging["Service Logs<br/>90-day Retention<br/>Searchable Logs"]
        end
        
        subgraph Cost["Cost Management"]
            CostTracking["Cost Tracking<br/>By Service<br/>By Environment<br/>Budget Alerts"]
        end
        
        subgraph CDN["CDN Global Edge"]
            Edge["200+ Edge Locations<br/>Static Assets<br/>Images, CSS, JS<br/>< 50ms Latency"]
        end
        
        subgraph DR["Disaster Recovery Region"]
            subgraph DRRegion["IN-MUMBAI-1 (DR Standby)"]
                DRVCN["VCN: ecommerce-dr-vcn<br/>Pre-configured"]
                DRDBs["10 Standby Databases<br/>Read-only<br/>Replication < 15 min<br/>Auto-failover ready"]
                DROKE["OKE Cluster<br/>Scaled down (0 nodes)<br/>Scale-up: < 30 min"]
                DRLB["Load Balancer<br/>Pre-configured<br/>Inactive until DR"]
                DRBackups["Cross-Region Backups<br/>Daily replication<br/>30-day retention"]
            end
        end
        
        subgraph Backup["Backup & Recovery"]
            AutoBackup["Automated Backups<br/>Full: Daily 02:00 UTC<br/>Incremental: Hourly<br/>Retention: 30 days"]
            PITR["Point-in-Time Recovery<br/>30-day window<br/>1-second granularity<br/>RTO: < 2 hours"]
            CrossRegionBackup["Cross-Region Backup<br/>Mumbai DR<br/>Daily replication<br/>Encrypted AES-256"]
        end
        
        subgraph HA["High Availability"]
            MultiAD["Multi-AD Deployment<br/>3 Availability Domains<br/>Automatic Failover<br/>< 5 minutes"]
            ReadReplicas["Read Replicas<br/>AD-2: 10 replicas<br/>AD-3: 10 replicas<br/>Replication < 1 sec"]
            RedisHA["Redis HA<br/>3-10 nodes<br/>Master-Replica<br/>Auto-failover"]
            PodHA["Pod High Availability<br/>PDB: minAvailable 1-2<br/>Spread across 3 FDs<br/>Health checks"]
        end
    end
    
    %% Traffic Flow
    Internet["Internet Users<br/>Millions"] --> CDN
    CDN --> WAF
    WAF --> LB
    LB --> Ingress1
    Ingress1 --> Gateway1
    
    Gateway1 --> Auth1
    Gateway1 --> User1
    Gateway1 --> Product1
    Gateway1 --> Cart1
    Gateway1 --> Order1
    Gateway1 --> Payment1
    Gateway1 --> Notification1
    Gateway1 --> Discount1
    Gateway1 --> Shipping1
    Gateway1 --> Return1
    
    %% Service to Database connections
    Auth1 --> AuthDB
    User1 --> UserDB
    Product1 --> ProductDB
    Cart1 --> CartDB
    Order1 --> OrderDB
    Payment1 --> PaymentDB
    Notification1 --> NotificationDB
    Discount1 --> DiscountDB
    Shipping1 --> ShippingDB
    Return1 --> ReturnDB
    
    %% Service to Redis connections
    Auth1 --> Redis
    User1 --> Redis
    Product1 --> Redis
    Cart1 --> Redis
    Order1 --> Redis
    Payment1 --> Redis
    Notification1 --> Redis
    Discount1 --> Redis
    Shipping1 --> Redis
    Return1 --> Redis
    Gateway1 --> Redis
    
    %% Event-driven architecture
    Auth1 --> Streaming
    User1 --> Streaming
    Product1 --> Streaming
    Order1 --> Streaming
    Payment1 --> Streaming
    Cart1 --> Streaming
    
    Streaming --> Queue
    Queue --> Notification1
    
    %% Security connections
    Vault --> Auth1
    Vault --> User1
    Vault --> Product1
    Vault --> Cart1
    Vault --> Order1
    Vault --> Payment1
    Vault --> Notification1
    Vault --> Discount1
    Vault --> Shipping1
    Vault --> Return1
    Vault --> Gateway1
    
    KMS --> Vault
    IAM --> Auth1
    IAM --> User1
    IAM --> Product1
    IAM --> Cart1
    IAM --> Order1
    IAM --> Payment1
    IAM --> Notification1
    IAM --> Discount1
    IAM --> Shipping1
    IAM --> Return1
    IAM --> Gateway1
    
    %% Monitoring connections
    OCI_Monitoring --> Notifications
    Auth1 --> Logging
    User1 --> Logging
    Product1 --> Logging
    Cart1 --> Logging
    Order1 --> Logging
    Payment1 --> Logging
    Notification1 --> Logging
    Discount1 --> Logging
    Shipping1 --> Logging
    Return1 --> Logging
    Gateway1 --> Logging
    
    %% Disaster Recovery connections
    AuthDB -.->|"DR Replication<br/>< 15 min lag"| DRDBs
    UserDB -.->|"DR Replication<br/>< 15 min lag"| DRDBs
    ProductDB -.->|"DR Replication<br/>< 15 min lag"| DRDBs
    OrderDB -.->|"DR Replication<br/>< 15 min lag"| DRDBs
    PaymentDB -.->|"DR Replication<br/>< 15 min lag"| DRDBs
    CartDB -.->|"DR Replication<br/>< 15 min lag"| DRDBs
    NotificationDB -.->|"DR Replication<br/>< 15 min lag"| DRDBs
    DiscountDB -.->|"DR Replication<br/>< 15 min lag"| DRDBs
    ShippingDB -.->|"DR Replication<br/>< 15 min lag"| DRDBs
    ReturnDB -.->|"DR Replication<br/>< 15 min lag"| DRDBs
    
    %% Backup connections
    AuthDB --> AutoBackup
    UserDB --> AutoBackup
    ProductDB --> AutoBackup
    OrderDB --> AutoBackup
    PaymentDB --> AutoBackup
    CartDB --> AutoBackup
    NotificationDB --> AutoBackup
    DiscountDB --> AutoBackup
    ShippingDB --> AutoBackup
    ReturnDB --> AutoBackup
    
    AutoBackup --> CrossRegionBackup
    CrossRegionBackup --> DRBackups
    
    %% High Availability connections
    AuthDB --> ReadReplicas
    UserDB --> ReadReplicas
    ProductDB --> ReadReplicas
    OrderDB --> ReadReplicas
    PaymentDB --> ReadReplicas
    CartDB --> ReadReplicas
    NotificationDB --> ReadReplicas
    DiscountDB --> ReadReplicas
    ShippingDB --> ReadReplicas
    ReturnDB --> ReadReplicas
    
    Redis --> RedisHA
    Gateway1 --> PodHA
    Auth1 --> PodHA
    User1 --> PodHA
    Product1 --> PodHA
    
    %% Styling
    classDef serviceClass fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef dbClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef cacheClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef securityClass fill:#ffebee,stroke:#b71c1c,stroke-width:2px
    classDef monitoringClass fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef networkClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef drClass fill:#ffccbc,stroke:#d84315,stroke-width:3px
    classDef backupClass fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef haClass fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    
    class Auth1,User1,Product1,Cart1,Order1,Payment1,Notification1,Discount1,Shipping1,Return1,Gateway1 serviceClass
    class AuthDB,UserDB,ProductDB,CartDB,OrderDB,PaymentDB,NotificationDB,DiscountDB,ShippingDB,ReturnDB dbClass
    class Redis cacheClass
    class IAM,KMS,Vault,WAF securityClass
    class OCI_Monitoring,Notifications,FlowLogs,Logging monitoringClass
    class LB,NAT,SGW,Ingress1 networkClass
    class DRDBs,DROKE,DRLB,DRBackups drClass
    class AutoBackup,PITR,CrossRegionBackup backupClass
    class MultiAD,ReadReplicas,RedisHA,PodHA haClass
```

## Traffic Flow Diagram

```mermaid
sequenceDiagram
    participant User as Internet User
    participant CDN as OCI CDN
    participant WAF as WAF + DDoS Shield
    participant LB as Load Balancer
    participant Ingress as NGINX Ingress
    participant Gateway as Gateway Service
    participant Service as Microservice
    participant Redis as Redis Cache
    participant DB as Autonomous DB
    participant Stream as OCI Streaming
    participant Queue as OCI Queue
    participant Notify as Notification Service
    
    User->>CDN: Request Static Assets
    CDN-->>User: Cached Response
    
    User->>WAF: API Request
    WAF->>WAF: Security Check (SQL Injection, XSS, Rate Limit)
    WAF->>LB: Forward Request
    LB->>Ingress: Route to Ingress
    Ingress->>Gateway: Route to Gateway
    Gateway->>Gateway: Authentication, Rate Limiting
    Gateway->>Service: Route to Service
    
    Service->>Redis: Check Cache
    alt Cache Hit
        Redis-->>Service: Cached Data
    else Cache Miss
        Service->>DB: Query Database
        DB-->>Service: Data
        Service->>Redis: Update Cache
    end
    
    Service-->>Gateway: Response
    Gateway-->>Ingress: Response
    Ingress-->>LB: Response
    LB-->>WAF: Response
    WAF-->>User: Response
    
    Service->>Stream: Publish Event
    Stream->>Queue: Queue Message
    Queue->>Notify: Consume Event
    Notify->>Notify: Send Notification
```

## Event-Driven Architecture Flow

```mermaid
graph LR
    subgraph Producers["Event Producers"]
        AuthP["Auth Service"]
        UserP["User Service"]
        ProductP["Product Service"]
        OrderP["Order Service"]
        PaymentP["Payment Service"]
        CartP["Cart Service"]
    end
    
        subgraph StreamingLayer["OCI Streaming Kafka-like"]
        UserStream["user-events<br/>1-10 partitions"]
        OrderStream["order-events<br/>1-20 partitions"]
        PaymentStream["payment-events<br/>1-10 partitions"]
        ProductStream["product-events<br/>1-10 partitions"]
    end
    
    subgraph QueueLayer["OCI Queue"]
        UserQueue["user-service-events"]
        OrderQueue["order-service-events"]
        PaymentQueue["payment-service-events"]
        ProductQueue["product-service-events"]
        NotifyQueue["notification-service-events"]
    end
    
    subgraph Consumers["Event Consumers"]
        NotifyC["Notification Service"]
        UserC["User Service"]
        OrderC["Order Service"]
        ProductC["Product Service"]
    end
    
    AuthP --> UserStream
    UserP --> UserStream
    ProductP --> ProductStream
    OrderP --> OrderStream
    PaymentP --> PaymentStream
    CartP --> OrderStream
    
    UserStream --> UserQueue
    OrderStream --> OrderQueue
    PaymentStream --> PaymentQueue
    ProductStream --> ProductQueue
    
    UserQueue --> NotifyQueue
    OrderQueue --> NotifyQueue
    PaymentQueue --> NotifyQueue
    ProductQueue --> NotifyQueue
    
    NotifyQueue --> NotifyC
    UserQueue --> UserC
    OrderQueue --> OrderC
    ProductQueue --> ProductC
```

## Scalability Architecture

```mermaid
graph TB
    subgraph AutoScaling["Auto-Scaling Components"]
        HPA["Horizontal Pod Autoscaler<br/>All 11 Services<br/>CPU: 70%, Memory: 80%<br/>2-20 replicas per service"]
        ClusterAS["Cluster Autoscaler<br/>Node Pools<br/>3-50 nodes per pool"]
        LBAS["Load Balancer Auto-scaling<br/>100 Mbps - 10 Gbps"]
        DBAS["Database Auto-scaling<br/>2-128 OCPUs<br/>2TB+ Storage"]
        RedisAS["Redis Auto-scaling<br/>3-10+ nodes"]
        StreamAS["Streaming Auto-scaling<br/>1-20 partitions per stream"]
    end
    
    subgraph HighAvailability["High Availability"]
        MultiAZ["Multi-AZ Deployment<br/>3 Availability Domains<br/>3 Fault Domains each"]
        PDB["Pod Disruption Budgets<br/>minAvailable: 1-2"]
        ReadReplicas["Database Read Replicas<br/>2-5 per database"]
        RedisHA["Redis Cluster Mode<br/>Automatic Failover"]
    end
    
    subgraph Performance["Performance Optimization"]
        CDN_Perf["CDN<br/>200+ Edge Locations<br/>< 50ms Latency"]
        RedisCache["Redis Caching<br/>80-90% DB Load Reduction"]
        ReadRepl["Read Replicas<br/>5-10x Read Capacity"]
        ConnPool["Connection Pooling<br/>Efficient Resource Usage"]
    end
    
    HPA --> MultiAZ
    ClusterAS --> MultiAZ
    DBAS --> ReadReplicas
    RedisAS --> RedisHA
    CDN_Perf --> RedisCache
    ReadRepl --> ConnPool
```

## Security Architecture

```mermaid
graph TB
    subgraph SecurityLayers["Multi-Layer Security"]
        CDN_Sec["CDN<br/>Edge Protection"]
        WAF_Sec["WAF<br/>DDoS: 10 Tbps<br/>OWASP Top 10<br/>Rate Limiting"]
        LB_Sec["Load Balancer<br/>SSL/TLS 1.2+<br/>Perfect Forward Secrecy"]
        Ingress_Sec["NGINX Ingress<br/>IP Whitelisting<br/>Rate Limiting"]
        Gateway_Sec["Gateway Service<br/>JWT Validation<br/>Rate Limiting<br/>Circuit Breakers"]
        Network_Sec["Network Policies<br/>Service Isolation<br/>Default Deny All"]
    end
    
    subgraph Secrets["Secrets Management"]
        KMS_Sec["KMS Vault<br/>AES-256 Encryption"]
        Vault_Sec["OCI Vault<br/>Secrets Storage<br/>K8s Sync"]
    end
    
    subgraph Identity["Identity & Access"]
        IAM_Sec["IAM<br/>Dynamic Groups<br/>Least Privilege<br/>Service Accounts"]
    end
    
    CDN_Sec --> WAF_Sec
    WAF_Sec --> LB_Sec
    LB_Sec --> Ingress_Sec
    Ingress_Sec --> Gateway_Sec
    Gateway_Sec --> Network_Sec
    
    KMS_Sec --> Vault_Sec
    Vault_Sec --> Gateway_Sec
    IAM_Sec --> Gateway_Sec
```

## Monitoring & Observability

```mermaid
graph LR
    subgraph Services["All Services"]
        S1["Gateway Service"]
        S2["Auth Service"]
        S3["User Service"]
        S4["Product Service"]
        S5["Order Service"]
        S6["Payment Service"]
        S7["Cart Service"]
        S8["Notification Service"]
        S9["Discount Service"]
        S10["Shipping Service"]
        S11["Return Service"]
    end
    
    subgraph Metrics["Metrics Collection"]
        MetricsServer["Metrics Server<br/>CPU, Memory, Network"]
        OCI_Metrics["OCI Monitoring<br/>Real-time Metrics"]
    end
    
    subgraph Alarms["Alarms & Alerts"]
        Alarms_Config["Custom Alarms<br/>CPU > 80%<br/>Memory > 80%<br/>5xx Errors > 10"]
    end
    
    subgraph Notifications["Notifications"]
        Email["Email Alerts<br/>devops@example.com<br/>oncall@example.com"]
    end
    
    subgraph Logging["Logging"]
        ServiceLogs["Service Logs<br/>90-day Retention"]
        FlowLogs["VCN Flow Logs<br/>Network Traffic<br/>90-day Retention"]
    end
    
    S1 --> MetricsServer
    S2 --> MetricsServer
    S3 --> MetricsServer
    S4 --> MetricsServer
    S5 --> MetricsServer
    S6 --> MetricsServer
    S7 --> MetricsServer
    S8 --> MetricsServer
    S9 --> MetricsServer
    S10 --> MetricsServer
    S11 --> MetricsServer
    
    MetricsServer --> OCI_Metrics
    OCI_Metrics --> Alarms_Config
    Alarms_Config --> Email
    
    S1 --> ServiceLogs
    S2 --> ServiceLogs
    S3 --> ServiceLogs
    S4 --> ServiceLogs
    S5 --> ServiceLogs
    S6 --> ServiceLogs
    S7 --> ServiceLogs
    S8 --> ServiceLogs
    S9 --> ServiceLogs
    S10 --> ServiceLogs
    S11 --> ServiceLogs
```

## Capacity Summary

```mermaid
graph TB
    subgraph Current["Current Configuration"]
        CC1["Concurrent Users: 500K+"]
        CC2["Requests/sec: 100K+ Gateway"]
        CC3["Requests/sec: 50K+ Product"]
        CC4["Requests/sec: 30K+ Order"]
        CC5["Total: Millions req/min"]
    end
    
    subgraph Max["Maximum Scalability"]
        MC1["Concurrent Users: 10M+"]
        MC2["Requests/sec: 1M+"]
        MC3["Database: 128 OCPUs each"]
        MC4["Nodes: 50 per pool"]
        MC5["Load Balancer: 10 Gbps+"]
        MC6["Redis: 10+ nodes, 240GB+ RAM"]
    end
    
    Current --> Max
```

## Disaster Recovery Architecture

```mermaid
graph TB
    subgraph Primary["PRIMARY REGION: IN-HYDERABAD-1"]
        subgraph PrimaryInfra["Active Infrastructure"]
            PrimaryOKE["OKE Cluster<br/>50+ nodes active<br/>100+ pods running"]
            PrimaryDBs["10 Primary Databases<br/>AD-1<br/>Write operations"]
            PrimaryRR["20 Read Replicas<br/>AD-2, AD-3<br/>Read operations"]
            PrimaryRedis["Redis Cluster<br/>3-10 nodes active"]
            PrimaryLB["Load Balancer<br/>Active<br/>Serving traffic"]
        end
    end
    
    subgraph DR["DISASTER RECOVERY REGION: IN-MUMBAI-1"]
        subgraph DRInfra["DR Standby Infrastructure"]
            DRDBs["10 Standby Databases<br/>Read-only<br/>Replication < 15 min<br/>RPO: < 15 min"]
            DROKE["OKE Cluster<br/>Scaled down (0 nodes)<br/>Scale-up: < 30 min"]
            DRRedis["Redis Cluster<br/>Standby mode<br/>Can activate on DR"]
            DRLB["Load Balancer<br/>Pre-configured<br/>Inactive"]
            DRBackups["Backup Storage<br/>Daily backups<br/>30-day retention"]
        end
    end
    
    subgraph Replication["Replication Strategy"]
        SyncRepl["Synchronous Replication<br/>Primary → Read Replicas<br/>Lag: < 1 second<br/>Zero data loss"]
        AsyncRepl["Asynchronous Replication<br/>Primary → DR Standby<br/>Lag: < 15 minutes<br/>RPO: < 15 min"]
    end
    
    subgraph Failover["Failover Scenarios"]
        AutoFailover["Automatic Failover<br/>Single/Multiple AD failure<br/>Time: < 5 minutes<br/>Zero data loss"]
        ManualFailover["Manual/Auto Failover<br/>Regional disaster<br/>Time: < 1 hour<br/>RTO: < 1 hour"]
    end
    
    PrimaryDBs ==>|"Replication<br/>< 1 sec"| PrimaryRR
    PrimaryDBs -.->|"DR Replication<br/>< 15 min"| DRDBs
    PrimaryDBs --> AutoBackup
    AutoBackup -.->|"Cross-region"| DRBackups
    
    PrimaryInfra -->|"Normal Operation"| SyncRepl
    PrimaryInfra -->|"Regional Disaster"| ManualFailover
    PrimaryInfra -->|"AD Failure"| AutoFailover
    
    ManualFailover --> DRInfra
    AutoFailover --> PrimaryRR
    
    style PrimaryDBs fill:#1b5e20,stroke:#2e7d32,stroke-width:3px,color:#fff
    style PrimaryRR fill:#4caf50,stroke:#66bb6a,stroke-width:2px,color:#000
    style DRDBs fill:#e65100,stroke:#ff6f00,stroke-width:3px,color:#fff
    style AutoFailover fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style ManualFailover fill:#ffccbc,stroke:#d84315,stroke-width:2px
```

## High Availability Architecture

```mermaid
graph TB
    subgraph RegionHA["Region-Level HA: IN-HYDERABAD-1"]
        subgraph AD1_HA["Availability Domain 1"]
            AD1_Primary["Primary Databases<br/>10 DBs<br/>Write operations"]
            AD1_OKE["OKE Nodes<br/>Fault Domain 1-3<br/>Pod distribution"]
        end
        
        subgraph AD2_HA["Availability Domain 2"]
            AD2_RR["Read Replicas<br/>10 replicas<br/>Read operations<br/>Replication < 1 sec"]
            AD2_OKE["OKE Nodes<br/>Fault Domain 1-3<br/>Pod distribution"]
        end
        
        subgraph AD3_HA["Availability Domain 3"]
            AD3_RR["Read Replicas<br/>10 replicas<br/>Read operations<br/>Replication < 1 sec"]
            AD3_OKE["OKE Nodes<br/>Fault Domain 1-3<br/>Pod distribution"]
        end
    end
    
    subgraph AppHA["Application-Level HA"]
        HPA_HA["Horizontal Pod Autoscaler<br/>All 11 services<br/>2-20 replicas<br/>CPU: 70%, Memory: 80%"]
        PDB_HA["Pod Disruption Budgets<br/>minAvailable: 1-2<br/>Prevents downtime"]
        HealthChecks["Health Checks<br/>Liveness probes<br/>Readiness probes"]
        CircuitBreakers["Circuit Breakers<br/>Cascade failure prevention<br/>Retry logic"]
    end
    
    subgraph DataHA["Data-Level HA"]
        DBReplication["Database Replication<br/>Primary → Read Replicas<br/>Automatic failover<br/>< 5 minutes"]
        RedisHA_Detail["Redis High Availability<br/>Master-Replica setup<br/>Automatic failover<br/>AOF persistence"]
        BackupHA["Automated Backups<br/>Daily full + hourly incremental<br/>30-day retention<br/>PITR available"]
    end
    
    subgraph NetworkHA["Network-Level HA"]
        LBHA["Load Balancer HA<br/>Multi-AZ deployment<br/>Health checks<br/>Automatic failover"]
        DNSHA["DNS Failover<br/>Geographic routing<br/>Automatic failover<br/>< 5 minutes"]
    end
    
    AD1_Primary ==>|"Replication"| AD2_RR
    AD1_Primary ==>|"Replication"| AD3_RR
    
    AD1_OKE --> HPA_HA
    AD2_OKE --> HPA_HA
    AD3_OKE --> HPA_HA
    
    HPA_HA --> PDB_HA
    PDB_HA --> HealthChecks
    HealthChecks --> CircuitBreakers
    
    AD1_Primary --> DBReplication
    DBReplication --> BackupHA
    
    LBHA --> DNSHA
    
    style AD1_Primary fill:#1b5e20,stroke:#2e7d32,stroke-width:3px,color:#fff
    style AD2_RR fill:#4caf50,stroke:#66bb6a,stroke-width:2px,color:#000
    style AD3_RR fill:#4caf50,stroke:#66bb6a,stroke-width:2px,color:#000
    style HPA_HA fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style DBReplication fill:#fff3e0,stroke:#e65100,stroke-width:2px
```

## Backup & Recovery Strategy

```mermaid
graph TB
    subgraph BackupStrategy["Backup Strategy"]
        subgraph Automated["Automated Backups"]
            FullBackup["Full Backup<br/>Daily at 02:00 UTC<br/>All 10 databases<br/>Compressed, Encrypted"]
            IncrementalBackup["Incremental Backup<br/>Hourly<br/>All 10 databases<br/>Transaction logs"]
            Retention["Retention Policy<br/>30 days (configurable to 60)<br/>Point-in-Time Recovery<br/>1-second granularity"]
        end
        
        subgraph CrossRegion["Cross-Region Backup"]
            MumbaiBackup["Mumbai DR Backup<br/>Daily replication<br/>30-day retention<br/>Encrypted AES-256"]
            BackupVerification["Backup Verification<br/>Automated integrity checks<br/>Restore testing<br/>Monthly validation"]
        end
        
        subgraph Recovery["Recovery Procedures"]
            PITR_Detail["Point-in-Time Recovery<br/>30-day window<br/>1-second granularity<br/>RTO: < 2 hours<br/>RPO: < 1 hour"]
            FullRestore["Full Database Restore<br/>From latest backup<br/>Apply incrementals<br/>RTO: < 4 hours"]
            DRRestore["DR Region Restore<br/>Promote standby to primary<br/>RTO: < 1 hour<br/>RPO: < 15 minutes"]
        end
    end
    
    subgraph BackupStorage["Backup Storage"]
        PrimaryStorage["Primary Region Storage<br/>OCI Object Storage<br/>Encrypted at rest<br/>Compressed"]
        DRStorage["DR Region Storage<br/>Mumbai Object Storage<br/>Cross-region replication<br/>Encrypted"]
    end
    
    FullBackup --> Retention
    IncrementalBackup --> Retention
    Retention --> PrimaryStorage
    PrimaryStorage --> MumbaiBackup
    MumbaiBackup --> DRStorage
    DRStorage --> BackupVerification
    
    Retention --> PITR_Detail
    Retention --> FullRestore
    DRStorage --> DRRestore
    
    style FullBackup fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style PITR_Detail fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style DRRestore fill:#ffccbc,stroke:#d84315,stroke-width:2px
```

## Disaster Recovery Procedures

```mermaid
sequenceDiagram
    participant Ops as DevOps Team
    participant Monitor as OCI Monitoring
    participant Primary as Hyderabad Primary
    participant DR as Mumbai DR
    participant DNS as DNS Service
    participant Users as End Users
    
    Note over Primary,DR: Normal Operation
    Primary->>DR: Continuous Replication (< 15 min lag)
    Monitor->>Ops: Health Status OK
    
    alt Scenario 1: Single AD Failure
        Primary->>Monitor: AD-1 Failure Detected
        Monitor->>Ops: Alert: AD-1 Down
        Primary->>Primary: Automatic Failover to AD-2/AD-3
        Primary->>Ops: Read Replica Promoted (< 5 min)
        Note over Primary: Zero Data Loss, < 5 min RTO
    else Scenario 2: Regional Disaster
        Primary->>Monitor: Region Failure Detected
        Monitor->>Ops: Critical Alert: Hyderabad Down
        Ops->>DR: Initiate DR Failover
        DR->>DR: Promote Standby to Primary (< 30 min)
        DR->>DR: Scale up OKE Cluster (< 30 min)
        DR->>DR: Deploy Services (< 15 min)
        Ops->>DNS: Update DNS to Mumbai (< 5 min)
        DNS->>Users: Traffic Routed to Mumbai
        Note over DR: RTO < 1 hour, RPO < 15 min
    else Scenario 3: Planned Maintenance
        Ops->>Primary: Schedule Maintenance
        Primary->>DR: Synchronize Data (< 1 min lag)
        Ops->>DR: Planned Failover
        DR->>DR: Promote Standby (< 30 min)
        Ops->>DNS: Update DNS (< 5 min)
        DNS->>Users: Traffic Routed to Mumbai
        Ops->>Primary: Perform Maintenance
        Ops->>Primary: Failback After Maintenance
    end
```

## RTO/RPO Targets & SLAs

```mermaid
graph TB
    subgraph RTO["Recovery Time Objectives (RTO)"]
        RTO1["Single AD Failure<br/>< 5 minutes<br/>Automatic"]
        RTO2["Multiple AD Failure<br/>< 5 minutes<br/>Automatic"]
        RTO3["Regional Disaster<br/>< 1 hour<br/>Manual/Auto"]
        RTO4["Planned Maintenance<br/>< 30 minutes<br/>Controlled"]
        RTO5["Data Corruption<br/>< 2 hours<br/>PITR"]
    end
    
    subgraph RPO["Recovery Point Objectives (RPO)"]
        RPO1["Single AD Failure<br/>0 seconds<br/>Zero data loss"]
        RPO2["Multiple AD Failure<br/>0 seconds<br/>Zero data loss"]
        RPO3["Regional Disaster<br/>< 15 minutes<br/>Last replication"]
        RPO4["Planned Maintenance<br/>0 seconds<br/>Synchronized"]
        RPO5["Data Corruption<br/>< 1 hour<br/>Last backup"]
    end
    
    subgraph SLA["Service Level Agreements"]
        Uptime["Uptime Target<br/>99.9%<br/>8.76 hours/year downtime"]
        DataAvail["Data Availability<br/>99.99%<br/>52.56 minutes/year"]
        Maintenance["Planned Maintenance<br/>2 hours/month<br/>Scheduled"]
        Unplanned["Unplanned Downtime<br/>< 1 hour/incident<br/>Maximum"]
    end
    
    RTO1 --> RPO1
    RTO2 --> RPO2
    RTO3 --> RPO3
    RTO4 --> RPO4
    RTO5 --> RPO5
    
    RTO1 --> Uptime
    RTO2 --> Uptime
    RTO3 --> Unplanned
    
    style RTO1 fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style RTO3 fill:#ffccbc,stroke:#d84315,stroke-width:2px
    style RPO1 fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    style RPO3 fill:#fff3e0,stroke:#e65100,stroke-width:2px
```

## Production Requirements Summary

```mermaid
graph TB
    subgraph Production["Production Requirements"]
        subgraph HA_Req["High Availability"]
            HA1["✅ Multi-AZ: 3 Availability Domains"]
            HA2["✅ Automatic Failover: < 5 minutes"]
            HA3["✅ Zero Data Loss: Single/Multiple AD failures"]
            HA4["✅ Load Balancing: Multi-AD distribution"]
            HA5["✅ Pod Disruption Budgets: minAvailable 1-2"]
        end
        
        subgraph DR_Req["Disaster Recovery"]
            DR1["✅ Cross-Region DR: Mumbai (IN-MUMBAI-1)"]
            DR2["✅ RTO: < 1 hour for regional disasters"]
            DR3["✅ RPO: < 15 minutes for regional disasters"]
            DR4["✅ Automated Backup & Replication"]
            DR5["✅ Point-in-Time Recovery: 30-day window"]
        end
        
        subgraph Backup_Req["Backup & Recovery"]
            B1["✅ Daily Full Backups: 02:00 UTC"]
            B2["✅ Hourly Incremental Backups"]
            B3["✅ 30-day Retention (configurable to 60)"]
            B4["✅ Cross-Region Backup Replication"]
            B5["✅ Automated Backup Integrity Verification"]
        end
        
        subgraph Monitor_Req["Monitoring & Alerting"]
            M1["✅ Real-time Replication Lag Monitoring"]
            M2["✅ DR Infrastructure Health Monitoring"]
            M3["✅ Automated Failover Readiness Checks"]
            M4["✅ Backup Success/Failure Alerts"]
            M5["✅ Critical Alerts: SMS + Email"]
        end
        
        subgraph Test_Req["Testing & Validation"]
            T1["✅ Quarterly DR Drills"]
            T2["✅ Monthly Backup Verification"]
            T3["✅ Continuous Replication Monitoring"]
            T4["✅ Automated Failover Testing"]
        end
        
        subgraph Security_Req["Security & Compliance"]
            S1["✅ Encrypted Backups: AES-256 at rest, TLS in transit"]
            S2["✅ Secure Cross-Region Data Transfer"]
            S3["✅ Access Controls for DR Procedures"]
            S4["✅ Audit Logs for All DR Operations"]
        end
    end
    
    HA_Req --> DR_Req
    DR_Req --> Backup_Req
    Backup_Req --> Monitor_Req
    Monitor_Req --> Test_Req
    Test_Req --> Security_Req
    
    style HA1 fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style DR1 fill:#ffccbc,stroke:#d84315,stroke-width:2px
    style B1 fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style M1 fill:#e1f5ff,stroke:#01579b,stroke-width:2px
```

## Database Replication Topology

```mermaid
graph TB
    subgraph Hyderabad["PRIMARY REGION: IN-HYDERABAD-1"]
        subgraph AD1_HYD["AD-1: Primary Databases"]
            P1["Auth DB Primary"]
            P2["User DB Primary"]
            P3["Product DB Primary"]
            P4["Order DB Primary"]
            P5["Payment DB Primary"]
            P6["Cart DB Primary"]
            P7["Notification DB Primary"]
            P8["Discount DB Primary"]
            P9["Shipping DB Primary"]
            P10["Return DB Primary"]
        end
        
        subgraph AD2_HYD["AD-2: Read Replicas"]
            R1_1["Auth DB RR-1<br/>Replication < 1 sec"]
            R2_1["User DB RR-1<br/>Replication < 1 sec"]
            R3_1["Product DB RR-1<br/>Replication < 1 sec"]
            R4_1["Order DB RR-1<br/>Replication < 1 sec"]
            R5_1["Payment DB RR-1<br/>Replication < 1 sec"]
            R6_1["Cart DB RR-1<br/>Replication < 1 sec"]
            R7_1["Notification DB RR-1<br/>Replication < 1 sec"]
            R8_1["Discount DB RR-1<br/>Replication < 1 sec"]
            R9_1["Shipping DB RR-1<br/>Replication < 1 sec"]
            R10_1["Return DB RR-1<br/>Replication < 1 sec"]
        end
        
        subgraph AD3_HYD["AD-3: Read Replicas"]
            R1_2["Auth DB RR-2<br/>Replication < 1 sec"]
            R2_2["User DB RR-2<br/>Replication < 1 sec"]
            R3_2["Product DB RR-2<br/>Replication < 1 sec"]
            R4_2["Order DB RR-2<br/>Replication < 1 sec"]
            R5_2["Payment DB RR-2<br/>Replication < 1 sec"]
            R6_2["Cart DB RR-2<br/>Replication < 1 sec"]
            R7_2["Notification DB RR-2<br/>Replication < 1 sec"]
            R8_2["Discount DB RR-2<br/>Replication < 1 sec"]
            R9_2["Shipping DB RR-2<br/>Replication < 1 sec"]
            R10_2["Return DB RR-2<br/>Replication < 1 sec"]
        end
    end
    
    subgraph Mumbai["DR REGION: IN-MUMBAI-1"]
        subgraph DR_MUM["DR Standby Databases"]
            DR1["Auth DB Standby<br/>Replication < 15 min"]
            DR2["User DB Standby<br/>Replication < 15 min"]
            DR3["Product DB Standby<br/>Replication < 15 min"]
            DR4["Order DB Standby<br/>Replication < 15 min"]
            DR5["Payment DB Standby<br/>Replication < 15 min"]
            DR6["Cart DB Standby<br/>Replication < 15 min"]
            DR7["Notification DB Standby<br/>Replication < 15 min"]
            DR8["Discount DB Standby<br/>Replication < 15 min"]
            DR9["Shipping DB Standby<br/>Replication < 15 min"]
            DR10["Return DB Standby<br/>Replication < 15 min"]
        end
    end
    
    %% Primary to Read Replicas (within Hyderabad) - Thick solid lines
    P1 ==>|"< 1 sec"| R1_1
    P1 ==>|"< 1 sec"| R1_2
    P2 ==>|"< 1 sec"| R2_1
    P2 ==>|"< 1 sec"| R2_2
    P3 ==>|"< 1 sec"| R3_1
    P3 ==>|"< 1 sec"| R3_2
    P4 ==>|"< 1 sec"| R4_1
    P4 ==>|"< 1 sec"| R4_2
    P5 ==>|"< 1 sec"| R5_1
    P5 ==>|"< 1 sec"| R5_2
    P6 ==>|"< 1 sec"| R6_1
    P6 ==>|"< 1 sec"| R6_2
    P7 ==>|"< 1 sec"| R7_1
    P7 ==>|"< 1 sec"| R7_2
    P8 ==>|"< 1 sec"| R8_1
    P8 ==>|"< 1 sec"| R8_2
    P9 ==>|"< 1 sec"| R9_1
    P9 ==>|"< 1 sec"| R9_2
    P10 ==>|"< 1 sec"| R10_1
    P10 ==>|"< 1 sec"| R10_2
    
    %% Cross-Region Replication (Hyderabad to Mumbai) - Dashed lines
    P1 -.->|"< 15 min"| DR1
    P2 -.->|"< 15 min"| DR2
    P3 -.->|"< 15 min"| DR3
    P4 -.->|"< 15 min"| DR4
    P5 -.->|"< 15 min"| DR5
    P6 -.->|"< 15 min"| DR6
    P7 -.->|"< 15 min"| DR7
    P8 -.->|"< 15 min"| DR8
    P9 -.->|"< 15 min"| DR9
    P10 -.->|"< 15 min"| DR10
    
    %% Styling
    style P1 fill:#1b5e20,stroke:#2e7d32,stroke-width:4px,color:#fff
    style P2 fill:#1b5e20,stroke:#2e7d32,stroke-width:4px,color:#fff
    style P3 fill:#1b5e20,stroke:#2e7d32,stroke-width:4px,color:#fff
    style R1_1 fill:#4caf50,stroke:#66bb6a,stroke-width:2px,color:#000
    style R1_2 fill:#4caf50,stroke:#66bb6a,stroke-width:2px,color:#000
    style DR1 fill:#e65100,stroke:#ff6f00,stroke-width:3px,color:#fff
    style DR2 fill:#e65100,stroke:#ff6f00,stroke-width:3px,color:#fff
```

## Complete Production Features Checklist

### ✅ Infrastructure Components
- **Primary Region**: IN-HYDERABAD-1 (India Central)
  - 3 Availability Domains (AD-1, AD-2, AD-3)
  - OKE Cluster with 50+ nodes
  - 11 Microservices (100+ pods)
  - 10 Primary Databases + 20 Read Replicas
  - Redis Cluster (3-10 nodes)
  - Load Balancer (100 Mbps - 10 Gbps)
  - OCI Streaming & Queue
  - Container Registry (11 repositories)

- **DR Region**: IN-MUMBAI-1 (India West)
  - 10 Standby Databases (read-only)
  - OKE Cluster (scaled down, ready to scale up)
  - Pre-configured VCN and networking
  - Cross-region backup storage

### ✅ High Availability Features
- Multi-AZ deployment across 3 Availability Domains
- Automatic failover within region (< 5 minutes)
- Zero data loss for single/multiple AD failures
- Read replicas for read scaling (2-5 per database)
- Pod Disruption Budgets (minAvailable: 1-2)
- Health checks (liveness, readiness probes)
- Circuit breakers for cascade failure prevention
- Redis High Availability (master-replica, auto-failover)

### ✅ Disaster Recovery Features
- Cross-region DR to Mumbai (IN-MUMBAI-1)
- RTO: < 1 hour for regional disasters
- RPO: < 15 minutes for regional disasters
- Automated cross-region replication
- Pre-configured DR infrastructure
- DNS failover capability
- DR testing schedule (quarterly drills)

### ✅ Backup & Recovery Features
- Daily full backups (02:00 UTC)
- Hourly incremental backups
- 30-day retention (configurable to 60 days)
- Point-in-Time Recovery (30-day window, 1-second granularity)
- Cross-region backup replication
- Automated backup integrity verification
- Encrypted backups (AES-256 at rest, TLS in transit)

### ✅ Security Features
- WAF (DDoS protection: 10 Tbps)
- SQL Injection & XSS protection
- Rate limiting (2000 req/5min/IP)
- KMS Vault (AES-256 encryption)
- OCI Vault (secrets management)
- IAM (dynamic groups, least privilege)
- Network policies (default deny all)
- mTLS for database connections

### ✅ Monitoring & Observability
- OCI Monitoring (real-time metrics)
- Custom alarms (CPU, Memory, Errors)
- OCI Notifications (Email, SMS alerts)
- VCN Flow Logs (90-day retention)
- Service Logs (90-day retention)
- Replication lag monitoring
- DR infrastructure health monitoring
- Backup success/failure alerts

### ✅ Scalability Features
- Horizontal Pod Autoscaler (2-20 replicas per service)
- Cluster Autoscaler (3-50 nodes per pool)
- Database Auto-scaling (2-128 OCPUs)
- Load Balancer Auto-scaling (100 Mbps - 10 Gbps)
- Redis Auto-scaling (3-10+ nodes)
- Streaming Auto-scaling (1-20 partitions per stream)

### ✅ Performance Features
- CDN (200+ edge locations, < 50ms latency)
- Redis Caching (80-90% DB load reduction)
- Read Replicas (5-10x read capacity)
- Connection pooling
- Event-driven architecture
- Async message processing

### ✅ Cost Management
- Cost tracking by service, environment, resource
- Budget alerts
- Usage reports (daily, monthly)
- Resource tagging for cost allocation

---

## Quick Reference: Key Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **Uptime** | 99.9% | 8.76 hours/year downtime |
| **Data Availability** | 99.99% | 52.56 minutes/year |
| **RTO (Single AD)** | < 5 min | Automatic failover |
| **RTO (Regional)** | < 1 hour | DR failover |
| **RPO (Single AD)** | 0 sec | Zero data loss |
| **RPO (Regional)** | < 15 min | Last replication |
| **Replication Lag (HA)** | < 1 sec | Within region |
| **Replication Lag (DR)** | < 15 min | Cross-region |
| **Backup Retention** | 30 days | Configurable to 60 |
| **PITR Window** | 30 days | 1-second granularity |

---

**This document is the single source of truth for the e-commerce platform architecture. All production features, disaster recovery procedures, high availability configurations, and operational requirements are documented here.**

