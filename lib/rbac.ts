import { Role } from "@prisma/client"
import prisma from "./prisma"

export type { Role }

// Role hierarchy - higher values have more permissions
const roleHierarchy: Record<Role, number> = {
  AGENT: 1,
  ANALYST: 2,
  MANAGER: 3,
  OWNER: 4,
}

export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export async function getUserBrandRole(userId: string, brandId: string): Promise<Role | null> {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_brandId: {
        userId,
        brandId,
      },
    },
    select: {
      role: true,
    },
  })

  return membership?.role ?? null
}

export async function assertBrandRole(
  userId: string,
  brandId: string,
  allowedRoles: Role[]
): Promise<Role> {
  const role = await getUserBrandRole(userId, brandId)

  if (!role) {
    throw new UnauthorizedError("You do not have access to this brand")
  }

  const hasPermission = allowedRoles.some((allowedRole) => hasMinimumRole(role, allowedRole))

  if (!hasPermission) {
    throw new ForbiddenError(`This action requires one of these roles: ${allowedRoles.join(", ")}`)
  }

  return role
}

export async function assertBrandMember(userId: string, brandId: string): Promise<Role> {
  return assertBrandRole(userId, brandId, ["AGENT", "ANALYST", "MANAGER", "OWNER"])
}

export async function getUserBrands(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: {
      brand: {
        include: {
          _count: {
            select: {
              socialAccounts: true,
              posts: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return memberships.map((m) => ({
    ...m.brand,
    role: m.role,
  }))
}

// Custom errors
export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message)
    this.name = "ForbiddenError"
  }
}
