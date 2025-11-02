/**
 * Instagram Graph API Helper
 *
 * Este archivo contiene utilidades para trabajar con la Instagram Graph API.
 *
 * IMPORTANTE: Instagram requiere un Page Access Token (no un User Access Token)
 * para acceder a conversaciones y mensajes.
 *
 * Flujo:
 * 1. Usuario autoriza con USER_ACCESS_TOKEN + scopes
 * 2. Obtenemos las páginas de Facebook del usuario
 * 3. Cada página tiene su propio PAGE_ACCESS_TOKEN
 * 4. De la página obtenemos el instagram_business_account.id
 * 5. Usamos PAGE_ACCESS_TOKEN + IG_USER_ID para todas las llamadas
 */

import { createLogger } from "@/lib/logger"

const logger = createLogger("instagram-api")

export interface InstagramTokenInfo {
  isValid: boolean
  type: "user" | "page" | "unknown"
  scopes: string[]
  expiresAt?: Date
  appId?: string
  userId?: string
  error?: string
}

export interface InstagramPermission {
  permission: string
  status: "granted" | "declined" | "expired"
}

/**
 * Scopes requeridos para funcionalidad completa de Instagram
 */
export const REQUIRED_SCOPES = {
  // Básicos
  PAGES_SHOW_LIST: "pages_show_list",
  PAGES_READ_ENGAGEMENT: "pages_read_engagement",

  // Instagram
  INSTAGRAM_BASIC: "instagram_basic",
  INSTAGRAM_MANAGE_COMMENTS: "instagram_manage_comments",
  INSTAGRAM_MANAGE_MESSAGES: "instagram_manage_messages",
  INSTAGRAM_MANAGE_INSIGHTS: "instagram_manage_insights",
  INSTAGRAM_CONTENT_PUBLISH: "instagram_content_publish",

  // Business (opcional pero recomendado)
  BUSINESS_MANAGEMENT: "business_management",
} as const

/**
 * Verifica si un access token es válido y obtiene información sobre él
 */
export async function verifyAccessToken(accessToken: string): Promise<InstagramTokenInfo> {
  try {
    // Usar debug_token para inspeccionar el token
    const response = await fetch(
      `https://graph.facebook.com/v19.0/debug_token?input_token=${accessToken}&access_token=${accessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      return {
        isValid: false,
        type: "unknown",
        scopes: [],
        error: error.error?.message || "Token verification failed",
      }
    }

    const { data } = await response.json()

    // Determinar el tipo de token
    let tokenType: "user" | "page" | "unknown" = "unknown"
    if (data.type === "USER") {
      tokenType = "user"
    } else if (data.type === "PAGE") {
      tokenType = "page"
    }

    return {
      isValid: data.is_valid || false,
      type: tokenType,
      scopes: data.scopes || [],
      expiresAt: data.expires_at ? new Date(data.expires_at * 1000) : undefined,
      appId: data.app_id,
      userId: data.user_id,
    }
  } catch (error: any) {
    logger.error({ error }, "Error verifying access token")
    return {
      isValid: false,
      type: "unknown",
      scopes: [],
      error: error.message,
    }
  }
}

/**
 * Obtiene los permisos actuales del token
 */
export async function getTokenPermissions(accessToken: string): Promise<InstagramPermission[]> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/me/permissions?access_token=${accessToken}`
    )

    if (!response.ok) {
      logger.error({ status: response.status }, "Failed to fetch permissions")
      return []
    }

    const { data } = await response.json()
    return data || []
  } catch (error: any) {
    logger.error({ error }, "Error fetching permissions")
    return []
  }
}

/**
 * Verifica si el token tiene todos los scopes necesarios para mensajería
 */
