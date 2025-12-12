<div align="center">

# 📨 Messaging Architecture - Multi-Environment Streaming & Queue

[![Messaging](https://img.shields.io/badge/Messaging-Event%20Driven-blue?style=for-the-badge)](.)
[![OCI Streaming](https://img.shields.io/badge/Streaming-OCI-green?style=flat-square&logo=oracle&logoColor=white)](https://www.oracle.com/cloud/)
[![Queue](https://img.shields.io/badge/Queue-OCI-orange?style=flat-square)](.)

**Complete messaging architecture for Production, Staging, and Development environments**

</div>

---

## Multi-Environment Messaging Overview

```mermaid
graph TB
    subgraph OCI["OCI Messaging - Multi-Environment"]
        
        subgraph ProdMessaging["🔴 Production Messaging<br/>Compartment: ecommerce-production"]
            ProdStream["OCI Streaming<br/>4 Streams<br/>1-20 Partitions<br/>24-168h Retention"]
            ProdQueue["OCI Queue<br/>5 Queues<br/>30s Visibility<br/>7 days Retention"]
        end
        
        subgraph StagingMessaging["🟠 Staging Messaging<br/>Compartment: ecommerce-staging"]
            StagingStream["OCI Streaming<br/>4 Streams<br/>1-10 Partitions<br/>24-72h Retention"]
            StagingQueue["OCI Queue<br/>5 Queues<br/>30s Visibility<br/>3 days Retention"]
        end
        
        subgraph DevMessaging["🟢 Development Messaging<br/>Compartment: ecommerce-development"]
            DevStream["OCI Streaming<br/>4 Streams<br/>1-3 Partitions<br/>24h Retention"]
            DevQueue["OCI Queue<br/>5 Queues<br/>30s Visibility<br/>1 day Retention"]
        end
    end
    
    style ProdMessaging fill:#c62828,stroke:#b71c1c,stroke-width:4px,color:#fff
    style StagingMessaging fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
    style DevMessaging fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
```

## Production OCI Streaming (Kafka-like) Overview

```mermaid
graph TB
    subgraph Streaming["OCI Streaming"]
        
        subgraph Streams["Streams"]
            UserStream["user-events<br/>Partitions: 1-10<br/>Retention: 24-168h<br/>Auto-scaling"]
            OrderStream["order-events<br/>Partitions: 1-20<br/>Retention: 24-168h<br/>Auto-scaling"]
            PaymentStream["payment-events<br/>Partitions: 1-10<br/>Retention: 24-168h<br/>Auto-scaling"]
            ProductStream["product-events<br/>Partitions: 1-10<br/>Retention: 24-168h<br/>Auto-scaling"]
        end
        
        subgraph Producers["Event Producers"]
            AuthProd["Auth Service<br/>Publishes: user.created"]
            UserProd["User Service<br/>Publishes: user.updated"]
            ProductProd["Product Service<br/>Publishes: product.updated"]
            OrderProd["Order Service<br/>Publishes: order.created"]
            PaymentProd["Payment Service<br/>Publishes: payment.succeeded"]
        end
        
        subgraph Consumers["Event Consumers"]
            NotifyCons["Notification Service<br/>Consumes: All events"]
            UserCons["User Service<br/>Consumes: user events"]
            OrderCons["Order Service<br/>Consumes: order events"]
        end
    end
    
    Producers --> Streams
    Streams --> Consumers
    
    classDef streamClass fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef producerClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef consumerClass fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    
    class UserStream,OrderStream,PaymentStream,ProductStream streamClass
    class AuthProd,UserProd,ProductProd,OrderProd,PaymentProd producerClass
    class NotifyCons,UserCons,OrderCons consumerClass
```

## OCI Queue Overview

```mermaid
graph TB
    subgraph Queue["OCI Queue"]
        
        subgraph Queues["Queues"]
            UserQueue["user-service-events<br/>Visibility: 30s<br/>Retention: 7 days"]
            OrderQueue["order-service-events<br/>Visibility: 30s<br/>Retention: 7 days"]
            PaymentQueue["payment-service-events<br/>Visibility: 30s<br/>Retention: 7 days"]
            ProductQueue["product-service-events<br/>Visibility: 30s<br/>Retention: 7 days"]
            NotifyQueue["notification-service-events<br/>Visibility: 30s<br/>Retention: 7 days"]
        end
        
        subgraph Producers["Message Producers"]
            StreamProducer["OCI Streaming<br/>Publishes to Queue"]
        end
        
        subgraph Consumers["Message Consumers"]
            NotifyConsumer["Notification Service<br/>Processes messages"]
            OtherConsumers["Other Services<br/>Process messages"]
        end
    end
    
    StreamProducer --> Queues
    Queues --> NotifyConsumer
    Queues --> OtherConsumers
    
    classDef queueClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef producerClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef consumerClass fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    
    class UserQueue,OrderQueue,PaymentQueue,ProductQueue,NotifyQueue queueClass
    class StreamProducer producerClass
    class NotifyConsumer,OtherConsumers consumerClass
```

## Event-Driven Architecture Flow

```mermaid
sequenceDiagram
    participant Service as Service (Producer)
    participant Stream as OCI Streaming
    participant Queue as OCI Queue
    participant Consumer as Service (Consumer)
    
    Service->>Stream: Publish Event<br/>(e.g., order.created)
    Stream->>Stream: Store Event<br/>(Partition-based)
    Stream->>Queue: Queue Message
    Queue->>Consumer: Deliver Message
    Consumer->>Consumer: Process Event
    Consumer->>Queue: Delete Message
```

## Production Streaming Configuration

| Stream | Partitions | Retention | Auto-scaling | Throughput |
|--------|------------|-----------|--------------|-------------|
| **user-events** | 1-10 | 24-168h | Yes | Millions msg/sec |
| **order-events** | 1-20 | 24-168h | Yes | Millions msg/sec |
| **payment-events** | 1-10 | 24-168h | Yes | Millions msg/sec |
| **product-events** | 1-10 | 24-168h | Yes | Millions msg/sec |

## Production Queue Configuration

| Queue | Visibility | Retention | Purpose |
|-------|------------|-----------|---------|
| **user-service-events** | 30s | 7 days | User event processing |
| **order-service-events** | 30s | 7 days | Order event processing |
| **payment-service-events** | 30s | 7 days | Payment event processing |
| **product-service-events** | 30s | 7 days | Product event processing |
| **notification-service-events** | 30s | 7 days | Notification processing |

## Staging Streaming Configuration

| Stream | Partitions | Retention | Auto-scaling | Throughput |
|--------|------------|-----------|--------------|-------------|
| **user-events** | 1-5 | 24-72h | Yes | Thousands msg/sec |
| **order-events** | 1-10 | 24-72h | Yes | Thousands msg/sec |
| **payment-events** | 1-5 | 24-72h | Yes | Thousands msg/sec |
| **product-events** | 1-5 | 24-72h | Yes | Thousands msg/sec |

## Staging Queue Configuration

| Queue | Visibility | Retention | Purpose |
|-------|------------|-----------|---------|
| **user-service-events** | 30s | 3 days | User event processing |
| **order-service-events** | 30s | 3 days | Order event processing |
| **payment-service-events** | 30s | 3 days | Payment event processing |
| **product-service-events** | 30s | 3 days | Product event processing |
| **notification-service-events** | 30s | 3 days | Notification processing |

## Development Streaming Configuration

| Stream | Partitions | Retention | Auto-scaling | Throughput |
|--------|------------|-----------|--------------|-------------|
| **user-events** | 1-3 | 24h | No | Hundreds msg/sec |
| **order-events** | 1-3 | 24h | No | Hundreds msg/sec |
| **payment-events** | 1-3 | 24h | No | Hundreds msg/sec |
| **product-events** | 1-3 | 24h | No | Hundreds msg/sec |

## Development Queue Configuration

| Queue | Visibility | Retention | Purpose |
|-------|------------|-----------|---------|
| **user-service-events** | 30s | 1 day | User event processing |
| **order-service-events** | 30s | 1 day | Order event processing |
| **payment-service-events** | 30s | 1 day | Payment event processing |
| **product-service-events** | 30s | 1 day | Product event processing |
| **notification-service-events** | 30s | 1 day | Notification processing |

## Environment Comparison

| Component | Production | Staging | Development |
|-----------|-----------|---------|-------------|
| **Streams** | 4 | 4 | 4 |
| **Max Partitions** | 1-20 | 1-10 | 1-3 |
| **Retention** | 24-168h | 24-72h | 24h |
| **Auto-scaling** | ✅ Yes | ✅ Yes | ❌ No |
| **Throughput** | Millions msg/sec | Thousands msg/sec | Hundreds msg/sec |
| **Queues** | 5 | 5 | 5 |
| **Queue Visibility** | 30s | 30s | 30s |
| **Queue Retention** | 7 days | 3 days | 1 day |
| **Cost** | High | Medium | Low |

