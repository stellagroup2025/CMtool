import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { nanoid } from "nanoid"
import { env } from "./env"
import { createLogger } from "./logger"

const logger = createLogger("s3")

const s3Client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
})

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
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }) // 1 hour

    logger.info({ key, contentType }, "Generated presigned PUT URL")

    return {
      url,
      key,
      bucket: env.S3_BUCKET,
    }
  } catch (error) {
    logger.error({ error, filename }, "Failed to generate presigned URL")
    throw new Error("Failed to generate upload URL")
  }
}

export function getPublicUrl(key: string): string {
  if (env.S3_ENDPOINT) {
    return `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${key}`
  }
  return `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${key}`
}

export { s3Client }
