"use server";

import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PostStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// ============================================
// GET PENDING APPROVALS
// ============================================

export async function getPendingApprovalsAction(brandId: string) {
  await requireAuth();

  const posts = await prisma.post.findMany({
    where: {
      brandId,
      status: PostStatus.PENDING_APPROVAL,
    },
    include: {
      items: {
        include: {
          socialAccount: {
            select: {
              platform: true,
              username: true,
            },
          },
        },
      },
      approvals: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { success: true, posts };
}

// ============================================
// APPROVE POST
// ============================================

export async function approvePostAction(postId: string, comment?: string) {
  const user = await requireAuth();

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return { success: false, error: "Post no encontrado" };
  }

  await prisma.approval.create({
    data: {
      postId,
      userId: user.id,
      approved: true,
      comment,
    },
  });

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: PostStatus.APPROVED,
    },
  });

  revalidatePath(`/dashboard/${post.brandId}/approvals`);

  return { success: true, message: "Post aprobado correctamente" };
}

// ============================================
// REJECT POST
// ============================================

export async function rejectPostAction(postId: string, comment: string) {
  const user = await requireAuth();

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return { success: false, error: "Post no encontrado" };
  }

  await prisma.approval.create({
    data: {
      postId,
      userId: user.id,
      approved: false,
      comment,
    },
  });

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: PostStatus.DRAFT,
    },
  });

  revalidatePath(`/dashboard/${post.brandId}/approvals`);

  return { success: true, message: "Post rechazado" };
}

// ============================================
// GET APPROVAL STATS
// ============================================

export async function getApprovalStatsAction(brandId: string) {
  await requireAuth();

  const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.post.count({
      where: {
        brandId,
        status: PostStatus.PENDING_APPROVAL,
      },
    }),
    prisma.approval.count({
      where: {
        approved: true,
        post: { brandId },
      },
    }),
    prisma.approval.count({
      where: {
        approved: false,
        post: { brandId },
      },
    }),
  ]);

  const total = approvedCount + rejectedCount;
  const approvalRate = total > 0 ? Math.round((approvedCount / total) * 100) : 0;

  return {
    success: true,
    stats: {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      total,
      approvalRate,
    },
  };
}
