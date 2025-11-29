const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const KEY_LENGTH = 32

const ENCRYPTION_KEY = "Ecg6ORhQRUvaBjI1wSX7qNDFDLoWGw7RV7ui0M0GF2M="

function deriveKey(salt) {
  return crypto.pbkdf2Sync(
    Buffer.from(ENCRYPTION_KEY, "base64"),
    salt,
    100000,
    KEY_LENGTH,
    "sha512"
  )
}

function decrypt(encryptedData) {
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

async function main() {
  try {
    const credentials = await prisma.oAuthCredentials.findMany({
      where: { platform: 'INSTAGRAM' }
    })

    console.log(`\nFound ${credentials.length} Instagram credential record(s)\n`)

    for (const cred of credentials) {
      console.log("=".repeat(60))
      console.log("Credential ID:", cred.id)
      console.log("Brand ID:", cred.brandId)
      console.log("Platform:", cred.platform)
      console.log("Active:", cred.isActive)
      console.log("Created:", cred.createdAt)
      console.log("\nEncrypted clientId length:", cred.clientId.length)
      console.log("Encrypted clientSecret length:", cred.clientSecret.length)
      console.log("\nEncrypted clientId (first 50):", cred.clientId.substring(0, 50))
      console.log("Encrypted clientSecret (first 50):", cred.clientSecret.substring(0, 50))

      // Try to decrypt
      console.log("\nAttempting to decrypt...")
      try {
        const decryptedId = decrypt(cred.clientId)
        const decryptedSecret = decrypt(cred.clientSecret)
        console.log("✓ Decrypted clientId:", decryptedId)
        console.log("✓ Decrypted clientSecret:", decryptedSecret)
      } catch (error) {
        console.error("✗ Decryption failed:", error.message)

        // Try to analyze the structure
        try {
          const buffer = Buffer.from(cred.clientId, "base64")
          console.log("\nBuffer analysis:")
          console.log("  - Total buffer length:", buffer.length)
          console.log("  - Expected minimum:", SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 1)
          console.log("  - Salt (first 10 bytes):", buffer.subarray(0, 10).toString('hex'))
        } catch (e) {
          console.error("  - Could not parse as base64:", e.message)
        }
      }
      console.log("=".repeat(60) + "\n")
    }

  } catch (error) {
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
