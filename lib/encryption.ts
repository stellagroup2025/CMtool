import { env } from "./env"
import * as crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const KEY_LENGTH = 32

/**
 * Derives a key from the encryption key using PBKDF2
 */
function deriveKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    Buffer.from(env.ENCRYPTION_KEY, "base64"),
    salt,
    100000,
    KEY_LENGTH,
    "sha512"
  )
}

/**
 * Encrypts a string value
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const salt = crypto.randomBytes(SALT_LENGTH)
  const key = deriveKey(salt)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  // Combine salt + iv + tag + encrypted data
  const result = Buffer.concat([salt, iv, tag, encrypted])
  return result.toString("base64")
}

/**
 * Decrypts an encrypted string value
 */
export function decrypt(encryptedData: string): string {
  const buffer = Buffer.from(encryptedData, "base64")

  const salt = buffer.subarray(0, SALT_LENGTH)
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const tag = buffer.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + TAG_LENGTH
  )
  const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH)

  const key = deriveKey(salt)

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString("utf8")
}
