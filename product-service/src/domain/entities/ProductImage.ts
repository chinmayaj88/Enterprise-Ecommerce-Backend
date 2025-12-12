export class ProductImage {
  constructor(
    public id: string,
    public productId: string,
    public url: string,
    public altText: string | null,
    public sortOrder: number,
    public isPrimary: boolean,
    public createdAt: Date
  ) {}

  static fromPrisma(data: any): ProductImage {
    return new ProductImage(
      data.id,
      data.productId,
      data.url,
      data.altText,
      data.sortOrder,
      data.isPrimary,
      data.createdAt
    );
  }
}

