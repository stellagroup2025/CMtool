const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const result = await prisma.oAuthCredentials.deleteMany({
      where: {
        platform: 'INSTAGRAM'
      }
    })

    console.log(`✓ Deleted ${result.count} Instagram credential records`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
