const crypto = require('crypto')

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

// Test
const testValue = "1527682271593707"
console.log("Texto original:", testValue)

const encrypted = encrypt(testValue)
console.log("Encriptado:", encrypted.substring(0, 50) + "...")

try {
  const decrypted = decrypt(encrypted)
  console.log("Desencriptado:", decrypted)
  console.log("✓ Encriptación funciona correctamente")
} catch (error) {
  console.error("✗ Error al desencriptar:", error.message)
}
