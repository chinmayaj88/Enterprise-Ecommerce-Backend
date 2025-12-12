<div align="center">

# ⚡ Redis Cache Architecture - Multi-Environment Detailed

[![Redis](https://img.shields.io/badge/Redis-Cache-blue?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![OCI](https://img.shields.io/badge/Cloud-OCI-green?style=flat-square&logo=oracle&logoColor=white)](https://www.oracle.com/cloud/)
[![Multi-Environment](https://img.shields.io/badge/Environments-All-orange?style=flat-square)](.)

**Complete detailed architecture of Redis clusters for Production, Staging, and Development environments**

</div>

---

## Multi-Environment Redis Overview

```mermaid
graph TB
    subgraph OCI["OCI Redis Clusters - Multi-Environment"]
        
        subgraph ProdRedis["🔴 Production Redis<br/>ecommerce-production-redis<br/>VCN: 10.0.0.0/16"]
            ProdCluster["Cluster Mode<br/>3-10 Primary Nodes<br/>3-10 Replica Nodes<br/>24GB RAM per node"]
        end
        
        subgraph StagingRedis["🟠 Staging Redis<br/>ecommerce-staging-redis<br/>VCN: 10.1.0.0/16"]
            StagingCluster["Cluster Mode<br/>3-5 Primary Nodes<br/>3-5 Replica Nodes<br/>12GB RAM per node"]
        end
        
        subgraph DevRedis["🟢 Development Redis<br/>ecommerce-development-redis<br/>VCN: 10.2.0.0/16"]
            DevCluster["Cluster Mode<br/>1-3 Primary Nodes<br/>1-3 Replica Nodes<br/>8GB RAM per node"]
        end
    end
    
    style ProdRedis fill:#c62828,stroke:#b71c1c,stroke-width:4px,color:#fff
    style StagingRedis fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
    style DevRedis fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
```

## Production Redis Cluster Architecture

```mermaid
graph TB
    subgraph OCI["OCI Redis Cluster: ecommerce-production-redis"]
        subgraph Cluster["Redis Cluster Mode<br/>Version: 7.0.5<br/>16384 Hash Slots"]
            
            subgraph Primary1["Primary Node 1<br/>IP: 10.0.6.10<br/>24GB RAM<br/>Hash Slots: 0-5460"]
                Slot1["Hash Slots<br/>0-5460<br/>~5461 keys"]
                Replica1["Replica 1-1<br/>Read-only<br/>Replicates from Primary 1"]
            end
            
            subgraph Primary2["Primary Node 2<br/>IP: 10.0.6.11<br/>24GB RAM<br/>Hash Slots: 5461-10922"]
                Slot2["Hash Slots<br/>5461-10922<br/>~5462 keys"]
                Replica2["Replica 2-1<br/>Read-only<br/>Replicates from Primary 2"]
            end
            
            subgraph Primary3["Primary Node 3<br/>IP: 10.0.6.12<br/>24GB RAM<br/>Hash Slots: 10923-16383"]
                Slot3["Hash Slots<br/>10923-16383<br/>~5461 keys"]
                Replica3["Replica 3-1<br/>Read-only<br/>Replicates from Primary 3"]
            end
            
            Primary1 -.->|"Async Replication"| Replica1
            Primary2 -.->|"Async Replication"| Replica2
            Primary3 -.->|"Async Replication"| Replica3
        end
        
        subgraph Services["Services Using Redis"]
            subgraph Gateway["Gateway Service"]
                GatewayPod1["gateway-pod-1<br/>Rate Limiting"]
                GatewayPod2["gateway-pod-2<br/>Session Storage"]
            end
            
            subgraph Auth["Auth Service"]
                AuthPod1["auth-pod-1<br/>Session Cache"]
                AuthPod2["auth-pod-2<br/>Token Cache"]
            end
            
            subgraph Product["Product Service"]
                ProductPod1["product-pod-1<br/>Product Catalog"]
                ProductPod2["product-pod-2<br/>Category Cache"]
            end
            
            subgraph Cart["Cart Service"]
                CartPod1["cart-pod-1<br/>Cart Data"]
            end
            
            subgraph Order["Order Service"]
                OrderPod1["order-pod-1<br/>Order Status"]
            end
        end
        
        subgraph Client["Redis Client Library<br/>Cluster Mode Enabled"]
            ClusterDiscovery["Cluster Discovery<br/>Queries any node<br/>Gets cluster topology"]
            SlotCalculation["Slot Calculation<br/>CRC16(key) % 16384"]
            Routing["Request Routing<br/>Routes to correct node"]
        end
    end
    
    %% Services to Client
    GatewayPod1 & GatewayPod2 --> Client
    AuthPod1 & AuthPod2 --> Client
    ProductPod1 & ProductPod2 --> Client
    CartPod1 --> Client
    OrderPod1 --> Client
    
    %% Client to Cluster
    Client --> ClusterDiscovery
    ClusterDiscovery --> Primary1
    ClusterDiscovery --> Primary2
    ClusterDiscovery --> Primary3
    
    SlotCalculation --> Routing
    Routing -->|"Slot 0-5460"| Primary1
    Routing -->|"Slot 5461-10922"| Primary2
    Routing -->|"Slot 10923-16383"| Primary3
    
    Routing -->|"Read Replica"| Replica1
    Routing -->|"Read Replica"| Replica2
    Routing -->|"Read Replica"| Replica3
    
    %% Styling
    style Primary1 fill:#c62828,stroke:#b71c1c,stroke-width:3px,color:#fff
    style Primary2 fill:#c62828,stroke:#b71c1c,stroke-width:3px,color:#fff
    style Primary3 fill:#c62828,stroke:#b71c1c,stroke-width:3px,color:#fff
    style Replica1 fill:#e57373,stroke:#c62828,stroke-width:2px
    style Replica2 fill:#e57373,stroke:#c62828,stroke-width:2px
    style Replica3 fill:#e57373,stroke:#c62828,stroke-width:2px
    style Client fill:#1976d2,stroke:#0d47a1,stroke-width:2px,color:#fff
```

## Redis Request Flow Workflow

```mermaid
sequenceDiagram
    participant Service as Microservice Pod
    participant Client as Redis Client
    participant Cluster as Redis Cluster
    participant Primary as Primary Node
    participant Replica as Replica Node
    
    Service->>Client: SET user:123:profile {...}
    Client->>Client: Calculate Hash Slot<br/>CRC16("user:123:profile") % 16384
    Client->>Client: Determine Node<br/>Slot 5234 → Primary Node 1
    
    alt Write Operation
        Client->>Primary: SET user:123:profile {...}
        Primary->>Primary: Store in Memory
        Primary->>Primary: Persist to AOF/RDB
        Primary-->>Client: OK
        Client-->>Service: Success
        
        Note over Primary,Replica: Async Replication
        Primary->>Replica: Replicate Command<br/>(Asynchronously)
        Replica->>Replica: Apply Command
    else Read Operation
        Client->>Client: Check Read Preference<br/>(Primary or Replica)
        alt Read from Replica
            Client->>Replica: GET user:123:profile
            Replica-->>Client: Return Data
            Client-->>Service: Return Data
        else Read from Primary
            Client->>Primary: GET user:123:profile
            Primary-->>Client: Return Data
            Client-->>Service: Return Data
        end
    end
```

## Redis Cluster Discovery Workflow

```mermaid
flowchart TD
    Start([Service Starts]) --> Connect[Connect to Redis<br/>Any Node IP]
    
    Connect --> ClusterInfo[Send CLUSTER NODES<br/>Command]
    
    ClusterInfo --> ParseTopology[Parse Cluster Topology<br/>Node IDs, IPs, Slots, Roles]
    
    ParseTopology --> BuildMap[Build Slot-to-Node Map<br/>0-5460 → Node1<br/>5461-10922 → Node2<br/>10923-16383 → Node3]
    
    BuildMap --> CacheTopology[Cache Topology<br/>In Client Memory]
    
    CacheTopology --> Ready[Client Ready<br/>Can Route Requests]
    
    Ready --> Request[Incoming Request]
    Request --> CalculateSlot[Calculate Hash Slot<br/>CRC16(key) % 16384]
    
    CalculateSlot --> CheckMap{Slot in<br/>Cached Map?}
    
    CheckMap -->|"Yes"| Route[Route to Node<br/>Based on Map]
    CheckMap -->|"No"| Refresh[Refresh Topology<br/>CLUSTER NODES]
    
    Refresh --> ParseTopology
    
    Route --> Execute[Execute Command<br/>on Target Node]
    
    Execute --> Response{Response Type?}
    
    Response -->|"MOVED"| UpdateMap[Update Slot Map<br/>Node Changed]
    Response -->|"ASK"| Redirect[Redirect to<br/>New Node]
    Response -->|"OK/Data"| Success[Success]
    
    UpdateMap --> CacheTopology
    Redirect --> Execute
    
    style Ready fill:#4caf50,stroke:#2e7d32,stroke-width:2px,color:#fff
    style Success fill:#4caf50,stroke:#2e7d32,stroke-width:2px,color:#fff
```

## Redis Failover Workflow

```mermaid
sequenceDiagram
    participant Primary as Primary Node 1
    participant Replica as Replica Node 1-1
    participant OtherNodes as Other Cluster Nodes
    participant Client as Redis Client
    participant Service as Service
    
    Note over Primary: Primary Node 1 Running
    Primary->>Replica: Heartbeat (PING)<br/>Every 1 second
    Replica->>Primary: PONG Response
    
    Note over Primary: Primary Node Fails<br/>No Response
    Replica->>Replica: Detect Timeout<br/>(No PING for 5 seconds)
    
    Replica->>OtherNodes: Request Vote<br/>for Failover
    OtherNodes->>Replica: Vote Granted
    
    Replica->>Replica: Promote to Primary<br/>Takeover Hash Slots 0-5460
    
    Replica->>OtherNodes: Announce New Primary<br/>Update Cluster Topology
    
    OtherNodes->>OtherNodes: Update Slot Map<br/>0-5460 → New Primary
    
    Note over Client: Client Detects Change
    Client->>Replica: Request (MOVED response)
    Replica-->>Client: MOVED 5234 new-primary-ip:6379
    
    Client->>Client: Update Slot Map<br/>0-5460 → New Primary IP
    Client->>Replica: Retry Request<br/>on New Primary
    Replica-->>Client: Success
    Client-->>Service: Return Data
    
    Note over Replica: New Primary Operational<br/>Failover Complete
```

## Redis Data Patterns

```mermaid
graph TB
    subgraph Patterns["Redis Usage Patterns"]
        
        subgraph Session["Session Storage"]
            SessionKey["Key: session:user:123<br/>Value: {token, expiry}<br/>TTL: 30 minutes<br/>Used by: Auth, Gateway"]
        end
        
        subgraph Cache["Data Caching"]
            CacheKey["Key: product:456<br/>Value: {name, price, ...}<br/>TTL: 5-60 minutes<br/>Used by: Product, User"]
        end
        
        subgraph RateLimit["Rate Limiting"]
            RateKey["Key: ratelimit:ip:1.2.3.4<br/>Value: Counter<br/>TTL: Sliding window<br/>Used by: Gateway"]
        end
        
        subgraph Queue["Message Queue"]
            QueueKey["Key: queue:notifications<br/>Type: List<br/>Operations: LPUSH, RPOP<br/>Used by: Notification"]
        end
        
        subgraph Cart["Cart Storage"]
            CartKey["Key: cart:user:123<br/>Value: {items, total}<br/>TTL: 7 days<br/>Used by: Cart"]
        end
    end
    
    subgraph Benefits["Benefits"]
        Performance["80-90% DB Load Reduction<br/>Most reads from cache"]
        Speed["Sub-millisecond Latency<br/>< 1ms response time"]
        Scalability["Handles Millions of Requests/sec<br/>Horizontal scaling"]
        Cost["Reduces Database Costs<br/>Fewer DB queries"]
    end
    
    Patterns --> Benefits
    
    style Session fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Cache fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style RateLimit fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style Queue fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    style Cart fill:#fce4ec,stroke:#880e4f,stroke-width:2px
```

## Redis Cache Strategy Workflow

```mermaid
flowchart TD
    Start([Service Request]) --> CheckCache{Check Redis<br/>Cache?}
    
    CheckCache -->|"Cache Hit"| ReturnCache[Return Cached Data<br/>Sub-millisecond]
    CheckCache -->|"Cache Miss"| QueryDB[Query Database]
    
    QueryDB --> GetData[Get Data from DB<br/>~10-50ms]
    GetData --> StoreCache[Store in Redis<br/>with TTL]
    StoreCache --> ReturnData[Return Data to Client]
    
    ReturnCache --> End([Response])
    ReturnData --> End
    
    StoreCache --> TTLExpiry{TTL Expires?}
    TTLExpiry -->|"Yes"| Evict[Evict from Cache<br/>Next request hits DB]
    TTLExpiry -->|"No"| Keep[Keep in Cache]
    
    Evict --> CheckCache
    Keep --> CheckCache
    
    style ReturnCache fill:#4caf50,stroke:#2e7d32,stroke-width:2px,color:#fff
    style QueryDB fill:#ff9800,stroke:#e65100,stroke-width:2px,color:#fff
```

## Redis Scaling Workflow

```mermaid
sequenceDiagram
    participant Admin as Administrator
    participant Cluster as Redis Cluster
    participant NewNode as New Node
    participant ExistingNodes as Existing Nodes
    participant Client as Redis Client
    
    Note over Admin: Need to Scale Cluster<br/>Add Node for More Capacity
    
    Admin->>Cluster: Add New Node<br/>redis-node-4
    Cluster->>NewNode: Join Cluster<br/>CLUSTER MEET
    NewNode->>ExistingNodes: Announce Presence
    
    ExistingNodes->>ExistingNodes: Calculate Slot Migration<br/>Rebalance Hash Slots
    
    ExistingNodes->>NewNode: Migrate Slots<br/>Move 4096 slots to New Node
    
    NewNode->>NewNode: Accept Slots<br/>Become Primary for Slots
    
    ExistingNodes->>ExistingNodes: Update Cluster Topology<br/>New Slot Distribution
    
    Note over Client: Client Detects Change
    Client->>Cluster: Request (MOVED response)
    Cluster-->>Client: MOVED slot new-node-ip:6379
    
    Client->>Client: Update Slot Map<br/>Refresh Topology
    Client->>NewNode: Route Requests<br/>to New Node
    
    Note over Cluster: Cluster Scaled<br/>4 Nodes Operational
```

## Redis Configuration

| Configuration | Value | Description |
|---------------|-------|-------------|
| **Version** | 7.0.5 | Latest stable version |
| **Mode** | Cluster | High availability, sharding |
| **Initial Nodes** | 3 Primary | Can scale to 10+ nodes |
| **Replicas per Primary** | 1 | Can add more for HA |
| **RAM per Node** | 24GB | Can scale to larger sizes |
| **Total RAM** | 72GB+ | Scales with node count |
| **Hash Slots** | 16384 | Distributed across nodes |
| **Replication** | Async | Data replicated for HA |
| **Failover Time** | < 5 seconds | Automatic failover |
| **Persistence** | AOF + RDB | Both enabled for durability |
| **Max Memory Policy** | allkeys-lru | Evict least recently used |
| **Connection Pool** | 50 per service | Connection pooling |

## Service-Specific Redis Usage

| Service | Pattern | Keys | TTL | Operations |
|---------|--------|------|-----|------------|
| **Gateway** | Rate Limiting | `ratelimit:ip:*` | 1 minute | INCR, EXPIRE |
| **Gateway** | Session | `session:user:*` | 30 minutes | SET, GET, EXPIRE |
| **Auth** | Session | `session:user:*` | 30 minutes | SET, GET, EXPIRE |
| **Auth** | Token Cache | `token:jwt:*` | 15 minutes | SET, GET, EXPIRE |
| **User** | Profile Cache | `user:profile:*` | 10 minutes | SET, GET, EXPIRE |
| **Product** | Catalog | `product:*` | 60 minutes | SET, GET, EXPIRE |
| **Product** | Category | `category:*` | 30 minutes | SET, GET, EXPIRE |
| **Cart** | Cart Data | `cart:user:*` | 7 days | HSET, HGET, EXPIRE |
| **Order** | Status | `order:status:*` | 5 minutes | SET, GET, EXPIRE |
| **Payment** | Transaction | `payment:txn:*` | 1 minute | SET, GET, EXPIRE |
| **Notification** | Queue | `queue:notifications` | N/A | LPUSH, RPOP |
| **Discount** | Coupon | `coupon:*` | 1 hour | SET, GET, EXPIRE |
| **Shipping** | Rates | `shipping:rate:*` | 30 minutes | SET, GET, EXPIRE |

## Performance Metrics

| Metric | Target | Current | Notes |
|--------|--------|---------|-------|
| **Latency (P99)** | < 1ms | 0.5ms | Sub-millisecond |
| **Throughput** | 100K ops/sec | 150K ops/sec | Per node |
| **Cache Hit Rate** | > 80% | 85% | Most requests cached |
| **Memory Usage** | < 80% | 65% | Healthy |
| **Replication Lag** | < 10ms | 5ms | Near real-time |
| **Failover Time** | < 5s | 3s | Automatic |

## Summary

- **Cluster Mode**: Enabled for high availability and sharding
- **Hash Slots**: 16384 slots distributed across 3 primary nodes
- **Replication**: Each primary has 1+ replicas for HA
- **Failover**: Automatic failover in < 5 seconds
- **Scaling**: Can scale from 3 to 10+ nodes
- **Performance**: Sub-millisecond latency, 150K ops/sec per node
- **Cache Hit Rate**: 85% - Most requests served from cache
- **Data Patterns**: Session, Cache, Rate Limiting, Queue, Cart
