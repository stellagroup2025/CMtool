"use server";

import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// ============================================
// GET ALL PROJECTS
// ============================================

export async function getProjectsAction(brandId?: string, clientId?: string) {
  await requireAuth();

  const where: any = {};
  if (brandId) where.brandId = brandId;
  if (clientId) where.clientId = clientId;

  const projects = await prisma.project.findMany({
    where,
    include: {
      client: true,
      brand: true,
      contract: true,
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { success: true, projects };
}

// ============================================
// GET PROJECT DETAIL
// ============================================

export async function getProjectDetailAction(projectId: string) {
  await requireAuth();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: true,
      brand: true,
      contract: true,
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      tasks: {
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!project) {
    return { success: false, error: "Proyecto no encontrado" };
  }

  return { success: true, project };
}

// ============================================
// CREATE PROJECT
// ============================================

export async function createProjectAction(data: {
  name: string;
  description?: string;
  clientId?: string;
  contractId?: string;
  brandId?: string;
  startDate: Date;
  endDate?: Date;
  budget?: number;
  budgetHours?: number;
  status?: ProjectStatus;
}) {
  const user = await requireAuth();

  const project = await prisma.project.create({
    data: {
      ...data,
      createdById: user.id,
    },
    include: {
      client: true,
      brand: true,
    },
  });

  if (data.brandId) {
    revalidatePath("/dashboard/" + data.brandId + "/projects");
  }

  return { success: true, project };
}

// ============================================
// UPDATE PROJECT
// ============================================

export async function updateProjectAction(
  projectId: string,
  data: {
    name?: string;
    description?: string;
    status?: ProjectStatus;
    startDate?: Date;
    endDate?: Date;
    budget?: number;
    budgetHours?: number;
  }
) {
  await requireAuth();

  const project = await prisma.project.update({
    where: { id: projectId },
    data,
    include: {
      client: true,
      brand: true,
    },
  });

  if (project.brandId) {
    revalidatePath("/dashboard/" + project.brandId + "/projects");
  }

  return { success: true, project };
}

// ============================================
// DELETE PROJECT
// ============================================

export async function deleteProjectAction(projectId: string) {
  await requireAuth();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return { success: false, error: "Proyecto no encontrado" };
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  if (project.brandId) {
    revalidatePath("/dashboard/" + project.brandId + "/projects");
  }

  return { success: true, message: "Proyecto eliminado" };
}

// ============================================
// ADD PROJECT MEMBER
// ============================================

export async function addProjectMemberAction(
  projectId: string,
  userId: string,
  role?: string
) {
  await requireAuth();

  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return { success: true, member };
}

// ============================================
// REMOVE PROJECT MEMBER
// ============================================

export async function removeProjectMemberAction(memberId: string) {
  await requireAuth();

  await prisma.projectMember.delete({
    where: { id: memberId },
  });

  return { success: true, message: "Miembro eliminado" };
}

// ============================================
// GET PROJECT STATS
// ============================================

export async function getProjectStatsAction(projectId: string) {
  await requireAuth();

  const [totalTasks, todoTasks, inProgressTasks, doneTasks] = await Promise.all([
    prisma.task.count({
      where: { projectId },
    }),
    prisma.task.count({
      where: {
        projectId,
        status: "TODO",
      },
    }),
    prisma.task.count({
      where: {
        projectId,
        status: "IN_PROGRESS",
      },
    }),
    prisma.task.count({
      where: {
        projectId,
        status: "DONE",
      },
    }),
  ]);

  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return {
    success: true,
    stats: {
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      progress,
    },
  };
}
