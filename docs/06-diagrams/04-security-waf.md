<div align="center">

# 🛡️ WAF (Web Application Firewall) Architecture - Multi-Environment

[![WAF](https://img.shields.io/badge/WAF-Web%20Application%20Firewall-blue?style=for-the-badge)](.)
[![Security](https://img.shields.io/badge/Security-DDoS%20Protection-green?style=flat-square)](.)
[![Multi-Environment](https://img.shields.io/badge/Environments-All-orange?style=flat-square)](.)

**Complete WAF configuration for Production, Staging, and Development environments**

</div>

---

## Multi-Environment WAF Overview

```mermaid
graph TB
    subgraph OCI["OCI WAF - Multi-Environment"]
        
        subgraph ProdWAF["🔴 Production WAF"]
            ProdWAF_Instance["WAF Instance<br/>ecommerce-production-waf<br/>10 Tbps DDoS Protection"]
            ProdProtection["Full Protection<br/>SQL Injection, XSS<br/>Rate Limiting, Bot Management"]
            ProdGeoBlock["Geographic Blocking<br/>Configurable"]
        end
        
        subgraph StagingWAF["🟠 Staging WAF"]
            StagingWAF_Instance["WAF Instance<br/>ecommerce-staging-waf<br/>1 Tbps DDoS Protection"]
            StagingProtection["Basic Protection<br/>SQL Injection, XSS<br/>Rate Limiting"]
        end
        
        subgraph DevWAF["🟢 Development WAF"]
            DevWAF_Instance["No WAF<br/>Direct Access<br/>For Development"]
        end
    end
    
    subgraph Traffic["Traffic Flow"]
        Internet["Internet Users"]
        ProdWAF --> ProdLB["Production Load Balancer"]
        StagingWAF --> StagingLB["Staging Load Balancer"]
        DevWAF --> DevLB["Development Load Balancer"]
    end
    
    Internet --> ProdWAF
    Internet --> StagingWAF
    Internet --> DevWAF
    
    style ProdWAF fill:#c62828,stroke:#b71c1c,stroke-width:4px,color:#fff
    style StagingWAF fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
    style DevWAF fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
```

## Production WAF Configuration

```mermaid
graph TB
    subgraph ProdWAF["🔴 Production WAF"]
        
        subgraph Protection["Protection Rules"]
            SQLInjection["SQL Injection Protection<br/>Action: Block<br/>Severity: Critical"]
            XSS["XSS Protection<br/>Action: Block<br/>Severity: Critical"]
            RateLimit["Rate Limiting<br/>2000 req/5min per IP<br/>Configurable"]
            BotManagement["Bot Management<br/>CAPTCHA, JavaScript challenge<br/>Strict mode"]
            GeoBlock["Geographic Blocking<br/>Block by country/region<br/>Configurable"]
        end
        
        subgraph DDoS["DDoS Protection"]
            DDoSShield["DDoS Shield<br/>Up to 10 Tbps protection<br/>Automatic mitigation"]
        end
        
        subgraph Whitelist["IP Whitelist"]
            AllowedIPs["Allowed IP Ranges<br/>Office IPs<br/>VPN IPs<br/>Admin IPs<br/>Monitoring IPs"]
        end
        
        subgraph Logging["WAF Logging"]
            WAFLogs["WAF Logs<br/>Blocked requests<br/>Attack patterns<br/>90-day retention"]
        end
    end
    
    Protection --> DDoS
    Protection --> Whitelist
    Protection --> Logging
    
    classDef protectionClass fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef ddosClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    
    class SQLInjection,XSS,RateLimit,BotManagement,GeoBlock protectionClass
    class DDoSShield ddosClass
```

## Staging WAF Configuration

```mermaid
graph TB
    subgraph StagingWAF["🟠 Staging WAF"]
        
        subgraph Protection["Protection Rules"]
            SQLInjection_S["SQL Injection Protection<br/>Action: Block<br/>Severity: High"]
            XSS_S["XSS Protection<br/>Action: Block<br/>Severity: High"]
            RateLimit_S["Rate Limiting<br/>1000 req/5min per IP<br/>Less strict"]
            BotManagement_S["Bot Management<br/>Basic mode<br/>Less strict"]
        end
        
        subgraph DDoS["DDoS Protection"]
            DDoSShield_S["DDoS Shield<br/>Up to 1 Tbps protection<br/>Automatic mitigation"]
        end
        
        subgraph Logging["WAF Logging"]
            WAFLogs_S["WAF Logs<br/>Blocked requests<br/>30-day retention"]
        end
    end
    
    Protection --> DDoS
    Protection --> Logging
    
    style StagingWAF fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
```

## Development WAF Configuration

```mermaid
graph TB
    subgraph DevWAF["🟢 Development Environment"]
        NoWAF["No WAF Deployed<br/>Direct Access to Load Balancer<br/>For Development & Testing"]
        Reason["Reason:<br/>- Lower cost<br/>- Faster development<br/>- No production traffic"]
    end
    
    style DevWAF fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
```

## WAF Protection Flow (Production)

```mermaid
sequenceDiagram
    participant User as User Request
    participant WAF as Production WAF
    participant Rules as Protection Rules
    participant DDoS as DDoS Shield
    participant LB as Load Balancer
    participant Service as Service
    
    User->>WAF: HTTP/HTTPS Request
    WAF->>DDoS: Check DDoS attack
    alt DDoS Attack Detected
        DDoS-->>User: Block (10 Tbps protection)
    else Normal Traffic
        WAF->>Rules: Check Protection Rules
        alt SQL Injection Detected
            Rules-->>User: Block (403 Forbidden)
        else XSS Detected
            Rules-->>User: Block (403 Forbidden)
        else Rate Limit Exceeded
            Rules-->>User: Block (429 Too Many Requests)
        else Bot Detected
            Rules->>User: Challenge (CAPTCHA/JS)
        else Allowed
            WAF->>LB: Forward to Load Balancer
            LB->>Service: Route to Service
        end
    end
```

## Environment Comparison

| Feature | Production | Staging | Development |
|---------|-----------|---------|-------------|
| **WAF Instance** | ✅ Yes | ✅ Yes | ❌ No |
| **DDoS Protection** | 10 Tbps | 1 Tbps | N/A |
| **SQL Injection** | ✅ Enabled (Strict) | ✅ Enabled (Moderate) | N/A |
| **XSS Protection** | ✅ Enabled (Strict) | ✅ Enabled (Moderate) | N/A |
| **Rate Limiting** | 2000 req/5min/IP | 1000 req/5min/IP | N/A |
| **Bot Management** | ✅ Strict (CAPTCHA/JS) | ✅ Basic | N/A |
| **Geographic Blocking** | ✅ Configurable | ❌ No | N/A |
| **IP Whitelist** | ✅ Yes | ❌ No | N/A |
| **Logging Retention** | 90 days | 30 days | N/A |
| **Cost** | High | Medium | Low |

## WAF Rules Configuration

### Production Rules

```mermaid
graph LR
    subgraph ProdRules["Production WAF Rules"]
        Rule1["Rule 1: SQL Injection<br/>Action: Block<br/>Severity: Critical"]
        Rule2["Rule 2: XSS<br/>Action: Block<br/>Severity: Critical"]
        Rule3["Rule 3: Rate Limiting<br/>Action: Block after threshold<br/>Threshold: 2000/5min"]
        Rule4["Rule 4: Bot Management<br/>Action: Challenge<br/>Type: CAPTCHA/JS (Strict)"]
        Rule5["Rule 5: Geographic Block<br/>Action: Block<br/>Countries: Configurable"]
    end
    
    subgraph Actions["Actions"]
        Block["Block Request<br/>403 Forbidden"]
        Challenge["Challenge User<br/>CAPTCHA/JS"]
        Allow["Allow Request<br/>Forward to LB"]
    end
    
    Rule1 --> Block
    Rule2 --> Block
    Rule3 --> Block
    Rule4 --> Challenge
    Rule5 --> Block
    
    style ProdRules fill:#c62828,stroke:#b71c1c,stroke-width:2px,color:#fff
```

### Staging Rules

```mermaid
graph LR
    subgraph StagingRules["Staging WAF Rules"]
        Rule1_S["Rule 1: SQL Injection<br/>Action: Block<br/>Severity: High"]
        Rule2_S["Rule 2: XSS<br/>Action: Block<br/>Severity: High"]
        Rule3_S["Rule 3: Rate Limiting<br/>Action: Block after threshold<br/>Threshold: 1000/5min"]
        Rule4_S["Rule 4: Bot Management<br/>Action: Challenge<br/>Type: Basic"]
    end
    
    subgraph Actions_S["Actions"]
        Block_S["Block Request<br/>403 Forbidden"]
        Challenge_S["Challenge User<br/>Basic"]
        Allow_S["Allow Request<br/>Forward to LB"]
    end
    
    Rule1_S --> Block_S
    Rule2_S --> Block_S
    Rule3_S --> Block_S
    Rule4_S --> Challenge_S
    
    style StagingRules fill:#f57c00,stroke:#e65100,stroke-width:2px,color:#fff
```

## WAF Configuration Summary

### Production WAF

| Feature | Configuration | Description |
|---------|---------------|-------------|
| **DDoS Protection** | Up to 10 Tbps | Automatic mitigation |
| **SQL Injection** | Enabled (Strict) | Blocks SQL injection attacks |
| **XSS Protection** | Enabled (Strict) | Blocks cross-site scripting |
| **Rate Limiting** | 2000 req/5min/IP | Configurable per IP |
| **Bot Management** | CAPTCHA + JS Challenge (Strict) | Blocks automated bots |
| **Geographic Blocking** | Configurable | Block by country/region |
| **IP Whitelist** | Configurable | Allow specific IP ranges |
| **Logging** | 90-day retention | WAF logs for analysis |

### Staging WAF

| Feature | Configuration | Description |
|---------|---------------|-------------|
| **DDoS Protection** | Up to 1 Tbps | Automatic mitigation |
| **SQL Injection** | Enabled (Moderate) | Blocks SQL injection attacks |
| **XSS Protection** | Enabled (Moderate) | Blocks cross-site scripting |
| **Rate Limiting** | 1000 req/5min/IP | Less strict than production |
| **Bot Management** | Basic mode | Less strict than production |
| **Geographic Blocking** | ❌ No | Not configured |
| **IP Whitelist** | ❌ No | Not configured |
| **Logging** | 30-day retention | WAF logs for analysis |

### Development WAF

| Feature | Configuration | Description |
|---------|---------------|-------------|
| **WAF Instance** | ❌ Not Deployed | Direct access to load balancer |
| **Reason** | Cost & Speed | Faster development, lower cost |

## Security Isolation

```mermaid
graph TB
    subgraph Isolation["WAF Environment Isolation"]
        ProdIsolation["Production WAF<br/>🔴 Isolated<br/>No access from staging/dev"]
        StagingIsolation["Staging WAF<br/>🟠 Isolated<br/>No access to prod"]
        DevIsolation["Development<br/>🟢 No WAF<br/>Direct access"]
    end
    
    ProdIsolation -.->|"❌ BLOCKED"| StagingIsolation
    ProdIsolation -.->|"❌ BLOCKED"| DevIsolation
    
    style ProdIsolation fill:#c62828,stroke:#b71c1c,stroke-width:3px,color:#fff
    style StagingIsolation fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
    style DevIsolation fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
```

---

**Next**: [KMS & Vault](./04-security-kms-vault.md) for secrets management
