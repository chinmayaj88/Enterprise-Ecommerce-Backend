<div align="center">

# 🔗 Cross-Service References - Complete Guide

[![References](https://img.shields.io/badge/Cross-Service%20References-blue?style=for-the-badge)](.)
[![ID References](https://img.shields.io/badge/Pattern-ID%20Strings-green?style=flat-square)](.)
[![Complete](https://img.shields.io/badge/Guide-Complete-orange?style=flat-square)](.)

**Complete guide to cross-service references in the e-commerce platform**

</div>

---

In a microservices architecture, services reference each other's data using **ID strings** rather than database foreign keys. This document details all cross-service references in the e-commerce platform with complete field mappings, validation strategies, and synchronization patterns.

---

## Key Principles

### ❌ NO Foreign Keys Across Services

**Why?**
- Each service has its own database
- Foreign keys cannot span databases
- Services must be independently deployable
- Services must work independently

### ✅ ID References Instead

**How?**
- Store IDs as strings (VARCHAR)
- No database-level constraints
- Validate via HTTP API calls (when needed)
- Synchronize via events

---

## Complete Reference Map

### 1. User Service → Auth Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `userId` | `user_profiles` | `auth.users.id` | ID String | Event sync | `user.created` event |

**Details:**
- **Purpose**: Link user profile to authentication account
- **Cardinality**: One-to-one (1:1)
- **Sync**: When auth-service creates user, publishes `user.created` event
- **Validation**: Trust event (auth-service already validated)

**Example:**
```sql
-- user-service database
CREATE TABLE user_profiles (
  id VARCHAR(25) PRIMARY KEY,
  userId VARCHAR(25) UNIQUE, -- References auth.users.id (no FK!)
  email VARCHAR(255) UNIQUE, -- Denormalized from auth.users.email
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  -- ...
);
```

**Event Flow:**
```
1. Auth-service creates user (id: "cm123")
   ↓
2. Publishes event: { userId: "cm123", email: "user@example.com" }
   ↓
3. User-service consumes event
   ↓
4. Creates profile with userId: "cm123"
   ↓
5. Same ID, but no FK constraint
```

---

### 2. User Service → Product Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `productId` | `wishlist_items` | `product.products.id` | ID String | HTTP API (optional) | Event sync |
| `productId` | `recently_viewed_products` | `product.products.id` | ID String | HTTP API (optional) | Event sync |

**Details:**
- **Purpose**: Link wishlist items and recently viewed products to products
- **Cardinality**: Many-to-many (M:N)
- **Sync**: Via `product.updated` event for denormalized data
- **Validation**: Optional HTTP API call when adding to wishlist

**Example:**
```sql
-- user-service database
CREATE TABLE wishlist_items (
  id VARCHAR(25) PRIMARY KEY,
  userId VARCHAR(25) NOT NULL,
  productId VARCHAR(25) NOT NULL, -- References product.products.id (no FK!)
  productName VARCHAR(255), -- Denormalized from product.products.name
  productImageUrl VARCHAR(500), -- Denormalized from product.products.image_url
  productPrice VARCHAR(50), -- Denormalized price at time of adding
  -- ...
);
```

---

### 3. Cart Service → Auth Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `userId` | `carts` | `auth.users.id` | ID String | JWT token | JWT validation |

**Details:**
- **Purpose**: Link cart to authenticated user
- **Cardinality**: One-to-many (1:N) - one user can have multiple carts
- **Validation**: JWT token contains userId
- **Sync**: Not needed (JWT provides userId)

**Example:**
```sql
-- cart-service database
CREATE TABLE carts (
  id VARCHAR(25) PRIMARY KEY,
  userId VARCHAR(25), -- References auth.users.id (no FK!)
  sessionId VARCHAR(100), -- For guest carts
  status VARCHAR(20) DEFAULT 'active',
  -- ...
);
```

---

### 4. Cart Service → Product Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `productId` | `cart_items` | `product.products.id` | ID String | HTTP API | Real-time validation |
| `variantId` | `cart_items` | `product.product_variants.id` | ID String | HTTP API | Real-time validation |

**Details:**
- **Purpose**: Link cart items to products and variants
- **Cardinality**: Many-to-many (M:N)
- **Validation**: HTTP API call to product-service when adding item
- **Denormalization**: Product name, SKU, image, price stored in cart_item

**Example:**
```sql
-- cart-service database
CREATE TABLE cart_items (
  id VARCHAR(25) PRIMARY KEY,
  cartId VARCHAR(25) NOT NULL,
  productId VARCHAR(25) NOT NULL, -- References product.products.id (no FK!)
  variantId VARCHAR(25), -- References product.product_variants.id (no FK!)
  productName VARCHAR(255), -- Denormalized snapshot
  productSku VARCHAR(100), -- Denormalized snapshot
  productImageUrl VARCHAR(500), -- Denormalized snapshot
  unitPrice DECIMAL(10,2), -- Denormalized snapshot
  quantity INT NOT NULL,
  -- ...
);
```

**Validation Flow:**
```
1. User adds product to cart
   ↓
2. Cart-service validates product exists:
   GET /api/v1/products/{productId}
   ↓
3. Product-service responds: { id: "cm456", name: "Product", ... }
   ↓
4. Cart-service creates cart_item with productId: "cm456"
   ↓
5. Stores denormalized data (name, SKU, price) for performance
```

---

### 5. Cart Service → Discount Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `couponCode` | `carts` | `discount.coupons.code` | ID String | HTTP API | Real-time validation |

**Details:**
- **Purpose**: Apply coupon code to cart
- **Cardinality**: Many-to-one (N:1)
- **Validation**: HTTP API call to discount-service
- **Sync**: Not needed (coupon validated at checkout)

---

### 6. Order Service → Auth Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `userId` | `orders` | `auth.users.id` | ID String | JWT token | JWT validation |

**Details:**
- **Purpose**: Link order to user
- **Cardinality**: One-to-many (1:N)
- **Validation**: JWT token contains userId
- **Sync**: Not needed

---

### 7. Order Service → Product Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `productId` | `order_items` | `product.products.id` | ID String | HTTP API | Snapshot at order time |
| `variantId` | `order_items` | `product.product_variants.id` | ID String | HTTP API | Snapshot at order time |

**Details:**
- **Purpose**: Link order items to products
- **Cardinality**: Many-to-many (M:N)
- **Validation**: HTTP API call to product-service when creating order
- **Snapshot**: Product data (name, SKU, price) stored as immutable snapshot

**Example:**
```sql
-- order-service database
CREATE TABLE order_items (
  id VARCHAR(25) PRIMARY KEY,
  orderId VARCHAR(25) NOT NULL,
  productId VARCHAR(25) NOT NULL, -- References product.products.id (no FK!)
  variantId VARCHAR(25), -- References product.product_variants.id (no FK!)
  productName VARCHAR(255), -- Snapshot (immutable)
  productSku VARCHAR(100), -- Snapshot (immutable)
  productImageUrl VARCHAR(500), -- Snapshot (immutable)
  unitPrice DECIMAL(10,2), -- Snapshot (immutable)
  quantity INT NOT NULL,
  totalPrice DECIMAL(10,2),
  -- ...
);
```

**Why Snapshot?**
- Orders are immutable historical records
- Product prices/names may change over time
- Need to preserve what customer actually ordered

---

### 8. Order Service → Payment Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `paymentMethodId` | `orders` | `payment.payments.id` | ID String | Event sync | `payment.succeeded` event |

**Details:**
- **Purpose**: Link order to payment
- **Cardinality**: One-to-one (1:1)
- **Validation**: Event from payment-service
- **Sync**: Payment-service publishes `payment.succeeded` event

---

### 9. Order Service → Discount Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `couponCode` | `orders` | `discount.coupons.code` | ID String | HTTP API | Real-time validation |

**Details:**
- **Purpose**: Apply coupon to order
- **Cardinality**: Many-to-one (N:1)
- **Validation**: HTTP API call to discount-service at checkout
- **Sync**: Discount-service tracks usage via `order.created` event

---

### 10. Payment Service → Order Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `orderId` | `payments` | `order.orders.id` | ID String | HTTP API | Real-time validation |
| `orderId` | `refunds` | `order.orders.id` | ID String | HTTP API | Real-time validation |

**Details:**
- **Purpose**: Link payment/refund to order
- **Cardinality**: One-to-many (1:N) - one order can have multiple payments/refunds
- **Validation**: HTTP API call to order-service
- **Sync**: Payment-service publishes events for order-service

**Example:**
```sql
-- payment-service database
CREATE TABLE payments (
  id VARCHAR(25) PRIMARY KEY,
  orderId VARCHAR(25) NOT NULL, -- References order.orders.id (no FK!)
  userId VARCHAR(25) NOT NULL, -- References auth.users.id (no FK!)
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  -- ...
);
```

---

### 11. Payment Service → Auth Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `userId` | `payments` | `auth.users.id` | ID String | JWT token | JWT validation |
| `userId` | `payment_methods` | `auth.users.id` | ID String | JWT token | JWT validation |
| `userId` | `refunds` | `auth.users.id` | ID String | JWT token | JWT validation |

**Details:**
- **Purpose**: Link payment to user
- **Cardinality**: One-to-many (1:N)
- **Validation**: JWT token contains userId
- **Sync**: Not needed

---

### 12. Shipping Service → Order Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `orderId` | `shipments` | `order.orders.id` | ID String | HTTP API | Real-time validation |

**Details:**
- **Purpose**: Link shipment to order
- **Cardinality**: One-to-one (1:1) - one order can have one shipment
- **Validation**: HTTP API call to order-service
- **Sync**: Shipping-service publishes `shipment.created` event

**Example:**
```sql
-- shipping-service database
CREATE TABLE shipments (
  id VARCHAR(25) PRIMARY KEY,
  orderId VARCHAR(25) NOT NULL, -- References order.orders.id (no FK!)
  trackingNumber VARCHAR(100) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  -- ...
);
```

---

### 13. Return Service → Order Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `orderId` | `return_requests` | `order.orders.id` | ID String | HTTP API | Real-time validation |
| `orderId` | `return_items` | `order.order_items.id` | ID String | HTTP API | Real-time validation |
| `orderId` | `refunds` | `order.orders.id` | ID String | HTTP API | Real-time validation |

**Details:**
- **Purpose**: Link return request to order
- **Cardinality**: One-to-many (1:N) - one order can have multiple return requests
- **Validation**: HTTP API call to order-service
- **Sync**: Return-service publishes `return.created` event

**Example:**
```sql
-- return-service database
CREATE TABLE return_requests (
  id VARCHAR(25) PRIMARY KEY,
  orderId VARCHAR(25) NOT NULL, -- References order.orders.id (no FK!)
  userId VARCHAR(25) NOT NULL, -- References auth.users.id (no FK!)
  rmaNumber VARCHAR(50) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  -- ...
);

CREATE TABLE return_items (
  id VARCHAR(25) PRIMARY KEY,
  returnRequestId VARCHAR(25) NOT NULL,
  orderItemId VARCHAR(25) NOT NULL, -- References order.order_items.id (no FK!)
  productId VARCHAR(25) NOT NULL, -- References product.products.id (no FK!)
  -- ...
);
```

---

### 14. Return Service → Auth Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `userId` | `return_requests` | `auth.users.id` | ID String | JWT token | JWT validation |
| `userId` | `refunds` | `auth.users.id` | ID String | JWT token | JWT validation |

**Details:**
- **Purpose**: Link return request to user
- **Cardinality**: One-to-many (1:N)
- **Validation**: JWT token contains userId
- **Sync**: Not needed

---

### 15. Return Service → Product Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `productId` | `return_items` | `product.products.id` | ID String | HTTP API | Real-time validation |
| `variantId` | `return_items` | `product.product_variants.id` | ID String | HTTP API | Real-time validation |

**Details:**
- **Purpose**: Link return items to products
- **Cardinality**: Many-to-many (M:N)
- **Validation**: HTTP API call to product-service
- **Sync**: Not needed (product data snapshot in order_item)

---

### 16. Return Service → Payment Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `paymentId` | `refunds` | `payment.payments.id` | ID String | HTTP API | Real-time validation |

**Details:**
- **Purpose**: Link refund to original payment
- **Cardinality**: One-to-many (1:N) - one payment can have multiple refunds
- **Validation**: HTTP API call to payment-service
- **Sync**: Return-service publishes `refund.processed` event

---

### 17. Product Service → Auth Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `userId` | `product_reviews` | `auth.users.id` | ID String | JWT token | JWT validation |
| `userId` | `product_questions` | `auth.users.id` | ID String | JWT token | JWT validation |
| `userId` | `stock_alerts` | `auth.users.id` | ID String | JWT token | JWT validation |

**Details:**
- **Purpose**: Link reviews, questions, and stock alerts to users
- **Cardinality**: One-to-many (1:N)
- **Validation**: JWT token contains userId
- **Sync**: Not needed

**Example:**
```sql
-- product-service database
CREATE TABLE product_reviews (
  id VARCHAR(25) PRIMARY KEY,
  productId VARCHAR(25) NOT NULL,
  userId VARCHAR(25) NOT NULL, -- References auth.users.id (no FK!)
  rating INT NOT NULL, -- 1-5
  title VARCHAR(255),
  comment TEXT,
  -- ...
);
```

---

### 18. Notification Service → Auth Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `userId` | `notifications` | `auth.users.id` | ID String | Event sync | Event-based |
| `userId` | `notification_preferences` | `auth.users.id` | ID String | Event sync | Event-based |

**Details:**
- **Purpose**: Link notifications to users
- **Cardinality**: One-to-many (1:N)
- **Validation**: Event from auth-service or HTTP API
- **Sync**: Auth-service publishes `user.created` event

**Example:**
```sql
-- notification-service database
CREATE TABLE notifications (
  id VARCHAR(25) PRIMARY KEY,
  userId VARCHAR(25) NOT NULL, -- References auth.users.id (no FK!)
  type VARCHAR(20) NOT NULL, -- EMAIL|SMS|PUSH|IN_APP
  subject VARCHAR(255),
  body TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  -- ...
);
```

---

### 19. Discount Service → Auth Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `userId` | `coupon_usage` | `auth.users.id` | ID String | JWT token | JWT validation |
| `userId` | `promotion_usage` | `auth.users.id` | ID String | JWT token | JWT validation |

**Details:**
- **Purpose**: Track coupon/promotion usage by user
- **Cardinality**: One-to-many (1:N)
- **Validation**: JWT token contains userId
- **Sync**: Not needed

---

### 20. Discount Service → Order Service

| Field | Table | References | Type | Validation | Sync Method |
|-------|-------|------------|------|------------|-------------|
| `orderId` | `coupon_usage` | `order.orders.id` | ID String | Event sync | `order.created` event |
| `orderId` | `promotion_usage` | `order.orders.id` | ID String | Event sync | `order.created` event |

**Details:**
- **Purpose**: Track coupon/promotion usage in orders
- **Cardinality**: One-to-many (1:N)
- **Validation**: Event from order-service
- **Sync**: Order-service publishes `order.created` event

---

## Reference Patterns

### Pattern 1: Event-Driven Synchronization

**Use Case**: User registration, order creation, payment processing

**Flow:**
```
1. Source service creates entity (e.g., auth-service creates user)
   ↓
2. Publishes event: { entityId: "cm123", ... }
   ↓
3. Target service consumes event
   ↓
4. Creates related entity with same ID
   ↓
5. No FK constraint, but same ID ensures consistency
```

**Benefits:**
- ✅ Decoupled services
- ✅ Eventually consistent
- ✅ Fault tolerant

**Examples:**
- `user.created` → User Service creates profile
- `order.created` → Discount Service tracks coupon usage
- `payment.succeeded` → Order Service updates payment status

---

### Pattern 2: HTTP API Validation

**Use Case**: Order creation, cart operations, return requests

**Flow:**
```
1. Service receives request (e.g., create order)
   ↓
2. Validates referenced entity exists:
   GET /api/v1/products/{productId}
   ↓
3. Source service responds: { id: "cm456", ... }
   ↓
4. Service creates entity with reference ID
   ↓
5. No FK constraint, validated via API
```

**Benefits:**
- ✅ Strong consistency (immediate validation)
- ✅ Real-time validation
- ⚠️ Creates coupling (service must be available)

**Examples:**
- Order Service validates product exists
- Cart Service validates product exists
- Return Service validates order exists

---

### Pattern 3: JWT Token Validation

**Use Case**: User authentication, authorization

**Flow:**
```
1. Service receives request with JWT token
   ↓
2. Decodes JWT token (contains userId: "cm123")
   ↓
3. Validates token signature (no HTTP call needed)
   ↓
4. Uses userId from token
   ↓
5. No FK constraint, validated via JWT
```

**Benefits:**
- ✅ No HTTP call needed (fast)
- ✅ Stateless authentication
- ✅ Scalable

**Examples:**
- All services use JWT for user identification
- No need to call auth-service for every request

---

### Pattern 4: Data Snapshot

**Use Case**: Order items, historical records

**Flow:**
```
1. Service creates entity (e.g., order)
   ↓
2. Fetches current data from source service
   ↓
3. Stores snapshot of data (immutable)
   ↓
4. No FK constraint, but data preserved
```

**Benefits:**
- ✅ Historical accuracy
- ✅ Immutable records
- ✅ No dependency on source service for reads

**Examples:**
- Order items store product name, SKU, price at order time
- Even if product changes, order shows original data

---

## Data Consistency Strategies

### Eventual Consistency

**When to Use:**
- Non-critical operations
- Data synchronization
- Decoupled operations

**Examples:**
- User profile creation (from auth-service event)
- Product updates (from product-service event)
- Order status updates (from order-service event)

**Consistency Guarantee**: Seconds to minutes

---

### Strong Consistency

**When to Use:**
- Critical operations
- Real-time validation
- Immediate feedback required

**Examples:**
- Order creation (validate product exists)
- Payment processing (validate order exists)
- Inventory check (validate stock available)

**Consistency Guarantee**: Immediate

---

## Denormalization Strategy

### Why Denormalize?

**Performance**: Avoid cross-service queries  
**Availability**: Work offline if other service is down  
**Speed**: Faster reads

### Examples

**1. Email in User Profile:**
```sql
-- user-service database
user_profiles.email VARCHAR(255) -- Denormalized from auth.users.email
```
**Synchronization**: Via `user.created` event

**2. Product Data in Order Items:**
```sql
-- order-service database
order_items.product_name VARCHAR(255) -- Snapshot from product.products.name
order_items.product_sku VARCHAR(100) -- Snapshot from product.products.sku
order_items.unit_price DECIMAL(10,2) -- Snapshot from product.products.price
```
**Synchronization**: Snapshot at order time (immutable)

**3. Product Data in Wishlist:**
```sql
-- user-service database
wishlist_items.product_name VARCHAR(255) -- Denormalized from product.products.name
wishlist_items.product_image_url VARCHAR(500) -- Denormalized from product.products.image_url
```
**Synchronization**: Via `product.updated` event

---

## Reference Validation Strategies

### Strategy 1: Trust Events (Recommended)

**When**: Event-driven synchronization

**Example:**
```typescript
// User-service receives user.created event
async function handleUserCreatedEvent(event: UserCreatedEvent) {
  // Trust the event - auth-service already validated user exists
  await userProfileRepository.create({
    userId: event.userId, // No validation needed
    email: event.email,
  });
}
```

**Benefits:**
- ✅ Fast (no HTTP call)
- ✅ Decoupled
- ✅ Scalable

---

### Strategy 2: HTTP API Validation

**When**: Critical operations requiring immediate validation

**Example:**
```typescript
// Order-service creates order
async function createOrder(orderData: CreateOrderData) {
  // Validate product exists
  const product = await productServiceClient.getProduct(orderData.productId);
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Create order
  await orderRepository.create({
    productId: orderData.productId,
    // ...
  });
}
```

**Benefits:**
- ✅ Strong consistency
- ✅ Real-time validation
- ⚠️ Creates coupling

---

### Strategy 3: JWT Token Validation

**When**: User authentication

**Example:**
```typescript
// User-service validates request
async function authenticate(req: Request) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, JWT_SECRET);
  
  // Use userId from token (no HTTP call needed)
  req.user = { userId: decoded.userId };
}
```

**Benefits:**
- ✅ Fast (no HTTP call)
- ✅ Stateless
- ✅ Scalable

---

## Complete Reference Summary Table

| From Service | To Service | Reference Count | Primary Use Cases | Validation Method |
|--------------|------------|------------------|-------------------|------------------|
| User Service | Auth Service | 1 | User profile sync | Event sync |
| User Service | Product Service | 2 | Wishlist, recently viewed | HTTP API (optional) |
| Cart Service | Auth Service | 1 | Cart ownership | JWT token |
| Cart Service | Product Service | 2 | Cart items | HTTP API |
| Cart Service | Discount Service | 1 | Coupon codes | HTTP API |
| Order Service | Auth Service | 1 | Order ownership | JWT token |
| Order Service | Product Service | 2 | Order items | HTTP API |
| Order Service | Payment Service | 1 | Payment method | Event sync |
| Order Service | Discount Service | 1 | Coupon codes | HTTP API |
| Payment Service | Order Service | 2 | Payment/refund links | HTTP API |
| Payment Service | Auth Service | 3 | Payment ownership | JWT token |
| Shipping Service | Order Service | 1 | Shipment tracking | HTTP API |
| Return Service | Order Service | 3 | Return requests, items, refunds | HTTP API |
| Return Service | Auth Service | 2 | Return ownership | JWT token |
| Return Service | Product Service | 2 | Return items | HTTP API |
| Return Service | Payment Service | 1 | Refund processing | HTTP API |
| Product Service | Auth Service | 3 | Reviews, questions, stock alerts | JWT token |
| Notification Service | Auth Service | 1 | Notification delivery | Event sync |
| Discount Service | Auth Service | 2 | Coupon/promotion usage | JWT token |
| Discount Service | Order Service | 2 | Coupon/promotion usage | Event sync |

**Total Cross-Service References**: 25+

---

## Best Practices

### ✅ DO

1. **Use ID strings** for cross-service references
2. **Synchronize via events** for non-critical operations
3. **Validate via HTTP API** for critical operations
4. **Denormalize** frequently accessed data
5. **Snapshot** data at transaction time (orders, etc.)
6. **Index** reference columns for performance
7. **Log** cross-service operations for debugging

### ❌ DON'T

1. **Don't use foreign keys** across services
2. **Don't make synchronous calls** for non-critical operations
3. **Don't duplicate** data without sync strategy
4. **Don't assume** data consistency (use eventual consistency)
5. **Don't query** other services' databases directly
6. **Don't cascade deletes** across services
7. **Don't use transactions** across services

---

## Troubleshooting

### Issue: Stale Data

**Problem**: Denormalized data is out of sync

**Solution:**
- Implement event-driven updates
- Use version numbers for conflict resolution
- Implement reconciliation jobs
- Set TTL for cached data

---

### Issue: Missing References

**Problem**: Referenced entity doesn't exist

**Solution:**
- Validate via HTTP API before creating reference
- Handle gracefully (log error, don't fail)
- Implement retry logic for events
- Use idempotency keys

---

### Issue: Circular Dependencies

**Problem**: Services depend on each other

**Solution:**
- Use events for decoupling
- Implement saga pattern for distributed transactions
- Use eventual consistency
- Design service boundaries carefully

---

## Next Steps

- View [Master ER Diagram](./01-master-er-diagram.md) for visual representation
- View individual service database designs: [Service Schemas](./service-schemas/)
- Return to [Database Architecture Overview](./README.md)

---

**Last Updated**: 2025  
**Architecture Version**: 2.0 (Complete)
