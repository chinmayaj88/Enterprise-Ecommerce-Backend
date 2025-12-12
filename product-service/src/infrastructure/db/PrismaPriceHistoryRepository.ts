import { PrismaClient } from '@prisma/client';
import { PriceHistory } from '../../domain/entities/PriceHistory';
import { IPriceHistoryRepository, CreatePriceHistoryData } from '../../domain/repositories/IPriceHistoryRepository';

export class PrismaPriceHistoryRepository implements IPriceHistoryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreatePriceHistoryData): Promise<PriceHistory> {
    const history = await this.prisma.priceHistory.create({
      data: {
        productId: data.productId,
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        changedBy: data.changedBy || null,
        reason: data.reason || null,
      },
    });

    return PriceHistory.fromPrisma(history);
  }

  async findByProductId(productId: string, limit: number = 50): Promise<PriceHistory[]> {
    const histories = await this.prisma.priceHistory.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return histories.map((h: any) => PriceHistory.fromPrisma(h));
  }

  async findLatestByProductId(productId: string): Promise<PriceHistory | null> {
    const history = await this.prisma.priceHistory.findFirst({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });

    if (!history) {
      return null;
    }

    return PriceHistory.fromPrisma(history);
  }

  
}

