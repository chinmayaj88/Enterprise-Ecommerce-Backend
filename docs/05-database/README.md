<div align="center">

# 🗄️ Database Documentation

[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Pattern](https://img.shields.io/badge/Pattern-Database%20Per%20Service-green?style=flat-square)](.)
[![Tables](https://img.shields.io/badge/Tables-70-orange?style=flat-square)](.)

**Complete database documentation for the e-commerce platform**

</div>

---

Complete database documentation for the e-commerce platform, including ER diagrams and individual service schemas.

## 📚 Documentation Structure

1. **[Master ER Diagram](./01-master-er-diagram.md)** - Complete system ER diagram showing all databases
2. **[Service Schemas](./service-schemas/)** - Individual service database schemas
3. **[Cross-Service References](./03-cross-service-references.md)** - How services reference each other

> **Note**: For infrastructure diagrams (placement, replication, DR, multi-region), see [Diagrams Folder](../diagrams/)

## 🗄️ Database Architecture

### Database Per Service Pattern

<div align="center">

**Each microservice has its own PostgreSQL database:**

</div>

| Service | Database | Tables | Description |
|:---:|:---|:---:|:---|
| 🔐 **Auth Service** | `auth_db` | 12 tables | Users, Roles, Sessions, Devices, MFA, Audit Logs |
| 👤 **User Service** | `user_db` | 9 tables | Profiles, Addresses, Payment Methods, Wishlist, Activities |
| 📦 **Product Service** | `product_db` | 14 tables | Products, Categories, Inventory, Reviews, Q&A, Comparisons |
| 🛒 **Cart Service** | `cart_db` | 2 tables | Carts, Cart Items |
| 📝 **Order Service** | `order_db` | 5 tables | Orders, Order Items, Status History, Shipping Addresses, Notes |
| 💳 **Payment Service** | `payment_db` | 7 tables | Payments, Transactions, Refunds, Methods, Webhooks, Audit Logs |
| 🚚 **Shipping Service** | `shipping_db` | 6 tables | Shipping Zones, Methods, Rates, Shipments, Tracking, Carriers |
| ↩️ **Return Service** | `return_db` | 6 tables | Return Requests, Items, Authorizations, Status History, Tracking, Refunds |
| 🎟️ **Discount Service** | `discount_db` | 5 tables | Coupons, Promotions, Rules, Usage Tracking |
| 📧 **Notification Service** | `notification_db` | 4 tables | Notifications, Email Templates, Preferences, Logs |

### Total Statistics

<div align="center">

| Metric | Value |
|:---:|:---|
| **🗄️ Databases** | 10 PostgreSQL databases |
| **📊 Total Tables** | 70 tables |
| **🏗️ Pattern** | Database per service (microservices pattern) |
| **🔗 Cross-Service References** | 25+ logical references |

</div>

## 📖 Documentation Files

### Master ER Diagram

[Master ER Diagram](./01-master-er-diagram.md) shows:
- All databases in the system
- Logical relationships between services
- Cross-service references
- Entity relationships

### Service Schemas

<div align="center">

**Individual service database schemas are organized in [Service Schemas](./service-schemas/):**

</div>

| Service | Documentation | Tables |
|:---:|:---|:---:|
| 🔐 **Auth** | [Auth Service Database](./service-schemas/01-auth-service-database.md) | 12 |
| 👤 **User** | [User Service Database](./service-schemas/02-user-service-database.md) | 9 |
| 📦 **Product** | [Product Service Database](./service-schemas/03-product-service-database.md) | 14 |
| 📝 **Order** | [Order Service Database](./service-schemas/04-order-service-database.md) | 5 |
| 💳 **Payment** | [Payment Service Database](./service-schemas/05-payment-service-database.md) | 7 |
| 📧 **Notification** | [Notification Service Database](./service-schemas/06-notification-service-database.md) | 4 |
| 🛒 **Cart** | [Cart Service Database](./service-schemas/07-cart-service-database.md) | 2 |
| 🎟️ **Discount** | [Discount Service Database](./service-schemas/08-discount-service-database.md) | 5 |
| 🚚 **Shipping** | [Shipping Service Database](./service-schemas/09-shipping-service-database.md) | 6 |
| ↩️ **Return** | [Return Service Database](./service-schemas/10-return-service-database.md) | 6 |

### Cross-Service References

[Cross-Service References](./03-cross-service-references.md) documents:
- How services reference each other
- ID-based references
- Event-driven communication
- Data consistency patterns

## 🏗️ Database Design Principles

1. **Database Per Service**: Each service owns its data
2. **No Shared Databases**: Services don't share databases
3. **ID References**: Services reference each other by ID (string)
4. **Event-Driven**: Data consistency via events (eventual consistency)
5. **No Direct Queries**: Services don't query each other's databases

## 🔗 Related Documentation

- **Database Infrastructure Diagrams**: [Database Placement & DR](../diagrams/10-database-placement-replication-dr.md)
- **Multi-Region Architecture**: [Multi-Region Deployment](../diagrams/11-multi-region/)
- **Architecture**: [Architecture Overview](../02-architecture/README.md)
- **Implementation**: [Implementation Steps](../01-getting-started/02-implementation-steps.md)
- **Deployment**: [Deployment Guide](../04-deployment/README.md)

---

<div align="center">

## 🚀 Start Here

**[Master ER Diagram →](./01-master-er-diagram.md)**

---

[Back to Top](#-database-documentation)

</div>
