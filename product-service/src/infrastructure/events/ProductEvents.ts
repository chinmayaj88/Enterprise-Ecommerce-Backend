export interface ProductCreatedEvent extends Record<string, unknown> {
  productId: string;
  sku: string;
  name: string;
  price: number;
  status: string;
  timestamp: string;
  source: string;
}

export interface ProductUpdatedEvent extends Record<string, unknown> {
  productId: string;
  sku: string;
  name?: string;
  price?: number;
  status?: string;
  changes?: Record<string, any>;
  timestamp: string;
  source: string;
}

export interface ProductPriceChangedEvent extends Record<string, unknown> {
  productId: string;
  sku: string;
  oldPrice: number;
  newPrice: number;
  timestamp: string;
  source: string;
}

export interface ProductStockChangedEvent extends Record<string, unknown> {
  productId: string;
  sku: string;
  oldStock: number;
  newStock: number;
  stockStatus: string;
  timestamp: string;
  source: string;
}

export interface ProductDeletedEvent extends Record<string, unknown> {
  productId: string;
  sku: string;
  timestamp: string;
  source: string;
}

