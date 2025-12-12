<div align="center">

# 🗄️ Database Placement, Replication & Disaster Recovery - Multi-Environment

[![Database](https://img.shields.io/badge/Database-Placement-blue?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Replication](https://img.shields.io/badge/Replication-Strategy-green?style=flat-square)](.)
[![DR](https://img.shields.io/badge/Disaster-Recovery-orange?style=flat-square)](.)

**Complete documentation for database placement, replication strategy, and disaster recovery procedures**

</div>

---

## Multi-Environment Overview

```mermaid
graph TB
    subgraph OCI["OCI Database Placement - Multi-Environment"]
        
        subgraph ProdDB["🔴 Production Databases<br/>Compartment: ecommerce-production"]
            ProdPrimary["Primary Region: IN-HYDERABAD-1<br/>3 Availability Domains<br/>10 Databases<br/>2-5 Read Replicas each"]
            ProdDR["DR Region: IN-MUMBAI-1<br/>Cross-region replication<br/>Automated backups"]
        end
        
        subgraph StagingDB["🟠 Staging Databases<br/>Compartment: ecommerce-staging"]
            StagingPrimary["Primary Region: IN-HYDERABAD-1<br/>3 Availability Domains<br/>10 Databases<br/>1-2 Read Replicas each"]
            StagingDR["DR Region: IN-MUMBAI-1<br/>Cross-region replication<br/>Automated backups"]
        end
        
        subgraph DevDB["🟢 Development Databases<br/>Compartment: ecommerce-development"]
            DevPrimary["Primary Region: IN-HYDERABAD-1<br/>1 Availability Domain<br/>10 Databases<br/>No Read Replicas"]
            DevDR["DR Region: ❌ No DR<br/>Local backups only"]
        end
    end
    
    style ProdDB fill:#c62828,stroke:#b71c1c,stroke-width:4px,color:#fff
    style StagingDB fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
    style DevDB fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
```

## Production Environment Overview

The production e-commerce platform uses **OCI Autonomous Database (ADB) PostgreSQL** with:
- **Primary Region**: IN-HYDERABAD-1 (India Central)
- **DR Region**: IN-MUMBAI-1 (India West)
- **Multi-AZ Deployment**: 3 Availability Domains in Hyderabad
- **Read Replicas**: 2-5 per database across ADs
- **Cross-Region Replication**: Automated to Mumbai for DR

## ⚠️ Important: Hyderabad vs Mumbai

### Question: Will databases automatically place in Mumbai for fault tolerance?

**Answer**: **No, Mumbai is NOT for automatic fault tolerance within the same region.**

**Fault Tolerance (Within Hyderabad)**:
- ✅ Handled by **3 Availability Domains (AD-1, AD-2, AD-3)** within Hyderabad
- ✅ **Read Replicas** in AD-2 and AD-3 provide automatic failover
- ✅ If AD-1 (Primary) fails, AD-2 or AD-3 automatically promotes to Primary
- ✅ **Zero data loss** (replicas in sync < 1 second)
- ✅ **Automatic failover** within 5 minutes

**Disaster Recovery (Hyderabad → Mumbai)**:
- ✅ Mumbai is for **regional disaster recovery** only
- ✅ Protects against **entire Hyderabad region failure** (earthquake, flood, etc.)
- ✅ **Manual or automatic failover** to Mumbai (RTO < 1 hour)
- ✅ **Cross-region replication lag**: < 15 minutes (acceptable for DR)
- ✅ **Geographic redundancy**: 1000+ km separation

### Summary

| Scenario | Solution | Location | Failover Type |
|----------|----------|----------|---------------|
| **Single AD failure** | Read Replica promotion | Hyderabad (AD-2 or AD-3) | Automatic (< 5 min) |
| **Multiple AD failure** | Read Replica promotion | Hyderabad (remaining AD) | Automatic (< 5 min) |
| **Entire region failure** | DR activation | Mumbai (IN-MUMBAI-1) | Manual/Auto (< 1 hour) |

**Key Point**: Mumbai databases are **standby/read-only** until a regional disaster occurs. They do NOT automatically handle fault tolerance within Hyderabad - that's handled by multiple ADs and read replicas within Hyderabad.

---

## Production Database Placement Architecture

### Production Primary Region: IN-HYDERABAD-1

```mermaid
graph TB
    subgraph PrimaryRegion["Production Primary Region: IN-HYDERABAD-1<br/>Compartment: ecommerce-production"]
        subgraph VCN["VCN: ecommerce-production-vcn<br/>CIDR: 10.0.0.0/16"]
            
            subgraph AD1["Availability Domain 1 (AD-1)"]
                subgraph DBSubnet1["Database Subnet 10.0.3.0/24"]
                    AuthDB1["Auth DB Primary<br/>2-128 OCPUs<br/>2TB+ Storage"]
                    UserDB1["User DB Primary<br/>2-128 OCPUs<br/>2TB+ Storage"]
                    ProductDB1["Product DB Primary<br/>2-128 OCPUs<br/>2TB+ Storage"]
                    OrderDB1["Order DB Primary<br/>2-128 OCPUs<br/>2TB+ Storage"]
                    PaymentDB1["Payment DB Primary<br/>2-128 OCPUs<br/>2TB+ Storage"]
                    CartDB1["Cart DB Primary<br/>2-128 OCPUs<br/>2TB+ Storage"]
                    NotificationDB1["Notification DB Primary<br/>2-128 OCPUs<br/>2TB+ Storage"]
                    DiscountDB1["Discount DB Primary<br/>2-128 OCPUs<br/>2TB+ Storage"]
                    ShippingDB1["Shipping DB Primary<br/>2-128 OCPUs<br/>2TB+ Storage"]
                    ReturnDB1["Return DB Primary<br/>2-128 OCPUs<br/>2TB+ Storage"]
                end
            end
            
            subgraph AD2["Availability Domain 2 (AD-2)"]
                subgraph DBSubnet2["Database Subnet 10.0.4.0/24"]
                    AuthDB2_RR["Auth DB Read Replica 1<br/>2-128 OCPUs<br/>Read-only"]
                    UserDB2_RR["User DB Read Replica 1<br/>2-128 OCPUs<br/>Read-only"]
                    ProductDB2_RR["Product DB Read Replica 1<br/>2-128 OCPUs<br/>Read-only"]
                    OrderDB2_RR["Order DB Read Replica 1<br/>2-128 OCPUs<br/>Read-only"]
                    PaymentDB2_RR["Payment DB Read Replica 1<br/>2-128 OCPUs<br/>Read-only"]
                    CartDB2_RR["Cart DB Read Replica 1<br/>2-128 OCPUs<br/>Read-only"]
                    NotificationDB2_RR["Notification DB Read Replica 1<br/>2-128 OCPUs<br/>Read-only"]
                    DiscountDB2_RR["Discount DB Read Replica 1<br/>2-128 OCPUs<br/>Read-only"]
                    ShippingDB2_RR["Shipping DB Read Replica 1<br/>2-128 OCPUs<br/>Read-only"]
                    ReturnDB2_RR["Return DB Read Replica 1<br/>2-128 OCPUs<br/>Read-only"]
                end
            end
            
            subgraph AD3["Availability Domain 3 (AD-3)"]
                subgraph DBSubnet3["Database Subnet 10.0.5.0/24"]
                    AuthDB3_RR["Auth DB Read Replica 2<br/>2-128 OCPUs<br/>Read-only"]
                    UserDB3_RR["User DB Read Replica 2<br/>2-128 OCPUs<br/>Read-only"]
                    ProductDB3_RR["Product DB Read Replica 2<br/>2-128 OCPUs<br/>Read-only"]
                    OrderDB3_RR["Order DB Read Replica 2<br/>2-128 OCPUs<br/>Read-only"]
                    PaymentDB3_RR["Payment DB Read Replica 2<br/>2-128 OCPUs<br/>Read-only"]
                    CartDB3_RR["Cart DB Read Replica 2<br/>2-128 OCPUs<br/>Read-only"]
                    NotificationDB3_RR["Notification DB Read Replica 2<br/>2-128 OCPUs<br/>Read-only"]
                    DiscountDB3_RR["Discount DB Read Replica 2<br/>2-128 OCPUs<br/>Read-only"]
                    ShippingDB3_RR["Shipping DB Read Replica 2<br/>2-128 OCPUs<br/>Read-only"]
                    ReturnDB3_RR["Return DB Read Replica 2<br/>2-128 OCPUs<br/>Read-only"]
                end
            end
        end
    end
    
    %% Primary to Read Replica connections (thick solid lines)
    AuthDB1 ==>|"Replication<br/>< 1 sec"| AuthDB2_RR
    AuthDB1 ==>|"Replication<br/>< 1 sec"| AuthDB3_RR
    UserDB1 ==>|"Replication<br/>< 1 sec"| UserDB2_RR
    UserDB1 ==>|"Replication<br/>< 1 sec"| UserDB3_RR
    ProductDB1 ==>|"Replication<br/>< 1 sec"| ProductDB2_RR
    ProductDB1 ==>|"Replication<br/>< 1 sec"| ProductDB3_RR
    OrderDB1 ==>|"Replication<br/>< 1 sec"| OrderDB2_RR
    OrderDB1 ==>|"Replication<br/>< 1 sec"| OrderDB3_RR
    PaymentDB1 ==>|"Replication<br/>< 1 sec"| PaymentDB2_RR
    PaymentDB1 ==>|"Replication<br/>< 1 sec"| PaymentDB3_RR
    
    %% Styling - Better colors for visibility
    style AuthDB1 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style UserDB1 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style ProductDB1 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style OrderDB1 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style PaymentDB1 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style CartDB1 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style NotificationDB1 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style DiscountDB1 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style ShippingDB1 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style ReturnDB1 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    
    style AuthDB2_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style UserDB2_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style ProductDB2_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style OrderDB2_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style PaymentDB2_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style CartDB2_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style NotificationDB2_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style DiscountDB2_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style ShippingDB2_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style ReturnDB2_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    
    style AuthDB3_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style UserDB3_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style ProductDB3_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style OrderDB3_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style PaymentDB3_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style CartDB3_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style NotificationDB3_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style DiscountDB3_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style ShippingDB3_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style ReturnDB3_RR fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
```

### Cross-Region Disaster Recovery: IN-MUMBAI-1

```mermaid
graph TB
    subgraph PrimaryRegion["Primary Region: IN-HYDERABAD-1"]
        subgraph PrimaryDBs["Primary Databases (AD-1)"]
            AuthDB_P["Auth DB Primary"]
            UserDB_P["User DB Primary"]
            ProductDB_P["Product DB Primary"]
            OrderDB_P["Order DB Primary"]
            PaymentDB_P["Payment DB Primary"]
            CartDB_P["Cart DB Primary"]
            NotificationDB_P["Notification DB Primary"]
            DiscountDB_P["Discount DB Primary"]
            ShippingDB_P["Shipping DB Primary"]
            ReturnDB_P["Return DB Primary"]
        end
    end
    
    subgraph DRRegion["DR Region: IN-MUMBAI-1"]
        subgraph DRDBs["DR Standby Databases"]
            AuthDB_DR["Auth DB Standby<br/>Read-only<br/>Auto-failover"]
            UserDB_DR["User DB Standby<br/>Read-only<br/>Auto-failover"]
            ProductDB_DR["Product DB Standby<br/>Read-only<br/>Auto-failover"]
            OrderDB_DR["Order DB Standby<br/>Read-only<br/>Auto-failover"]
            PaymentDB_DR["Payment DB Standby<br/>Read-only<br/>Auto-failover"]
            CartDB_DR["Cart DB Standby<br/>Read-only<br/>Auto-failover"]
            NotificationDB_DR["Notification DB Standby<br/>Read-only<br/>Auto-failover"]
            DiscountDB_DR["Discount DB Standby<br/>Read-only<br/>Auto-failover"]
            ShippingDB_DR["Shipping DB Standby<br/>Read-only<br/>Auto-failover"]
            ReturnDB_DR["Return DB Standby<br/>Read-only<br/>Auto-failover"]
        end
    end
    
    %% Cross-region replication (dashed lines for DR)
    AuthDB_P -.->|"DR Replication<br/>< 15 min lag"| AuthDB_DR
    UserDB_P -.->|"DR Replication<br/>< 15 min lag"| UserDB_DR
    ProductDB_P -.->|"DR Replication<br/>< 15 min lag"| ProductDB_DR
    OrderDB_P -.->|"DR Replication<br/>< 15 min lag"| OrderDB_DR
    PaymentDB_P -.->|"DR Replication<br/>< 15 min lag"| PaymentDB_DR
    CartDB_P -.->|"DR Replication<br/>< 15 min lag"| CartDB_DR
    NotificationDB_P -.->|"DR Replication<br/>< 15 min lag"| NotificationDB_DR
    DiscountDB_P -.->|"DR Replication<br/>< 15 min lag"| DiscountDB_DR
    ShippingDB_P -.->|"DR Replication<br/>< 15 min lag"| ShippingDB_DR
    ReturnDB_P -.->|"DR Replication<br/>< 15 min lag"| ReturnDB_DR
    
    %% Styling - Better colors
    style AuthDB_P fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style UserDB_P fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style ProductDB_P fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style OrderDB_P fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style PaymentDB_P fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style CartDB_P fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style NotificationDB_P fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style DiscountDB_P fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style ShippingDB_P fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style ReturnDB_P fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    
    style AuthDB_DR fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style UserDB_DR fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style ProductDB_DR fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style OrderDB_DR fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style PaymentDB_DR fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style CartDB_DR fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style NotificationDB_DR fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style DiscountDB_DR fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style ShippingDB_DR fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style ReturnDB_DR fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
```

---

## Complete Database Topology

```mermaid
graph TB
    subgraph Hyderabad["IN-HYDERABAD-1 (Primary Region)"]
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
            R1_1["Auth DB RR-1"]
            R2_1["User DB RR-1"]
            R3_1["Product DB RR-1"]
            R4_1["Order DB RR-1"]
            R5_1["Payment DB RR-1"]
            R6_1["Cart DB RR-1"]
            R7_1["Notification DB RR-1"]
            R8_1["Discount DB RR-1"]
            R9_1["Shipping DB RR-1"]
            R10_1["Return DB RR-1"]
        end
        
        subgraph AD3_HYD["AD-3: Read Replicas"]
            R1_2["Auth DB RR-2"]
            R2_2["User DB RR-2"]
            R3_2["Product DB RR-2"]
            R4_2["Order DB RR-2"]
            R5_2["Payment DB RR-2"]
            R6_2["Cart DB RR-2"]
            R7_2["Notification DB RR-2"]
            R8_2["Discount DB RR-2"]
            R9_2["Shipping DB RR-2"]
            R10_2["Return DB RR-2"]
        end
    end
    
    subgraph Mumbai["IN-MUMBAI-1 (DR Region)"]
        subgraph DR_MUM["DR Standby Databases"]
            DR1["Auth DB Standby"]
            DR2["User DB Standby"]
            DR3["Product DB Standby"]
            DR4["Order DB Standby"]
            DR5["Payment DB Standby"]
            DR6["Cart DB Standby"]
            DR7["Notification DB Standby"]
            DR8["Discount DB Standby"]
            DR9["Shipping DB Standby"]
            DR10["Return DB Standby"]
        end
    end
    
    %% Primary to Read Replicas (within Hyderabad) - Thick solid lines
    P1 ==>|"Replication<br/>< 1 sec"| R1_1
    P1 ==>|"Replication<br/>< 1 sec"| R1_2
    P2 ==>|"Replication<br/>< 1 sec"| R2_1
    P2 ==>|"Replication<br/>< 1 sec"| R2_2
    P3 ==>|"Replication<br/>< 1 sec"| R3_1
    P3 ==>|"Replication<br/>< 1 sec"| R3_2
    P4 ==>|"Replication<br/>< 1 sec"| R4_1
    P4 ==>|"Replication<br/>< 1 sec"| R4_2
    P5 ==>|"Replication<br/>< 1 sec"| R5_1
    P5 ==>|"Replication<br/>< 1 sec"| R5_2
    P6 ==>|"Replication<br/>< 1 sec"| R6_1
    P6 ==>|"Replication<br/>< 1 sec"| R6_2
    P7 ==>|"Replication<br/>< 1 sec"| R7_1
    P7 ==>|"Replication<br/>< 1 sec"| R7_2
    P8 ==>|"Replication<br/>< 1 sec"| R8_1
    P8 ==>|"Replication<br/>< 1 sec"| R8_2
    P9 ==>|"Replication<br/>< 1 sec"| R9_1
    P9 ==>|"Replication<br/>< 1 sec"| R9_2
    P10 ==>|"Replication<br/>< 1 sec"| R10_1
    P10 ==>|"Replication<br/>< 1 sec"| R10_2
    
    %% Cross-Region Replication (Hyderabad to Mumbai) - Dashed lines
    P1 -.->|"DR Replication<br/>< 15 min lag"| DR1
    P2 -.->|"DR Replication<br/>< 15 min lag"| DR2
    P3 -.->|"DR Replication<br/>< 15 min lag"| DR3
    P4 -.->|"DR Replication<br/>< 15 min lag"| DR4
    P5 -.->|"DR Replication<br/>< 15 min lag"| DR5
    P6 -.->|"DR Replication<br/>< 15 min lag"| DR6
    P7 -.->|"DR Replication<br/>< 15 min lag"| DR7
    P8 -.->|"DR Replication<br/>< 15 min lag"| DR8
    P9 -.->|"DR Replication<br/>< 15 min lag"| DR9
    P10 -.->|"DR Replication<br/>< 15 min lag"| DR10
    
    %% Styling - Primary databases (dark green, thick border, white text)
    style P1 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style P2 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style P3 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style P4 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style P5 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style P6 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style P7 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style P8 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style P9 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    style P10 fill:#1b5e20,stroke:#2e7d32,stroke-width:5px,color:#ffffff
    
    %% Styling - Read replicas (light green, black text)
    style R1_1 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R1_2 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R2_1 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R2_2 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R3_1 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R3_2 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R4_1 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R4_2 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R5_1 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R5_2 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R6_1 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R6_2 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R7_1 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R7_2 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R8_1 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R8_2 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R9_1 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R9_2 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R10_1 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    style R10_2 fill:#4caf50,stroke:#66bb6a,stroke-width:3px,color:#000000
    
    %% Styling - DR standby (orange, white text)
    style DR1 fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style DR2 fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style DR3 fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style DR4 fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style DR5 fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style DR6 fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style DR7 fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style DR8 fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style DR9 fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
    style DR10 fill:#e65100,stroke:#ff6f00,stroke-width:4px,color:#ffffff
```

---

## Replication Strategy

### Within Region (Hyderabad) - Fault Tolerance

**Purpose**: High availability and read scaling within Hyderabad region.

| Component | Configuration | Purpose |
|-----------|--------------|---------|
| **Primary DBs** | AD-1 (Hyderabad) | Write operations, master database |
| **Read Replicas** | AD-2, AD-3 (Hyderabad) | Read operations, load distribution |
| **Replication Type** | Asynchronous (Streaming) | Low latency, high throughput |
| **Replication Lag** | < 1 second | Near real-time consistency |
| **Failover** | Automatic (within region) | If primary fails, promote replica |
| **Read Distribution** | Round-robin or least-lag | Balance read load |

**Benefits**:
- ✅ **Fault Tolerance**: If AD-1 fails, AD-2 or AD-3 can take over
- ✅ **Read Scaling**: Distribute read queries across replicas
- ✅ **Low Latency**: All within same region (< 5ms)
- ✅ **Automatic Failover**: OCI handles promotion automatically

### Cross-Region (Hyderabad → Mumbai) - Disaster Recovery

**Purpose**: Protect against regional disasters (earthquake, flood, etc.).

| Component | Configuration | Purpose |
|-----------|--------------|---------|
| **Primary Region** | IN-HYDERABAD-1 | Production workloads |
| **DR Region** | IN-MUMBAI-1 | Standby for disaster recovery |
| **Replication Type** | Asynchronous (Cross-Region) | Network-efficient, cost-effective |
| **Replication Lag** | < 15 minutes | Acceptable for DR scenarios |
| **Failover** | Manual (planned) or Automatic (unplanned) | Controlled or emergency |
| **RTO** | < 1 hour | Recovery Time Objective |
| **RPO** | < 15 minutes | Recovery Point Objective |

**Benefits**:
- ✅ **Regional Disaster Protection**: Survive Hyderabad region failure
- ✅ **Geographic Redundancy**: 1000+ km separation
- ✅ **Data Safety**: All data replicated to Mumbai
- ✅ **Business Continuity**: Can operate from Mumbai if needed

---

## Database Configuration

### Primary Databases (Hyderabad AD-1)

```yaml
Configuration:
  Region: IN-HYDERABAD-1
  Availability Domain: AD-1
  Subnet: 10.0.3.0/24 (Database Subnet)
  Type: Autonomous Database PostgreSQL
  Shape: 2-128 OCPUs (Auto-scaling)
  Storage: 2TB+ (Auto-scaling)
  Backup: Automated (30-day retention)
  Encryption: AES-256 (at rest), TLS 1.2+ (in transit)
  mTLS: Enabled (production security)
  High Availability: Enabled
  Read Replicas: 2-5 per database
  Cross-Region Replication: Enabled (to Mumbai)
```

### Read Replicas (Hyderabad AD-2, AD-3)

```yaml
Configuration:
  Region: IN-HYDERABAD-1
  Availability Domains: AD-2, AD-3
  Subnets: 10.0.4.0/24, 10.0.5.0/24
  Type: Autonomous Database Read Replica
  Shape: 2-128 OCPUs (matches primary)
  Storage: Auto-synced from primary
  Access: Read-only
  Replication Lag: < 1 second
  Failover: Automatic (if primary fails)
```

### DR Standby Databases (Mumbai)

```yaml
Configuration:
  Region: IN-MUMBAI-1
  Availability Domain: AD-1
  Type: Autonomous Database Standby
  Shape: 2-128 OCPUs (matches primary)
  Storage: Auto-synced from primary
  Access: Read-only (until failover)
  Replication Lag: < 15 minutes
  Failover: Manual (planned) or Automatic (unplanned)
  RTO: < 1 hour
  RPO: < 15 minutes
```

---

## Service Connection Strategy

### Write Operations

```mermaid
graph LR
    Service["Microservice<br/>(OKE Pod)"] -->|"Write Query"| Primary["Primary DB<br/>(Hyderabad AD-1)"]
    Primary -->|"Replicate"| RR1["Read Replica 1<br/>(Hyderabad AD-2)"]
    Primary -->|"Replicate"| RR2["Read Replica 2<br/>(Hyderabad AD-3)"]
    Primary -.->|"Cross-Region"| DR["DR Standby<br/>(Mumbai)"]
    
    style Primary fill:#4caf50,stroke:#2e7d32,stroke-width:3px
    style RR1 fill:#81c784,stroke:#388e3c,stroke-width:2px
    style RR2 fill:#81c784,stroke:#388e3c,stroke-width:2px
    style DR fill:#ff9800,stroke:#f57c00,stroke-width:2px
```

**Connection Pattern**:
- All **write operations** go to **Primary DB** (Hyderabad AD-1)
- Services use **connection pooling** to primary
- **Automatic retry** on connection failure
- **Circuit breaker** prevents cascade failures

### Read Operations

```mermaid
graph LR
    Service["Microservice<br/>(OKE Pod)"] -->|"Read Query"| LB["Read Replica Load Balancer"]
    LB -->|"Route"| RR1["Read Replica 1<br/>(Hyderabad AD-2)"]
    LB -->|"Route"| RR2["Read Replica 2<br/>(Hyderabad AD-3)"]
    LB -.->|"Fallback"| Primary["Primary DB<br/>(Hyderabad AD-1)"]
    
    style RR1 fill:#81c784,stroke:#388e3c,stroke-width:2px
    style RR2 fill:#81c784,stroke:#388e3c,stroke-width:2px
    style Primary fill:#4caf50,stroke:#2e7d32,stroke-width:2px
```

**Connection Pattern**:
- **Read queries** distributed across **Read Replicas** (AD-2, AD-3)
- **Load balancing**: Round-robin or least-lag
- **Fallback**: If replicas unavailable, route to primary
- **Read scaling**: 5-10x read capacity with replicas

---

## Disaster Recovery Procedures

### RTO/RPO Targets

| Metric | Target | Description |
|--------|--------|-------------|
| **RTO** | < 1 hour | Time to restore service after disaster |
| **RPO** | < 15 minutes | Maximum data loss acceptable |
| **Failover Time** | < 30 minutes | Time to activate DR databases |
| **Data Sync** | < 15 minutes | Replication lag to Mumbai |

### Failover Scenarios

#### Scenario 1: Single Availability Domain Failure (Hyderabad)

**Impact**: AD-1 (Primary) fails, but AD-2 and AD-3 available

**Response**:
1. **Automatic**: OCI promotes Read Replica from AD-2 or AD-3 to Primary
2. **Time**: < 5 minutes
3. **Data Loss**: None (replicas are in sync)
4. **Service Impact**: Minimal (brief read-only period)

**Diagram**:
```mermaid
graph TB
    subgraph Before["Before Failure"]
        P1["Primary DB (AD-1)"] -->|"Replicate"| R1["Read Replica (AD-2)"]
        P1 -->|"Replicate"| R2["Read Replica (AD-3)"]
    end
    
    subgraph After["After AD-1 Failure"]
        R1["New Primary DB (AD-2)<br/>Auto-promoted"] -->|"Replicate"| R2["Read Replica (AD-3)"]
    end
    
    Before -.->|"AD-1 Fails"| After
    
    style P1 fill:#f44336,stroke:#c62828,stroke-width:2px
    style R1 fill:#4caf50,stroke:#2e7d32,stroke-width:3px
    style R2 fill:#81c784,stroke:#388e3c,stroke-width:2px
```

#### Scenario 2: Entire Hyderabad Region Failure

**Impact**: All Hyderabad availability domains unavailable

**Response**:
1. **Manual Failover**: Activate Mumbai DR databases
2. **Time**: < 1 hour (RTO)
3. **Data Loss**: < 15 minutes (RPO)
4. **Service Impact**: Services redirect to Mumbai region

**Failover Steps**:
```mermaid
sequenceDiagram
    participant Ops as DevOps Team
    participant OCI as OCI Console
    participant Mumbai as Mumbai DR DBs
    participant Services as OKE Services
    
    Ops->>OCI: Detect Hyderabad region failure
    Ops->>OCI: Initiate DR failover
    OCI->>Mumbai: Promote Standby to Primary
    Mumbai-->>OCI: Standby promoted (read-write)
    OCI->>Services: Update connection strings
    Services->>Mumbai: Connect to Mumbai databases
    Mumbai-->>Services: Service restored
    Ops->>Ops: Verify data integrity
    Ops->>Ops: Monitor replication lag
```

**Post-Failover**:
1. Update service connection strings to Mumbai
2. Verify data integrity (< 15 min lag)
3. Monitor replication when Hyderabad recovers
4. Plan failback procedure

#### Scenario 3: Planned Maintenance (Hyderabad)

**Impact**: Scheduled maintenance on Hyderabad region

**Response**:
1. **Planned Failover**: Switch to Mumbai before maintenance
2. **Time**: < 30 minutes (controlled)
3. **Data Loss**: None (synchronized failover)
4. **Service Impact**: Minimal (brief connection switch)

---

## Backup Strategy

### Automated Backups

| Backup Type | Frequency | Retention | Location |
|-------------|-----------|-----------|----------|
| **Full Backup** | Daily (2 AM UTC) | 30 days | Hyderabad (Primary) |
| **Incremental Backup** | Hourly | 7 days | Hyderabad (Primary) |
| **Point-in-Time Recovery** | Continuous | 30 days | Hyderabad (Primary) |
| **Cross-Region Backup** | Daily | 30 days | Mumbai (DR) |

### Backup Configuration

```yaml
Backup Settings:
  Automated Backups: Enabled
  Full Backup Schedule: Daily at 02:00 UTC
  Incremental Backup: Every hour
  Retention Period: 30 days
  Cross-Region Replication: Enabled (to Mumbai)
  Encryption: AES-256
  Compression: Enabled
  Backup Window: 2 hours
```

### Restore Procedures

#### Point-in-Time Recovery (PITR)

**Use Case**: Data corruption, accidental deletion

**Steps**:
1. Identify recovery point (within 30 days)
2. Create new database from backup
3. Restore to specific timestamp
4. Verify data integrity
5. Switch services to restored database

**RTO**: < 2 hours
**RPO**: < 1 hour (to last backup)

#### Full Database Restore

**Use Case**: Complete database failure

**Steps**:
1. Create new database instance
2. Restore from latest full backup
3. Apply incremental backups
4. Verify data integrity
5. Update connection strings

**RTO**: < 4 hours
**RPO**: < 1 hour (to last backup)

---

## Monitoring & Alerts

### Key Metrics

| Metric | Threshold | Action |
|--------|-----------|--------|
| **Replication Lag (Hyderabad)** | > 5 seconds | Alert DevOps |
| **Replication Lag (Mumbai)** | > 20 minutes | Alert DevOps |
| **Primary DB CPU** | > 80% | Scale up or add replicas |
| **Primary DB Storage** | > 85% | Increase storage |
| **Read Replica Status** | Down | Alert DevOps |
| **DR Standby Status** | Down | Critical Alert |
| **Backup Failure** | Any | Critical Alert |

### Alerts Configuration

```yaml
Alarms:
  - Name: "Database Replication Lag (Hyderabad)"
    Metric: ReplicationLag
    Threshold: > 5 seconds
    Action: Email DevOps Team
    
  - Name: "Database Replication Lag (Mumbai)"
    Metric: CrossRegionReplicationLag
    Threshold: > 20 minutes
    Action: Email DevOps + On-Call
    
  - Name: "Primary Database CPU High"
    Metric: CPUUtilization
    Threshold: > 80%
    Action: Email DevOps Team
    
  - Name: "DR Standby Database Down"
    Metric: DatabaseStatus
    Threshold: Down
    Action: Critical Alert (SMS + Email)
    
  - Name: "Backup Failure"
    Metric: BackupStatus
    Threshold: Failed
    Action: Critical Alert (SMS + Email)
```

---

## Cost Optimization

### Database Costs

| Component | Cost Factor | Optimization |
|-----------|-------------|--------------|
| **Primary DBs** | OCPUs, Storage | Auto-scaling (2-128 OCPUs) |
| **Read Replicas** | OCPUs, Storage | Scale based on read load |
| **DR Standby** | OCPUs, Storage | Same size as primary |
| **Backups** | Storage | 30-day retention, compression |
| **Cross-Region Replication** | Data Transfer | Compressed, incremental |

### Cost Estimates (Monthly)

```
Primary Databases (10): ~$2,000/month
Read Replicas (20): ~$3,000/month
DR Standby (10): ~$2,000/month
Backups: ~$500/month
Cross-Region Replication: ~$300/month
Total: ~$7,800/month
```

---

## Summary

### Fault Tolerance (Within Hyderabad)

✅ **Multi-AZ Deployment**: 3 Availability Domains
✅ **Read Replicas**: 2-5 per database across ADs
✅ **Automatic Failover**: < 5 minutes
✅ **Zero Data Loss**: Replicas in sync (< 1 second lag)

### Disaster Recovery (Hyderabad → Mumbai)

✅ **Cross-Region Replication**: Automated to Mumbai
✅ **RTO**: < 1 hour
✅ **RPO**: < 15 minutes
✅ **Geographic Redundancy**: 1000+ km separation

### Key Points

1. **Hyderabad is Primary**: All production workloads run in Hyderabad
2. **Mumbai is DR**: Only activated during regional disasters
3. **Fault Tolerance**: Handled by multiple ADs within Hyderabad
4. **Automatic Failover**: Within region (Hyderabad ADs)
5. **Manual Failover**: Cross-region (Hyderabad → Mumbai)

---

**Next Steps**:
- [Multi-Region Architecture](./11-multi-region/11-master-multi-region-architecture.md) - Complete multi-region deployment (India, Russia, Mumbai)
- [Database Schemas](../database/01-master-er-diagram.md) - Database schemas and ER diagrams
- [Service Schemas](../database/service-schemas/) - Individual service database schemas
- [Cross-Service References](../database/03-cross-service-references.md) - How services reference each other

