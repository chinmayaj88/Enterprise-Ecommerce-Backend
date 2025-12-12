/**
 * Domain event fired when an order is cancelled
 */
export interface OrderCancelledEvent extends Record<string, unknown> {
  orderId: string;
  orderNumber: string;
  userId: string;
  reason?: string;
  timestamp: string;
  source: string;
}

