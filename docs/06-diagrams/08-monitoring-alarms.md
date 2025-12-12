<div align="center">

# 📊 Monitoring & Alarms Architecture - Multi-Environment

[![Monitoring](https://img.shields.io/badge/Monitoring-Prometheus-blue?style=for-the-badge&logo=prometheus&logoColor=white)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-Dashboards-green?style=flat-square&logo=grafana&logoColor=white)](https://grafana.com/)
[![Alarms](https://img.shields.io/badge/Alarms-Configured-orange?style=flat-square)](.)

**Complete monitoring and alarms configuration for Production, Staging, and Development environments**

</div>

---

## Multi-Environment Monitoring Overview

```mermaid
graph TB
    subgraph OCI["OCI Monitoring - Multi-Environment"]
        
        subgraph ProdMonitoring["🔴 Production Monitoring<br/>Compartment: ecommerce-production"]
            ProdMetrics["Metrics Collection<br/>All resources<br/>90-day retention"]
            ProdAlarms["Alarms<br/>Critical thresholds<br/>Email notifications"]
            ProdLogs["Logging<br/>90-day retention<br/>Service, Flow, WAF logs"]
        end
        
        subgraph StagingMonitoring["🟠 Staging Monitoring<br/>Compartment: ecommerce-staging"]
            StagingMetrics["Metrics Collection<br/>All resources<br/>30-day retention"]
            StagingAlarms["Alarms<br/>Moderate thresholds<br/>Email notifications"]
            StagingLogs["Logging<br/>30-day retention<br/>Service, Flow logs"]
        end
        
        subgraph DevMonitoring["🟢 Development Monitoring<br/>Compartment: ecommerce-development"]
            DevMetrics["Metrics Collection<br/>All resources<br/>7-day retention"]
            DevAlarms["Alarms<br/>Relaxed thresholds<br/>Email notifications"]
            DevLogs["Logging<br/>7-day retention<br/>Service logs only"]
        end
    end
    
    style ProdMonitoring fill:#c62828,stroke:#b71c1c,stroke-width:4px,color:#fff
    style StagingMonitoring fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
    style DevMonitoring fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
```

## Production Monitoring Overview

```mermaid
graph TB
    subgraph Monitoring["OCI Monitoring"]
        
        subgraph Metrics["Metrics Collection"]
            CPU["CPU Utilization<br/>All resources"]
            Memory["Memory Utilization<br/>All resources"]
            Network["Network I/O<br/>All resources"]
            Disk["Disk I/O<br/>All resources"]
            Custom["Custom Metrics<br/>Application-specific"]
        end
        
        subgraph Alarms["Alarms Configuration"]
            DB_CPU["Database CPU > 80%<br/>Severity: Critical"]
            DB_Storage["Database Storage > 85%<br/>Severity: Warning"]
            Redis_Mem["Redis Memory > 80%<br/>Severity: Warning"]
            LB_5xx["Load Balancer 5xx > 10<br/>Severity: Critical"]
            OKE_CPU["OKE Node CPU > 80%<br/>Severity: Warning"]
            Service_CPU["Service CPU > 70%<br/>Severity: Info"]
        end
        
        subgraph Notifications["OCI Notifications"]
            Topic["Topic: ecommerce-production-alerts"]
            Email1["Email: devops@example.com"]
            Email2["Email: oncall@example.com"]
        end
        
        subgraph Logging["Logging"]
            ServiceLogs["Service Logs<br/>90-day retention<br/>/eks/ecommerce-{service}"]
            FlowLogs["VCN Flow Logs<br/>90-day retention<br/>Network traffic"]
            WAFLogs["WAF Logs<br/>90-day retention<br/>Security events"]
        end
    end
    
    Metrics --> Alarms
    Alarms --> Notifications
    Notifications --> Email1
    Notifications --> Email2
    
    classDef metricsClass fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef alarmClass fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef notifyClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef logClass fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    
    class CPU,Memory,Network,Disk,Custom metricsClass
    class DB_CPU,DB_Storage,Redis_Mem,LB_5xx,OKE_CPU,Service_CPU alarmClass
    class Topic,Email1,Email2 notifyClass
    class ServiceLogs,FlowLogs,WAFLogs logClass
```

## Alarm Flow

```mermaid
sequenceDiagram
    participant Resource as Resource (DB/Service/Redis)
    participant Monitor as OCI Monitoring
    participant Alarm as Alarm
    participant Topic as Notification Topic
    participant Email as Email Alert
    
    Resource->>Monitor: Send Metrics
    Monitor->>Alarm: Check Threshold
    alt Threshold Exceeded
        Alarm->>Topic: Trigger Alarm
        Topic->>Email: Send Notification
        Email->>Email: Alert DevOps Team
    end
```

## Monitoring Coverage

```mermaid
graph LR
    subgraph Resources["Monitored Resources"]
        DB["10 Autonomous DBs<br/>CPU, Storage, Connections"]
        Redis["Redis Cluster<br/>Memory, Connections"]
        LB["Load Balancer<br/>5xx Errors, Latency"]
        OKE["OKE Cluster<br/>Node CPU, Memory"]
        Services["11 Services<br/>CPU, Memory, Pods"]
    end
    
    subgraph Metrics["Metrics Collected"]
        CPU_M["CPU %"]
        Mem_M["Memory %"]
        Net_M["Network I/O"]
        Disk_M["Disk I/O"]
        Error_M["Error Rates"]
        Latency_M["Latency"]
    end
    
    Resources --> Metrics
    
    classDef resourceClass fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef metricClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    
    class DB,Redis,LB,OKE,Services resourceClass
    class CPU_M,Mem_M,Net_M,Disk_M,Error_M,Latency_M metricClass
```

## Production Alarm Configuration Summary

| Alarm | Resource | Threshold | Severity | Action |
|-------|----------|-----------|----------|--------|
| **Database CPU** | All ADBs | > 80% | Critical | Email alert |
| **Database Storage** | All ADBs | > 85% | Warning | Email alert |
| **Redis Memory** | Redis Cluster | > 80% | Warning | Email alert |
| **Load Balancer 5xx** | Load Balancer | > 10 errors | Critical | Email alert |
| **OKE Node CPU** | OKE Nodes | > 80% | Warning | Email alert |
| **Service CPU** | All Services | > 70% | Info | Email alert (HPA triggers) |

## Staging Alarm Configuration Summary

| Alarm | Resource | Threshold | Severity | Action |
|-------|----------|-----------|----------|--------|
| **Database CPU** | All ADBs | > 85% | Warning | Email alert |
| **Database Storage** | All ADBs | > 90% | Warning | Email alert |
| **Redis Memory** | Redis Cluster | > 85% | Info | Email alert |
| **Load Balancer 5xx** | Load Balancer | > 50 errors | Warning | Email alert |
| **OKE Node CPU** | OKE Nodes | > 85% | Info | Email alert |
| **Service CPU** | All Services | > 80% | Info | Email alert (HPA triggers) |

## Development Alarm Configuration Summary

| Alarm | Resource | Threshold | Severity | Action |
|-------|----------|-----------|----------|--------|
| **Database CPU** | All ADBs | > 90% | Info | Email alert |
| **Database Storage** | All ADBs | > 95% | Warning | Email alert |
| **Redis Memory** | Redis Cluster | > 90% | Info | Email alert |
| **Load Balancer 5xx** | Load Balancer | > 100 errors | Info | Email alert |
| **OKE Node CPU** | OKE Nodes | > 90% | Info | Email alert |
| **Service CPU** | All Services | > 90% | Info | Email alert (HPA triggers) |

## Environment Comparison

| Component | Production | Staging | Development |
|-----------|-----------|---------|-------------|
| **Metrics Retention** | 90 days | 30 days | 7 days |
| **Log Retention** | 90 days | 30 days | 7 days |
| **Alarm Thresholds** | Strict (80%) | Moderate (85%) | Relaxed (90%) |
| **Notification Topics** | Critical alerts | Warning alerts | Info alerts |
| **Email Recipients** | devops@, oncall@ | devops@ | developers@ |
| **Cost** | High | Medium | Low |