export async function verifyMessagingScopes(accessToken: string): Promise<{
  hasAllScopes: boolean
  missingScopes: string[]
  grantedScopes: string[]
  permissions: InstagramPermission[]
}> {
  const tokenInfo = await verifyAccessToken(accessToken)
  const permissions = await getTokenPermissions(accessToken)

  const requiredForMessaging = [
    REQUIRED_SCOPES.PAGES_SHOW_LIST,
    REQUIRED_SCOPES.INSTAGRAM_BASIC,
    REQUIRED_SCOPES.INSTAGRAM_MANAGE_MESSAGES,
  ]

  const grantedPermissions = permissions
    .filter(p => p.status === "granted")
    .map(p => p.permission)

  const missingScopes = requiredForMessaging.filter(
    scope => !grantedPermissions.includes(scope) && !tokenInfo.scopes.includes(scope)
  )

  return {
    hasAllScopes: missingScopes.length === 0,
    missingScopes,
    grantedScopes: [...new Set([...grantedPermissions, ...tokenInfo.scopes])],
    permissions,
  }
}

/**
 * Obtiene las páginas de Facebook del usuario
 */
export async function getFacebookPages(userAccessToken: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to fetch pages")
    }

    const { data: pages } = await response.json()
    return { success: true, pages: pages || [] }
  } catch (error: any) {
    logger.error({ error }, "Error fetching Facebook pages")
    return { success: false, error: error.message, pages: [] }
  }
}

/**
 * Obtiene el Instagram Business Account vinculado a una página de Facebook
 */
export async function getInstagramBusinessAccount(
  pageId: string,
  pageAccessToken: string
) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account{id,username,name,profile_picture_url}&access_token=${pageAccessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to fetch Instagram account")
    }

    const data = await response.json()

    if (!data.instagram_business_account) {
      return {
        success: false,
        error: "No Instagram Business Account linked to this page",
        account: null,
      }
    }

    return {
      success: true,
      account: data.instagram_business_account,
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching Instagram Business Account")
    return {
      success: false,
      error: error.message,
      account: null,
    }
  }
}

/**
 * Obtiene conversaciones de Instagram usando el Page Access Token
 */
export async function getInstagramConversations(
  igUserId: string,
  pageAccessToken: string
) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/conversations?fields=id,updated_time,participants,messages.limit(1){message,from,created_time}&platform=instagram&access_token=${pageAccessToken}`
    )

    if (!response.ok) {
      const error = await response.json()

      // Mensajes de error más específicos
      if (error.error?.code === 190) {
        throw new Error("Access token expired or invalid. Please reconnect your Instagram account.")
      }

      if (error.error?.code === 10) {
        throw new Error("Permission 'instagram_manage_messages' is required. Please reconnect your account with the correct permissions.")
      }

      if (error.error?.code === 200) {
        throw new Error("Insufficient permissions. Make sure your Instagram account is a Business account.")
      }

      throw new Error(error.error?.message || "Failed to fetch conversations")
    }

    const { data: conversations } = await response.json()
    return { success: true, conversations: conversations || [] }
  } catch (error: any) {
    logger.error({ error }, "Error fetching Instagram conversations")
    return { success: false, error: error.message, conversations: [] }
  }
}

/**
 * Verifica el tipo de cuenta de Instagram (Business vs Creator)
 * IMPORTANTE: Solo Business Accounts tienen acceso completo a la API de mensajería
 */
export async function checkInstagramAccountType(
  igUserId: string,
  pageAccessToken: string
) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}?fields=id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website&access_token=${pageAccessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.error?.message || "Failed to check account type",
        accountType: "unknown",
      }
    }

    const accountData = await response.json()

    // Intentar obtener información de la cuenta que solo Business accounts tienen
    const businessResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}?fields=business_discovery.username(${accountData.username}){username,id}&access_token=${pageAccessToken}`
    )

    let isBusinessAccount = true
    let additionalInfo = ""

    if (!businessResponse.ok) {
      const businessError = await businessResponse.json()

      // Si este endpoint falla, puede ser Creator o Personal
      if (businessError.error?.code === 100) {
        isBusinessAccount = false
        additionalInfo = "Account appears to be Creator or Personal (not Business)"
      }
    }

    // Otro método: intentar acceder a insights (solo Business)
    const insightsTest = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/insights?metric=impressions&period=day&access_token=${pageAccessToken}`
    )

    const hasInsightsAccess = insightsTest.ok

    return {
      success: true,
      accountData,
      isLikelyBusinessAccount: isBusinessAccount && hasInsightsAccess,
      hasInsightsAccess,
      accountType: isBusinessAccount && hasInsightsAccess ? "business" : "creator_or_personal",
      warning: !hasInsightsAccess ? "Account may be Creator instead of Business. Messaging API requires Business Account." : null,
    }
  } catch (error: any) {
    logger.error({ error }, "Error checking Instagram account type")
    return {
      success: false,
      error: error.message,
      accountType: "unknown",
    }
  }
}

/**
 * Envía un mensaje de Instagram usando el Page Access Token
 */
export async function sendInstagramMessage(
  igUserId: string,
  pageAccessToken: string,
  recipientId: string,
  message: string
) {
  try {
    const params = new URLSearchParams({
      recipient: JSON.stringify({ id: recipientId }),
      message: JSON.stringify({ text: message.trim() }),
      access_token: pageAccessToken,
    })

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/messages`,
      {
        method: "POST",
        body: params,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to send message")
    }

    const data = await response.json()
    return { success: true, messageId: data.id }
  } catch (error: any) {
    logger.error({ error }, "Error sending Instagram message")
    return { success: false, error: error.message }
  }
}

