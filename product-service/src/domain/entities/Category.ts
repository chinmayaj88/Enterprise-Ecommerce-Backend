export class Category {
  constructor(
    public id: string,
    public name: string,
    public slug: string,
    public description: string | null,
    public parentId: string | null,
    public level: number,
    public sortOrder: number,
    public imageUrl: string | null,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static fromPrisma(data: any): Category {
    return new Category(
      data.id,
      data.name,
      data.slug,
      data.description,
      data.parentId,
      data.level,
      data.sortOrder,
      data.imageUrl,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }

  isRoot(): boolean {
    return this.parentId === null;
  }

  hasParent(): boolean {
    return this.parentId !== null;
  }
}

