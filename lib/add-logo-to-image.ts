/**
 * Adds a logo overlay to an image (works with data URLs or remote URLs)
 * @param imageUrl - The base image URL (can be data URL or HTTP URL)
 * @param logoUrl - The logo URL to overlay
 * @param position - Corner position for the logo ("top-right" | "top-left" | "bottom-right" | "bottom-left")
 * @param size - Logo size in pixels (default: 100)
 * @param padding - Padding from edges in pixels (default: 40)
 * @returns Promise<string> - Data URL of the combined image
 */
export async function addLogoToImage(
  imageUrl: string,
  logoUrl: string,
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left" = "top-right",
  size: number = 100,
  padding: number = 40
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create canvas
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Failed to get canvas context"))
      return
    }

    // Load base image
    const baseImg = new Image()
    baseImg.crossOrigin = "anonymous" // For remote URLs

    baseImg.onload = () => {
      // Set canvas size to match image
      canvas.width = baseImg.width
      canvas.height = baseImg.height

      // Draw base image
      ctx.drawImage(baseImg, 0, 0)

      // Load logo
      const logoImg = new Image()
      logoImg.crossOrigin = "anonymous"

      logoImg.onload = () => {
        // Calculate logo dimensions (maintain aspect ratio)
        const logoAspect = logoImg.width / logoImg.height
        let logoWidth = size
        let logoHeight = size / logoAspect

        // If height exceeds size, adjust
        if (logoHeight > size) {
          logoHeight = size
          logoWidth = size * logoAspect
        }

        // Calculate position
        let x: number, y: number

        switch (position) {
          case "top-left":
            x = padding
            y = padding
            break
          case "top-right":
            x = canvas.width - logoWidth - padding
            y = padding
            break
          case "bottom-left":
            x = padding
            y = canvas.height - logoHeight - padding
            break
          case "bottom-right":
          default:
            x = canvas.width - logoWidth - padding
            y = canvas.height - logoHeight - padding
            break
        }

        // Draw logo
        ctx.drawImage(logoImg, x, y, logoWidth, logoHeight)

        // Convert to data URL
        const result = canvas.toDataURL("image/png")
        resolve(result)
      }

      logoImg.onerror = () => {
        // If logo fails to load, return original image
        console.warn("Logo failed to load, returning original image")
        resolve(canvas.toDataURL("image/png"))
      }

      logoImg.src = logoUrl
    }

    baseImg.onerror = () => {
      reject(new Error("Failed to load base image"))
    }

    baseImg.src = imageUrl
  })
}
