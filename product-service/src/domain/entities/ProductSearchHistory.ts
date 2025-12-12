export class ProductSearchHistory {
  constructor(
    public id: string,
    public productId: string | null,
    public userId: string | null,
    public query: string,
    public filters: Record<string, any> | null,
    public resultsCount: number | null,
    public createdAt: Date
  ) {}

  static fromPrisma(data: any): ProductSearchHistory {
    return new ProductSearchHistory(
      data.id,
      data.productId,
      data.userId,
      data.query,
      data.filters as Record<string, any> | null,
      data.resultsCount,
      data.createdAt
    );
  }
}

