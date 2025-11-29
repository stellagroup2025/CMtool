const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSavedPosts() {
  try {
    console.log('🔍 Checking for saved generated posts...\n')

    const posts = await prisma.generatedPost.findMany({
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            isPersonal: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${posts.length} generated posts in database:\n`)

    if (posts.length === 0) {
      console.log('❌ No posts found in database!')
      console.log('\nPossible reasons:')
      console.log('1. No posts have been generated yet')
      console.log('2. Posts were not saved properly')
      console.log('3. There was an error during the save process')
    } else {
      posts.forEach((post, index) => {
        console.log(`📝 Post ${index + 1}:`)
        console.log(`   Brand: ${post.brand.name} (${post.brand.isPersonal ? 'Personal' : 'Agency'})`)
        console.log(`   Title: ${post.title}`)
        console.log(`   Platform: ${post.platform}`)
        console.log(`   Language: ${post.language}`)
        console.log(`   Has Image: ${post.imageUrl ? '✅' : '❌'}`)
        console.log(`   Published: ${post.isPublished ? '✅' : '❌'}`)
        console.log(`   Created: ${post.createdAt.toLocaleString()}`)
        console.log('')
      })
    }

    console.log('✅ Check complete!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSavedPosts()
