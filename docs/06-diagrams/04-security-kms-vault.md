<div align="center">

# 🔐 KMS & Vault Architecture - Multi-Environment

[![KMS](https://img.shields.io/badge/KMS-Key%20Management-blue?style=for-the-badge)](.)
[![Vault](https://img.shields.io/badge/Vault-Secrets-green?style=flat-square)](.)
[![Security](https://img.shields.io/badge/Security-Encryption-orange?style=flat-square)](.)

**Complete KMS and Vault configuration for Production, Staging, and Development environments**

</div>

---

## Multi-Environment KMS & Vault Overview

```mermaid
graph TB
    subgraph OCI["OCI KMS & Vault - Multi-Environment"]
        
        subgraph ProdKMS["🔴 Production KMS & Vault"]
            ProdVault["KMS Vault<br/>ecommerce-production-vault<br/>Type: DEFAULT"]
            ProdKeys["Encryption Keys<br/>AES-256<br/>32 bytes"]
            ProdSecrets["22 Secrets<br/>11 services × 2 secrets<br/>Isolated from other envs"]
        end
        
        subgraph StagingKMS["🟠 Staging KMS & Vault"]
            StagingVault["KMS Vault<br/>ecommerce-staging-vault<br/>Type: DEFAULT"]
            StagingKeys["Encryption Keys<br/>AES-256<br/>32 bytes"]
            StagingSecrets["22 Secrets<br/>11 services × 2 secrets<br/>Isolated from prod"]
        end
        
        subgraph DevKMS["🟢 Development KMS & Vault"]
            DevVault["KMS Vault<br/>ecommerce-development-vault<br/>Type: DEFAULT"]
            DevKeys["Encryption Keys<br/>AES-256<br/>32 bytes"]
            DevSecrets["22 Secrets<br/>11 services × 2 secrets<br/>Isolated from prod"]
        end
    end
    
    ProdVault --> ProdKeys
    ProdKeys --> ProdSecrets
    StagingVault --> StagingKeys
    StagingKeys --> StagingSecrets
    DevVault --> DevKeys
    DevKeys --> DevSecrets
    
    %% Isolation
    ProdSecrets -.->|"❌ BLOCKED"| StagingSecrets
    ProdSecrets -.->|"❌ BLOCKED"| DevSecrets
    
    style ProdKMS fill:#c62828,stroke:#b71c1c,stroke-width:4px,color:#fff
    style StagingKMS fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
    style DevKMS fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
```

## Production KMS & Vault

```mermaid
graph TB
    subgraph ProdKMS["🔴 Production KMS & Vault"]
        subgraph KMS["KMS Key Management Service"]
            Vault["KMS Vault<br/>ecommerce-production-vault<br/>Type: DEFAULT"]
            
            subgraph Keys["Encryption Keys"]
                SecretsKey["Secrets Key<br/>AES-256<br/>32 bytes<br/>Purpose: Encrypt secrets"]
            end
            
            subgraph Rotation["Key Rotation"]
                AutoRotation["Auto Rotation<br/>Configurable schedule<br/>Strict rotation policy"]
            end
        end
        
        subgraph OCI_Vault["OCI Vault Secrets Management"]
            subgraph Secrets["Secrets (22 total)"]
                AuthSecret["ecommerce/production/auth-service/database-url<br/>Encrypted with KMS"]
                AuthJWT["ecommerce/production/auth-service/jwt-secret<br/>Encrypted with KMS"]
                UserSecret["ecommerce/production/user-service/database-url<br/>Encrypted with KMS"]
                UserJWT["ecommerce/production/user-service/jwt-secret<br/>Encrypted with KMS"]
                OtherSecrets["... 18 more services<br/>Same pattern"]
            end
        end
        
        subgraph K8s["Kubernetes Secrets (Production)"]
            K8sSecrets["Kubernetes Secrets<br/>Synced from OCI Vault<br/>via annotations<br/>Production namespace only"]
        end
        
        subgraph Services["Production Services"]
            AuthSvc["Auth Service<br/>Reads from K8s Secret"]
            UserSvc["User Service<br/>Reads from K8s Secret"]
            OtherSvcs["Other Services<br/>Read from K8s Secrets"]
        end
    end
    
    Vault --> Keys
    Keys --> SecretsKey
    SecretsKey --> Secrets
    Secrets --> K8sSecrets
    K8sSecrets --> Services
    
    style ProdKMS fill:#c62828,stroke:#b71c1c,stroke-width:3px,color:#fff
```

## Staging KMS & Vault

```mermaid
graph TB
    subgraph StagingKMS["🟠 Staging KMS & Vault"]
        subgraph KMS_S["KMS Key Management Service"]
            Vault_S["KMS Vault<br/>ecommerce-staging-vault<br/>Type: DEFAULT"]
            
            subgraph Keys_S["Encryption Keys"]
                SecretsKey_S["Secrets Key<br/>AES-256<br/>32 bytes<br/>Purpose: Encrypt secrets"]
            end
            
            subgraph Rotation_S["Key Rotation"]
                AutoRotation_S["Auto Rotation<br/>Configurable schedule<br/>Moderate rotation policy"]
            end
        end
        
        subgraph OCI_Vault_S["OCI Vault Secrets Management"]
            subgraph Secrets_S["Secrets (22 total)"]
                AuthSecret_S["ecommerce/staging/auth-service/database-url<br/>Encrypted with KMS"]
                AuthJWT_S["ecommerce/staging/auth-service/jwt-secret<br/>Encrypted with KMS"]
                OtherSecrets_S["... 20 more services<br/>Same pattern"]
            end
        end
        
        subgraph K8s_S["Kubernetes Secrets (Staging)"]
            K8sSecrets_S["Kubernetes Secrets<br/>Synced from OCI Vault<br/>via annotations<br/>Staging namespace only"]
        end
    end
    
    Vault_S --> Keys_S
    Keys_S --> SecretsKey_S
    SecretsKey_S --> Secrets_S
    Secrets_S --> K8sSecrets_S
    
    style StagingKMS fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
```

## Development KMS & Vault

```mermaid
graph TB
    subgraph DevKMS["🟢 Development KMS & Vault"]
        subgraph KMS_D["KMS Key Management Service"]
            Vault_D["KMS Vault<br/>ecommerce-development-vault<br/>Type: DEFAULT"]
            
            subgraph Keys_D["Encryption Keys"]
                SecretsKey_D["Secrets Key<br/>AES-256<br/>32 bytes<br/>Purpose: Encrypt secrets"]
            end
            
            subgraph Rotation_D["Key Rotation"]
                AutoRotation_D["Auto Rotation<br/>Manual rotation<br/>Relaxed rotation policy"]
            end
        end
        
        subgraph OCI_Vault_D["OCI Vault Secrets Management"]
            subgraph Secrets_D["Secrets (22 total)"]
                AuthSecret_D["ecommerce/development/auth-service/database-url<br/>Encrypted with KMS"]
                AuthJWT_D["ecommerce/development/auth-service/jwt-secret<br/>Encrypted with KMS"]
                OtherSecrets_D["... 20 more services<br/>Same pattern"]
            end
        end
        
        subgraph K8s_D["Kubernetes Secrets (Development)"]
            K8sSecrets_D["Kubernetes Secrets<br/>Synced from OCI Vault<br/>via annotations<br/>Development namespace only"]
        end
    end
    
    Vault_D --> Keys_D
    Keys_D --> SecretsKey_D
    SecretsKey_D --> Secrets_D
    Secrets_D --> K8sSecrets_D
    
    style DevKMS fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
```

## Secret Management Flow (Production)

```mermaid
sequenceDiagram
    participant Admin as Administrator
    participant Vault as OCI Vault (Production)
    participant KMS as KMS (Production)
    participant K8s as Kubernetes (Production)
    participant Service as Service Pod (Production)
    
    Admin->>Vault: Create Secret<br/>(ecommerce/production/{service}/...)
    Vault->>KMS: Request Encryption Key<br/>(Production vault only)
    KMS-->>Vault: Return Key
    Vault->>Vault: Encrypt Secret
    Vault->>K8s: Sync to K8s Secret<br/>(Production namespace only)
    K8s->>Service: Mount Secret
    Service->>Service: Use Secret<br/>(DATABASE_URL, JWT_SECRET)
```

## Secret Structure per Environment

```mermaid
graph TB
    subgraph SecretPath["Secret Path Structure"]
        Root["ecommerce/"]
        ProdEnv["production/"]
        StagingEnv["staging/"]
        DevEnv["development/"]
        Service["{service-name}/"]
        Secret["{secret-name}"]
    end
    
    subgraph ProdExamples["Production Examples"]
        ProdEx1["ecommerce/production/auth-service/database-url"]
        ProdEx2["ecommerce/production/auth-service/jwt-secret"]
    end
    
    subgraph StagingExamples["Staging Examples"]
        StagingEx1["ecommerce/staging/auth-service/database-url"]
        StagingEx2["ecommerce/staging/auth-service/jwt-secret"]
    end
    
    subgraph DevExamples["Development Examples"]
        DevEx1["ecommerce/development/auth-service/database-url"]
        DevEx2["ecommerce/development/auth-service/jwt-secret"]
    end
    
    Root --> ProdEnv
    Root --> StagingEnv
    Root --> DevEnv
    ProdEnv --> Service
    StagingEnv --> Service
    DevEnv --> Service
    Service --> Secret
    
    ProdEnv --> ProdExamples
    StagingEnv --> StagingExamples
    DevEnv --> DevExamples
    
    classDef prodClass fill:#c62828,stroke:#b71c1c,stroke-width:2px,color:#fff
    classDef stagingClass fill:#f57c00,stroke:#e65100,stroke-width:2px,color:#fff
    classDef devClass fill:#4caf50,stroke:#2e7d32,stroke-width:2px,color:#fff
    
    class ProdEnv,ProdEx1,ProdEx2 prodClass
    class StagingEnv,StagingEx1,StagingEx2 stagingClass
    class DevEnv,DevEx1,DevEx2 devClass
```

## Environment Comparison

| Component | Production | Staging | Development |
|-----------|-----------|---------|-------------|
| **KMS Vault** | ecommerce-production-vault | ecommerce-staging-vault | ecommerce-development-vault |
| **Vault Type** | DEFAULT | DEFAULT | DEFAULT |
| **Encryption Key** | AES-256, 32 bytes | AES-256, 32 bytes | AES-256, 32 bytes |
| **Key Rotation** | Auto (Strict) | Auto (Moderate) | Manual (Relaxed) |
| **Secret Count** | 22 secrets | 22 secrets | 22 secrets |
| **Secret Types** | database-url, jwt-secret | database-url, jwt-secret | database-url, jwt-secret |
| **K8s Sync** | Production namespace | Staging namespace | Development namespace |
| **Refresh Interval** | 1 hour | 1 hour | 1 hour |
| **Access Control** | 🔴 Strict (Prod only) | 🟠 Moderate (Staging only) | 🟢 Relaxed (Dev only) |
| **Production Access** | ✅ Full | ❌ **BLOCKED** | ❌ **BLOCKED** |

## KMS & Vault Configuration Summary

### Production Configuration

| Component | Configuration | Description |
|-----------|---------------|-------------|
| **KMS Vault** | Type: DEFAULT | Standard vault for encryption |
| **Encryption Key** | AES-256, 32 bytes | Used for secret encryption |
| **Key Rotation** | Auto (Strict schedule) | Automatic key rotation |
| **Secret Count** | 22 secrets | 11 services × 2 secrets each |
| **Secret Types** | database-url, jwt-secret | Per service |
| **K8s Sync** | Via annotations (Prod namespace) | Automatic sync to Kubernetes |
| **Refresh Interval** | 1 hour | Secret refresh frequency |
| **Access Control** | Production compartment only | Isolated from staging/dev |

### Staging Configuration

| Component | Configuration | Description |
|-----------|---------------|-------------|
| **KMS Vault** | Type: DEFAULT | Standard vault for encryption |
| **Encryption Key** | AES-256, 32 bytes | Used for secret encryption |
| **Key Rotation** | Auto (Moderate schedule) | Automatic key rotation |
| **Secret Count** | 22 secrets | 11 services × 2 secrets each |
| **Secret Types** | database-url, jwt-secret | Per service |
| **K8s Sync** | Via annotations (Staging namespace) | Automatic sync to Kubernetes |
| **Refresh Interval** | 1 hour | Secret refresh frequency |
| **Access Control** | Staging compartment only | Isolated from prod |

### Development Configuration

| Component | Configuration | Description |
|-----------|---------------|-------------|
| **KMS Vault** | Type: DEFAULT | Standard vault for encryption |
| **Encryption Key** | AES-256, 32 bytes | Used for secret encryption |
| **Key Rotation** | Manual | Manual key rotation |
| **Secret Count** | 22 secrets | 11 services × 2 secrets each |
| **Secret Types** | database-url, jwt-secret | Per service |
| **K8s Sync** | Via annotations (Dev namespace) | Automatic sync to Kubernetes |
| **Refresh Interval** | 1 hour | Secret refresh frequency |
| **Access Control** | Development compartment only | Isolated from prod |

## Security Isolation

```mermaid
graph TB
    subgraph Isolation["KMS & Vault Environment Isolation"]
        ProdIsolation["Production Vault<br/>🔴 Isolated<br/>No access from staging/dev<br/>Separate encryption keys"]
        StagingIsolation["Staging Vault<br/>🟠 Isolated<br/>No access to prod<br/>Separate encryption keys"]
        DevIsolation["Development Vault<br/>🟢 Isolated<br/>No access to prod<br/>Separate encryption keys"]
    end
    
    ProdIsolation -.->|"❌ BLOCKED"| StagingIsolation
    ProdIsolation -.->|"❌ BLOCKED"| DevIsolation
    
    style ProdIsolation fill:#c62828,stroke:#b71c1c,stroke-width:3px,color:#fff
    style StagingIsolation fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
    style DevIsolation fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
```

## Secret Access Matrix

| Environment | Production Secrets | Staging Secrets | Development Secrets |
|-------------|-------------------|-----------------|---------------------|
| **Production Services** | ✅ Full Access | ❌ **BLOCKED** | ❌ **BLOCKED** |
| **Staging Services** | ❌ **BLOCKED** | ✅ Full Access | ❌ No Access |
| **Development Services** | ❌ **BLOCKED** | ❌ No Access | ✅ Full Access |

---

**Next**: [OKE Cluster](./05-compute-oke-cluster.md) for compute infrastructure
