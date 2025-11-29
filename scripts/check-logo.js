const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function checkLogo() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "stellagroupapps@gmail.com" },
      select: {
        email: true,
        logoUrl: true,
        brandColors: true,
      },
    })

    if (!user) {
      console.log("❌ User not found")
      return
    }

    console.log("✅ User found:", user.email)
    console.log("\n📷 Logo URL:", user.logoUrl || "NO LOGO")
    console.log("🎨 Brand Colors:", user.brandColors || "NO COLORS")

    if (user.logoUrl) {
      console.log("\n✓ Logo está guardado")
      console.log("  URL completa:", user.logoUrl)
    } else {
      console.log("\n✗ No hay logo guardado")
    }

    // Check personal brand
    const personalBrand = await prisma.brand.findFirst({
      where: {
        isPersonal: true,
        memberships: {
          some: {
            user: {
              email: "stellagroupapps@gmail.com"
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        logo: true,
        isPersonal: true,
      }
    })

    if (personalBrand) {
      console.log("\n🏢 Personal Brand:")
      console.log("  ID:", personalBrand.id)
      console.log("  Name:", personalBrand.name)
      console.log("  Logo:", personalBrand.logo || "NO LOGO")
    } else {
      console.log("\n⚠️ No personal brand found")
    }

  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkLogo()