// ============================================
// CONTENT PUBLISHING
// ============================================

export interface CreateMediaContainerParams {
  imageUrl?: string
  videoUrl?: string
  caption?: string
  mediaType?: "IMAGE" | "VIDEO" | "REELS" | "CAROUSEL_ALBUM"
  isCarouselItem?: boolean
  coverUrl?: string // For videos/reels thumbnail
  children?: string[] // For carousel - array of media container IDs
  locationId?: string
  userTags?: Array<{ username: string; x: number; y: number }>
  shareToFeed?: boolean // For reels
}

/**
 * Crea un container de media para Instagram
 * Este es el primer paso para publicar contenido
 */
export async function createMediaContainer(
  igUserId: string,
  pageAccessToken: string,
  params: CreateMediaContainerParams
) {
  try {
    const body: Record<string, string> = {
      access_token: pageAccessToken,
    }

    // Image
    if (params.imageUrl) {
      body.image_url = params.imageUrl
      // Explicitly set media type for images
      if (!params.isCarouselItem && !params.mediaType) {
        body.media_type = "IMAGE"
      }
    }

    // Video or Reels
    if (params.videoUrl) {
      body.video_url = params.videoUrl

      if (params.mediaType === "REELS") {
        body.media_type = "REELS"
        if (params.shareToFeed !== undefined) {
          body.share_to_feed = params.shareToFeed.toString()
        }
      } else if (!params.isCarouselItem) {
        // Regular video
        body.media_type = "VIDEO"
      }

      // Cover/thumbnail for video
      if (params.coverUrl) {
        body.cover_url = params.coverUrl
      }
    }

    // Carousel Album
    if (params.mediaType === "CAROUSEL_ALBUM" && params.children) {
      body.media_type = "CAROUSEL_ALBUM"
      body.children = params.children.join(",")
    }

    // Carousel item flag
    if (params.isCarouselItem) {
      body.is_carousel_item = "true"
    }

    // Caption
    if (params.caption) {
      body.caption = params.caption
    }

    // Location
    if (params.locationId) {
      body.location_id = params.locationId
    }

    // User tags
    if (params.userTags && params.userTags.length > 0) {
      body.user_tags = JSON.stringify(params.userTags)
    }

    // Log what we're sending to Instagram for debugging
    logger.info(
      {
        endpoint: `https://graph.facebook.com/v19.0/${igUserId}/media`,
        params: { ...body, access_token: "[REDACTED]" },
      },
      "Creating media container on Instagram"
    )

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(body),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error, requestBody: { ...body, access_token: "[REDACTED]" } }, "Failed to create media container")
      throw new Error(error.error?.message || "Failed to create media container")
    }

    const data = await response.json()
    return { success: true, containerId: data.id }
  } catch (error: any) {
    logger.error({ error }, "Error creating media container")
    return { success: false, error: error.message }
  }
}

/**
 * Publica un media container previamente creado
 * Este es el segundo paso después de crear el container
 */
