const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function testTemplateRender() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "stellagroupapps@gmail.com" },
      select: { templates: true },
    })

    if (!user || !user.templates || user.templates.length === 0) {
      console.log("❌ No templates found")
      return
    }

    const template = user.templates[0]
    console.log("📄 Testing template:", template.name)
    console.log("\n🔸 Original HTML:")
    console.log(template.html)

    // Simulate the replacement that happens in the render endpoint
    const variables = {
      TITLE: "Test Title Here",
      CONTENT: "This is test content that should appear in the template",
      CTA: "Learn More →",
      LABEL: "New",
      TAG1: "Tip",
      TAG2: "Info",
    }

    let populatedHtml = template.html

    // Default variables
    const defaultVariables = {
      TITLE: "",
      CONTENT: "",
      CTA: "",
      LABEL: "",
      TAG1: "",
      TAG2: "",
      TAG3: "",
      CATEGORY: "",
      BIG_NUMBER: "",
      BIG_LABEL: "",
      POINT1: "",
      POINT2: "",
      POINT3: "",
      DATE: "",
      METRIC1: "",
      LABEL1: "",
      METRIC2: "",
      LABEL2: "",
      METRIC3: "",
      LABEL3: "",
    }

    const allVariables = { ...defaultVariables, ...variables }

    Object.keys(allVariables).forEach((key) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g")
      populatedHtml = populatedHtml.replace(regex, allVariables[key] || "")
    })

    // Additional cleanup
    populatedHtml = populatedHtml.replace(/\{\{[A-Z_0-9]+\}\}/g, "")

    console.log("\n🔹 After variable replacement:")
    console.log(populatedHtml)

    console.log("\n✅ Contains 'Test Title':", populatedHtml.includes("Test Title"))
    console.log("✅ Contains 'test content':", populatedHtml.includes("test content"))

  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testTemplateRender()
