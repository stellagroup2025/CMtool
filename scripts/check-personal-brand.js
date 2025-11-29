const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAndFixPersonalBrand() {
  try {
    console.log('🔍 Checking for users and their personal brands...\n')

    // Get all users
    const users = await prisma.user.findMany({
      include: {
        memberships: {
          include: {
            brand: true
          }
        }
      }
    })

    console.log(`Found ${users.length} users:\n`)

    for (const user of users) {
      console.log(`👤 User: ${user.email}`)
      console.log(`   ID: ${user.id}`)

      const personalBrand = user.memberships.find(m => m.brand.isPersonal)

      if (personalBrand) {
        console.log(`   ✅ Has personal brand: "${personalBrand.brand.name}" (ID: ${personalBrand.brand.id})`)
      } else {
        console.log(`   ❌ NO PERSONAL BRAND FOUND`)
        console.log(`   📝 Creating personal brand...`)

        // Create personal brand for this user
        const brandName = `Personal - ${user.name || user.email.split('@')[0]}`
        const brandSlug = `personal-${user.id.toLowerCase()}`

        const newBrand = await prisma.brand.create({
          data: {
            name: brandName,
            slug: brandSlug,
            isPersonal: true,
            memberships: {
              create: {
                userId: user.id,
                role: 'OWNER'
              }
            }
          }
        })

        console.log(`   ✅ Created personal brand: "${newBrand.name}" (ID: ${newBrand.id})`)
      }
      console.log('')
    }

    console.log('✅ Check complete!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndFixPersonalBrand()
