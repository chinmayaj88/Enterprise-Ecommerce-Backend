<div align="center">

# 🔐 IAM Roles & Policies - Complete Detailed with Multi-Environment

[![IAM](https://img.shields.io/badge/IAM-Roles%20%26%20Policies-blue?style=for-the-badge)](.)
[![Security](https://img.shields.io/badge/Security-Access%20Control-green?style=flat-square)](.)
[![Multi-Environment](https://img.shields.io/badge/Environments-All-orange?style=flat-square)](.)

**Complete IAM architecture with roles, policies, and security boundaries**

</div>

---

Complete IAM architecture with roles, policies, and security boundaries for Production, Staging, and Development environments.

## Multi-Environment IAM Architecture

```mermaid
graph TB
    subgraph Tenancy["OCI Tenancy: ecommerce-tenancy"]
        
        subgraph ProdComp["Compartment: ecommerce-production"]
            subgraph ProdDG["Production Dynamic Groups"]
                ProdOKE_DG["ecommerce-production-oke-services<br/>Matching: OKE nodes in prod compartment"]
            end
            
            subgraph ProdPolicies["Production Policies"]
                ProdPolicy["ecommerce-production-policy<br/>Full access to prod resources<br/>BLOCK access from other envs"]
            end
            
            subgraph ProdRoles["Production Roles"]
                ProdAdmin["Production Admin<br/>Full access to prod"]
                ProdOperator["Production Operator<br/>Deploy and manage prod"]
                ProdViewer["Production Viewer<br/>Read-only access"]
            end
        end
        
        subgraph StagingComp["Compartment: ecommerce-staging"]
            subgraph StagingDG["Staging Dynamic Groups"]
                StagingOKE_DG["ecommerce-staging-oke-services<br/>Matching: OKE nodes in staging compartment"]
            end
            
            subgraph StagingPolicies["Staging Policies"]
                StagingPolicy["ecommerce-staging-policy<br/>Access to staging resources<br/>BLOCK access to prod"]
            end
            
            subgraph StagingRoles["Staging Roles"]
                StagingAdmin["Staging Admin<br/>Full access to staging"]
                StagingDeveloper["Staging Developer<br/>Deploy to staging"]
            end
        end
        
        subgraph DevComp["Compartment: ecommerce-development"]
            subgraph DevDG["Development Dynamic Groups"]
                DevOKE_DG["ecommerce-development-oke-services<br/>Matching: OKE nodes in dev compartment"]
            end
            
            subgraph DevPolicies["Development Policies"]
                DevPolicy["ecommerce-development-policy<br/>Access to dev resources<br/>BLOCK access to prod<br/>Read-only to staging"]
            end
            
            subgraph DevRoles["Development Roles"]
                DevAdmin["Development Admin<br/>Full access to dev"]
                DevDeveloper["Developer<br/>Deploy to dev<br/>Read staging"]
            end
        end
        
        subgraph SecurityPolicies["Security Policies (Tenancy Level)"]
            ProdProtection["Production Protection Policy<br/>DENY all access to prod<br/>from staging and dev"]
        end
    end
    
    %% Connections
    ProdDG --> ProdPolicy
    StagingDG --> StagingPolicy
    DevDG --> DevPolicy
    ProdPolicy --> ProdProtection
    StagingPolicy --> ProdProtection
    DevPolicy --> ProdProtection
    
    %% Security boundaries
    StagingPolicy -.->|"BLOCKED"| ProdComp
    DevPolicy -.->|"BLOCKED"| ProdComp
    DevPolicy -.->|"Read-only"| StagingComp
    
    %% Styling
    style ProdComp fill:#c62828,stroke:#b71c1c,stroke-width:4px,color:#fff
    style StagingComp fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
    style DevComp fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
    style ProdProtection fill:#ff0000,stroke:#cc0000,stroke-width:4px,color:#fff
```

## Production IAM Configuration

### Production Dynamic Groups

```mermaid
graph TB
    subgraph ProdDG["Production Dynamic Groups"]
        ProdOKE["ecommerce-production-oke-services<br/><br/>Matching Rule:<br/>ALL {<br/>  instance.compartment.id = 'prod_compartment_id',<br/>  instance.id = '*'<br/>}<br/><br/>Purpose: OKE service accounts<br/>in production compartment"]
    end
    
    subgraph ProdResources["Production Resources"]
        ProdVault["OCI Vault<br/>Production secrets"]
        ProdDB["10 Production Databases"]
        ProdRedis["Production Redis"]
        ProdStream["Production Streaming"]
        ProdQueue["Production Queue"]
    end
    
    ProdOKE --> ProdResources
    
    style ProdDG fill:#c62828,stroke:#b71c1c,stroke-width:3px,color:#fff
```

### Production IAM Policy

```mermaid
graph TB
    subgraph ProdPolicy["Production Policy<br/>ecommerce-production-policy"]
        P1["Statement 1:<br/>Allow dynamic-group<br/>ecommerce-production-oke-services<br/>to read secret-family<br/>in compartment ecommerce-production"]
        P2["Statement 2:<br/>Allow dynamic-group<br/>ecommerce-production-oke-services<br/>to use vaults<br/>in compartment ecommerce-production"]
        P3["Statement 3:<br/>Allow dynamic-group<br/>ecommerce-production-oke-services<br/>to manage objects<br/>in buckets ecommerce-production-*"]
        P4["Statement 4:<br/>Allow dynamic-group<br/>ecommerce-production-oke-services<br/>to read autonomous-database-family<br/>in compartment ecommerce-production"]
        P5["Statement 5:<br/>Allow dynamic-group<br/>ecommerce-production-oke-services<br/>to use redis-clusters<br/>in compartment ecommerce-production"]
        P6["Statement 6:<br/>Allow dynamic-group<br/>ecommerce-production-oke-services<br/>to use stream-family<br/>in compartment ecommerce-production"]
        P7["Statement 7:<br/>Allow dynamic-group<br/>ecommerce-production-oke-services<br/>to use queue-family<br/>in compartment ecommerce-production"]
        P8["Statement 8:<br/>DENY dynamic-group<br/>ecommerce-staging-oke-services<br/>to access ANY resources<br/>in compartment ecommerce-production"]
        P9["Statement 9:<br/>DENY dynamic-group<br/>ecommerce-development-oke-services<br/>to access ANY resources<br/>in compartment ecommerce-production"]
    end
    
    style P8 fill:#ff0000,stroke:#cc0000,stroke-width:3px,color:#fff
    style P9 fill:#ff0000,stroke:#cc0000,stroke-width:3px,color:#fff
```

### Production User Roles

| Role | Permissions | Users | Purpose |
|------|-------------|-------|---------|
| **Production Admin** | Full access to prod compartment | DevOps Leads | Complete control |
| **Production Operator** | Deploy, manage, scale prod resources | DevOps Engineers | Day-to-day operations |
| **Production Viewer** | Read-only access to prod | Support Team | Monitoring and troubleshooting |
| **Production Developer** | ❌ **NO ACCESS** | Developers | Developers cannot access prod |

## Staging IAM Configuration

### Staging Dynamic Groups

```mermaid
graph TB
    subgraph StagingDG["Staging Dynamic Groups"]
        StagingOKE["ecommerce-staging-oke-services<br/><br/>Matching Rule:<br/>ALL {<br/>  instance.compartment.id = 'staging_compartment_id',<br/>  instance.id = '*'<br/>}<br/><br/>Purpose: OKE service accounts<br/>in staging compartment"]
    end
    
    subgraph StagingResources["Staging Resources"]
        StagingVault["OCI Vault<br/>Staging secrets"]
        StagingDB["10 Staging Databases"]
        StagingRedis["Staging Redis"]
        StagingStream["Staging Streaming"]
        StagingQueue["Staging Queue"]
    end
    
    StagingOKE --> StagingResources
    
    style StagingDG fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
```

### Staging IAM Policy

```mermaid
graph TB
    subgraph StagingPolicy["Staging Policy<br/>ecommerce-staging-policy"]
        S1["Statement 1:<br/>Allow dynamic-group<br/>ecommerce-staging-oke-services<br/>to read secret-family<br/>in compartment ecommerce-staging"]
        S2["Statement 2:<br/>Allow dynamic-group<br/>ecommerce-staging-oke-services<br/>to use vaults<br/>in compartment ecommerce-staging"]
        S3["Statement 3:<br/>Allow dynamic-group<br/>ecommerce-staging-oke-services<br/>to manage objects<br/>in buckets ecommerce-staging-*"]
        S4["Statement 4:<br/>Allow dynamic-group<br/>ecommerce-staging-oke-services<br/>to read autonomous-database-family<br/>in compartment ecommerce-staging"]
        S5["Statement 5:<br/>Allow dynamic-group<br/>ecommerce-staging-oke-services<br/>to use redis-clusters<br/>in compartment ecommerce-staging"]
        S6["Statement 6:<br/>Allow dynamic-group<br/>ecommerce-staging-oke-services<br/>to use stream-family<br/>in compartment ecommerce-staging"]
        S7["Statement 7:<br/>Allow dynamic-group<br/>ecommerce-staging-oke-services<br/>to use queue-family<br/>in compartment ecommerce-staging"]
        S8["Statement 8:<br/>DENY dynamic-group<br/>ecommerce-staging-oke-services<br/>to access ANY resources<br/>in compartment ecommerce-production"]
        S9["Statement 9:<br/>DENY group<br/>ecommerce-staging-developers<br/>to access ANY resources<br/>in compartment ecommerce-production"]
    end
    
    style S8 fill:#ff0000,stroke:#cc0000,stroke-width:3px,color:#fff
    style S9 fill:#ff0000,stroke:#cc0000,stroke-width:3px,color:#fff
```

### Staging User Roles

| Role | Permissions | Users | Purpose |
|------|-------------|-------|---------|
| **Staging Admin** | Full access to staging compartment | DevOps Engineers | Complete staging control |
| **Staging Developer** | Deploy, manage staging resources | Developers | Pre-production testing |
| **Staging Viewer** | Read-only access to staging | QA Team | Testing and validation |

## Development IAM Configuration

### Development Dynamic Groups

```mermaid
graph TB
    subgraph DevDG["Development Dynamic Groups"]
        DevOKE["ecommerce-development-oke-services<br/><br/>Matching Rule:<br/>ALL {<br/>  instance.compartment.id = 'dev_compartment_id',<br/>  instance.id = '*'<br/>}<br/><br/>Purpose: OKE service accounts<br/>in development compartment"]
    end
    
    subgraph DevResources["Development Resources"]
        DevVault["OCI Vault<br/>Dev secrets"]
        DevDB["10 Development Databases"]
        DevRedis["Development Redis"]
        DevStream["Development Streaming"]
        DevQueue["Development Queue"]
    end
    
    DevOKE --> DevResources
    
    style DevDG fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
```

### Development IAM Policy

```mermaid
graph TB
    subgraph DevPolicy["Development Policy<br/>ecommerce-development-policy"]
        D1["Statement 1:<br/>Allow dynamic-group<br/>ecommerce-development-oke-services<br/>to read secret-family<br/>in compartment ecommerce-development"]
        D2["Statement 2:<br/>Allow dynamic-group<br/>ecommerce-development-oke-services<br/>to use vaults<br/>in compartment ecommerce-development"]
        D3["Statement 3:<br/>Allow dynamic-group<br/>ecommerce-development-oke-services<br/>to manage objects<br/>in buckets ecommerce-development-*"]
        D4["Statement 4:<br/>Allow dynamic-group<br/>ecommerce-development-oke-services<br/>to read autonomous-database-family<br/>in compartment ecommerce-development"]
        D5["Statement 5:<br/>Allow dynamic-group<br/>ecommerce-development-oke-services<br/>to use redis-clusters<br/>in compartment ecommerce-development"]
        D6["Statement 6:<br/>Allow dynamic-group<br/>ecommerce-development-oke-services<br/>to use stream-family<br/>in compartment ecommerce-development"]
        D7["Statement 7:<br/>Allow dynamic-group<br/>ecommerce-development-oke-services<br/>to use queue-family<br/>in compartment ecommerce-development"]
        D8["Statement 8:<br/>DENY dynamic-group<br/>ecommerce-development-oke-services<br/>to access ANY resources<br/>in compartment ecommerce-production"]
        D9["Statement 9:<br/>DENY group<br/>ecommerce-developers<br/>to access ANY resources<br/>in compartment ecommerce-production"]
        D10["Statement 10:<br/>Allow group<br/>ecommerce-developers<br/>to read resources<br/>in compartment ecommerce-staging<br/>(Read-only)"]
    end
    
    style D8 fill:#ff0000,stroke:#cc0000,stroke-width:3px,color:#fff
    style D9 fill:#ff0000,stroke:#cc0000,stroke-width:3px,color:#fff
    style D10 fill:#4caf50,stroke:#2e7d32,stroke-width:2px,color:#fff
```

### Development User Roles

| Role | Permissions | Users | Purpose |
|------|-------------|-------|---------|
| **Development Admin** | Full access to dev compartment | Senior Developers | Complete dev control |
| **Developer** | Deploy, manage dev resources<br/>Read-only staging access | All Developers | Development and testing |
| **Developer Viewer** | Read-only dev access | Junior Developers | Learning and observation |

## Production Protection Policy (Tenancy Level)

```mermaid
graph TB
    subgraph ProdProtection["Production Protection Policy<br/>(Tenancy Level - Highest Priority)"]
        Rule1["Rule 1: DENY All Staging Access<br/>DENY group ecommerce-staging-*<br/>to access ANY resources<br/>in compartment ecommerce-production"]
        Rule2["Rule 2: DENY All Development Access<br/>DENY group ecommerce-development-*<br/>to access ANY resources<br/>in compartment ecommerce-production"]
        Rule3["Rule 3: DENY All External Access<br/>DENY any user/group not explicitly<br/>granted access to<br/>compartment ecommerce-production"]
        Rule4["Rule 4: DENY Cross-Environment Network<br/>DENY network traffic from<br/>10.1.0.0/16 and 10.2.0.0/16<br/>to 10.0.0.0/16"]
    end
    
    style ProdProtection fill:#ff0000,stroke:#cc0000,stroke-width:4px,color:#fff
```

## Complete IAM Policy Statements

### Production Policy Statements

```yaml
Policy: ecommerce-production-policy
Compartment: ecommerce-production

Statements:
  1. Allow dynamic-group ecommerce-production-oke-services to read secret-family in compartment ecommerce-production
  2. Allow dynamic-group ecommerce-production-oke-services to use vaults in compartment ecommerce-production
  3. Allow dynamic-group ecommerce-production-oke-services to manage objects in buckets ecommerce-production-* in compartment ecommerce-production
  4. Allow dynamic-group ecommerce-production-oke-services to read autonomous-database-family in compartment ecommerce-production
  5. Allow dynamic-group ecommerce-production-oke-services to use redis-clusters in compartment ecommerce-production
  6. Allow dynamic-group ecommerce-production-oke-services to use stream-family in compartment ecommerce-production
  7. Allow dynamic-group ecommerce-production-oke-services to use queue-family in compartment ecommerce-production
  8. DENY dynamic-group ecommerce-staging-oke-services to access ANY resources in compartment ecommerce-production
  9. DENY dynamic-group ecommerce-development-oke-services to access ANY resources in compartment ecommerce-production
  10. DENY group ecommerce-staging-developers to access ANY resources in compartment ecommerce-production
  11. DENY group ecommerce-developers to access ANY resources in compartment ecommerce-production
```

### Staging Policy Statements

```yaml
Policy: ecommerce-staging-policy
Compartment: ecommerce-staging

Statements:
  1. Allow dynamic-group ecommerce-staging-oke-services to read secret-family in compartment ecommerce-staging
  2. Allow dynamic-group ecommerce-staging-oke-services to use vaults in compartment ecommerce-staging
  3. Allow dynamic-group ecommerce-staging-oke-services to manage objects in buckets ecommerce-staging-* in compartment ecommerce-staging
  4. Allow dynamic-group ecommerce-staging-oke-services to read autonomous-database-family in compartment ecommerce-staging
  5. Allow dynamic-group ecommerce-staging-oke-services to use redis-clusters in compartment ecommerce-staging
  6. Allow dynamic-group ecommerce-staging-oke-services to use stream-family in compartment ecommerce-staging
  7. Allow dynamic-group ecommerce-staging-oke-services to use queue-family in compartment ecommerce-staging
  8. DENY dynamic-group ecommerce-staging-oke-services to access ANY resources in compartment ecommerce-production
  9. DENY group ecommerce-staging-developers to access ANY resources in compartment ecommerce-production
```

### Development Policy Statements

```yaml
Policy: ecommerce-development-policy
Compartment: ecommerce-development

Statements:
  1. Allow dynamic-group ecommerce-development-oke-services to read secret-family in compartment ecommerce-development
  2. Allow dynamic-group ecommerce-development-oke-services to use vaults in compartment ecommerce-development
  3. Allow dynamic-group ecommerce-development-oke-services to manage objects in buckets ecommerce-development-* in compartment ecommerce-development
  4. Allow dynamic-group ecommerce-development-oke-services to read autonomous-database-family in compartment ecommerce-development
  5. Allow dynamic-group ecommerce-development-oke-services to use redis-clusters in compartment ecommerce-development
  6. Allow dynamic-group ecommerce-development-oke-services to use stream-family in compartment ecommerce-development
  7. Allow dynamic-group ecommerce-development-oke-services to use queue-family in compartment ecommerce-development
  8. DENY dynamic-group ecommerce-development-oke-services to access ANY resources in compartment ecommerce-production
  9. DENY group ecommerce-developers to access ANY resources in compartment ecommerce-production
  10. Allow group ecommerce-developers to read resources in compartment ecommerce-staging (Read-only)
```

## Kubernetes Service Accounts per Environment

### Production Service Accounts

```mermaid
graph TB
    subgraph ProdSA["Production Service Accounts"]
        ProdSA_Gateway["gateway-service-sa<br/>Annotation:<br/>oci.oraclecloud.com/oci-identity-dynamic-group:<br/>ecommerce-production-oke-services"]
        ProdSA_Auth["auth-service-sa<br/>Same annotation"]
        ProdSA_User["user-service-sa<br/>Same annotation"]
        ProdSA_Product["product-service-sa<br/>Same annotation"]
        ProdSA_Order["order-service-sa<br/>Same annotation"]
        ProdSA_Payment["payment-service-sa<br/>Same annotation"]
        ProdSA_Cart["cart-service-sa<br/>Same annotation"]
        ProdSA_Notification["notification-service-sa<br/>Same annotation"]
        ProdSA_Discount["discount-service-sa<br/>Same annotation"]
        ProdSA_Shipping["shipping-service-sa<br/>Same annotation"]
        ProdSA_Return["return-service-sa<br/>Same annotation"]
    end
    
    ProdSA --> ProdPolicy["Production Policy"]
    
    style ProdSA fill:#c62828,stroke:#b71c1c,stroke-width:2px,color:#fff
```

### Staging Service Accounts

```mermaid
graph TB
    subgraph StagingSA["Staging Service Accounts"]
        StagingSA_Gateway["gateway-service-sa<br/>Annotation:<br/>oci.oraclecloud.com/oci-identity-dynamic-group:<br/>ecommerce-staging-oke-services"]
        StagingSA_Auth["auth-service-sa<br/>Same annotation"]
        StagingSA_User["user-service-sa<br/>Same annotation"]
        StagingSA_Product["product-service-sa<br/>Same annotation"]
        StagingSA_Order["order-service-sa<br/>Same annotation"]
        StagingSA_Payment["payment-service-sa<br/>Same annotation"]
        StagingSA_Cart["cart-service-sa<br/>Same annotation"]
        StagingSA_Notification["notification-service-sa<br/>Same annotation"]
        StagingSA_Discount["discount-service-sa<br/>Same annotation"]
        StagingSA_Shipping["shipping-service-sa<br/>Same annotation"]
        StagingSA_Return["return-service-sa<br/>Same annotation"]
    end
    
    StagingSA --> StagingPolicy["Staging Policy"]
    
    style StagingSA fill:#f57c00,stroke:#e65100,stroke-width:2px,color:#fff
```

### Development Service Accounts

```mermaid
graph TB
    subgraph DevSA["Development Service Accounts"]
        DevSA_Gateway["gateway-service-sa<br/>Annotation:<br/>oci.oraclecloud.com/oci-identity-dynamic-group:<br/>ecommerce-development-oke-services"]
        DevSA_Auth["auth-service-sa<br/>Same annotation"]
        DevSA_User["user-service-sa<br/>Same annotation"]
        DevSA_Product["product-service-sa<br/>Same annotation"]
        DevSA_Order["order-service-sa<br/>Same annotation"]
        DevSA_Payment["payment-service-sa<br/>Same annotation"]
        DevSA_Cart["cart-service-sa<br/>Same annotation"]
        DevSA_Notification["notification-service-sa<br/>Same annotation"]
        DevSA_Discount["discount-service-sa<br/>Same annotation"]
        DevSA_Shipping["shipping-service-sa<br/>Same annotation"]
        DevSA_Return["return-service-sa<br/>Same annotation"]
    end
    
    DevSA --> DevPolicy["Development Policy"]
    
    style DevSA fill:#4caf50,stroke:#2e7d32,stroke-width:2px,color:#fff
```

## Access Control Matrix

| User/Group | Production | Staging | Development |
|------------|-----------|---------|-------------|
| **Production Admin** | ✅ Full Access | ❌ No Access | ❌ No Access |
| **Production Operator** | ✅ Deploy/Manage | ❌ No Access | ❌ No Access |
| **Production Viewer** | ✅ Read-only | ❌ No Access | ❌ No Access |
| **Staging Admin** | ❌ **BLOCKED** | ✅ Full Access | ❌ No Access |
| **Staging Developer** | ❌ **BLOCKED** | ✅ Deploy/Manage | ❌ No Access |
| **Development Admin** | ❌ **BLOCKED** | ✅ Read-only | ✅ Full Access |
| **Developer** | ❌ **BLOCKED** | ✅ Read-only | ✅ Deploy/Manage |

## Service Account Access Matrix

| Service Account | Production Resources | Staging Resources | Development Resources |
|-----------------|---------------------|-------------------|----------------------|
| **Production SAs** | ✅ Full Access | ❌ **BLOCKED** | ❌ **BLOCKED** |
| **Staging SAs** | ❌ **BLOCKED** | ✅ Full Access | ❌ No Access |
| **Development SAs** | ❌ **BLOCKED** | ✅ Read-only | ✅ Full Access |

## Security Enforcement Workflow

```mermaid
sequenceDiagram
    participant User as User/Service
    participant IAM as IAM Service
    participant Policy as IAM Policy
    participant ProdResource as Production Resource
    participant StagingResource as Staging Resource
    
    Note over User: Attempt to Access Resource
    User->>IAM: Request Access<br/>(e.g., Read Database)
    IAM->>Policy: Check User/Group Permissions
    
    alt User from Staging/Dev
        Policy->>Policy: Check Production Protection Rules
        Policy->>Policy: DENY Rule Found<br/>Block Access to Prod
        Policy-->>User: ❌ ACCESS DENIED<br/>Cannot access production resources
    else User from Production
        Policy->>Policy: Check Production Policy
        Policy->>Policy: Allow Rule Found
        Policy->>ProdResource: Grant Access
        ProdResource-->>User: ✅ Access Granted
    end
    
    Note over User,StagingResource: Staging Access
    User->>IAM: Request Access to Staging
    IAM->>Policy: Check Permissions
    alt User from Development
        Policy->>Policy: Check Staging Read Policy
        Policy->>StagingResource: Grant Read-only Access
        StagingResource-->>User: ✅ Read Access Granted
    else User from Production
        Policy->>Policy: DENY Rule Found
        Policy-->>User: ❌ ACCESS DENIED
    end
```

## Environment Isolation Summary

### Production Isolation

- ✅ **Complete Isolation**: No access from staging or development
- ✅ **Network Isolation**: Separate VCN (10.0.0.0/16)
- ✅ **IAM Isolation**: Separate compartment, policies, roles
- ✅ **Resource Isolation**: Separate databases, Redis, streaming, queue
- ✅ **Protection Policy**: Tenancy-level policy blocks all external access

### Staging Isolation

- ✅ **Isolated from Production**: Cannot access prod resources
- ✅ **Network Isolation**: Separate VCN (10.1.0.0/16)
- ✅ **IAM Isolation**: Separate compartment, policies, roles
- ✅ **Read Access for Dev**: Developers can read staging (read-only)

### Development Isolation

- ✅ **Isolated from Production**: Cannot access prod resources
- ✅ **Network Isolation**: Separate VCN (10.2.0.0/16)
- ✅ **IAM Isolation**: Separate compartment, policies, roles
- ✅ **Staging Read Access**: Can read staging resources (read-only)

## Complete IAM Summary

| Component | Production | Staging | Development |
|-----------|-----------|---------|-------------|
| **Compartment** | ecommerce-production | ecommerce-staging | ecommerce-development |
| **Dynamic Groups** | 1 (OKE services) | 1 (OKE services) | 1 (OKE services) |
| **IAM Policies** | 1 (with prod protection) | 1 (blocks prod) | 1 (blocks prod, allows staging read) |
| **User Roles** | 3 (Admin, Operator, Viewer) | 3 (Admin, Developer, Viewer) | 3 (Admin, Developer, Viewer) |
| **Service Accounts** | 11 (one per service) | 11 (one per service) | 11 (one per service) |
| **Production Access** | ✅ Full | ❌ **BLOCKED** | ❌ **BLOCKED** |

---

**Next**: [Security - WAF](./04-security-waf.md) for web application firewall
