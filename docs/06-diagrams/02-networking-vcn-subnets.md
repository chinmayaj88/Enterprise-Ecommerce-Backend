<div align="center">

# 🌐 Networking Architecture - Complete Detailed VCN & Subnets

[![Networking](https://img.shields.io/badge/Networking-VCN-blue?style=for-the-badge)](.)
[![OCI](https://img.shields.io/badge/Cloud-OCI-green?style=flat-square&logo=oracle&logoColor=white)](https://www.oracle.com/cloud/)
[![Subnets](https://img.shields.io/badge/Subnets-Detailed-orange?style=flat-square)](.)

**Complete detailed networking architecture for Production, Staging, and Development environments**

</div>

---

Complete detailed networking architecture with all subnets, security lists, route tables, and network components for **Production, Staging, and Development** environments.

## Complete VCN Architecture

```mermaid
graph TB
    subgraph OCI["Oracle Cloud Infrastructure"]
        subgraph Region["Region: IN-HYDERABAD-1"]
            subgraph VCN["VCN: ecommerce-production-vcn<br/>CIDR: 10.0.0.0/16<br/>DNS Label: ecommerce-prod"]
                
                subgraph AD1["Availability Domain 1 (AD-1)"]
                    subgraph PublicSubnet1["Public Subnet 1<br/>10.0.1.0/24<br/>256 IPs<br/>Route Table: public-rt"]
                        LB1["Load Balancer<br/>Public IP: 129.213.45.67<br/>Flexible: 100-1000 Mbps<br/>Auto-scales to 10 Gbps"]
                        NAT1["NAT Gateway<br/>Public IP: 129.213.45.68<br/>Outbound Internet Access"]
                        SGW1["Service Gateway<br/>OCI Services Access<br/>All OCI Services"]
                    end
                    
                    subgraph PrivateSubnet1["Private Subnet 1<br/>10.0.2.0/24<br/>256 IPs<br/>Route Table: private-rt"]
                        OKE1["OKE Cluster Nodes<br/>Node Pool 1<br/>3-50 nodes<br/>IP Range: 10.0.2.10-10.0.2.200"]
                        Node1["Node 1: 10.0.2.10<br/>Node 2: 10.0.2.11<br/>Node 3: 10.0.2.12"]
                    end
                    
                    subgraph DatabaseSubnet1["Database Subnet 1<br/>10.0.3.0/24<br/>256 IPs<br/>Route Table: database-rt"]
                        ADB_Primary["10 Primary Databases<br/>IP Range: 10.0.3.10-10.0.3.19"]
                        Redis_Primary["Redis Cluster Primary<br/>3 Primary Nodes<br/>IP Range: 10.0.3.20-10.0.3.22"]
                    end
                end
                
                subgraph AD2["Availability Domain 2 (AD-2)"]
                    subgraph PublicSubnet2["Public Subnet 2<br/>10.0.4.0/24<br/>256 IPs<br/>Route Table: public-rt"]
                        LB2["Load Balancer Secondary<br/>Public IP: 129.213.45.69<br/>Backup/Standby"]
                    end
                    
                    subgraph PrivateSubnet2["Private Subnet 2<br/>10.0.5.0/24<br/>256 IPs<br/>Route Table: private-rt"]
                        OKE2["OKE Cluster Nodes<br/>Node Pool 2<br/>3-50 nodes<br/>IP Range: 10.0.5.10-10.0.5.200"]
                        Node4["Node 4: 10.0.5.10<br/>Node 5: 10.0.5.11<br/>Node 6: 10.0.5.12"]
                    end
                    
                    subgraph DatabaseSubnet2["Database Subnet 2<br/>10.0.6.0/24<br/>256 IPs<br/>Route Table: database-rt"]
                        ADB_Replica1["20 Read Replicas<br/>IP Range: 10.0.6.10-10.0.6.29"]
                        Redis_Replica1["Redis Replicas<br/>3 Replica Nodes<br/>IP Range: 10.0.6.30-10.0.6.32"]
                    end
                end
                
                subgraph AD3["Availability Domain 3 (AD-3)"]
                    subgraph PublicSubnet3["Public Subnet 3<br/>10.0.7.0/24<br/>256 IPs<br/>Route Table: public-rt"]
                        LB3["Load Balancer Tertiary<br/>Public IP: 129.213.45.70<br/>Backup/Standby"]
                    end
                    
                    subgraph PrivateSubnet3["Private Subnet 3<br/>10.0.8.0/24<br/>256 IPs<br/>Route Table: private-rt"]
                        OKE3["OKE Cluster Nodes<br/>Node Pool 3<br/>3-50 nodes<br/>IP Range: 10.0.8.10-10.0.8.200"]
                        Node7["Node 7: 10.0.8.10<br/>Node 8: 10.0.8.11<br/>Node 9: 10.0.8.12"]
                    end
                    
                    subgraph DatabaseSubnet3["Database Subnet 3<br/>10.0.9.0/24<br/>256 IPs<br/>Route Table: database-rt"]
                        ADB_Replica2["20 Read Replicas<br/>IP Range: 10.0.9.10-10.0.9.29"]
                        Redis_Replica2["Redis Replicas<br/>3 Replica Nodes<br/>IP Range: 10.0.9.30-10.0.9.32"]
                    end
                end
                
                subgraph Gateways["Gateways"]
                    IGW["Internet Gateway<br/>ecommerce-igw<br/>Inbound Internet Traffic"]
                    NAT["NAT Gateway<br/>ecommerce-nat<br/>Outbound Internet<br/>Public IP: 129.213.45.68"]
                    SGW["Service Gateway<br/>ecommerce-sgw<br/>OCI Services Access"]
                end
            end
        end
    end
    
    %% Connections
    PublicSubnet1 --> LB1
    PublicSubnet1 --> NAT1
    PublicSubnet1 --> SGW1
    PrivateSubnet1 --> OKE1
    DatabaseSubnet1 --> ADB_Primary
    DatabaseSubnet1 --> Redis_Primary
    
    %% Styling
    style VCN fill:#e3f2fd,stroke:#1976d2,stroke-width:4px
    style PublicSubnet1 fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style PrivateSubnet1 fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
    style DatabaseSubnet1 fill:#f3e5f5,stroke:#6a1b9a,stroke-width:3px
    style IGW fill:#ff9800,stroke:#e65100,stroke-width:3px,color:#fff
    style NAT fill:#ff9800,stroke:#e65100,stroke-width:3px,color:#fff
    style SGW fill:#ff9800,stroke:#e65100,stroke-width:3px,color:#fff
```

## Complete Subnet Structure

```mermaid
graph TB
    subgraph VCN_CIDR["VCN: 10.0.0.0/16 (65,536 IPs)"]
        
        subgraph AD1_Block["AD-1 Block: 10.0.0.0/21 (2,048 IPs)"]
            Public1["Public Subnet 1<br/>10.0.1.0/24<br/>256 IPs<br/>Used: ~10 IPs<br/>Available: 246 IPs"]
            Private1["Private Subnet 1<br/>10.0.2.0/24<br/>256 IPs<br/>Used: ~50 IPs<br/>Available: 206 IPs"]
            DB1["Database Subnet 1<br/>10.0.3.0/24<br/>256 IPs<br/>Used: ~30 IPs<br/>Available: 226 IPs"]
            Reserved1["Reserved: 10.0.0.0/24<br/>Future use"]
        end
        
        subgraph AD2_Block["AD-2 Block: 10.0.4.0/21 (2,048 IPs)"]
            Public2["Public Subnet 2<br/>10.0.4.0/24<br/>256 IPs<br/>Used: ~5 IPs<br/>Available: 251 IPs"]
            Private2["Private Subnet 2<br/>10.0.5.0/24<br/>256 IPs<br/>Used: ~50 IPs<br/>Available: 206 IPs"]
            DB2["Database Subnet 2<br/>10.0.6.0/24<br/>256 IPs<br/>Used: ~30 IPs<br/>Available: 226 IPs"]
            Reserved2["Reserved: 10.0.4.0/24<br/>Future use"]
        end
        
        subgraph AD3_Block["AD-3 Block: 10.0.8.0/21 (2,048 IPs)"]
            Public3["Public Subnet 3<br/>10.0.7.0/24<br/>256 IPs<br/>Used: ~5 IPs<br/>Available: 251 IPs"]
            Private3["Private Subnet 3<br/>10.0.8.0/24<br/>256 IPs<br/>Used: ~50 IPs<br/>Available: 206 IPs"]
            DB3["Database Subnet 3<br/>10.0.9.0/24<br/>256 IPs<br/>Used: ~30 IPs<br/>Available: 226 IPs"]
            Reserved3["Reserved: 10.0.8.0/24<br/>Future use"]
        end
        
        subgraph Future["Future Expansion: 10.0.16.0/20<br/>4,096 IPs Reserved"]
            FutureBlock["Reserved for:<br/>- Additional regions<br/>- VPN connections<br/>- Peering"]
        end
    end
    
    style VCN_CIDR fill:#e3f2fd,stroke:#1976d2,stroke-width:4px
    style Public1 fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style Private1 fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style DB1 fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
```

## Detailed Security Lists

### Public Subnet Security List

```mermaid
graph TB
    subgraph PublicSL["Public Security List<br/>ecommerce-production-public-sl"]
        
        subgraph IngressRules["Ingress Rules (Inbound)"]
            Rule1["Rule 1: HTTP<br/>Source: 0.0.0.0/0<br/>Protocol: TCP<br/>Port: 80<br/>Description: HTTP traffic"]
            Rule2["Rule 2: HTTPS<br/>Source: 0.0.0.0/0<br/>Protocol: TCP<br/>Port: 443<br/>Description: HTTPS traffic"]
            Rule3["Rule 3: ICMP<br/>Source: 0.0.0.0/0<br/>Protocol: ICMP<br/>Type: 3, Code: 4<br/>Description: Path MTU Discovery"]
            Rule4["Rule 4: Load Balancer Health<br/>Source: OCI LB Service<br/>Protocol: TCP<br/>Port: 80, 443<br/>Description: Health checks"]
        end
        
        subgraph EgressRules["Egress Rules (Outbound)"]
            Egress1["Rule 1: All Traffic<br/>Destination: 0.0.0.0/0<br/>Protocol: All<br/>Description: Allow all outbound"]
        end
    end
    
    PublicSL --> IngressRules
    PublicSL --> EgressRules
    
    style PublicSL fill:#ffebee,stroke:#c62828,stroke-width:3px
    style IngressRules fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style EgressRules fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
```

### Private Subnet Security List

```mermaid
graph TB
    subgraph PrivateSL["Private Security List<br/>ecommerce-production-private-sl"]
        
        subgraph IngressRules["Ingress Rules (Inbound)"]
            Rule1["Rule 1: OKE Nodes<br/>Source: 10.0.0.0/16<br/>Protocol: TCP<br/>Port: 10250<br/>Description: Kubelet API"]
            Rule2["Rule 2: OKE Nodes<br/>Source: 10.0.0.0/16<br/>Protocol: TCP<br/>Port: 10255<br/>Description: Kubelet Read-only"]
            Rule3["Rule 3: Services<br/>Source: 10.0.0.0/16<br/>Protocol: TCP<br/>Port: 3000-3010<br/>Description: Microservices"]
            Rule4["Rule 4: Ingress Controller<br/>Source: 10.0.1.0/24<br/>Protocol: TCP<br/>Port: 80, 443<br/>Description: From Load Balancer"]
            Rule5["Rule 5: Node Communication<br/>Source: 10.0.2.0/24, 10.0.5.0/24, 10.0.8.0/24<br/>Protocol: TCP<br/>Port: 10248-10250<br/>Description: K8s node communication"]
            Rule6["Rule 6: ICMP<br/>Source: 10.0.0.0/16<br/>Protocol: ICMP<br/>Description: Ping within VCN"]
            Rule7["Rule 7: DNS<br/>Source: 10.0.0.0/16<br/>Protocol: UDP<br/>Port: 53<br/>Description: DNS queries"]
        end
        
        subgraph EgressRules["Egress Rules (Outbound)"]
            Egress1["Rule 1: All Traffic<br/>Destination: 0.0.0.0/0<br/>Protocol: All<br/>Description: Allow all outbound<br/>(via NAT Gateway)"]
            Egress2["Rule 2: OCI Services<br/>Destination: All OCI Services<br/>Protocol: All<br/>Description: Via Service Gateway"]
        end
    end
    
    PrivateSL --> IngressRules
    PrivateSL --> EgressRules
    
    style PrivateSL fill:#ffebee,stroke:#c62828,stroke-width:3px
    style IngressRules fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style EgressRules fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
```

### Database Subnet Security List

```mermaid
graph TB
    subgraph DatabaseSL["Database Security List<br/>ecommerce-production-database-sl"]
        
        subgraph IngressRules["Ingress Rules (Inbound)"]
            Rule1["Rule 1: PostgreSQL<br/>Source: 10.0.2.0/24, 10.0.5.0/24, 10.0.8.0/24<br/>Protocol: TCP<br/>Port: 5432<br/>Description: Database access from OKE nodes"]
            Rule2["Rule 2: Redis<br/>Source: 10.0.2.0/24, 10.0.5.0/24, 10.0.8.0/24<br/>Protocol: TCP<br/>Port: 6379<br/>Description: Redis access from OKE nodes"]
            Rule3["Rule 3: Redis Cluster<br/>Source: 10.0.3.0/24, 10.0.6.0/24, 10.0.9.0/24<br/>Protocol: TCP<br/>Port: 16379<br/>Description: Redis cluster bus"]
            Rule4["Rule 4: Database Replication<br/>Source: 10.0.3.0/24, 10.0.6.0/24, 10.0.9.0/24<br/>Protocol: TCP<br/>Port: 5432<br/>Description: Database replication"]
            Rule5["Rule 5: ICMP<br/>Source: 10.0.0.0/16<br/>Protocol: ICMP<br/>Description: Ping within VCN"]
            Rule6["Rule 6: Health Checks<br/>Source: OCI ADB Service<br/>Protocol: TCP<br/>Port: 1521<br/>Description: ADB health checks"]
        end
        
        subgraph EgressRules["Egress Rules (Outbound)"]
            Egress1["Rule 1: VCN Only<br/>Destination: 10.0.0.0/16<br/>Protocol: All<br/>Description: Only VCN traffic"]
            Egress2["Rule 2: Database Replication<br/>Destination: 10.0.3.0/24, 10.0.6.0/24, 10.0.9.0/24<br/>Protocol: TCP<br/>Port: 5432<br/>Description: Replication traffic"]
            Egress3["Rule 3: Redis Cluster<br/>Destination: 10.0.3.0/24, 10.0.6.0/24, 10.0.9.0/24<br/>Protocol: TCP<br/>Port: 16379<br/>Description: Redis cluster communication"]
        end
    end
    
    DatabaseSL --> IngressRules
    DatabaseSL --> EgressRules
    
    style DatabaseSL fill:#ffebee,stroke:#c62828,stroke-width:3px
    style IngressRules fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style EgressRules fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
```

## Complete Security List Rules Table

| Security List | Rule # | Type | Source/Destination | Protocol | Port | Description |
|---------------|--------|------|-------------------|----------|------|-------------|
| **Public SL** | 1 | Ingress | 0.0.0.0/0 | TCP | 80 | HTTP traffic |
| **Public SL** | 2 | Ingress | 0.0.0.0/0 | TCP | 443 | HTTPS traffic |
| **Public SL** | 3 | Ingress | 0.0.0.0/0 | ICMP | - | Path MTU Discovery |
| **Public SL** | 4 | Ingress | OCI LB Service | TCP | 80, 443 | Load Balancer health checks |
| **Public SL** | 1 | Egress | 0.0.0.0/0 | All | All | All outbound traffic |
| **Private SL** | 1 | Ingress | 10.0.0.0/16 | TCP | 10250 | Kubelet API |
| **Private SL** | 2 | Ingress | 10.0.0.0/16 | TCP | 10255 | Kubelet Read-only |
| **Private SL** | 3 | Ingress | 10.0.0.0/16 | TCP | 3000-3010 | Microservices ports |
| **Private SL** | 4 | Ingress | 10.0.1.0/24 | TCP | 80, 443 | From Load Balancer |
| **Private SL** | 5 | Ingress | 10.0.2.0/24, 10.0.5.0/24, 10.0.8.0/24 | TCP | 10248-10250 | K8s node communication |
| **Private SL** | 6 | Ingress | 10.0.0.0/16 | ICMP | - | Ping within VCN |
| **Private SL** | 7 | Ingress | 10.0.0.0/16 | UDP | 53 | DNS queries |
| **Private SL** | 1 | Egress | 0.0.0.0/0 | All | All | All outbound (via NAT) |
| **Private SL** | 2 | Egress | All OCI Services | All | All | OCI services (via SGW) |
| **Database SL** | 1 | Ingress | 10.0.2.0/24, 10.0.5.0/24, 10.0.8.0/24 | TCP | 5432 | PostgreSQL from OKE |
| **Database SL** | 2 | Ingress | 10.0.2.0/24, 10.0.5.0/24, 10.0.8.0/24 | TCP | 6379 | Redis from OKE |
| **Database SL** | 3 | Ingress | 10.0.3.0/24, 10.0.6.0/24, 10.0.9.0/24 | TCP | 16379 | Redis cluster bus |
| **Database SL** | 4 | Ingress | 10.0.3.0/24, 10.0.6.0/24, 10.0.9.0/24 | TCP | 5432 | Database replication |
| **Database SL** | 5 | Ingress | 10.0.0.0/16 | ICMP | - | Ping within VCN |
| **Database SL** | 6 | Ingress | OCI ADB Service | TCP | 1521 | ADB health checks |
| **Database SL** | 1 | Egress | 10.0.0.0/16 | All | All | Only VCN traffic |
| **Database SL** | 2 | Egress | 10.0.3.0/24, 10.0.6.0/24, 10.0.9.0/24 | TCP | 5432 | Database replication |
| **Database SL** | 3 | Egress | 10.0.3.0/24, 10.0.6.0/24, 10.0.9.0/24 | TCP | 16379 | Redis cluster communication |

## Route Tables

### Public Route Table

```mermaid
graph TB
    subgraph PublicRT["Public Route Table<br/>ecommerce-production-public-rt"]
        Route1["Route 1: Internet<br/>Destination: 0.0.0.0/0<br/>Target: Internet Gateway<br/>Description: All internet traffic"]
        Route2["Route 2: VCN Local<br/>Destination: 10.0.0.0/16<br/>Target: Local VCN<br/>Description: VCN internal traffic"]
    end
    
    PublicRT --> Route1
    PublicRT --> Route2
    
    style PublicRT fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
```

### Private Route Table

```mermaid
graph TB
    subgraph PrivateRT["Private Route Table<br/>ecommerce-production-private-rt"]
        Route1["Route 1: Internet<br/>Destination: 0.0.0.0/0<br/>Target: NAT Gateway<br/>Description: Outbound internet via NAT"]
        Route2["Route 2: OCI Services<br/>Destination: All OCI Services<br/>Target: Service Gateway<br/>Description: OCI services access"]
        Route3["Route 3: VCN Local<br/>Destination: 10.0.0.0/16<br/>Target: Local VCN<br/>Description: VCN internal traffic"]
    end
    
    PrivateRT --> Route1
    PrivateRT --> Route2
    PrivateRT --> Route3
    
    style PrivateRT fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
```

### Database Route Table

```mermaid
graph TB
    subgraph DatabaseRT["Database Route Table<br/>ecommerce-production-database-rt"]
        Route1["Route 1: VCN Local Only<br/>Destination: 10.0.0.0/16<br/>Target: Local VCN<br/>Description: No internet access<br/>Isolated subnet"]
    end
    
    DatabaseRT --> Route1
    
    style DatabaseRT fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
```

## Complete Route Table Configuration

| Route Table | Route # | Destination | Target | Description |
|-------------|---------|-------------|--------|-------------|
| **Public RT** | 1 | 0.0.0.0/0 | Internet Gateway | All internet traffic |
| **Public RT** | 2 | 10.0.0.0/16 | Local VCN | VCN internal traffic |
| **Private RT** | 1 | 0.0.0.0/0 | NAT Gateway | Outbound internet via NAT |
| **Private RT** | 2 | All OCI Services | Service Gateway | OCI services access |
| **Private RT** | 3 | 10.0.0.0/16 | Local VCN | VCN internal traffic |
| **Database RT** | 1 | 10.0.0.0/16 | Local VCN | No internet access (isolated) |

## Network Traffic Flow Workflow

```mermaid
sequenceDiagram
    participant Internet as Internet User
    participant CDN as OCI CDN
    participant WAF as WAF
    participant IGW as Internet Gateway
    participant LB as Load Balancer<br/>Public Subnet
    participant Ingress as NGINX Ingress<br/>Private Subnet
    participant Service as Service Pod<br/>Private Subnet
    participant NAT as NAT Gateway
    participant DB as Database<br/>Database Subnet
    participant Redis as Redis<br/>Database Subnet
    
    Note over Internet,CDN: External Request Flow
    Internet->>CDN: HTTPS Request
    CDN->>WAF: Forward Request
    WAF->>WAF: Security Check<br/>(DDoS, SQL Injection)
    WAF->>IGW: Forward Safe Request
    IGW->>LB: Route to Load Balancer<br/>(Public Subnet 10.0.1.0/24)
    LB->>Ingress: Route to Ingress<br/>(Private Subnet 10.0.2.0/24)
    Ingress->>Service: Route to Service Pod
    
    Note over Service,Redis: Internal Request Flow
    Service->>Redis: Check Cache<br/>(Database Subnet 10.0.3.0/24)
    alt Cache Miss
        Service->>DB: Query Database<br/>(Database Subnet 10.0.3.0/24)
        DB-->>Service: Return Data
        Service->>Redis: Store in Cache
    else Cache Hit
        Redis-->>Service: Return Cached Data
    end
    
    Note over Service,NAT: Outbound Request Flow
    Service->>NAT: Outbound API Call<br/>(e.g., External Payment Gateway)
    NAT->>NAT: NAT Translation<br/>(Private IP → Public IP)
    NAT->>Internet: Forward Request
    
    Service-->>Ingress: Response
    Ingress-->>LB: Response
    LB-->>IGW: Response
    IGW-->>WAF: Response
    WAF-->>CDN: Response
    CDN-->>Internet: Final Response
```

## Subnet to Route Table Mapping

```mermaid
graph LR
    subgraph Subnets["Subnets"]
        Public1["Public Subnet 1<br/>10.0.1.0/24"]
        Public2["Public Subnet 2<br/>10.0.4.0/24"]
        Public3["Public Subnet 3<br/>10.0.7.0/24"]
        Private1["Private Subnet 1<br/>10.0.2.0/24"]
        Private2["Private Subnet 2<br/>10.0.5.0/24"]
        Private3["Private Subnet 3<br/>10.0.8.0/24"]
        DB1["Database Subnet 1<br/>10.0.3.0/24"]
        DB2["Database Subnet 2<br/>10.0.6.0/24"]
        DB3["Database Subnet 3<br/>10.0.9.0/24"]
    end
    
    subgraph RouteTables["Route Tables"]
        PublicRT["Public Route Table<br/>public-rt"]
        PrivateRT["Private Route Table<br/>private-rt"]
        DatabaseRT["Database Route Table<br/>database-rt"]
    end
    
    Public1 --> PublicRT
    Public2 --> PublicRT
    Public3 --> PublicRT
    Private1 --> PrivateRT
    Private2 --> PrivateRT
    Private3 --> PrivateRT
    DB1 --> DatabaseRT
    DB2 --> DatabaseRT
    DB3 --> DatabaseRT
    
    style PublicRT fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style PrivateRT fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
    style DatabaseRT fill:#f3e5f5,stroke:#6a1b9a,stroke-width:3px
```

## Subnet to Security List Mapping

```mermaid
graph LR
    subgraph Subnets["Subnets"]
        Public1["Public Subnet 1<br/>10.0.1.0/24"]
        Public2["Public Subnet 2<br/>10.0.4.0/24"]
        Public3["Public Subnet 3<br/>10.0.7.0/24"]
        Private1["Private Subnet 1<br/>10.0.2.0/24"]
        Private2["Private Subnet 2<br/>10.0.5.0/24"]
        Private3["Private Subnet 3<br/>10.0.8.0/24"]
        DB1["Database Subnet 1<br/>10.0.3.0/24"]
        DB2["Database Subnet 2<br/>10.0.6.0/24"]
        DB3["Database Subnet 3<br/>10.0.9.0/24"]
    end
    
    subgraph SecurityLists["Security Lists"]
        PublicSL["Public Security List<br/>public-sl"]
        PrivateSL["Private Security List<br/>private-sl"]
        DatabaseSL["Database Security List<br/>database-sl"]
    end
    
    Public1 --> PublicSL
    Public2 --> PublicSL
    Public3 --> PublicSL
    Private1 --> PrivateSL
    Private2 --> PrivateSL
    Private3 --> PrivateSL
    DB1 --> DatabaseSL
    DB2 --> DatabaseSL
    DB3 --> DatabaseSL
    
    style PublicSL fill:#ffebee,stroke:#c62828,stroke-width:3px
    style PrivateSL fill:#ffebee,stroke:#c62828,stroke-width:3px
    style DatabaseSL fill:#ffebee,stroke:#c62828,stroke-width:3px
```

## IP Address Allocation

| Subnet | CIDR | Total IPs | Reserved | Usable | Used | Available |
|--------|------|-----------|----------|--------|------|-----------|
| **Public Subnet 1** | 10.0.1.0/24 | 256 | 5 | 251 | 10 | 241 |
| **Public Subnet 2** | 10.0.4.0/24 | 256 | 5 | 251 | 5 | 246 |
| **Public Subnet 3** | 10.0.7.0/24 | 256 | 5 | 251 | 5 | 246 |
| **Private Subnet 1** | 10.0.2.0/24 | 256 | 5 | 251 | 50 | 201 |
| **Private Subnet 2** | 10.0.5.0/24 | 256 | 5 | 251 | 50 | 201 |
| **Private Subnet 3** | 10.0.8.0/24 | 256 | 5 | 251 | 50 | 201 |
| **Database Subnet 1** | 10.0.3.0/24 | 256 | 5 | 251 | 30 | 221 |
| **Database Subnet 2** | 10.0.6.0/24 | 256 | 5 | 251 | 30 | 221 |
| **Database Subnet 3** | 10.0.9.0/24 | 256 | 5 | 251 | 30 | 221 |
| **Total** | 10.0.0.0/16 | 65,536 | - | - | 260 | 65,276 |

## Gateway Configuration

| Gateway | Type | Purpose | Public IP | Associated Subnets |
|---------|------|---------|-----------|-------------------|
| **Internet Gateway** | IGW | Inbound internet traffic | N/A | Public Subnets (1, 2, 3) |
| **NAT Gateway** | NAT | Outbound internet for private subnets | 129.213.45.68 | Private Subnets (1, 2, 3) |
| **Service Gateway** | SGW | OCI services access | N/A | Private Subnets (1, 2, 3) |

## Network Security Groups (NSGs) - Optional Advanced Security

```mermaid
graph TB
    subgraph NSGs["Network Security Groups<br/>(Optional - Advanced Security)"]
        
        subgraph OKE_NSG["OKE Nodes NSG<br/>ecommerce-oke-nodes-nsg"]
            OKE_Ingress["Ingress:<br/>- TCP 10250 from Control Plane<br/>- TCP 3000-3010 from LB<br/>- ICMP from VCN"]
            OKE_Egress["Egress:<br/>- All to 0.0.0.0/0<br/>- All to OCI Services"]
        end
        
        subgraph DB_NSG["Database NSG<br/>ecommerce-database-nsg"]
            DB_Ingress["Ingress:<br/>- TCP 5432 from OKE NSG<br/>- TCP 6379 from OKE NSG<br/>- TCP 16379 from DB NSG"]
            DB_Egress["Egress:<br/>- All to VCN only"]
        end
        
        subgraph LB_NSG["Load Balancer NSG<br/>ecommerce-lb-nsg"]
            LB_Ingress["Ingress:<br/>- TCP 80, 443 from 0.0.0.0/0"]
            LB_Egress["Egress:<br/>- TCP 80, 443 to OKE NSG"]
        end
    end
    
    NSGs --> OKE_NSG
    NSGs --> DB_NSG
    NSGs --> LB_NSG
    
    style NSGs fill:#f3e5f5,stroke:#6a1b9a,stroke-width:3px
```

## DNS Configuration

```mermaid
graph TB
    subgraph DNS["DNS Configuration"]
        VCN_DNS["VCN DNS<br/>ecommerce-prod.oraclevcn.com"]
        CustomDNS["Custom DNS<br/>api.ecommerce.com<br/>admin.ecommerce.com"]
        ServiceDNS["Service DNS<br/>gateway.ecommerce-prod.svc.cluster.local<br/>(Kubernetes)"]
    end
    
    subgraph Resolvers["DNS Resolvers"]
        VCNResolver["VCN Resolver<br/>169.254.169.254"]
        InternetResolver["Internet Resolver<br/>8.8.8.8, 1.1.1.1"]
    end
    
    VCN_DNS --> VCNResolver
    CustomDNS --> InternetResolver
    ServiceDNS --> VCNResolver
    
    style DNS fill:#e1f5ff,stroke:#01579b,stroke-width:2px
```

## Network Flow Summary

### Inbound Flow (Internet → Services)

```
Internet → CDN → WAF → Internet Gateway → Load Balancer (Public Subnet) 
→ NGINX Ingress (Private Subnet) → Service Pods (Private Subnet)
```

### Outbound Flow (Services → Internet)

```
Service Pods (Private Subnet) → NAT Gateway (Public Subnet) → Internet Gateway → Internet
```

### Internal Flow (VCN → VCN)

```
Service Pods (Private Subnet) → Database/Redis (Database Subnet)
Service Pods (Private Subnet) → OCI Services (via Service Gateway)
```

### Database Replication Flow

```
Primary DB (Database Subnet 1) → Read Replicas (Database Subnet 2, 3)
Redis Primary (Database Subnet 1) → Redis Replicas (Database Subnet 2, 3)
```

## Network Components Summary

| Component | Count | Configuration | Purpose |
|-----------|-------|---------------|---------|
| **VCN** | 1 | 10.0.0.0/16 | Main network |
| **Public Subnets** | 3 | 10.0.1.0/24, 10.0.4.0/24, 10.0.7.0/24 | Load balancer, NAT, Service Gateway |
| **Private Subnets** | 3 | 10.0.2.0/24, 10.0.5.0/24, 10.0.8.0/24 | OKE cluster nodes |
| **Database Subnets** | 3 | 10.0.3.0/24, 10.0.6.0/24, 10.0.9.0/24 | Databases, Redis |
| **Internet Gateway** | 1 | - | Inbound internet traffic |
| **NAT Gateway** | 1 | Public IP: 129.213.45.68 | Outbound internet for private subnets |
| **Service Gateway** | 1 | - | OCI services access |
| **Security Lists** | 3 | Public, Private, Database | Network security rules |
| **Route Tables** | 3 | Public, Private, Database | Traffic routing rules |
| **Load Balancers** | 3 | Public IPs | Traffic distribution |

## Security Best Practices

1. **Least Privilege**: Security lists only allow necessary ports
2. **Network Isolation**: Database subnets have no internet access
3. **Private Subnets**: OKE nodes in private subnets, no direct internet access
4. **NAT Gateway**: All outbound traffic goes through NAT (single public IP)
5. **Service Gateway**: OCI services accessed without internet routing
6. **Separate Security Lists**: Different rules for public, private, and database subnets
7. **VCN-Only Traffic**: Database subnets only allow VCN internal traffic

## Multi-Environment VCN Architecture

```mermaid
graph TB
    subgraph OCI["Oracle Cloud Infrastructure"]
        subgraph Region["Region: IN-HYDERABAD-1"]
            
            subgraph ProdVCN["Production VCN<br/>ecommerce-production-vcn<br/>CIDR: 10.0.0.0/16"]
                ProdPublic["Public Subnets<br/>10.0.1.0/24, 10.0.4.0/24, 10.0.7.0/24"]
                ProdPrivate["Private Subnets<br/>10.0.2.0/24, 10.0.5.0/24, 10.0.8.0/24"]
                ProdDB["Database Subnets<br/>10.0.3.0/24, 10.0.6.0/24, 10.0.9.0/24"]
                ProdIGW["Internet Gateway<br/>Production Only"]
                ProdNAT["NAT Gateway<br/>Production Only"]
            end
            
            subgraph StagingVCN["Staging VCN<br/>ecommerce-staging-vcn<br/>CIDR: 10.1.0.0/16"]
                StagingPublic["Public Subnets<br/>10.1.1.0/24, 10.1.4.0/24, 10.1.7.0/24"]
                StagingPrivate["Private Subnets<br/>10.1.2.0/24, 10.1.5.0/24, 10.1.8.0/24"]
                StagingDB["Database Subnets<br/>10.1.3.0/24, 10.1.6.0/24, 10.1.9.0/24"]
                StagingIGW["Internet Gateway<br/>Staging Only"]
                StagingNAT["NAT Gateway<br/>Staging Only"]
            end
            
            subgraph DevVCN["Development VCN<br/>ecommerce-development-vcn<br/>CIDR: 10.2.0.0/16"]
                DevPublic["Public Subnets<br/>10.2.1.0/24"]
                DevPrivate["Private Subnets<br/>10.2.2.0/24"]
                DevDB["Database Subnets<br/>10.2.3.0/24"]
                DevIGW["Internet Gateway<br/>Dev Only"]
                DevNAT["NAT Gateway<br/>Dev Only"]
            end
        end
    end
    
    %% No connections between environments - isolated
    ProdVCN -.->|"NO ACCESS"| StagingVCN
    ProdVCN -.->|"NO ACCESS"| DevVCN
    StagingVCN -.->|"NO ACCESS"| DevVCN
    
    style ProdVCN fill:#c62828,stroke:#b71c1c,stroke-width:4px,color:#fff
    style StagingVCN fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
    style DevVCN fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
```

## Environment Network Isolation

| Environment | VCN CIDR | Purpose | Isolation Level |
|-------------|----------|---------|-----------------|
| **Production** | 10.0.0.0/16 | Live production traffic | 🔴 **STRICT** - No access from other environments |
| **Staging** | 10.1.0.0/16 | Pre-production testing | 🟠 **MODERATE** - Isolated from prod, can access dev |
| **Development** | 10.2.0.0/16 | Developer testing | 🟢 **RELAXED** - Can access staging, NOT prod |

## Staging VCN Configuration

### Staging VCN Structure

```mermaid
graph TB
    subgraph StagingVCN["Staging VCN: ecommerce-staging-vcn<br/>CIDR: 10.1.0.0/16"]
        
        subgraph StagingAD1["AD-1"]
            StagingPublic1["Public Subnet 1<br/>10.1.1.0/24<br/>Load Balancer, NAT, SGW"]
            StagingPrivate1["Private Subnet 1<br/>10.1.2.0/24<br/>OKE Nodes"]
            StagingDB1["Database Subnet 1<br/>10.1.3.0/24<br/>Databases, Redis"]
        end
        
        subgraph StagingAD2["AD-2"]
            StagingPublic2["Public Subnet 2<br/>10.1.4.0/24"]
            StagingPrivate2["Private Subnet 2<br/>10.1.5.0/24<br/>OKE Nodes"]
            StagingDB2["Database Subnet 2<br/>10.1.6.0/24<br/>Read Replicas"]
        end
        
        subgraph StagingAD3["AD-3"]
            StagingPublic3["Public Subnet 3<br/>10.1.7.0/24"]
            StagingPrivate3["Private Subnet 3<br/>10.1.8.0/24<br/>OKE Nodes"]
            StagingDB3["Database Subnet 3<br/>10.1.9.0/24<br/>Read Replicas"]
        end
    end
    
    style StagingVCN fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
```

### Staging Security Lists

| Security List | Ingress Rules | Egress Rules | Notes |
|---------------|---------------|--------------|-------|
| **Staging Public SL** | TCP 80, 443 from 0.0.0.0/0 | All to 0.0.0.0/0 | Similar to prod, but less restrictive |
| **Staging Private SL** | TCP 3000-3010 from 10.1.0.0/16<br/>TCP 10250 from 10.1.0.0/16 | All to 0.0.0.0/0 | OKE nodes can access internet |
| **Staging Database SL** | TCP 5432, 6379 from 10.1.2.0/24, 10.1.5.0/24, 10.1.8.0/24 | All to 10.1.0.0/16 | VCN only, NO prod access |

## Development VCN Configuration

### Development VCN Structure

```mermaid
graph TB
    subgraph DevVCN["Development VCN: ecommerce-development-vcn<br/>CIDR: 10.2.0.0/16"]
        
        subgraph DevAD1["AD-1 (Single AD for Dev)"]
            DevPublic1["Public Subnet<br/>10.2.1.0/24<br/>Load Balancer, NAT"]
            DevPrivate1["Private Subnet<br/>10.2.2.0/24<br/>OKE Nodes (1-5 nodes)"]
            DevDB1["Database Subnet<br/>10.2.3.0/24<br/>Databases, Redis"]
        end
    end
    
    style DevVCN fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
```

### Development Security Lists

| Security List | Ingress Rules | Egress Rules | Notes |
|---------------|---------------|--------------|-------|
| **Dev Public SL** | TCP 80, 443 from 0.0.0.0/0<br/>TCP 22 from Developer IPs | All to 0.0.0.0/0 | SSH access for debugging |
| **Dev Private SL** | TCP 3000-3010 from 10.2.0.0/16<br/>TCP 10250 from 10.2.0.0/16<br/>TCP 22 from Developer IPs | All to 0.0.0.0/0 | More permissive for development |
| **Dev Database SL** | TCP 5432, 6379 from 10.2.2.0/24<br/>TCP 5432 from Developer IPs | All to 10.2.0.0/16 | Direct DB access for devs |

## Environment Comparison

| Aspect | Production | Staging | Development |
|--------|-----------|---------|-------------|
| **VCN CIDR** | 10.0.0.0/16 | 10.1.0.0/16 | 10.2.0.0/16 |
| **Availability Domains** | 3 ADs | 3 ADs | 1 AD |
| **OKE Nodes** | 3-50 nodes | 3-20 nodes | 1-5 nodes |
| **Database Size** | 2-128 OCPUs | 2-16 OCPUs | 2-4 OCPUs |
| **Redis Nodes** | 3-10 nodes | 3-5 nodes | 1-3 nodes |
| **Load Balancer** | Flexible (100-10Gbps) | Flexible (10-1000 Mbps) | Flexible (10-100 Mbps) |
| **Security Level** | 🔴 STRICT | 🟠 MODERATE | 🟢 RELAXED |
| **Internet Access** | Via NAT only | Via NAT only | Via NAT + Direct |
| **SSH Access** | ❌ Blocked | ❌ Blocked | ✅ Allowed (from dev IPs) |
| **Cost** | High | Medium | Low |

## Cross-Environment Security Rules

### Production Protection Rules

```mermaid
graph TB
    subgraph ProdProtection["Production Protection Rules"]
        Rule1["Rule 1: Block Staging<br/>Deny: 10.1.0.0/16 → 10.0.0.0/16<br/>All protocols, all ports"]
        Rule2["Rule 2: Block Development<br/>Deny: 10.2.0.0/16 → 10.0.0.0/16<br/>All protocols, all ports"]
        Rule3["Rule 3: Block External Access<br/>Deny: 0.0.0.0/0 → 10.0.3.0/24, 10.0.6.0/24, 10.0.9.0/24<br/>Database subnets isolated"]
        Rule4["Rule 4: Allow Only Internal<br/>Allow: 10.0.0.0/16 → 10.0.0.0/16<br/>VCN internal only"]
    end
    
    style ProdProtection fill:#c62828,stroke:#b71c1c,stroke-width:3px,color:#fff
```

### Staging Access Rules

```mermaid
graph TB
    subgraph StagingAccess["Staging Access Rules"]
        Rule1["Rule 1: Block Production<br/>Deny: 10.1.0.0/16 → 10.0.0.0/16<br/>Cannot access prod"]
        Rule2["Rule 2: Allow Development<br/>Allow: 10.2.0.0/16 → 10.1.0.0/16<br/>Dev can access staging<br/>(Read-only)"]
        Rule3["Rule 3: Allow Internet<br/>Allow: 10.1.0.0/16 → 0.0.0.0/0<br/>Via NAT Gateway"]
    end
    
    style StagingAccess fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
```

### Development Access Rules

```mermaid
graph TB
    subgraph DevAccess["Development Access Rules"]
        Rule1["Rule 1: Block Production<br/>Deny: 10.2.0.0/16 → 10.0.0.0/16<br/>Cannot access prod"]
        Rule2["Rule 2: Allow Staging Read<br/>Allow: 10.2.0.0/16 → 10.1.0.0/16<br/>Read-only access to staging"]
        Rule3["Rule 3: Allow Internet<br/>Allow: 10.2.0.0/16 → 0.0.0.0/0<br/>Via NAT + Direct"]
        Rule4["Rule 4: Allow SSH<br/>Allow: Developer IPs → 10.2.0.0/16<br/>Port 22 for debugging"]
    end
    
    style DevAccess fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
```

## Complete Environment Network Summary

| Environment | VCN | Public Subnets | Private Subnets | Database Subnets | Gateways |
|-------------|-----|----------------|-----------------|------------------|----------|
| **Production** | 10.0.0.0/16 | 3 (10.0.1.0/24, 10.0.4.0/24, 10.0.7.0/24) | 3 (10.0.2.0/24, 10.0.5.0/24, 10.0.8.0/24) | 3 (10.0.3.0/24, 10.0.6.0/24, 10.0.9.0/24) | IGW, NAT, SGW |
| **Staging** | 10.1.0.0/16 | 3 (10.1.1.0/24, 10.1.4.0/24, 10.1.7.0/24) | 3 (10.1.2.0/24, 10.1.5.0/24, 10.1.8.0/24) | 3 (10.1.3.0/24, 10.1.6.0/24, 10.1.9.0/24) | IGW, NAT, SGW |
| **Development** | 10.2.0.0/16 | 1 (10.2.1.0/24) | 1 (10.2.2.0/24) | 1 (10.2.3.0/24) | IGW, NAT |

## Security Isolation Matrix

| From Environment | To Production | To Staging | To Development |
|------------------|---------------|------------|----------------|
| **Production** | ✅ Full Access | ❌ Blocked | ❌ Blocked |
| **Staging** | ❌ **BLOCKED** | ✅ Full Access | ✅ Read-only |
| **Development** | ❌ **BLOCKED** | ✅ Read-only | ✅ Full Access |

**Key Security Principle**: Production resources are **completely isolated** and cannot be accessed from staging or development environments.

---

**Next**: [IAM Roles & Policies](./03-iam-roles-policies.md) for security foundation with environment-specific roles
