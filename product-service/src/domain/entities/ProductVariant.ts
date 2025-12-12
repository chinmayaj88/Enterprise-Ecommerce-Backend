export class ProductVariant {
  constructor(
    public id: string,
    public productId: string,
    public sku: string,
    public name: string | null,
    public price: number | null,
    public compareAtPrice: number | null,
    public stockQuantity: number,
    public stockStatus: string,
    public attributes: Record<string, any> | null,
    public imageUrl: string | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static fromPrisma(data: any): ProductVariant {
    return new ProductVariant(
      data.id,
      data.productId,
      data.sku,
      data.name,
      data.price ? Number(data.price) : null,
      data.compareAtPrice ? Number(data.compareAtPrice) : null,
      data.stockQuantity,
      data.stockStatus,
      data.attributes as Record<string, any> | null,
      data.imageUrl,
      data.createdAt,
      data.updatedAt
    );
  }

  isInStock(): boolean {
    return this.stockStatus === 'in_stock' && this.stockQuantity > 0;
  }
}

