import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create test user
  const passwordHash = await bcrypt.hash("password123", 10)

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      password: passwordHash,
    },
  })

  console.log("✅ Created user:", user.email)

  // Create test brands
  const acmeBrand = await prisma.brand.upsert({
    where: { slug: "acme" },
    update: {},
    create: {
      name: "Acme",
      slug: "acme",
      logo: "/generic-company-logo.png",
    },
  })

  const bloomBrand = await prisma.brand.upsert({
    where: { slug: "bloom" },
    update: {},
    create: {
      name: "Bloom",
      slug: "bloom",
      logo: "/bloom-logo.jpg",
    },
  })

  const novaBrand = await prisma.brand.upsert({
    where: { slug: "nova" },
    update: {},
    create: {
      name: "Nova",
      slug: "nova",
      logo: "/nova-logo.png",
    },
  })

  console.log("✅ Created brands:", acmeBrand.name, bloomBrand.name, novaBrand.name)

  // Create memberships
  await prisma.membership.upsert({
    where: {
      userId_brandId: {
        userId: user.id,
        brandId: acmeBrand.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      brandId: acmeBrand.id,
      role: "OWNER",
    },
  })

  await prisma.membership.upsert({
    where: {
      userId_brandId: {
        userId: user.id,
        brandId: bloomBrand.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      brandId: bloomBrand.id,
      role: "OWNER",
    },
  })

  await prisma.membership.upsert({
    where: {
      userId_brandId: {
        userId: user.id,
        brandId: novaBrand.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      brandId: novaBrand.id,
      role: "OWNER",
    },
  })

  console.log("✅ Created memberships")

  console.log("🎉 Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
