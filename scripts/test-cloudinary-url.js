// Script to test Cloudinary URL accessibility
// Run with: node scripts/test-cloudinary-url.js <image-url>

const https = require('https')
const http = require('http')

const testUrl = process.argv[2]

if (!testUrl) {
  console.log('❌ Usage: node scripts/test-cloudinary-url.js <image-url>')
  console.log('Example: node scripts/test-cloudinary-url.js https://res.cloudinary.com/...')
  process.exit(1)
}

console.log('\n🔍 Testing Cloudinary URL accessibility...\n')
console.log('URL:', testUrl)

const protocol = testUrl.startsWith('https') ? https : http

protocol.get(testUrl, (res) => {
  console.log('\n📊 Response:')
  console.log('  Status:', res.statusCode)
  console.log('  Status Message:', res.statusMessage)
  console.log('  Content-Type:', res.headers['content-type'])
  console.log('  Content-Length:', res.headers['content-length'])

  if (res.statusCode === 200) {
    console.log('\n✅ URL is publicly accessible!')
    console.log('Instagram should be able to fetch this image.')
  } else {
    console.log('\n❌ URL returned an error!')
    console.log('Instagram will NOT be able to fetch this image.')
  }

  console.log('\n💡 Headers:')
  Object.keys(res.headers).forEach(key => {
    console.log(`  ${key}: ${res.headers[key]}`)
  })

}).on('error', (error) => {
  console.log('\n❌ Error fetching URL:', error.message)
  console.log('Instagram will NOT be able to fetch this image.')
})
