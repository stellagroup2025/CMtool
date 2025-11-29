/**
 * Test script to verify carousel image generation
 */

const { createCanvas, loadImage } = require("canvas")
const fs = require("fs")
const path = require("path")

async function testGradientGeneration() {
  console.log("🎨 Testing gradient slide generation...")

  try {
    const canvas = createCanvas(1080, 1080)
    const ctx = canvas.getContext("2d")

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080)
    gradient.addColorStop(0, "#8b5cf6")
    gradient.addColorStop(0.5, "#6366f1")
    gradient.addColorStop(1, "#4f46e5")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1080, 1080)

    // Add text
    ctx.font = "bold 56px Arial, sans-serif"
    ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "center"
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
    ctx.shadowBlur = 10
    ctx.fillText("Test Slide", 540, 540)

    // Save to file
    const buffer = canvas.toBuffer("image/png")
    const testPath = path.join(__dirname, "test-gradient-slide.png")
    fs.writeFileSync(testPath, buffer)

    console.log("✅ Gradient image generated successfully")
    console.log("📁 Saved to:", testPath)
    console.log("📦 Buffer size:", buffer.length, "bytes")

    return true
  } catch (error) {
    console.error("❌ Failed to generate gradient:", error)
    return false
  }
}

async function main() {
  console.log("Starting carousel image generation test...\n")

  const gradientTest = await testGradientGeneration()

  console.log("\n" + "=".repeat(50))
  console.log("Test Results:")
  console.log("Gradient Generation:", gradientTest ? "✅ PASS" : "❌ FAIL")
  console.log("=".repeat(50))
}

main().catch(console.error)
