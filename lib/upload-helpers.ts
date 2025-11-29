import { v2 as cloudinary } from "cloudinary"
import { env } from "@/lib/env"
import { createLogger } from "@/lib/logger"

const logger = createLogger("lib:upload-helpers")

// Configure Cloudinary
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  })
}

/**
 * Upload a data URL (base64 image) to Cloudinary and return public HTTPS URL
 */
export async function uploadDataUrlToS3(
  dataUrl: string,
  fileName: string = `template-${Date.now()}.png`
): Promise<string> {
  try {
    // Check if Cloudinary is configured
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary not configured. Please set CLOUDINARY_* environment variables.")
    }

    // Upload to Cloudinary using data URL directly
    const uploadResult = await cloudinary.uploader.upload(dataUrl, {
      folder: "generated/carousel-templates",
      public_id: fileName.replace(/\.(png|jpg|jpeg)$/i, ""),
      resource_type: "image",
      overwrite: true,
    })

    logger.info({
      public_id: uploadResult.public_id,
      size: uploadResult.bytes,
      url: uploadResult.secure_url
    }, "Uploaded data URL to Cloudinary")

    return uploadResult.secure_url
  } catch (error: any) {
    logger.error({ error }, "Failed to upload data URL to Cloudinary")
    throw new Error(`Cloudinary upload failed: ${error.message}`)
  }
}

/**
 * Upload multiple data URLs to Cloudinary in parallel
 */
export async function uploadDataUrlsToS3(
  dataUrls: string[],
  fileNamePrefix: string = "template"
): Promise<string[]> {
  try {
    const uploadPromises = dataUrls.map((dataUrl, index) => {
      const fileName = `${fileNamePrefix}-${index + 1}-${Date.now()}`
      return uploadDataUrlToS3(dataUrl, fileName)
    })

    const urls = await Promise.all(uploadPromises)

    logger.info({ count: urls.length }, "Uploaded multiple data URLs to Cloudinary")

    return urls
  } catch (error: any) {
    logger.error({ error }, "Failed to upload multiple data URLs to Cloudinary")
    throw error
  }
}
