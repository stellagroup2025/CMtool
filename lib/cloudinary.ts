// Lazy load cloudinary to avoid Next.js 15 worker.js error
let cloudinary: any = null

function getCloudinary() {
  if (!cloudinary) {
    const { v2 } = require("cloudinary")

    v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })

    cloudinary = v2
  }

  return cloudinary
}

/**
 * Upload image to Cloudinary
 */
export async function uploadToCloudinary(
  file: Buffer,
  brandId: string,
  filename: string
) {
  const cloudinary = getCloudinary()
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `brands/${brandId}`, // Organize by brand
          public_id: filename,
          resource_type: "image",
          overwrite: false,
          unique_filename: true,
          type: "upload", // Ensure it's a public upload
          access_mode: "public", // Make sure it's publicly accessible
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      .end(file)
  })
}

/**
 * Get all images for a brand
 */
export async function getMediaLibrary(brandId: string) {
  const cloudinary = getCloudinary()
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: `brands/${brandId}`,
      max_results: 500,
      resource_type: "image",
    })

    return {
      success: true,
      images: result.resources.map((resource: any) => ({
        id: resource.public_id,
        // Use Instagram-optimized URL for direct publishing
        url: cloudinary.url(resource.public_id, {
          secure: true,
          sign_url: false,
          type: "upload",
          resource_type: "image",
          format: "jpg",
          quality: "auto:good",
        }),
        thumbnail: cloudinary.url(resource.public_id, {
          width: 400,
          height: 400,
          crop: "fill",
          secure: true,
          format: "jpg",
        }),
        width: resource.width,
        height: resource.height,
        format: resource.format,
        createdAt: resource.created_at,
        bytes: resource.bytes,
      })),
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      images: [],
    }
  }
}

/**
 * Get Instagram-optimized URL for an image
 * Instagram requires specific format and public access
 */
export function getInstagramOptimizedUrl(publicId: string): string {
  const cloudinary = getCloudinary()
  return cloudinary.url(publicId, {
    secure: true,
    sign_url: false,
    type: "upload",
    resource_type: "image",
    format: "jpg", // Instagram prefers JPG
    quality: "auto:good",
    fetch_format: "auto",
  })
}

/**
 * Delete image from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string) {
  const cloudinary = getCloudinary()
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return {
      success: result.result === "ok",
      message: result.result,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}
