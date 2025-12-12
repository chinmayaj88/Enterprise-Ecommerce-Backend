export class PriceHistory {
  constructor(
    public id: string,
    public productId: string,
    public price: number,
    public compareAtPrice: number | null,
    public changedBy: string | null,
    public reason: string | null,
    public createdAt: Date
  ) {}

  static fromPrisma(data: any): PriceHistory {
    return new PriceHistory(
      data.id,
      data.productId,
      Number(data.price),
      data.compareAtPrice ? Number(data.compareAtPrice) : null,
      data.changedBy,
      data.reason,
      data.createdAt
    );
  }
}

