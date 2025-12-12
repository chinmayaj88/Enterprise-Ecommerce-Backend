import { PrismaClient } from '@prisma/client';
import { ProductSearchHistory } from '../../domain/entities/ProductSearchHistory';
import { IProductSearchHistoryRepository, CreateProductSearchHistoryData } from '../../domain/repositories/IProductSearchHistoryRepository';

export class PrismaProductSearchHistoryRepository implements IProductSearchHistoryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateProductSearchHistoryData): Promise<ProductSearchHistory> {
    const history = await this.prisma.productSearchHistory.create({
      data: {
        productId: data.productId || null,
        userId: data.userId || null,
        query: data.query,
        filters: data.filters || undefined,
        resultsCount: data.resultsCount || null,
      },
    });

    return ProductSearchHistory.fromPrisma(history);
  }

  async findByUserId(userId: string, limit: number = 50): Promise<ProductSearchHistory[]> {
    const histories = await this.prisma.productSearchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return histories.map((h: any) => ProductSearchHistory.fromPrisma(h));
  }

  async findPopularQueries(limit: number = 10): Promise<Array<{ query: string; count: number }>> {
    // This is a simplified implementation
    // In production, you might want to use a more efficient aggregation query
    const histories = await this.prisma.productSearchHistory.findMany({
      select: { query: true },
    });

    const queryCounts = new Map<string, number>();
    histories.forEach((h: { query: string }) => {
      queryCounts.set(h.query, (queryCounts.get(h.query) || 0) + 1);
    });

    return Array.from(queryCounts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async findRecentQueries(limit: number = 50): Promise<ProductSearchHistory[]> {
    const histories = await this.prisma.productSearchHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      distinct: ['query'],
    });

    return histories.map((h: any) => ProductSearchHistory.fromPrisma(h));
  }

  
}

