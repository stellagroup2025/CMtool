const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('\n=== CHECKING CAROUSEL POSTS IN DATABASE ===\n')

  // Get all generated posts ordered by creation date
  const posts = await prisma.generatedPost.findMany({
    orderBy: { createdAt: 'desc' },
    take: 15,
  })

  console.log(`Total posts found: ${posts.length}\n`)

  posts.forEach((post, index) => {
    console.log(`${index + 1}. Post ID: ${post.id}`)
    console.log(`   Brand ID: ${post.brandId}`)
    console.log(`   Batch ID: ${post.batchId}`)
    console.log(`   Title: ${post.title}`)
    console.log(`   Type: ${post.contentType}`)
    console.log(`   Platform: ${post.platform}`)
    console.log(`   Created: ${post.createdAt}`)
    console.log(`   Has Image: ${post.imageUrl ? 'YES' : 'NO'}`)
    console.log(`   Published: ${post.isPublished ? 'YES' : 'NO'}`)
    if (post.metadata) {
      console.log(`   Metadata keys: ${Object.keys(post.metadata).join(', ')}`)
      if (post.metadata.slides) {
        console.log(`   Slides count: ${post.metadata.slides.length}`)
      }
    }
    console.log('')
  })

  // Check for carousel-specific posts
  const carouselPosts = posts.filter(p =>
    p.contentType === 'CAROUSEL' ||
    p.title.toLowerCase().includes('carrusel') ||
    (p.metadata && p.metadata.structure)
  )

  console.log(`\n=== CAROUSEL POSTS ===`)
  console.log(`Found ${carouselPosts.length} carousel posts\n`)

  carouselPosts.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title}`)
    console.log(`   Created: ${post.createdAt}`)
    console.log(`   Type: ${post.contentType}`)
    if (post.metadata && post.metadata.structure) {
      console.log(`   Structure: ${post.metadata.structure}`)
    }
    if (post.metadata && post.metadata.slides) {
      console.log(`   Slides: ${post.metadata.slides.length}`)
    }
    console.log('')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
