"use server"

import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCalendarPostsAction(
  brandId: string,
  startDate: Date,
  endDate: Date
) {
  await requireAuth()

  const posts = await prisma.post.findMany({
    where: {
      brandId,
      OR: [
        {
          scheduledAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          publishedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      ],
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
    },
    orderBy: {
      scheduledAt: "asc",
    },
  })

  return posts.map((post) => ({
    ...post,
    scheduledAt: post.scheduledAt?.toISOString() || null,
    publishedAt: post.publishedAt?.toISOString() || null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }))
}

export async function movePostDateAction(postId: string, newDate: Date, brandId: string) {
  await requireAuth()

  // Verificar que el post pertenece al brand
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      brandId,
    },
  })

  if (!post) {
    throw new Error("Post no encontrado o no tienes permiso")
  }

  // No permitir mover posts ya publicados
  if (post.status === "PUBLISHED") {
    throw new Error("No puedes mover un post ya publicado")
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      scheduledAt: newDate,
      status: post.status === "DRAFT" ? "SCHEDULED" : post.status,
    },
  })

  revalidatePath(`/dashboard/${brandId}/calendar`)
  return updatedPost
}

export async function createPostFromCalendarAction(
  brandId: string,
  scheduledAt: Date,
  data: {
    platform: string
    content: string
    mediaUrls?: string[]
  }
) {
  const user = await requireAuth()

  // Obtener la primera cuenta social activa de la plataforma especificada
  const socialAccount = await prisma.socialAccount.findFirst({
    where: {
      brandId,
      platform: data.platform as any,
      isActive: true,
    },
  })

  if (!socialAccount) {
    throw new Error(`No hay cuenta de ${data.platform} conectada`)
  }

  const post = await prisma.post.create({
    data: {
      brandId,
      scheduledAt,
      status: "SCHEDULED",
      createdById: user.id,
      items: {
        create: {
          socialAccountId: socialAccount.id,
          platform: data.platform as any,
          content: data.content,
          mediaUrls: data.mediaUrls || [],
          hashtags: [],
          status: "SCHEDULED",
        },
      },
    },
    include: {
      items: {
        include: {
          socialAccount: true,
        },
      },
    },
  })

  revalidatePath(`/dashboard/${brandId}/calendar`)
  return post
}

export async function updatePostFromCalendarAction(
  postId: string,
  brandId: string,
  data: {
    content?: string
    scheduledAt?: Date
    status?: string
    mediaUrls?: string[]
  }
) {
  await requireAuth()

  // Verificar que el post pertenece al brand
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      brandId,
    },
    include: {
      items: true,
    },
  })

  if (!post) {
    throw new Error("Post no encontrado")
  }

  // Actualizar el post
  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      scheduledAt: data.scheduledAt,
      status: data.status as any,
    },
  })

  // Si hay contenido o mediaUrls, actualizar el primer PostItem
  if ((data.content || data.mediaUrls) && post.items.length > 0) {
    await prisma.postItem.update({
      where: { id: post.items[0].id },
      data: {
        content: data.content,
        mediaUrls: data.mediaUrls,
      },
    })
  }

  revalidatePath(`/dashboard/${brandId}/calendar`)
  return updatedPost
}

export async function deletePostFromCalendarAction(postId: string, brandId: string) {
  await requireAuth()

  // Verificar que el post pertenece al brand
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      brandId,
    },
  })

  if (!post) {
    throw new Error("Post no encontrado")
  }

  // No permitir eliminar posts publicados
  if (post.status === "PUBLISHED") {
    throw new Error("No puedes eliminar un post ya publicado")
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: "DELETED",
    },
  })

  revalidatePath(`/dashboard/${brandId}/calendar`)
}

export async function duplicatePostAction(postId: string, brandId: string, newDate?: Date) {
  await requireAuth()

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      brandId,
    },
    include: {
      items: true,
    },
  })

  if (!post) {
    throw new Error("Post no encontrado")
  }

  const duplicatedPost = await prisma.post.create({
    data: {
      brandId: post.brandId,
      scheduledAt: newDate || post.scheduledAt,
      status: "DRAFT",
      createdById: post.createdById,
      items: {
        create: post.items.map((item) => ({
          socialAccountId: item.socialAccountId,
          platform: item.platform,
          content: item.content,
          mediaUrls: item.mediaUrls,
          hashtags: item.hashtags,
          status: "PENDING",
        })),
      },
    },
    include: {
      items: true,
    },
  })

  revalidatePath(`/dashboard/${brandId}/calendar`)
  return duplicatedPost
}

export async function getPostDetailAction(postId: string, brandId: string) {
  await requireAuth()

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      brandId,
    },
    include: {
      items: {
        include: {
          socialAccount: {
            select: {
              platform: true,
              username: true,
              displayName: true,
            },
          },
        },
      },
    },
  })

  if (!post) {
    throw new Error("Post no encontrado")
  }

  return {
    ...post,
    scheduledAt: post.scheduledAt?.toISOString() || null,
    publishedAt: post.publishedAt?.toISOString() || null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }
}
