import { PrismaClient } from '@prisma/client';
import { ProductTag } from '../../domain/entities/ProductTag';
import { IProductTagRepository, CreateProductTagData } from '../../domain/repositories/IProductTagRepository';

export class PrismaProductTagRepository implements IProductTagRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateProductTagData): Promise<ProductTag> {
    // Check if tag already exists for this product
    const existing = await this.prisma.productTag.findFirst({
      where: { productId: data.productId, tag: data.tag },
    });

    if (existing) {
      return ProductTag.fromPrisma(existing);
    }

    const tag = await this.prisma.productTag.create({
      data: {
        productId: data.productId,
        tag: data.tag,
      },
    });

    return ProductTag.fromPrisma(tag);
  }

  async findById(id: string): Promise<ProductTag | null> {
    const tag = await this.prisma.productTag.findUnique({
      where: { id },
    });

    if (!tag) {
      return null;
    }

    return ProductTag.fromPrisma(tag);
  }

  async findByProductId(productId: string): Promise<ProductTag[]> {
    const tags = await this.prisma.productTag.findMany({
      where: { productId },
      orderBy: { tag: 'asc' },
    });

    return tags.map((t: any) => ProductTag.fromPrisma(t));
  }

  async findByTag(tag: string): Promise<ProductTag[]> {
    const tags = await this.prisma.productTag.findMany({
      where: { tag },
      orderBy: { createdAt: 'desc' },
    });

    return tags.map((t: any) => ProductTag.fromPrisma(t));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.productTag.delete({
      where: { id },
    });
  }

  async deleteByProductId(productId: string): Promise<void> {
    await this.prisma.productTag.deleteMany({
      where: { productId },
    });
  }

  async deleteByProductIdAndTag(productId: string, tag: string): Promise<void> {
    await this.prisma.productTag.deleteMany({
      where: { productId, tag },
    });
  }

  
}

