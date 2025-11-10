import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { nanoid } from "nanoid"
import { env } from "./env"
import { createLogger } from "./logger"

const logger = createLogger("s3")

// Check if S3 is configured
function isS3Configured(): boolean {
  return !!(env.S3_REGION && env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY)
}

// Lazy initialization of S3 client
let s3ClientInstance: S3Client | null = null

function getS3Client(): S3Client {
  if (!isS3Configured()) {
    throw new Error(
      "S3 is not configured. Please set S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY environment variables."
    )
  }

  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: env.S3_REGION!,
      endpoint: env.S3_ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID!,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
      },
    })
  }

  return s3ClientInstance
}

export interface PresignedUrlResult {
  url: string
  key: string
  bucket: string
}

export async function getPresignedPutUrl(
  filename: string,
  contentType: string,
  folder = "uploads"
): Promise<PresignedUrlResult> {
  const ext = filename.split(".").pop() || ""
  const key = `${folder}/${nanoid()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  })

  try {
    const s3Client = getS3Client()
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }) // 1 hour

    logger.info({ key, contentType }, "Generated presigned PUT URL")

    return {
      url,
      key,
      bucket: env.S3_BUCKET!,
    }
  } catch (error) {
    logger.error({ error, filename }, "Failed to generate presigned URL")
    throw new Error("Failed to generate upload URL")
  }
}

export function getPublicUrl(key: string): string {
  if (!isS3Configured()) {
    throw new Error("S3 is not configured")
  }

  if (env.S3_ENDPOINT) {
    return `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${key}`
  }
  return `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${key}`
}

// Export the getter function and configuration checker
export { getS3Client as s3Client, isS3Configured }
