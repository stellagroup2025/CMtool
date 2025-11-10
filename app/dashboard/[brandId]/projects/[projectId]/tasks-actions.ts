"use server";

import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { revalidatePath } from "next/cache";

// ============================================
// GET TASKS
// ============================================

export async function getTasksAction(projectId?: string, brandId?: string) {
  await requireAuth();

  const where: any = {};
  if (projectId) where.projectId = projectId;
  if (brandId) where.brandId = brandId;

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          checkItems: true,
          comments: true,
          attachments: true,
        },
      },
    },
    orderBy: {
      position: "asc",
    },
  });

  return { success: true, tasks };
}

// ============================================
// GET TASK DETAIL
// ============================================

export async function getTaskDetailAction(taskId: string) {
  await requireAuth();

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
      brand: true,
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      checkItems: {
        orderBy: {
          position: "asc",
        },
      },
      comments: {
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
        orderBy: {
          createdAt: "asc",
        },
      },
      attachments: true,
    },
  });

  if (!task) {
    return { success: false, error: "Tarea no encontrada" };
  }

  return { success: true, task };
}

// ============================================
// CREATE TASK
// ============================================

export async function createTaskAction(data: {
  title: string;
  description?: string;
  projectId?: string;
  brandId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: Date;
  tags?: string[];
}) {
  const user = await requireAuth();

  // Get max position for new task
  const maxPosition = await prisma.task.findFirst({
    where: {
      projectId: data.projectId,
      brandId: data.brandId,
      status: data.status || "TODO",
    },
    orderBy: {
      position: "desc",
    },
    select: {
      position: true,
    },
  });

  const task = await prisma.task.create({
    data: {
      ...data,
      createdById: user.id,
      position: (maxPosition?.position || 0) + 1,
    },
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
  });

  if (data.projectId) {
    revalidatePath("/dashboard/" + task.brandId + "/projects/" + data.projectId);
  }

  return { success: true, task };
}

// ============================================
// UPDATE TASK
// ============================================

export async function updateTaskAction(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedTo?: string;
    dueDate?: Date;
    tags?: string[];
  }
) {
  await requireAuth();

  const task = await prisma.task.update({
    where: { id: taskId },
    data,
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
  });

  if (task.projectId) {
    revalidatePath("/dashboard/" + task.brandId + "/projects/" + task.projectId);
  }

  return { success: true, task };
}

// ============================================
// UPDATE TASK POSITION (Drag & Drop)
// ============================================

export async function updateTaskPositionAction(
  taskId: string,
  newStatus: TaskStatus,
  newPosition: number
) {
  await requireAuth();

  // Get task
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    return { success: false, error: "Tarea no encontrada" };
  }

  // Update other tasks positions
  if (task.status === newStatus) {
    // Same column, reorder
    if (newPosition < task.position) {
      await prisma.task.updateMany({
        where: {
          projectId: task.projectId,
          status: newStatus,
          position: {
            gte: newPosition,
            lt: task.position,
          },
        },
        data: {
          position: {
            increment: 1,
          },
        },
      });
    } else {
      await prisma.task.updateMany({
        where: {
          projectId: task.projectId,
          status: newStatus,
          position: {
            gt: task.position,
            lte: newPosition,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });
    }
  } else {
    // Different column
    // Decrease positions in old column
    await prisma.task.updateMany({
      where: {
        projectId: task.projectId,
        status: task.status,
        position: {
          gt: task.position,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    });

    // Increase positions in new column
    await prisma.task.updateMany({
      where: {
        projectId: task.projectId,
        status: newStatus,
        position: {
          gte: newPosition,
        },
      },
      data: {
        position: {
          increment: 1,
        },
      },
    });
  }

  // Update task
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: newStatus,
      position: newPosition,
    },
  });

  if (updatedTask.projectId) {
    revalidatePath("/dashboard/" + updatedTask.brandId + "/projects/" + updatedTask.projectId);
  }

  return { success: true, task: updatedTask };
}

// ============================================
// DELETE TASK
// ============================================

export async function deleteTaskAction(taskId: string) {
  await requireAuth();

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    return { success: false, error: "Tarea no encontrada" };
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  if (task.projectId) {
    revalidatePath("/dashboard/" + task.brandId + "/projects/" + task.projectId);
  }

  return { success: true, message: "Tarea eliminada" };
}

// ============================================
// ADD CHECK ITEM
// ============================================

export async function addCheckItemAction(taskId: string, title: string) {
  await requireAuth();

  const maxPosition = await prisma.taskCheckItem.findFirst({
    where: { taskId },
    orderBy: {
      position: "desc",
    },
    select: {
      position: true,
    },
  });

  const checkItem = await prisma.taskCheckItem.create({
    data: {
      taskId,
      title,
      position: (maxPosition?.position || 0) + 1,
    },
  });

  return { success: true, checkItem };
}

// ============================================
// TOGGLE CHECK ITEM
// ============================================

export async function toggleCheckItemAction(checkItemId: string) {
  await requireAuth();

  const checkItem = await prisma.taskCheckItem.findUnique({
    where: { id: checkItemId },
  });

  if (!checkItem) {
    return { success: false, error: "Item no encontrado" };
  }

  const updated = await prisma.taskCheckItem.update({
    where: { id: checkItemId },
    data: {
      completed: !checkItem.completed,
    },
  });

  return { success: true, checkItem: updated };
}

// ============================================
// DELETE CHECK ITEM
// ============================================

export async function deleteCheckItemAction(checkItemId: string) {
  await requireAuth();

  await prisma.taskCheckItem.delete({
    where: { id: checkItemId },
  });

  return { success: true, message: "Item eliminado" };
}

// ============================================
// ADD COMMENT
// ============================================

export async function addCommentAction(taskId: string, content: string) {
  const user = await requireAuth();

  const comment = await prisma.taskComment.create({
    data: {
      taskId,
      userId: user.id,
      content,
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

  return { success: true, comment };
}

// ============================================
// DELETE COMMENT
// ============================================

export async function deleteCommentAction(commentId: string) {
  await requireAuth();

  await prisma.taskComment.delete({
    where: { id: commentId },
  });

  return { success: true, message: "Comentario eliminado" };
}
