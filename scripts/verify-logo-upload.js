const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function verifyLogo() {
  try {
    // Get all users to see which one has logo
    const users = await prisma.user.findMany({
      select: {
        email: true,
        logoUrl: true,
      },
    })

    console.log("📋 All users:")
    users.forEach((user) => {
      console.log(`  ${user.email}: ${user.logoUrl || "NO LOGO"}`)
    })

    // Check personal brands
    const brands = await prisma.brand.findMany({
      where: { isPersonal: true },
      select: {
        id: true,
        name: true,
        logo: true,
      },
    })

    console.log("\n🏢 Personal brands:")
    brands.forEach((brand) => {
      console.log(`  ${brand.name}: ${brand.logo || "NO LOGO"}`)
    })
  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    await prisma.$disconnect()
  }
}

verifyLogo()
