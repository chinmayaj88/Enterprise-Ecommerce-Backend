<div align="center">

# 🌍 Multi-Region Deployment Architecture

[![Multi-Region](https://img.shields.io/badge/Multi-Region-Deployment-blue?style=for-the-badge)](.)
[![Global](https://img.shields.io/badge/Global-Infrastructure-green?style=flat-square)](.)
[![DR](https://img.shields.io/badge/Disaster-Recovery-orange?style=flat-square)](.)

**Complete documentation for multi-region deployment strategy**

</div>

---

Complete documentation for multi-region deployment strategy with India as primary region and Russia as secondary active region.

## 🌍 Region Overview

<div align="center">

**Region overview:**

</div>

| Region | Type | Purpose | Status |
|:---:|:---|:---|:---:|
| **🇮🇳 India - Hyderabad** | Primary/Master | Main production region, all writes | ✅ Active |
| **🇷🇺 Russia - Moscow** | Secondary/Edge | Active region for Russian users, low latency | 🚀 Deploy After India |
| **🇮🇳 India - Mumbai** | DR | Disaster recovery for India region | ✅ Standby |

## 📁 Documentation Structure (Deployment Order)

1. **[Master Multi-Region Architecture](./11-master-multi-region-architecture.md)** - Complete visual diagrams
2. **[11-01 India - Hyderabad (Primary)](./11-01-india-hyderabad/README.md)** - Main production region (Deploy First)
3. **[11-02 Russia - Moscow (Secondary)](./11-02-russia-moscow/README.md)** - Active region for Russia (Deploy After India)
4. **[11-03 India - Mumbai (DR)](./11-03-india-mumbai/README.md)** - Disaster recovery for India (Deploy Last)

## 🏗️ Architecture Overview

### Region Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│  PRIMARY REGION: INDIA - HYDERABAD                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Full Production Infrastructure                  │  │
│  │  - OKE Cluster (50+ nodes)                       │  │
│  │  - 11 Microservices (100+ pods)                   │  │
│  │  - 10 Primary Databases (Write Master)            │  │
│  │  - 20 Read Replicas                               │  │
│  │  - All Infrastructure                             │  │
│  │  Status: ✅ ACTIVE (Main Region)                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                    │
                    │ Replication
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐      ┌───────────────┐
│ RUSSIA        │      │ MUMBAI        │
│ MOSCOW        │      │ (DR)          │
│ Secondary     │      │ Standby       │
│ Active        │      │ DR Only       │
└───────────────┘      └───────────────┘
```

### Key Principles

1. **India (Hyderabad) is MAIN**: All database writes go to India
2. **Russia (Moscow) is ACTIVE**: Full infrastructure for Russian users
3. **Mumbai is DR**: Only for India region disaster recovery
4. **Russia DR**: Can use another Russian region or Mumbai as DR

## 🔄 Data Flow

### Write Operations

```
All Writes → India (Hyderabad) Primary Databases
                │
                ├─→ Replicate to → Russia Read Replicas (< 5 min lag)
                └─→ Replicate to → Mumbai Standby (< 15 min lag)
```

### Read Operations

```
Indian Users → India Services → India Databases
Russian Users → Russia Services → Russia Read Replicas
```

## 📊 Deployment Order

1. ✅ **Phase 1**: [11-01 India - Hyderabad](./11-01-india-hyderabad/README.md) (Primary) - **COMPLETE**
2. 🚀 **Phase 2**: [11-02 Russia - Moscow](./11-02-russia-moscow/README.md) (Secondary) - **TO DEPLOY**
3. ✅ **Phase 3**: [11-03 India - Mumbai](./11-03-india-mumbai/README.md) (DR) - **COMPLETE**

## 🔗 Related Documentation

- [Database Placement & DR](../10-database-placement-replication-dr.md)
- [Database Schemas](../../database/01-master-er-diagram.md) - Database schemas and ER diagrams
- [Diagrams Overview](../README.md) - All infrastructure diagrams

