<div align="center">

# 📊 OCI Infrastructure Diagrams

[![Diagrams](https://img.shields.io/badge/Infrastructure-Diagrams-blue?style=for-the-badge)](.)
[![OCI](https://img.shields.io/badge/Cloud-OCI-green?style=flat-square&logo=oracle&logoColor=white)](https://www.oracle.com/cloud/)
[![Mermaid](https://img.shields.io/badge/Format-Mermaid-orange?style=flat-square&logo=mermaid&logoColor=white)](https://mermaid.js.org/)

**Comprehensive Mermaid diagrams for the OCI production infrastructure**

</div>

---

This folder contains comprehensive Mermaid diagrams for the OCI production infrastructure, organized in the order they will be created in production.

## 📁 Folder Structure (Production Order)

```
diagrams/
├── 01-master-architecture.md                    # Master overview diagram
├── 01-master-architecture-detailed.md           # Detailed master diagram
├── 02-networking-vcn-subnets.md                 # VCN, subnets, security lists, routing
├── 03-iam-roles-policies.md                     # IAM roles, policies, dynamic groups
├── 04-security-waf.md                           # WAF, DDoS protection
├── 04-security-kms-vault.md                     # KMS, Vault, secrets management
├── 05-compute-oke-cluster.md                    # OKE cluster, services, HPA, autoscaling
├── 06-data-databases.md                          # Autonomous databases, read replicas
├── 06-data-redis.md                              # Redis cluster, caching patterns
├── 07-messaging-streaming-queue.md              # OCI Streaming, Queue, event-driven
├── 08-monitoring-alarms.md                      # Monitoring, alarms, notifications
├── 09-cost-management.md                         # Cost tracking, budgets, optimization
├── 10-database-placement-replication-dr.md      # Database placement, replicas, disaster recovery
├── 11-multi-region/
│   ├── 11-master-multi-region-architecture.md   # Multi-region architecture
│   ├── README.md                                 # Multi-region overview
│   ├── 11-01-india-hyderabad/                    # India primary region (Deploy First)
│   ├── 11-02-russia-moscow/                      # Russia secondary region (Deploy After India)
│   └── 11-03-india-mumbai/                       # Mumbai DR region (Deploy Last)
└── PRODUCTION_ARCHITECTURE_DIAGRAM.md            # ASCII architecture diagram
```

## 🗺️ Navigation (Production Creation Order)

### Phase 1: Planning & Foundation
1. **[Master Architecture](./01-master-architecture.md)** - High-level overview with links to detailed diagrams
2. **[Master Architecture (Detailed)](./01-master-architecture-detailed.md)** - Complete detailed architecture

### Phase 2: Networking Foundation
3. **[Networking - VCN & Subnets](./02-networking-vcn-subnets.md)** - VCN, subnets, security lists, routing

### Phase 3: Security Foundation
4. **[IAM Roles & Policies](./03-iam-roles-policies.md)** - Identity and access management
5. **[Security - WAF](./04-security-waf.md)** - Web application firewall, DDoS protection
6. **[Security - KMS & Vault](./04-security-kms-vault.md)** - Secrets management, encryption

### Phase 4: Compute Infrastructure
7. **[Compute - OKE Cluster](./05-compute-oke-cluster.md)** - Kubernetes cluster and services

### Phase 5: Data Layer
8. **[Data - Databases](./06-data-databases.md)** - All 10 autonomous databases
9. **[Data - Redis Cache](./06-data-redis.md)** - Caching architecture

### Phase 6: Messaging & Events
10. **[Messaging - Streaming & Queue](./07-messaging-streaming-queue.md)** - Event-driven architecture

### Phase 7: Observability
11. **[Monitoring & Alarms](./08-monitoring-alarms.md)** - Alarms, logging, metrics
12. **[Cost Management](./09-cost-management.md)** - Cost tracking and optimization

### Phase 8: Database Infrastructure Planning
13. **[Database Placement, Replication & DR](./10-database-placement-replication-dr.md)** - Database placement, replicas, disaster recovery

### Phase 9: Multi-Region Deployment
14. **[Multi-Region Architecture](./11-multi-region/)** - Multi-region deployment (India, Russia, Mumbai)

## 📊 Production Deployment Order

The files are numbered in the order they should be created in production:

<div align="center">

**Production deployment order:**

</div>

| Phase | Step | File | Description |
|:---:|:---:|:---|:---|
| **1️⃣** | Planning | `01-master-architecture*.md` | Overall architecture planning |
| **2️⃣** | Foundation | `02-networking-vcn-subnets.md` | Network foundation (VCN, subnets) |
| **3️⃣** | Security | `03-iam-roles-policies.md` | IAM setup |
| **3️⃣** | Security | `04-security-*.md` | WAF, KMS, Vault |
| **4️⃣** | Compute | `05-compute-oke-cluster.md` | Kubernetes cluster |
| **5️⃣** | Data | `06-data-*.md` | Databases and Redis |
| **6️⃣** | Messaging | `07-messaging-streaming-queue.md` | Event infrastructure |
| **7️⃣** | Observability | `08-monitoring-alarms.md` | Monitoring setup |
| **7️⃣** | Observability | `09-cost-management.md` | Cost tracking |
| **8️⃣** | DB Planning | `10-database-placement-replication-dr.md` | Database infrastructure |
| **9️⃣** | Multi-Region | `11-multi-region/` | Multi-region deployment (11-01 India, 11-02 Russia, 11-03 Mumbai) |

## 📊 Diagram Types

- **Architecture Diagrams** - Component relationships and structure
- **Flow Diagrams** - Request flows and data flows
- **Sequence Diagrams** - Step-by-step processes
- **Configuration Diagrams** - Settings and configurations

## 🎨 Color Coding

- 🔵 **Blue** - Compute resources (OKE, services)
- 🟠 **Orange** - Data resources (databases, storage)
- 🟣 **Purple** - Security resources (WAF, KMS, Vault)
- 🟢 **Green** - Monitoring and cost
- 🔴 **Red** - Security and alerts

## 📝 Usage

These diagrams can be:
- Viewed in GitHub (renders automatically)
- Used in documentation
- Opened in [Mermaid Live Editor](https://mermaid.live/)
- Exported as PNG/SVG for presentations

## 🔄 Updates

When infrastructure changes, update the relevant diagram files to keep them in sync.
