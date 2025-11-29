const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const KEY_LENGTH = 32

// Usar la misma clave del .env.local
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

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const salt = crypto.randomBytes(SALT_LENGTH)
  const key = deriveKey(salt)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  const result = Buffer.concat([salt, iv, tag, encrypted])
  return result.toString("base64")
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
    // Test 1: Encrypt and decrypt directly
    console.log("\n=== Test 1: Direct encryption/decryption ===")
    const testAppId = "1234567890123456"
    const testAppSecret = "testsecret123456"

    const encryptedAppId = encrypt(testAppId)
    const encryptedAppSecret = encrypt(testAppSecret)

    console.log("✓ Encrypted App ID:", encryptedAppId.substring(0, 50) + "...")
    console.log("✓ Encrypted App Secret:", encryptedAppSecret.substring(0, 50) + "...")

    const decryptedAppId = decrypt(encryptedAppId)
    const decryptedAppSecret = decrypt(encryptedAppSecret)

    console.log("✓ Decrypted App ID:", decryptedAppId)
    console.log("✓ Decrypted App Secret:", decryptedAppSecret)
    console.log("✓ Direct encryption/decryption works!")

    // Test 2: Save to database and read back
    console.log("\n=== Test 2: Database round-trip ===")

    // Find personal brand
    const personalBrand = await prisma.brand.findFirst({
      where: { isPersonal: true }
    })

    if (!personalBrand) {
      console.error("✗ No personal brand found")
      return
    }

    console.log("✓ Found personal brand:", personalBrand.id)

    // Save credentials
    const saved = await prisma.oAuthCredentials.upsert({
      where: {
        brandId_platform: {
          brandId: personalBrand.id,
          platform: "INSTAGRAM",
        },
      },
      update: {
        clientId: encryptedAppId,
        clientSecret: encryptedAppSecret,
        isActive: true,
      },
      create: {
        brandId: personalBrand.id,
        platform: "INSTAGRAM",
        clientId: encryptedAppId,
        clientSecret: encryptedAppSecret,
        isActive: true,
      },
    })

    console.log("✓ Saved to database")
    console.log("  - clientId length:", saved.clientId.length)
    console.log("  - clientSecret length:", saved.clientSecret.length)

    // Read back from database
    const retrieved = await prisma.oAuthCredentials.findUnique({
      where: {
        brandId_platform: {
          brandId: personalBrand.id,
          platform: "INSTAGRAM",
        },
      },
    })

    if (!retrieved) {
      console.error("✗ Could not retrieve from database")
      return
    }

    console.log("✓ Retrieved from database")
    console.log("  - clientId length:", retrieved.clientId.length)
    console.log("  - clientSecret length:", retrieved.clientSecret.length)
    console.log("  - clientId matches:", saved.clientId === retrieved.clientId)
    console.log("  - clientSecret matches:", saved.clientSecret === retrieved.clientSecret)

    // Try to decrypt what we retrieved
    console.log("\n=== Test 3: Decrypt from database ===")
    try {
      const decryptedDbAppId = decrypt(retrieved.clientId)
      const decryptedDbAppSecret = decrypt(retrieved.clientSecret)

      console.log("✓ Decrypted App ID from DB:", decryptedDbAppId)
      console.log("✓ Decrypted App Secret from DB:", decryptedDbAppSecret)
      console.log("✓ Values match original:",
        decryptedDbAppId === testAppId && decryptedDbAppSecret === testAppSecret)

      console.log("\n🎉 ALL TESTS PASSED!")
    } catch (error) {
      console.error("✗ Error decrypting from database:", error.message)
      console.log("\n=== Debugging info ===")
      console.log("Original encrypted App ID:", encryptedAppId)
      console.log("Retrieved encrypted App ID:", retrieved.clientId)
      console.log("Are they equal?", encryptedAppId === retrieved.clientId)
    }

  } catch (error) {
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
