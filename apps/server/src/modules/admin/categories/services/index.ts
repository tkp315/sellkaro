import prisma from '@utils/prisma.js';
import ApiError from '@utils/apiError.js';

export async function getCategories() {
  return prisma.category.findMany({
    include: {
      subcategories: { orderBy: { order: 'asc' } },
      _count: { select: { products: true } },
    },
    orderBy: { order: 'asc' },
  });
}

export async function createCategory(data: {
  name: string;
  slug: string;
  icon?: string;
  order?: number;
}) {
  const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
  if (existing) throw ApiError.conflict('Slug already in use');
  return prisma.category.create({ data });
}

export async function updateCategory(
  id: string,
  data: { name?: string; slug?: string; icon?: string; order?: number; isActive?: boolean },
) {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) throw ApiError.notFound('Category not found');
  if (data.slug && data.slug !== cat.slug) {
    const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
    if (existing) throw ApiError.conflict('Slug already in use');
  }
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  const cat = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!cat) throw ApiError.notFound('Category not found');
  if (cat._count.products > 0)
    throw ApiError.badRequest(`Cannot delete — ${cat._count.products} ads linked to this category`);
  await prisma.category.delete({ where: { id } });
}

export async function createSubcategory(
  categoryId: string,
  data: { name: string; slug: string; icon?: string; order?: number },
) {
  const cat = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!cat) throw ApiError.notFound('Category not found');
  const existing = await prisma.subCategory.findUnique({ where: { slug: data.slug } });
  if (existing) throw ApiError.conflict('Slug already in use');
  return prisma.subCategory.create({ data: { ...data, categoryId } });
}

export async function updateSubcategory(
  id: string,
  data: { name?: string; slug?: string; icon?: string; order?: number; isActive?: boolean },
) {
  const sub = await prisma.subCategory.findUnique({ where: { id } });
  if (!sub) throw ApiError.notFound('Subcategory not found');
  if (data.slug && data.slug !== sub.slug) {
    const existing = await prisma.subCategory.findUnique({ where: { slug: data.slug } });
    if (existing) throw ApiError.conflict('Slug already in use');
  }
  return prisma.subCategory.update({ where: { id }, data });
}

export async function deleteSubcategory(id: string) {
  const sub = await prisma.subCategory.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!sub) throw ApiError.notFound('Subcategory not found');
  if (sub._count.products > 0)
    throw ApiError.badRequest(`Cannot delete — ${sub._count.products} ads linked to this subcategory`);
  await prisma.subCategory.delete({ where: { id } });
}
