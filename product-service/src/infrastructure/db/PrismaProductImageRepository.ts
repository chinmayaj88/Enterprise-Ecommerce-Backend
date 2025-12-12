import { PrismaClient } from '@prisma/client';
import { ProductImage } from '../../domain/entities/ProductImage';
import { IProductImageRepository, CreateProductImageData, UpdateProductImageData } from '../../domain/repositories/IProductImageRepository';

export class PrismaProductImageRepository implements IProductImageRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateProductImageData): Promise<ProductImage> {
    // If this is the primary image, unset other primary images for this product
    if (data.isPrimary) {
      await this.prisma.productImage.updateMany({
        where: { productId: data.productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const image = await this.prisma.productImage.create({
      data: {
        productId: data.productId,
        url: data.url,
        altText: data.altText || null,
        sortOrder: data.sortOrder ?? 0,
        isPrimary: data.isPrimary ?? false,
      },
    });

    return ProductImage.fromPrisma(image);
  }

  async findById(id: string): Promise<ProductImage | null> {
    const image = await this.prisma.productImage.findUnique({
      where: { id },
    });

    if (!image) {
      return null;
    }

    return ProductImage.fromPrisma(image);
  }

  async findByProductId(productId: string): Promise<ProductImage[]> {
    const images = await this.prisma.productImage.findMany({
      where: { productId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return images.map((img: any) => ProductImage.fromPrisma(img));
  }

  async findPrimaryByProductId(productId: string): Promise<ProductImage | null> {
    const image = await this.prisma.productImage.findFirst({
      where: { productId, isPrimary: true },
    });

    if (!image) {
      return null;
    }

    return ProductImage.fromPrisma(image);
  }

  async update(id: string, data: UpdateProductImageData): Promise<ProductImage> {
    // If setting as primary, unset other primary images
    if (data.isPrimary) {
      const image = await this.prisma.productImage.findUnique({ where: { id } });
      if (image) {
        await this.prisma.productImage.updateMany({
          where: { productId: image.productId, isPrimary: true, id: { not: id } },
          data: { isPrimary: false },
        });
      }
    }

    const image = await this.prisma.productImage.update({
      where: { id },
      data: {
        ...(data.url !== undefined && { url: data.url }),
        ...(data.altText !== undefined && { altText: data.altText }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isPrimary !== undefined && { isPrimary: data.isPrimary }),
      },
    });

    return ProductImage.fromPrisma(image);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.productImage.delete({
      where: { id },
    });
  }

  async setPrimary(id: string, productId: string): Promise<void> {
    // Unset all primary images for this product
    await this.prisma.productImage.updateMany({
      where: { productId, isPrimary: true },
      data: { isPrimary: false },
    });

    // Set this image as primary
    await this.prisma.productImage.update({
      where: { id },
      data: { isPrimary: true },
    });
  }

  
}

