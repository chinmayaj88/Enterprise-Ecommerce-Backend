export class Product {
  constructor(
    public id: string,
    public sku: string,
    public name: string,
    public slug: string,
    public description: string | null,
    public shortDescription: string | null,
    public price: number,
    public compareAtPrice: number | null,
    public costPrice: number | null,
    public status: 'draft' | 'active' | 'archived',
    public isVisible: boolean,
    public stockQuantity: number,
    public stockStatus: 'in_stock' | 'out_of_stock' | 'backorder',
    public weight: number | null,
    public length: number | null,
    public width: number | null,
    public height: number | null,
    public metaTitle: string | null,
    public metaDescription: string | null,
    public attributes: Record<string, any> | null,
    public badges: string[],
    public viewCount: number,
    public purchaseCount: number,
    public searchCount: number,
    public createdAt: Date,
    public updatedAt: Date,
    public publishedAt: Date | null
  ) {}

  static fromPrisma(data: any): Product {
    return new Product(
      data.id,
      data.sku,
      data.name,
      data.slug,
      data.description,
      data.shortDescription,
      Number(data.price),
      data.compareAtPrice ? Number(data.compareAtPrice) : null,
      data.costPrice ? Number(data.costPrice) : null,
      data.status,
      data.isVisible,
      data.stockQuantity,
      data.stockStatus,
      data.weight ? Number(data.weight) : null,
      data.length ? Number(data.length) : null,
      data.width ? Number(data.width) : null,
      data.height ? Number(data.height) : null,
      data.metaTitle,
      data.metaDescription,
      data.attributes as Record<string, any> | null,
      data.badges || [],
      data.viewCount,
      data.purchaseCount,
      data.searchCount,
      data.createdAt,
      data.updatedAt,
      data.publishedAt
    );
  }

  isActive(): boolean {
    return this.status === 'active' && this.isVisible;
  }

  isInStock(): boolean {
    return this.stockStatus === 'in_stock' && this.stockQuantity > 0;
  }

  incrementViewCount(): void {
    this.viewCount++;
  }

  incrementPurchaseCount(): void {
    this.purchaseCount++;
  }

  incrementSearchCount(): void {
    this.searchCount++;
  }
}