export async function publishMediaContainer(
  igUserId: string,
  pageAccessToken: string,
  containerId: string
) {
  try {
    const params = new URLSearchParams({
      creation_id: containerId,
      access_token: pageAccessToken,
    })

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media_publish`,
      {
        method: "POST",
        body: params,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error }, "Failed to publish media container")
      throw new Error(error.error?.message || "Failed to publish media")
    }

    const data = await response.json()
    return { success: true, postId: data.id }
  } catch (error: any) {
    logger.error({ error }, "Error publishing media container")
    return { success: false, error: error.message }
  }
}

/**
 * Obtiene el estado de un media container
 * Útil para verificar si un video/reel está listo para publicar
 */
export async function getMediaContainerStatus(
  containerId: string,
  pageAccessToken: string
) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${containerId}?fields=status_code,status&access_token=${pageAccessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to get container status")
    }

    const data = await response.json()
    return {
      success: true,
      status: data.status,
      statusCode: data.status_code,
      isReady: data.status_code === "FINISHED",
    }
  } catch (error: any) {
    logger.error({ error }, "Error getting media container status")
    return { success: false, error: error.message }
  }
}

/**
 * Helper: Publica una imagen simple
 */
export async function publishSingleImage(
  igUserId: string,
  pageAccessToken: string,
  imageUrl: string,
  caption?: string
) {
  // Step 1: Create container
  const containerResult = await createMediaContainer(igUserId, pageAccessToken, {
    imageUrl,
    caption,
  })

  if (!containerResult.success) {
    return containerResult
  }

  // Step 2: Publish container
  return await publishMediaContainer(igUserId, pageAccessToken, containerResult.containerId!)
}

/**
 * Helper: Publica un reel
 */
export async function publishReel(
  igUserId: string,
  pageAccessToken: string,
  videoUrl: string,
  caption?: string,
  coverUrl?: string,
  shareToFeed: boolean = true
) {
  // Step 1: Create container
  const containerResult = await createMediaContainer(igUserId, pageAccessToken, {
    videoUrl,
    caption,
    coverUrl,
    mediaType: "REELS",
    shareToFeed,
  })

  if (!containerResult.success) {
    return containerResult
  }

  // Step 2: Wait for video processing (poll status)
  let isReady = false
  let attempts = 0
  const maxAttempts = 30 // 30 attempts * 2 seconds = 1 minute max

  while (!isReady && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds

    const statusResult = await getMediaContainerStatus(
      containerResult.containerId!,
      pageAccessToken
    )

    if (!statusResult.success) {
      return statusResult
    }

    isReady = statusResult.isReady!
    attempts++
  }

  if (!isReady) {
    return {
      success: false,
      error: "Video processing timeout - please try again later",
    }
  }

  // Step 3: Publish container
  return await publishMediaContainer(igUserId, pageAccessToken, containerResult.containerId!)
}

/**
 * Helper: Publica un carousel (álbum de imágenes/videos)
 */
export async function publishCarousel(
  igUserId: string,
  pageAccessToken: string,
  items: Array<{ imageUrl?: string; videoUrl?: string }>,
  caption?: string
) {
  if (items.length < 2 || items.length > 10) {
    return {
      success: false,
      error: "Carousel must have between 2 and 10 items",
    }
  }

  // Step 1: Create containers for each item
  const itemContainerIds: string[] = []

  for (const item of items) {
    const containerResult = await createMediaContainer(igUserId, pageAccessToken, {
      imageUrl: item.imageUrl,
      videoUrl: item.videoUrl,
      isCarouselItem: true,
    })

    if (!containerResult.success) {
      return containerResult
    }

    itemContainerIds.push(containerResult.containerId!)
  }

  // Step 2: Create carousel container
  const carouselResult = await createMediaContainer(igUserId, pageAccessToken, {
    mediaType: "CAROUSEL_ALBUM",
    children: itemContainerIds,
    caption,
  })

  if (!carouselResult.success) {
    return carouselResult
  }

  // Step 3: Publish carousel
  return await publishMediaContainer(igUserId, pageAccessToken, carouselResult.containerId!)
}
