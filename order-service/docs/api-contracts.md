# API Contracts

## Base URL
```
http://localhost:3005/api/v1
```

## Authentication
All endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <token>
```

## Endpoints

### Create Order
```
POST /orders
```

**Request Body:**
```json
{
  "cartId": "string (optional)",
  "shippingAddressId": "string (optional)",
  "paymentMethodId": "string (optional)",
  "shippingMethod": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "string",
    "orderNumber": "string",
    "userId": "string",
    "status": "pending",
    "paymentStatus": "pending",
    "totalAmount": 115.00,
    "currency": "USD",
    ...
  },
  "timestamp": "2024-11-09T12:00:00.000Z"
}
```

### Get Orders
```
GET /orders?limit=20&offset=0&status=pending
```

**Query Parameters:**
- `limit` (optional): Number of results (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status
- `paymentStatus` (optional): Filter by payment status
- `sortBy` (optional): Sort field (createdAt, totalAmount, status)
- `sortOrder` (optional): Sort direction (asc, desc)

### Get Order by ID
```
GET /orders/:orderId
```

### Get Order by Order Number
```
GET /orders/number/:orderNumber
```

### Update Order Status
```
PATCH /orders/:orderId/status
```

**Request Body:**
```json
{
  "status": "confirmed",
  "reason": "string (optional)"
}
```

### Update Payment Status
```
PATCH /orders/:orderId/payment-status
```

**Request Body:**
```json
{
  "paymentStatus": "paid",
  "reason": "string (optional)"
}
```

### Cancel Order
```
POST /orders/:orderId/cancel
```

**Request Body:**
```json
{
  "reason": "string (optional)"
}
```

### Order Notes

#### Create Note
```
POST /orders/:orderId/notes
```

#### Get Notes
```
GET /orders/:orderId/notes?includeInternal=false
```

#### Update Note
```
PATCH /orders/notes/:noteId
```

#### Delete Note
```
DELETE /orders/notes/:noteId
```

## Error Responses

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)",
  "timestamp": "2024-11-09T12:00:00.000Z"
}
```

## Status Codes

- `200`: Success
- `201`: Created
- `204`: No Content
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error
- `503`: Service Unavailable

