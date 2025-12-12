import { PrismaClient } from '@prisma/client';
import { ProductVariant } from '../../domain/entities/ProductVariant';
import { IProductVariantRepository, CreateProductVariantData, UpdateProductVariantData } from '../../domain/repositories/IProductVariantRepository';

export class PrismaProductVariantRepository implements IProductVariantRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateProductVariantData): Promise<ProductVariant> {
    const variant = await this.prisma.productVariant.create({
      data: {
        productId: data.productId,
        sku: data.sku,
        name: data.name || null,
        price: data.price || null,
        compareAtPrice: data.compareAtPrice || null,
        stockQuantity: data.stockQuantity ?? 0,
        stockStatus: data.stockStatus || 'out_of_stock',
        attributes: data.attributes || undefined,
        imageUrl: data.imageUrl || null,
      },
    });

    return ProductVariant.fromPrisma(variant);
  }

  async findById(id: string): Promise<ProductVariant | null> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!variant) {
      return null;
    }

    return ProductVariant.fromPrisma(variant);
  }

  async findBySku(sku: string): Promise<ProductVariant | null> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { sku },
    });

    if (!variant) {
      return null;
    }

    return ProductVariant.fromPrisma(variant);
  }

  async findByProductId(productId: string): Promise<ProductVariant[]> {
    const variants = await this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    });

    return variants.map((v: any) => ProductVariant.fromPrisma(v));
  }

  async update(id: string, data: UpdateProductVariantData): Promise<ProductVariant> {
    const variant = await this.prisma.productVariant.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.compareAtPrice !== undefined && { compareAtPrice: data.compareAtPrice }),
        ...(data.stockQuantity !== undefined && { stockQuantity: data.stockQuantity }),
        ...(data.stockStatus !== undefined && { stockStatus: data.stockStatus }),
        ...(data.attributes !== undefined && { attributes: data.attributes || undefined }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      },
    });

    return ProductVariant.fromPrisma(variant);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.productVariant.delete({
      where: { id },
    });
  }

  
}

