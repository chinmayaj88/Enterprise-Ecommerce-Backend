<div align="center">

# 🗄️ Database Architecture - Multi-Environment Autonomous Databases

[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![OCI](https://img.shields.io/badge/Cloud-OCI-green?style=flat-square&logo=oracle&logoColor=white)](https://www.oracle.com/cloud/)
[![Multi-Environment](https://img.shields.io/badge/Environments-All-orange?style=flat-square)](.)

**Complete database architecture for Production, Staging, and Development environments**

</div>

---

## Multi-Environment Database Overview

```mermaid
graph TB
    subgraph OCI["OCI Autonomous Databases - Multi-Environment"]
        
        subgraph ProdDB["🔴 Production Databases<br/>Compartment: ecommerce-production<br/>VCN: 10.0.0.0/16"]
            ProdDBs["10 Databases<br/>2-128 OCPUs each<br/>2TB+ Storage<br/>2-5 Read Replicas each<br/>Multi-AZ"]
        end
        
        subgraph StagingDB["🟠 Staging Databases<br/>Compartment: ecommerce-staging<br/>VCN: 10.1.0.0/16"]
            StagingDBs["10 Databases<br/>2-16 OCPUs each<br/>1TB+ Storage<br/>1-2 Read Replicas each<br/>Multi-AZ"]
        end
        
        subgraph DevDB["🟢 Development Databases<br/>Compartment: ecommerce-development<br/>VCN: 10.2.0.0/16"]
            DevDBs["10 Databases<br/>2-4 OCPUs each<br/>1TB Storage<br/>No Read Replicas<br/>Single AZ"]
        end
    end
    
    style ProdDB fill:#c62828,stroke:#b71c1c,stroke-width:4px,color:#fff
    style StagingDB fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
    style DevDB fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
```

## Production Database Overview

```mermaid
graph TB
    subgraph ADB["10 Production Autonomous Databases PostgreSQL<br/>Compartment: ecommerce-production"]
        
        subgraph AuthDB["Auth Database<br/>ecommerce-production-auth-db"]
            Auth_Primary["Primary Instance<br/>2-128 OCPUs<br/>2TB+ Storage<br/>Auto-scaling enabled"]
            Auth_Replicas["Read Replicas<br/>2-5 replicas<br/>Multi-AZ"]
        end
        
        subgraph UserDB["User Database<br/>ecommerce-production-user-db"]
            User_Primary["Primary Instance<br/>2-128 OCPUs<br/>2TB+ Storage"]
            User_Replicas["Read Replicas<br/>2-5 replicas"]
        end
        
        subgraph ProductDB["Product Database<br/>ecommerce-production-product-db"]
            Product_Primary["Primary Instance<br/>2-128 OCPUs<br/>2TB+ Storage"]
            Product_Replicas["Read Replicas<br/>2-5 replicas"]
        end
        
        subgraph OrderDB["Order Database<br/>ecommerce-production-order-db"]
            Order_Primary["Primary Instance<br/>2-128 OCPUs<br/>2TB+ Storage"]
            Order_Replicas["Read Replicas<br/>2-5 replicas"]
        end
        
        subgraph OtherDB["Other Databases<br/>Cart, Payment, Notification,<br/>Discount, Shipping, Return"]
            Other_Primary["7 Primary Instances<br/>Same configuration"]
            Other_Replicas["7 sets of Read Replicas"]
        end
    end
    
    subgraph Features["Database Features"]
        AutoScale["Auto-scaling<br/>2-128 OCPUs<br/>2TB+ Storage"]
        Backup["Automated Backups<br/>30-day retention<br/>Point-in-time recovery"]
        Security["Security<br/>mTLS enabled<br/>Encryption at rest"]
        HA["High Availability<br/>Multi-AZ<br/>Automatic failover"]
    end
    
    Auth_Primary --> Auth_Replicas
    User_Primary --> User_Replicas
    Product_Primary --> Product_Replicas
    Order_Primary --> Order_Replicas
    Other_Primary --> Other_Replicas
    
    Auth_Primary --> AutoScale
    Auth_Primary --> Backup
    Auth_Primary --> Security
    Auth_Primary --> HA
    
    classDef primaryClass fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef replicaClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef featureClass fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    
    class Auth_Primary,User_Primary,Product_Primary,Order_Primary,Other_Primary primaryClass
    class Auth_Replicas,User_Replicas,Product_Replicas,Order_Replicas,Other_Replicas replicaClass
    class AutoScale,Backup,Security,HA featureClass
```

## Database to Service Mapping

```mermaid
graph LR
    subgraph Services["Microservices"]
        AuthSvc["Auth Service"]
        UserSvc["User Service"]
        ProductSvc["Product Service"]
        CartSvc["Cart Service"]
        OrderSvc["Order Service"]
        PaymentSvc["Payment Service"]
        NotifySvc["Notification Service"]
        DiscountSvc["Discount Service"]
        ShippingSvc["Shipping Service"]
        ReturnSvc["Return Service"]
    end
    
    subgraph Databases["Autonomous Databases"]
        AuthDB["Auth DB"]
        UserDB["User DB"]
        ProductDB["Product DB"]
        CartDB["Cart DB"]
        OrderDB["Order DB"]
        PaymentDB["Payment DB"]
        NotifyDB["Notification DB"]
        DiscountDB["Discount DB"]
        ShippingDB["Shipping DB"]
        ReturnDB["Return DB"]
    end
    
    AuthSvc --> AuthDB
    UserSvc --> UserDB
    ProductSvc --> ProductDB
    CartSvc --> CartDB
    OrderSvc --> OrderDB
    PaymentSvc --> PaymentDB
    NotifySvc --> NotifyDB
    DiscountSvc --> DiscountDB
    ShippingSvc --> ShippingDB
    ReturnSvc --> ReturnDB
    
    classDef serviceClass fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef dbClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    
    class AuthSvc,UserSvc,ProductSvc,CartSvc,OrderSvc,PaymentSvc,NotifySvc,DiscountSvc,ShippingSvc,ReturnSvc serviceClass
    class AuthDB,UserDB,ProductDB,CartDB,OrderDB,PaymentDB,NotifyDB,DiscountDB,ShippingDB,ReturnDB dbClass
```

## Database Auto-scaling Flow

```mermaid
sequenceDiagram
    participant Service as Service
    participant DB as Autonomous DB
    participant Monitor as OCI Monitoring
    participant AutoScale as Auto-scaling Engine
    
    Service->>DB: High Load Query
    DB->>Monitor: Report CPU/Memory Usage
    Monitor->>AutoScale: CPU > 80% or Memory > 80%
    AutoScale->>DB: Scale Up OCPUs
    DB->>DB: Add CPU Cores (2 → 4 → 8...)
    DB-->>Service: Improved Performance
```

## Production Database Configuration Summary

| Database | Service | Initial OCPUs | Max OCPUs | Initial Storage | Max Storage | Read Replicas |
|----------|---------|---------------|-----------|-----------------|-------------|---------------|
| **Auth DB** | Auth Service | 2 | 128 | 2TB | Unlimited | 2-5 |
| **User DB** | User Service | 2 | 128 | 2TB | Unlimited | 2-5 |
| **Product DB** | Product Service | 2 | 128 | 2TB | Unlimited | 2-5 |
| **Cart DB** | Cart Service | 2 | 128 | 2TB | Unlimited | 2-5 |
| **Order DB** | Order Service | 2 | 128 | 2TB | Unlimited | 2-5 |
| **Payment DB** | Payment Service | 2 | 128 | 2TB | Unlimited | 2-5 |
| **Notification DB** | Notification Service | 2 | 128 | 2TB | Unlimited | 2-5 |
| **Discount DB** | Discount Service | 2 | 128 | 2TB | Unlimited | 2-5 |
| **Shipping DB** | Shipping Service | 2 | 128 | 2TB | Unlimited | 2-5 |
| **Return DB** | Return Service | 2 | 128 | 2TB | Unlimited | 2-5 |

## Staging Database Configuration Summary

| Database | Service | Initial OCPUs | Max OCPUs | Initial Storage | Max Storage | Read Replicas |
|----------|---------|---------------|-----------|-----------------|-------------|---------------|
| **Auth DB** | Auth Service | 2 | 16 | 1TB | 2TB | 1-2 |
| **User DB** | User Service | 2 | 16 | 1TB | 2TB | 1-2 |
| **Product DB** | Product Service | 2 | 16 | 1TB | 2TB | 1-2 |
| **Cart DB** | Cart Service | 2 | 16 | 1TB | 2TB | 1-2 |
| **Order DB** | Order Service | 2 | 16 | 1TB | 2TB | 1-2 |
| **Payment DB** | Payment Service | 2 | 16 | 1TB | 2TB | 1-2 |
| **Notification DB** | Notification Service | 2 | 16 | 1TB | 2TB | 1-2 |
| **Discount DB** | Discount Service | 2 | 16 | 1TB | 2TB | 1-2 |
| **Shipping DB** | Shipping Service | 2 | 16 | 1TB | 2TB | 1-2 |
| **Return DB** | Return Service | 2 | 16 | 1TB | 2TB | 1-2 |

## Development Database Configuration Summary

| Database | Service | Initial OCPUs | Max OCPUs | Initial Storage | Max Storage | Read Replicas |
|----------|---------|---------------|-----------|-----------------|-------------|---------------|
| **Auth DB** | Auth Service | 2 | 4 | 1TB | 1TB | 0 |
| **User DB** | User Service | 2 | 4 | 1TB | 1TB | 0 |
| **Product DB** | Product Service | 2 | 4 | 1TB | 1TB | 0 |
| **Cart DB** | Cart Service | 2 | 4 | 1TB | 1TB | 0 |
| **Order DB** | Order Service | 2 | 4 | 1TB | 1TB | 0 |
| **Payment DB** | Payment Service | 2 | 4 | 1TB | 1TB | 0 |
| **Notification DB** | Notification Service | 2 | 4 | 1TB | 1TB | 0 |
| **Discount DB** | Discount Service | 2 | 4 | 1TB | 1TB | 0 |
| **Shipping DB** | Shipping Service | 2 | 4 | 1TB | 1TB | 0 |
| **Return DB** | Return Service | 2 | 4 | 1TB | 1TB | 0 |

## Environment Comparison

| Component | Production | Staging | Development |
|-----------|-----------|---------|-------------|
| **Database Count** | 10 | 10 | 10 |
| **Initial OCPUs** | 2 | 2 | 2 |
| **Max OCPUs** | 128 | 16 | 4 |
| **Initial Storage** | 2TB | 1TB | 1TB |
| **Max Storage** | Unlimited | 2TB | 1TB |
| **Read Replicas** | 2-5 per DB | 1-2 per DB | 0 |
| **Availability Domains** | 3 ADs | 3 ADs | 1 AD |
| **Auto-scaling** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Backup Retention** | 30 days | 7 days | 3 days |
| **Cost** | High | Medium | Low |

## Database Features

```mermaid
graph TB
    subgraph Features["Autonomous Database Features"]
        Performance["Performance<br/>- Auto-scaling CPU<br/>- Auto-scaling Storage<br/>- Query optimization<br/>- Connection pooling"]
        Security["Security<br/>- mTLS required<br/>- Encryption at rest<br/>- Encryption in transit<br/>- Network isolation"]
        Availability["High Availability<br/>- Multi-AZ deployment<br/>- Automatic failover<br/>- Read replicas<br/>- Zero downtime"]
        Backup["Backup & Recovery<br/>- Automated backups<br/>- 30-day retention<br/>- Point-in-time recovery<br/>- Cross-region backup"]
    end
    
    classDef featureClass fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    class Performance,Security,Availability,Backup featureClass
```

