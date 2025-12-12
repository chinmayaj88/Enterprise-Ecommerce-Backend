<div align="center">

# 🇮🇳 India - Hyderabad (Primary Region)

[![Region](https://img.shields.io/badge/Region-Primary-blue?style=for-the-badge)](.)
[![Status](https://img.shields.io/badge/Status-ACTIVE-green?style=flat-square)](.)
[![Master](https://img.shields.io/badge/Type-Master-orange?style=flat-square)](.)

**✅ ACTIVE - MAIN PRODUCTION REGION**

</div>

---

Hyderabad is the **primary and master region** for the e-commerce platform. All database writes go to Hyderabad, and it serves as the source of truth for all data.

## Region Details

- **Region**: IN-HYDERABAD-1 (India Central)
- **Type**: Primary/Master
- **Status**: Active Production
- **Deployment**: Complete

## Infrastructure

### Complete Production Stack

```mermaid
graph TB
    subgraph India["INDIA - HYDERABAD (PRIMARY/MASTER)"]
        subgraph VCN["VCN: ecommerce-production-vcn"]
            subgraph AD1["Availability Domain 1"]
                PrimaryDBs["10 Primary Databases<br/>WRITE MASTER<br/>All writes go here"]
                OKE1["OKE Cluster<br/>50+ nodes"]
                Services1["11 Microservices<br/>100+ pods"]
            end
            
            subgraph AD2["Availability Domain 2"]
                RR1["10 Read Replicas<br/>Read-only"]
            end
            
            subgraph AD3["Availability Domain 3"]
                RR2["10 Read Replicas<br/>Read-only"]
            end
        end
    end
    
    PrimaryDBs -->|"Replication"| RR1
    PrimaryDBs -->|"Replication"| RR2
    
    style PrimaryDBs fill:#2e7d32,stroke:#1b5e20,stroke-width:4px,color:#fff
    style RR1 fill:#66bb6a,stroke:#388e3c,stroke-width:2px
    style RR2 fill:#66bb6a,stroke:#388e3c,stroke-width:2px
    style OKE1 fill:#1976d2,stroke:#0d47a1,stroke-width:3px,color:#fff
    style Services1 fill:#1976d2,stroke:#0d47a1,stroke-width:2px,color:#fff
```

## Key Characteristics

- ✅ **Write Master**: All database writes
- ✅ **Full Infrastructure**: Complete production stack
- ✅ **High Availability**: 3 Availability Domains
- ✅ **Read Replicas**: 20 read replicas for scaling
- ✅ **Source of Truth**: All data originates here

## Database Configuration

| Database | Type | OCPUs | Storage | Replicas |
|----------|------|-------|---------|----------|
| Auth DB | Primary | 2-128 | 2TB+ | 2-5 |
| User DB | Primary | 2-128 | 2TB+ | 2-5 |
| Product DB | Primary | 2-128 | 2TB+ | 2-5 |
| Order DB | Primary | 2-128 | 2TB+ | 2-5 |
| Payment DB | Primary | 2-128 | 2TB+ | 2-5 |
| Cart DB | Primary | 2-128 | 2TB+ | 2-5 |
| Notification DB | Primary | 2-128 | 2TB+ | 2-5 |
| Discount DB | Primary | 2-128 | 2TB+ | 2-5 |
| Shipping DB | Primary | 2-128 | 2TB+ | 2-5 |
| Return DB | Primary | 2-128 | 2TB+ | 2-5 |

## Replication Targets

1. **Within Region**: AD-2 and AD-3 (Read Replicas)
2. **Cross-Region**: Russia - Moscow (Read Replicas)
3. **DR**: Mumbai (Standby)

## Traffic

- **Primary Users**: Indian users
- **Traffic Volume**: 100% of writes, 70% of reads
- **Latency**: < 10ms (within India)

---

**Next**: [11-02 Russia - Moscow (Secondary)](../11-02-russia-moscow/README.md)

