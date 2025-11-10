"use server";

import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAssetsAction(brandId: string, search?: string) {
  await requireAuth();

  const where: any = { brandId };

  if (search) {
    where.OR = [
      { publicId: { contains: search, mode: 'insensitive' } },
      { format: { contains: search, mode: 'insensitive' } },
    ];
  }

  const assets = await prisma.mediaAsset.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { success: true, assets };
}

export async function getAssetDetailAction(assetId: string) {
  await requireAuth();

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: assetId },
  });

  if (!asset) {
    return { success: false, error: "Asset no encontrado" };
  }

  return { success: true, asset };
}

export async function createAssetAction(
  brandId: string,
  assetData: {
    publicId: string;
    url: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
  }
) {
  await requireAuth();

  const asset = await prisma.mediaAsset.create({
    data: {
      brandId,
      ...assetData,
    },
  });

  revalidatePath("/dashboard/" + brandId + "/assets");

  return { success: true, asset };
}

export async function deleteAssetAction(assetId: string) {
  await requireAuth();

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: assetId },
  });

  if (!asset) {
    return { success: false, error: "Asset no encontrado" };
  }

  await prisma.mediaAsset.delete({
    where: { id: assetId },
  });

  revalidatePath("/dashboard/" + asset.brandId + "/assets");

  return { success: true, message: "Asset eliminado correctamente" };
}

export async function incrementAssetUsageAction(assetId: string) {
  await requireAuth();

  await prisma.mediaAsset.update({
    where: { id: assetId },
    data: {
      usedCount: {
        increment: 1,
      },
      lastUsedAt: new Date(),
    },
  });

  return { success: true };
}

export async function getAssetStatsAction(brandId: string) {
  await requireAuth();

  const [
    totalAssets,
    totalSize,
    mostUsed,
  ] = await Promise.all([
    prisma.mediaAsset.count({
      where: { brandId },
    }),
    prisma.mediaAsset.aggregate({
      where: { brandId },
      _sum: {
        bytes: true,
      },
    }),
    prisma.mediaAsset.findMany({
      where: { brandId },
      orderBy: {
        usedCount: 'desc',
      },
      take: 5,
    }),
  ]);

  return {
    success: true,
    stats: {
      totalAssets,
      totalSize: totalSize._sum.bytes || 0,
      mostUsed,
    },
  };
}
