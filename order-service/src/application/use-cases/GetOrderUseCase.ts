import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { IOrderItemRepository } from '../../domain/repositories/IOrderItemRepository';
import { IOrderShippingAddressRepository } from '../../domain/repositories/IOrderShippingAddressRepository';
import { IOrderStatusHistoryRepository } from '../../domain/repositories/IOrderStatusHistoryRepository';
import { Order, OrderStatus, PaymentStatus } from '../../domain/entities/Order';
import { OrderItem } from '../../domain/entities/OrderItem';
import { OrderShippingAddress } from '../../domain/entities/OrderShippingAddress';
import { OrderStatusHistory } from '../../domain/entities/OrderStatusHistory';

export interface OrderDetails {
  order: Order;
  items: OrderItem[];
  shippingAddress: OrderShippingAddress | null;
  statusHistory: OrderStatusHistory[];
}

export class GetOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly orderItemRepository: IOrderItemRepository,
    private readonly orderShippingAddressRepository: IOrderShippingAddressRepository,
    private readonly orderStatusHistoryRepository: IOrderStatusHistoryRepository
  ) {}

  async execute(orderId: string, userId?: string): Promise<OrderDetails | null> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      return null;
    }

    // Check if user has permission to view this order
    if (userId && order.userId !== userId) {
      throw new Error('Unauthorized to view this order');
    }

    const items = await this.orderItemRepository.findByOrderId(orderId);
    const shippingAddress = await this.orderShippingAddressRepository.findByOrderId(orderId);
    const statusHistory = await this.orderStatusHistoryRepository.findByOrderId(orderId);

    return {
      order,
      items,
      shippingAddress,
      statusHistory,
    };
  }

  async executeByOrderNumber(orderNumber: string, userId?: string): Promise<OrderDetails | null> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);

    if (!order) {
      return null;
    }

    // Check if user has permission to view this order
    if (userId && order.userId !== userId) {
      throw new Error('Unauthorized to view this order');
    }

    const items = await this.orderItemRepository.findByOrderId(order.id);
    const shippingAddress = await this.orderShippingAddressRepository.findByOrderId(order.id);
    const statusHistory = await this.orderStatusHistoryRepository.findByOrderId(order.id);

    return {
      order,
      items,
      shippingAddress,
      statusHistory,
    };
  }

  async executeByUserId(userId: string, status?: OrderStatus): Promise<Order[]> {
    return await this.orderRepository.findByUserId(userId, status);
  }

  async executeByUserIdPaginated(
    userId: string,
    options?: {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      limit?: number;
      offset?: number;
      sortBy?: 'createdAt' | 'totalAmount' | 'status';
      sortOrder?: 'asc' | 'desc';
      startDate?: Date;
      endDate?: Date;
      minAmount?: number;
      maxAmount?: number;
    }
  ) {
    return await this.orderRepository.findByUserIdPaginated(userId, options);
  }
}

