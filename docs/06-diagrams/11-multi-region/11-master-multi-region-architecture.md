<div align="center">

# 🌍 Master Multi-Region Architecture Diagram

[![Multi-Region](https://img.shields.io/badge/Multi-Region-Architecture-blue?style=for-the-badge)](.)
[![Global](https://img.shields.io/badge/Global-Infrastructure-green?style=flat-square)](.)
[![Complete](https://img.shields.io/badge/Diagram-Complete-orange?style=flat-square)](.)

**Complete visual representation of the multi-region deployment**

</div>

---

Complete visual representation of the multi-region deployment with India as primary, Russia as secondary, and Mumbai as DR.

## Complete Multi-Region Architecture

```mermaid
graph TB
    subgraph Global["🌍 GLOBAL INFRASTRUCTURE"]
        CDN["OCI CDN<br/>Edge Locations<br/>200+ locations worldwide"]
        DNS["Global DNS<br/>Geographic Routing<br/>Route by user location"]
        WAF["WAF<br/>Global Protection<br/>DDoS, SQL Injection"]
    end
    
    subgraph IndiaPrimary["🇮🇳 INDIA - HYDERABAD (PRIMARY/MASTER)"]
        subgraph IndiaVCN["VCN: ecommerce-production-vcn"]
            subgraph IndiaAD1["Availability Domain 1"]
                IndiaOKE["OKE Cluster<br/>50+ nodes<br/>Full Production"]
                IndiaServices["11 Microservices<br/>100+ pods<br/>All services active"]
                IndiaDB_P["10 Primary Databases<br/>🔵 WRITE MASTER<br/>All writes go here"]
            end
            
            subgraph IndiaAD2["Availability Domain 2"]
                IndiaRR1["10 Read Replicas<br/>🟢 Read-only<br/>Replication < 1 sec"]
            end
            
            subgraph IndiaAD3["Availability Domain 3"]
                IndiaRR2["10 Read Replicas<br/>🟢 Read-only<br/>Replication < 1 sec"]
            end
            
            IndiaRedis["Redis Cluster<br/>10 nodes<br/>Local cache"]
            IndiaLB["Load Balancer<br/>Indian users"]
            IndiaStream["OCI Streaming<br/>Event processing"]
        end
    end
    
    subgraph RussiaSecondary["🇷🇺 RUSSIA - MOSCOW (SECONDARY ACTIVE)"]
        subgraph RussiaVCN["VCN: ecommerce-russia-vcn"]
            RussiaOKE["OKE Cluster<br/>30 nodes<br/>Active for Russian users"]
            RussiaServices["11 Microservices<br/>70 pods<br/>All services active"]
            RussiaDB_RR["10 Read Replicas<br/>🟡 Read-only<br/>Replicated from India<br/>Lag < 5 min"]
            RussiaRedis["Redis Cluster<br/>5 nodes<br/>Local cache"]
            RussiaLB["Load Balancer<br/>Russian users"]
            RussiaStream["OCI Streaming<br/>Local events"]
        end
    end
    
    subgraph MumbaiDR["🇮🇳 INDIA - MUMBAI (DR STANDBY)"]
        subgraph MumbaiVCN["VCN: ecommerce-dr-vcn"]
            MumbaiDB_Standby["10 Standby Databases<br/>🟠 DR STANDBY<br/>Replicated from India<br/>Lag < 15 min"]
            MumbaiOKE_Standby["OKE Cluster<br/>⚪ SCALE UP ON DEMAND<br/>Not running until DR"]
        end
    end
    
    %% User Traffic Flow
    IndiaUsers["👥 Indian Users"] --> CDN
    RussiaUsers["👥 Russian Users"] --> CDN
    CDN --> DNS
    DNS -->|"Route Indian users"| IndiaLB
    DNS -->|"Route Russian users"| RussiaLB
    WAF --> CDN
    
    %% India Infrastructure
    IndiaLB --> IndiaOKE
    IndiaOKE --> IndiaServices
    IndiaServices --> IndiaDB_P
    IndiaServices --> IndiaRR1
    IndiaServices --> IndiaRR2
    IndiaServices --> IndiaRedis
    IndiaServices --> IndiaStream
    
    %% Russia Infrastructure
    RussiaLB --> RussiaOKE
    RussiaOKE --> RussiaServices
    RussiaServices --> RussiaDB_RR
    RussiaServices --> RussiaRedis
    RussiaServices --> RussiaStream
    
    %% Data Replication (Thick lines for primary replication)
    IndiaDB_P ==>|"Primary Replication<br/>Async < 1 sec"| IndiaRR1
    IndiaDB_P ==>|"Primary Replication<br/>Async < 1 sec"| IndiaRR2
    IndiaDB_P ==>|"Cross-Region Replication<br/>Async < 5 min"| RussiaDB_RR
    IndiaDB_P ==>|"DR Replication<br/>Async < 15 min"| MumbaiDB_Standby
    
    %% Optional: Russia to Mumbai DR
    RussiaDB_RR -.->|"Optional DR Replication"| MumbaiDB_Standby
    
    %% Cross-region service communication
    RussiaServices -.->|"Write API calls<br/>or Event sync"| IndiaServices
    
    %% Styling - Better colors for Mermaid
    style IndiaDB_P fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style IndiaRR1 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style IndiaRR2 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style IndiaOKE fill:#0d47a1,stroke:#1565c0,stroke-width:4px,color:#ffffff
    style IndiaServices fill:#1976d2,stroke:#42a5f5,stroke-width:3px,color:#ffffff
    style IndiaLB fill:#e65100,stroke:#ff6f00,stroke-width:3px,color:#ffffff
    style IndiaRedis fill:#b71c1c,stroke:#c62828,stroke-width:3px,color:#ffffff
    
    style RussiaDB_RR fill:#ffa726,stroke:#ff9800,stroke-width:4px,color:#000000
    style RussiaOKE fill:#1565c0,stroke:#1976d2,stroke-width:4px,color:#ffffff
    style RussiaServices fill:#42a5f5,stroke:#64b5f6,stroke-width:3px,color:#000000
    style RussiaLB fill:#f57c00,stroke:#ff9800,stroke-width:3px,color:#ffffff
    style RussiaRedis fill:#c62828,stroke:#d32f2f,stroke-width:3px,color:#ffffff
    
    style MumbaiDB_Standby fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style MumbaiOKE_Standby fill:#757575,stroke:#9e9e9e,stroke-width:3px,color:#ffffff
    
    style CDN fill:#7b1fa2,stroke:#9c27b0,stroke-width:3px,color:#ffffff
    style DNS fill:#00695c,stroke:#00897b,stroke-width:3px,color:#ffffff
    style WAF fill:#c62828,stroke:#d32f2f,stroke-width:3px,color:#ffffff
```

## Region Comparison Table

| Aspect | India (Hyderabad) | Russia (Moscow) | Mumbai (DR) |
|--------|-------------------|-----------------|-------------|
| **Type** | Primary/Master | Secondary/Active | DR/Standby |
| **Status** | ✅ Active | 🚀 To Deploy | ✅ Standby |
| **OKE Cluster** | 50+ nodes | 30 nodes | Scale on demand |
| **Services** | 100+ pods | 70 pods | Deploy on DR |
| **Databases** | 10 Primary (Write) | 10 Read Replicas | 10 Standby |
| **Read Replicas** | 20 (within region) | 0 (is replica) | 0 |
| **Traffic** | Indian users | Russian users | None (until DR) |
| **Write Operations** | ✅ All writes | ❌ No writes | ❌ No writes |
| **Cost** | $50,000/month | $30,000/month | $2,600/month |

## Data Flow Diagram

```mermaid
flowchart TD
    Start([User Request]) --> UserType{User Location?}
    
    UserType -->|India| IndiaFlow[Indian User]
    UserType -->|Russia| RussiaFlow[Russian User]
    
    IndiaFlow --> IndiaLB1[India Load Balancer]
    IndiaLB1 --> IndiaSvc1[India Services]
    IndiaSvc1 --> ReadWrite{Operation Type?}
    
    ReadWrite -->|Read| IndiaRR[India Read Replicas<br/>AD-2 or AD-3]
    ReadWrite -->|Write| IndiaPrimary[India Primary DB<br/>AD-1]
    
    IndiaPrimary --> Replicate1[Replicate to]
    Replicate1 --> IndiaRR
    Replicate1 --> RussiaRR[Russia Read Replicas]
    Replicate1 --> MumbaiStandby[Mumbai Standby]
    
    RussiaFlow --> RussiaLB1[Russia Load Balancer]
    RussiaLB1 --> RussiaSvc1[Russia Services]
    RussiaSvc1 --> ReadOnly{Operation Type?}
    
    ReadOnly -->|Read| RussiaRR
    ReadOnly -->|Write| WritePath{Write Strategy?}
    
    WritePath -->|Option 1| IndiaAPI[API Call to India<br/>~200-300ms latency]
    WritePath -->|Option 2| RussiaLocal[Local Write + Sync<br/>~10-20ms latency]
    
    IndiaAPI --> IndiaSvc2[India Services]
    IndiaSvc2 --> IndiaPrimary
    
    RussiaLocal --> RussiaLocalDB[Russia Local DB]
    RussiaLocalDB --> EventSync[Event Stream]
    EventSync --> IndiaPrimary
    
    style IndiaPrimary fill:#1b5e20,stroke:#2e7d32,stroke-width:4px,color:#ffffff
    style IndiaRR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style RussiaRR fill:#ffa726,stroke:#ff9800,stroke-width:3px,color:#000000
    style MumbaiStandby fill:#e65100,stroke:#ff6f00,stroke-width:3px,color:#ffffff
    style IndiaSvc1 fill:#1976d2,stroke:#42a5f5,stroke-width:2px,color:#ffffff
    style RussiaSvc1 fill:#42a5f5,stroke:#64b5f6,stroke-width:2px,color:#000000
```

## Replication Topology

```mermaid
graph LR
    subgraph Master["MASTER: India Primary DBs"]
        P1[Auth DB Primary]
        P2[User DB Primary]
        P3[Product DB Primary]
        P4[Order DB Primary]
        P5[Payment DB Primary]
        P6[Cart DB Primary]
        P7[Notification DB Primary]
        P8[Discount DB Primary]
        P9[Shipping DB Primary]
        P10[Return DB Primary]
    end
    
    subgraph IndiaReplicas["INDIA: Read Replicas"]
        R1_1[Auth RR-1]
        R2_1[User RR-1]
        R3_1[Product RR-1]
        R4_1[Order RR-1]
        R5_1[Payment RR-1]
        R6_1[Cart RR-1]
        R7_1[Notification RR-1]
        R8_1[Discount RR-1]
        R9_1[Shipping RR-1]
        R10_1[Return RR-1]
        
        R1_2[Auth RR-2]
        R2_2[User RR-2]
        R3_2[Product RR-2]
        R4_2[Order RR-2]
        R5_2[Payment RR-2]
        R6_2[Cart RR-2]
        R7_2[Notification RR-2]
        R8_2[Discount RR-2]
        R9_2[Shipping RR-2]
        R10_2[Return RR-2]
    end
    
    subgraph RussiaReplicas["RUSSIA: Read Replicas"]
        RU1[Auth RR]
        RU2[User RR]
        RU3[Product RR]
        RU4[Order RR]
        RU5[Payment RR]
        RU6[Cart RR]
        RU7[Notification RR]
        RU8[Discount RR]
        RU9[Shipping RR]
        RU10[Return RR]
    end
    
    subgraph MumbaiStandby["MUMBAI: Standby"]
        M1[Auth Standby]
        M2[User Standby]
        M3[Product Standby]
        M4[Order Standby]
        M5[Payment Standby]
        M6[Cart Standby]
        M7[Notification Standby]
        M8[Discount Standby]
        M9[Shipping Standby]
        M10[Return Standby]
    end
    
    %% Primary to India Replicas (thick lines)
    P1 ==>|"< 1 sec"| R1_1
    P1 ==>|"< 1 sec"| R1_2
    P2 ==>|"< 1 sec"| R2_1
    P2 ==>|"< 1 sec"| R2_2
    P3 ==>|"< 1 sec"| R3_1
    P3 ==>|"< 1 sec"| R3_2
    
    %% Primary to Russia (medium lines)
    P1 -.->|"< 5 min"| RU1
    P2 -.->|"< 5 min"| RU2
    P3 -.->|"< 5 min"| RU3
    P4 -.->|"< 5 min"| RU4
    P5 -.->|"< 5 min"| RU5
    
    %% Primary to Mumbai (dashed lines)
    P1 -.->|"< 15 min"| M1
    P2 -.->|"< 15 min"| M2
    P3 -.->|"< 15 min"| M3
    P4 -.->|"< 15 min"| M4
    P5 -.->|"< 15 min"| M5
    
    style P1 fill:#1b5e20,stroke:#2e7d32,stroke-width:4px,color:#ffffff
    style P2 fill:#1b5e20,stroke:#2e7d32,stroke-width:4px,color:#ffffff
    style P3 fill:#1b5e20,stroke:#2e7d32,stroke-width:4px,color:#ffffff
    style R1_1 fill:#4caf50,stroke:#66bb6a,stroke-width:2px,color:#000000
    style R1_2 fill:#4caf50,stroke:#66bb6a,stroke-width:2px,color:#000000
    style RU1 fill:#ffa726,stroke:#ff9800,stroke-width:3px,color:#000000
    style M1 fill:#e65100,stroke:#ff6f00,stroke-width:3px,color:#ffffff
```

## Disaster Recovery Scenarios

```mermaid
graph TB
    subgraph Normal["NORMAL OPERATION"]
        IndiaNormal["India: Active<br/>100% traffic"]
        RussiaNormal["Russia: Active<br/>Russian users"]
        MumbaiNormal["Mumbai: Standby<br/>No traffic"]
    end
    
    subgraph Scenario1["SCENARIO 1: India Region Fails"]
        IndiaFail["India: DOWN<br/>❌ Region failure"]
        RussiaContinue["Russia: Continue<br/>✅ Still active"]
        MumbaiActivate["Mumbai: ACTIVATE<br/>🚀 Promote to Primary<br/>RTO < 1 hour"]
    end
    
    subgraph Scenario2["SCENARIO 2: Russia Region Fails"]
        IndiaContinue["India: Continue<br/>✅ Still active"]
        RussiaFail["Russia: DOWN<br/>❌ Region failure"]
        MumbaiOption["Mumbai: OPTION<br/>Can activate Russia DR<br/>OR use another Russian region"]
    end
    
    Normal -->|"India fails"| Scenario1
    Normal -->|"Russia fails"| Scenario2
    
    style IndiaNormal fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#ffffff
    style IndiaFail fill:#d32f2f,stroke:#c62828,stroke-width:3px,color:#ffffff
    style RussiaNormal fill:#42a5f5,stroke:#1976d2,stroke-width:3px,color:#ffffff
    style RussiaFail fill:#d32f2f,stroke:#c62828,stroke-width:3px,color:#ffffff
    style MumbaiNormal fill:#757575,stroke:#616161,stroke-width:2px,color:#ffffff
    style MumbaiActivate fill:#ff6f00,stroke:#e65100,stroke-width:4px,color:#ffffff
```

## Key Points Summary

### ✅ India (Hyderabad) - PRIMARY/MASTER
- **Role**: Write master, main production
- **Infrastructure**: Full (50+ nodes, 100+ pods)
- **Databases**: 10 Primary (write) + 20 Read Replicas
- **Traffic**: Indian users
- **Status**: ✅ Active

### 🚀 Russia (Moscow) - SECONDARY ACTIVE
- **Role**: Active region for Russian users
- **Infrastructure**: Full (30 nodes, 70 pods)
- **Databases**: 10 Read Replicas (read-only from India)
- **Traffic**: Russian users
- **Status**: To be deployed after India

### ✅ Mumbai - DR STANDBY
- **Role**: Disaster recovery for India
- **Infrastructure**: Minimal (databases only, scale on demand)
- **Databases**: 10 Standby (replicated from India)
- **Traffic**: None (until DR activation)
- **Status**: ✅ Standby
- **Can also serve**: As DR for Russia (optional)

## Replication Summary

| Replication Path | Type | Lag | Purpose |
|------------------|------|-----|---------|
| India Primary → India RR (AD-2) | Within Region | < 1 sec | Fault tolerance |
| India Primary → India RR (AD-3) | Within Region | < 1 sec | Fault tolerance |
| India Primary → Russia RR | Cross-Region | < 5 min | Low latency reads |
| India Primary → Mumbai Standby | Cross-Region | < 15 min | Disaster recovery |
| Russia RR → Mumbai Standby | Cross-Region | < 15 min | Optional DR for Russia |

---

**Next Steps**:
- [11-01 India - Hyderabad Details](./11-01-india-hyderabad/README.md)
- [11-02 Russia - Moscow Details](./11-02-russia-moscow/README.md)
- [11-03 India - Mumbai Details](./11-03-india-mumbai/README.md)

