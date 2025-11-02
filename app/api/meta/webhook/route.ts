/**
 * Meta Webhook Endpoint
 *
 * Este endpoint maneja:
 * 1. Verificación de webhook (GET) - Meta valida la URL
 * 2. Eventos de mensajes (POST) - Recibe mensajes de Instagram
 *
 * Documentación: https://developers.facebook.com/docs/messenger-platform/webhooks
 */

import { NextRequest, NextResponse } from "next/server"
import { createLogger } from "@/lib/logger"
import { createHmac } from "crypto"
import prisma from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"

const logger = createLogger("api:meta:webhook")

// Token de verificación (debe coincidir con el configurado en Meta)
const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "stella_verify"
const APP_SECRET = process.env.META_APP_SECRET || process.env.INSTAGRAM_APP_SECRET

/**
 * GET - Verificación del Webhook
 * Meta llama a este endpoint con hub.mode=subscribe y hub.challenge
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  logger.info({ mode, token, challenge }, "Webhook verification request")

  // Verificar que el token coincida
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    logger.info("Webhook verified successfully")

    // Responder con el challenge para confirmar la verificación
    return new NextResponse(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }

  logger.error({ mode, token }, "Webhook verification failed")
  return NextResponse.json(
    { error: "Verification failed" },
    { status: 403 }
  )
}

/**
 * POST - Procesar Eventos de Webhook
 * Meta envía eventos de mensajes aquí
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar la firma del webhook (seguridad)
    const signature = request.headers.get("x-hub-signature-256")
    const body = await request.text()

    if (APP_SECRET && signature) {
      const isValid = verifySignature(body, signature, APP_SECRET)
      if (!isValid) {
        logger.error("Invalid webhook signature")
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 403 }
        )
      }
    }

    // 2. Parsear el body
    const data = JSON.parse(body)

    logger.info({ object: data.object, entries: data.entry?.length }, "Webhook event received")

    // 3. Procesar cada entrada
    if (data.object === "instagram") {
      for (const entry of data.entry || []) {
        await processInstagramEntry(entry)
      }
    } else if (data.object === "page") {
      for (const entry of data.entry || []) {
        await processPageEntry(entry)
      }
    }

    // 4. Responder 200 OK inmediatamente
    // Meta espera respuesta rápida, el procesamiento se hace async
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error: any) {
    logger.error({ error: error.message }, "Error processing webhook")

    // Aún así responder 200 para no reintentos innecesarios
    return NextResponse.json({ success: true }, { status: 200 })
  }
}

/**
 * Verificar firma del webhook usando HMAC-SHA256
 */
function verifySignature(payload: string, signature: string, appSecret: string): boolean {
  const expectedSignature = "sha256=" + createHmac("sha256", appSecret)
    .update(payload)
    .digest("hex")

  return signature === expectedSignature
}

/**
 * Procesar eventos de Instagram
 */
async function processInstagramEntry(entry: any) {
  logger.info({ id: entry.id, time: entry.time }, "Processing Instagram entry")

  // Procesar mensajes
  for (const messaging of entry.messaging || []) {
    await processInstagramMessage(messaging)
  }

  // Procesar cambios (opcional)
  for (const change of entry.changes || []) {
    logger.info({ field: change.field, value: change.value }, "Instagram change event")
  }
}

/**
 * Procesar eventos de Página de Facebook
 */
async function processPageEntry(entry: any) {
  logger.info({ id: entry.id, time: entry.time }, "Processing Page entry")

  // Similar al de Instagram pero para Facebook Messenger
  for (const messaging of entry.messaging || []) {
    await processPageMessage(messaging)
  }
}

/**
 * Procesar mensaje de Instagram
 */
async function processInstagramMessage(messaging: any) {
  const senderId = messaging.sender?.id
  const recipientId = messaging.recipient?.id
  const message = messaging.message

  logger.info(
    {
      senderId,
      recipientId,
      hasMessage: !!message,
      messageId: message?.mid
    },
    "Instagram message event"
  )

  if (!message) {
    // Puede ser un evento diferente (entrega, lectura, etc.)
    if (messaging.delivery) {
      logger.info({ delivery: messaging.delivery }, "Message delivery confirmation")
    }
    if (messaging.read) {
      logger.info({ read: messaging.read }, "Message read confirmation")
    }
    return
  }

  try {
    // Buscar la cuenta de Instagram conectada
    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        platform: "INSTAGRAM",
        platformAccountId: recipientId, // Este es nuestro IG_USER_ID
        isActive: true,
      },
      include: {
        brand: true,
      },
    })

    if (!socialAccount) {
      logger.warn({ recipientId }, "No social account found for this recipient")
      return
    }

    logger.info(
      {
        brandId: socialAccount.brandId,
        accountId: socialAccount.id,
        igUserId: recipientId
      },
      "Found social account"
    )

    // Buscar o crear conversación
    const conversation = await prisma.conversation.upsert({
      where: {
        platform_externalId: {
          platform: "INSTAGRAM",
          externalId: senderId, // ID del usuario que nos envió el mensaje
        },
      },
      create: {
        brandId: socialAccount.brandId,
        socialAccountId: socialAccount.id,
        platform: "INSTAGRAM",
        type: "DM",
        externalId: senderId,
        fromUserId: senderId,
        fromUsername: senderId, // Podemos obtener el username después
        status: "NEW",
        lastMessageAt: new Date(),
      },
      update: {
        lastMessageAt: new Date(),
        status: "IN_PROGRESS", // Cambiar de NEW a IN_PROGRESS al recibir mensaje
      },
    })

    logger.info({ conversationId: conversation.id }, "Conversation upserted")

    // Guardar mensaje
    const savedMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        platform: "INSTAGRAM",
        externalId: message.mid,
        from: "USER",
        content: message.text || message.attachments?.[0]?.type || "[Media]",
        mediaUrls: message.attachments?.map((a: any) => a.payload?.url).filter(Boolean) || [],
        metadata: {
          originalMessage: message,
        },
        createdAt: new Date(messaging.timestamp),
      },
    })

    logger.info(
      {
        messageId: savedMessage.id,
        conversationId: conversation.id,
        from: senderId
      },
      "Message saved successfully"
    )

    // TODO: Aquí puedes agregar lógica adicional:
    // - Notificaciones en tiempo real (Pusher/Socket.io)
    // - Auto-respuestas
    // - Análisis de sentimiento
    // - Asignación automática a agentes

  } catch (error: any) {
    logger.error({ error: error.message, senderId }, "Error saving Instagram message")
  }
}

/**
 * Procesar mensaje de Página de Facebook (Messenger)
 */
async function processPageMessage(messaging: any) {
  // Similar al de Instagram pero para Facebook Messenger
  logger.info({ messaging }, "Facebook Messenger message")

  // Implementar si necesitas soporte para Messenger de Facebook
  // Por ahora solo procesamos Instagram
}
