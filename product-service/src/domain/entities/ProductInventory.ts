export class ProductInventory {
  constructor(
    public id: string,
    public productId: string,
    public variantId: string | null,
    public quantity: number,
    public reservedQuantity: number,
    public availableQuantity: number,
    public location: string | null,
    public lastRestockedAt: Date | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static fromPrisma(data: any): ProductInventory {
    return new ProductInventory(
      data.id,
      data.productId,
      data.variantId,
      data.quantity,
      data.reservedQuantity,
      data.availableQuantity,
      data.location,
      data.lastRestockedAt,
      data.createdAt,
      data.updatedAt
    );
  }

  reserve(amount: number): void {
    if (amount > this.availableQuantity) {
      throw new Error('Insufficient available quantity');
    }
    this.reservedQuantity += amount;
    this.availableQuantity -= amount;
  }

  release(amount: number): void {
    if (amount > this.reservedQuantity) {
      throw new Error('Cannot release more than reserved');
    }
    this.reservedQuantity -= amount;
    this.availableQuantity += amount;
  }

  addStock(amount: number): void {
    this.quantity += amount;
    this.availableQuantity += amount;
    this.lastRestockedAt = new Date();
  }

  removeStock(amount: number): void {
    if (amount > this.availableQuantity) {
      throw new Error('Insufficient stock');
    }
    this.quantity -= amount;
    this.availableQuantity -= amount;
  }
}

