const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function checkTemplates() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "stellagroupapps@gmail.com" },
      select: { email: true, templates: true },
    })

    if (!user) {
      console.log("❌ User not found")
      return
    }

    console.log("✅ User found:", user.email)
    console.log("📊 Total templates:", user.templates?.length || 0)

    if (user.templates && user.templates.length > 0) {
      console.log("\n🔍 First template analysis:")
      const firstTemplate = user.templates[0]
      console.log("ID:", firstTemplate.id)
      console.log("Name:", firstTemplate.name)
      console.log("Category:", firstTemplate.category)
      console.log("Variables:", firstTemplate.variables)
      console.log("\n📄 HTML Preview (first 500 chars):")
      console.log(firstTemplate.html?.substring(0, 500))
      console.log("\n📏 Total HTML length:", firstTemplate.html?.length || 0)

      // Check if HTML has variables
      const hasTitle = firstTemplate.html?.includes("{{TITLE}}")
      const hasContent = firstTemplate.html?.includes("{{CONTENT}}")
      console.log("\n✓ Has {{TITLE}}:", hasTitle)
      console.log("✓ Has {{CONTENT}}:", hasContent)

      // Check for style tag
      const hasStyleTag = firstTemplate.html?.includes("<style>") || firstTemplate.html?.includes("style=")
      console.log("✓ Has styling:", hasStyleTag)
    }
  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkTemplates()
