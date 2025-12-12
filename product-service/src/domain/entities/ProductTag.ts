export class ProductTag {
  constructor(
    public id: string,
    public productId: string,
    public tag: string,
    public createdAt: Date
  ) {}

  static fromPrisma(data: any): ProductTag {
    return new ProductTag(
      data.id,
      data.productId,
      data.tag,
      data.createdAt
    );
  }
}

