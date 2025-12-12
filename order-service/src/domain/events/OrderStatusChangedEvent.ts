/**
 * Domain event fired when an order status changes
 */
export interface OrderStatusChangedEvent extends Record<string, unknown> {
  orderId: string;
  orderNumber: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  reason?: string;
  timestamp: string;
  source: string;
}

