const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkOnboardingData() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        industry: true,
        companyDescription: true,
        targetAudience: true,
        brandPersonality: true,
        onboardingCompleted: true,
      },
      take: 5
    })

    console.log('=== DATOS DE ONBOARDING ===\n')
    users.forEach((user, index) => {
      console.log(`Usuario ${index + 1}:`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Nombre: ${user.name || 'N/A'}`)
      console.log(`  Industria: ${user.industry || 'N/A'}`)
      console.log(`  Descripcion: ${user.companyDescription ? user.companyDescription.substring(0, 50) + '...' : 'N/A'}`)
      console.log(`  Audiencia: ${user.targetAudience ? user.targetAudience.substring(0, 50) + '...' : 'N/A'}`)
      console.log(`  Personalidad: ${user.brandPersonality ? JSON.stringify(user.brandPersonality) : 'N/A'}`)
      console.log(`  Onboarding Completado: ${user.onboardingCompleted ? 'SI' : 'NO'}`)
      console.log('')
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOnboardingData()
