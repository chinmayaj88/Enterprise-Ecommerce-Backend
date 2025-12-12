/**
 * Domain event fired when an order is created
 */
export interface OrderCreatedEvent extends Record<string, unknown> {
  orderId: string;
  orderNumber: string;
  userId: string;
  totalAmount: number;
  currency: string;
  itemCount: number;
  timestamp: string;
  source: string;
}

