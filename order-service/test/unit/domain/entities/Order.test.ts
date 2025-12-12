import { Order, OrderStatus, PaymentStatus } from '../../../../src/domain/entities/Order';

describe('Order Entity', () => {
  const createOrder = (overrides?: Partial<Order>): Order => {
    return new Order(
      overrides?.id || 'order-1',
      overrides?.orderNumber || 'ORD-001',
      overrides?.userId || 'user-1',
      overrides?.status || OrderStatus.PENDING,
      overrides?.paymentStatus || PaymentStatus.PENDING,
      overrides?.subtotal || 100,
      overrides?.taxAmount || 10,
      overrides?.shippingAmount || 5,
      overrides?.discountAmount || 0,
      overrides?.totalAmount || 115,
      overrides?.currency || 'USD',
      overrides?.paymentMethodId || null,
      overrides?.shippingMethod || null,
      overrides?.trackingNumber || null,
      overrides?.estimatedDeliveryDate || null,
      overrides?.shippedAt || null,
      overrides?.deliveredAt || null,
      overrides?.cancelledAt || null,
      overrides?.metadata || null,
      overrides?.createdAt || new Date(),
      overrides?.updatedAt || new Date()
    );
  };

  describe('canBeCancelled', () => {
    it('should return true for pending orders', () => {
      const order = createOrder({ status: OrderStatus.PENDING });
      expect(order.canBeCancelled()).toBe(true);
    });

    it('should return true for confirmed orders', () => {
      const order = createOrder({ status: OrderStatus.CONFIRMED });
      expect(order.canBeCancelled()).toBe(true);
    });

    it('should return false for shipped orders', () => {
      const order = createOrder({ status: OrderStatus.SHIPPED });
      expect(order.canBeCancelled()).toBe(false);
    });
  });

  describe('canBeRefunded', () => {
    it('should return true for paid and delivered orders', () => {
      const order = createOrder({
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.DELIVERED,
      });
      expect(order.canBeRefunded()).toBe(true);
    });

    it('should return false for unpaid orders', () => {
      const order = createOrder({
        paymentStatus: PaymentStatus.PENDING,
        status: OrderStatus.DELIVERED,
      });
      expect(order.canBeRefunded()).toBe(false);
    });
  });

  describe('isCompleted', () => {
    it('should return true for delivered orders', () => {
      const order = createOrder({ status: OrderStatus.DELIVERED });
      expect(order.isCompleted()).toBe(true);
    });

    it('should return true for cancelled orders', () => {
      const order = createOrder({ status: OrderStatus.CANCELLED });
      expect(order.isCompleted()).toBe(true);
    });

    it('should return false for pending orders', () => {
      const order = createOrder({ status: OrderStatus.PENDING });
      expect(order.isCompleted()).toBe(false);
    });
  });
});

