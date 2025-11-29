const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "stellagroupapps@gmail.com" },
    select: {
      email: true,
      templates: true,
    },
  })

  if (!user) {
    console.log("User not found")
    return
  }

  console.log("User:", user.email)
  console.log("Number of templates:", user.templates?.length || 0)
  console.log("\nTemplates:")

  if (user.templates && Array.isArray(user.templates)) {
    user.templates.forEach((template, index) => {
      console.log(`\n${index + 1}. ${template.name}`)
      console.log(`   ID: ${template.id}`)
      console.log(`   Category: ${template.category}`)
      console.log(`   Variables: ${template.variables?.join(", ")}`)
      console.log(`   HTML length: ${template.html?.length || 0} characters`)
    })
  } else {
    console.log("No templates found or templates is not an array")
    console.log("Templates value:", JSON.stringify(user.templates, null, 2))
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
