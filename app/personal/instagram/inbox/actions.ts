"use server"

import prisma from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { createLogger } from "@/lib/logger"
import {
  getInstagramConversations,
  sendInstagramMessage,
  verifyAccessToken,
  verifyMessagingScopes,
  getTokenPermissions,
  checkInstagramAccountType,
} from "@/lib/instagram-api"

const logger = createLogger("actions:instagram:inbox")

/**
 * Get all conversations (DMs) from Instagram
 * Requires: instagram_manage_messages permission
 * Uses PAGE_ACCESS_TOKEN (not user token)
 */
export async function getConversations(brandId: string) {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: {
        brandId,
        platform: "INSTAGRAM",
        isActive: true,
      },
    })

    if (!account) {
      return { success: false, error: "No Instagram account connected" }
    }

    // Este es el PAGE_ACCESS_TOKEN guardado durante OAuth
    const pageAccessToken = decrypt(account.accessToken)
    // Este es el IG_USER_ID (instagram_business_account.id)
    const igUserId = account.platformAccountId

    logger.info({ igUserId }, "Fetching conversations for IG Business Account")

    // Usar la función centralizada
    const result = await getInstagramConversations(igUserId, pageAccessToken)

    if (!result.success) {
      logger.error({ error: result.error }, "Failed to fetch conversations")
      return {
        success: false,
        error: result.error,
      }
    }

    return {
      success: true,
      conversations: result.conversations,
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching conversations")
    return { success: false, error: error.message }
  }
}

/**
 * Get messages from a specific conversation
 * Requires: instagram_manage_messages permission
 */
export async function getConversationMessages(brandId: string, conversationId: string) {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: {
        brandId,
        platform: "INSTAGRAM",
        isActive: true,
      },
    })

    if (!account) {
      return { success: false, error: "No Instagram account connected" }
    }

    const accessToken = decrypt(account.accessToken)

    // Get messages
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${conversationId}?fields=id,messages{id,message,from,created_time,attachments}&access_token=${accessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error }, "Failed to fetch messages")
      return {
        success: false,
        error: error.error?.message || "Failed to fetch messages",
      }
    }

    const data = await response.json()

    return {
      success: true,
      messages: data.messages?.data || [],
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching messages")
    return { success: false, error: error.message }
  }
}

/**
 * Send a message to a conversation
 * Requires: instagram_manage_messages permission
 * Uses PAGE_ACCESS_TOKEN (not user token)
 */
export async function sendMessage(
  brandId: string,
  recipientId: string,
  message: string
) {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: {
        brandId,
        platform: "INSTAGRAM",
        isActive: true,
      },
    })

    if (!account) {
      return { success: false, error: "No Instagram account connected" }
    }

    if (!message || message.trim() === "") {
      return { success: false, error: "Message cannot be empty" }
    }

    // Este es el PAGE_ACCESS_TOKEN guardado durante OAuth
    const pageAccessToken = decrypt(account.accessToken)
    // Este es el IG_USER_ID (instagram_business_account.id)
    const igUserId = account.platformAccountId

    logger.info({ recipientId, igUserId }, "Sending Instagram message")

    // Usar la función centralizada
    const result = await sendInstagramMessage(
      igUserId,
      pageAccessToken,
      recipientId,
      message
    )

    if (!result.success) {
      logger.error({ error: result.error }, "Failed to send message")
      return {
        success: false,
        error: result.error,
      }
    }

    logger.info({ messageId: result.messageId, recipientId }, "Message sent successfully")

    return {
      success: true,
      messageId: result.messageId,
      message: "Message sent successfully!",
    }
  } catch (error: any) {
    logger.error({ error }, "Error sending message")
    return { success: false, error: error.message }
  }
}

/**
 * Get saved conversations from database
 */
export async function getSavedConversations(brandId: string, filters?: {
  status?: string
  type?: string
}) {
  try {
    const where: any = {
      brandId,
      type: "DM",
    }

    if (filters?.status) {
      where.status = filters.status
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        socialAccount: {
          select: {
            platform: true,
            username: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    })

    return {
      success: true,
      conversations,
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching saved conversations")
    return { success: false, error: error.message }
  }
}

/**
 * Save a conversation to database
 */
export async function saveConversation(
  brandId: string,
  data: {
    externalId: string
    fromUserId: string
    fromUsername: string
    fromDisplayName?: string
    fromAvatar?: string
    lastMessageAt: Date
  }
) {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: {
        brandId,
        platform: "INSTAGRAM",
        isActive: true,
      },
    })

    if (!account) {
      return { success: false, error: "No Instagram account connected" }
    }

    // Upsert conversation
    const conversation = await prisma.conversation.upsert({
      where: {
        platform_externalId: {
          platform: "INSTAGRAM",
          externalId: data.externalId,
        },
      },
      create: {
        brandId,
        socialAccountId: account.id,
        platform: "INSTAGRAM",
        type: "DM",
        externalId: data.externalId,
        fromUserId: data.fromUserId,
        fromUsername: data.fromUsername,
        fromDisplayName: data.fromDisplayName,
        fromAvatar: data.fromAvatar,
        status: "NEW",
        lastMessageAt: data.lastMessageAt,
      },
      update: {
        lastMessageAt: data.lastMessageAt,
        fromDisplayName: data.fromDisplayName,
        fromAvatar: data.fromAvatar,
      },
    })

    return {
      success: true,
      conversation,
    }
  } catch (error: any) {
    logger.error({ error }, "Error saving conversation")
    return { success: false, error: error.message }
  }
}

/**
 * Update conversation status
 */
export async function updateConversationStatus(
  conversationId: string,
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
) {
  try {
    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { status },
    })

    return {
      success: true,
      conversation,
    }
  } catch (error: any) {
    logger.error({ error }, "Error updating conversation status")
    return { success: false, error: error.message }
  }
}

/**
 * Diagnóstico avanzado de configuración de la app de Meta
 */
export async function diagnoseMetaAppConfiguration(brandId: string) {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: {
        brandId,
        platform: "INSTAGRAM",
        isActive: true,
      },
    })

    if (!account) {
      return { success: false, error: "No Instagram account connected" }
    }

    const pageAccessToken = decrypt(account.accessToken)
    const igUserId = account.platformAccountId

    // Test multiple endpoints to identify the exact issue
    const tests = []

    // Test 1: Verify IG Account access
    try {
      const igAccountTest = await fetch(
        `https://graph.facebook.com/v19.0/${igUserId}?fields=id,username,name&access_token=${pageAccessToken}`
      )
      const igAccountData = await igAccountTest.json()
      tests.push({
        name: "Instagram Account Access",
        passed: igAccountTest.ok,
        endpoint: `/${igUserId}`,
        error: igAccountData.error?.message,
        errorCode: igAccountData.error?.code,
      })
    } catch (e: any) {
      tests.push({
        name: "Instagram Account Access",
        passed: false,
        error: e.message,
      })
    }

    // Test 2: Verify Media access (should work)
    try {
      const mediaTest = await fetch(
        `https://graph.facebook.com/v19.0/${igUserId}/media?fields=id&limit=1&access_token=${pageAccessToken}`
      )
      const mediaData = await mediaTest.json()
      tests.push({
        name: "Media Endpoint",
        passed: mediaTest.ok,
        endpoint: `/${igUserId}/media`,
        error: mediaData.error?.message,
        errorCode: mediaData.error?.code,
      })
    } catch (e: any) {
      tests.push({
        name: "Media Endpoint",
        passed: false,
        error: e.message,
      })
    }

    // Test 3: Verify Conversations access (the problematic one)
    try {
      const conversationsTest = await fetch(
        `https://graph.facebook.com/v19.0/${igUserId}/conversations?platform=instagram&access_token=${pageAccessToken}`
      )
      const conversationsData = await conversationsTest.json()
      tests.push({
        name: "Conversations Endpoint (Messaging)",
        passed: conversationsTest.ok,
        endpoint: `/${igUserId}/conversations`,
        error: conversationsData.error?.message,
        errorCode: conversationsData.error?.code,
        errorType: conversationsData.error?.type,
        fbtrace_id: conversationsData.error?.fbtrace_id,
      })
    } catch (e: any) {
      tests.push({
        name: "Conversations Endpoint (Messaging)",
        passed: false,
        error: e.message,
      })
    }

    // Test 4: Check account type (Business vs Creator)
    let accountTypeCheck = null
    try {
      accountTypeCheck = await checkInstagramAccountType(igUserId, pageAccessToken)
      tests.push({
        name: "Account Type Verification",
        passed: accountTypeCheck.success && accountTypeCheck.isLikelyBusinessAccount,
        endpoint: `/${igUserId} (insights check)`,
        error: accountTypeCheck.warning || accountTypeCheck.error,
        accountType: accountTypeCheck.accountType,
        hasInsightsAccess: accountTypeCheck.hasInsightsAccess,
      })
    } catch (e: any) {
      tests.push({
        name: "Account Type Verification",
        passed: false,
        error: e.message,
      })
    }

    // Test 5: Get app info
    let appInfo = null
    try {
      const tokenInfo = await verifyAccessToken(pageAccessToken)
      if (tokenInfo.appId) {
        const appInfoResponse = await fetch(
          `https://graph.facebook.com/v19.0/${tokenInfo.appId}?fields=id,name,namespace,link&access_token=${pageAccessToken}`
        )
        if (appInfoResponse.ok) {
          appInfo = await appInfoResponse.json()
        }
      }
    } catch (e) {
      // Ignore, app info is optional
    }

    return {
      success: true,
      diagnosis: {
        tests,
        appInfo,
        accountTypeCheck,
        recommendations: generateRecommendations(tests, accountTypeCheck),
      },
    }
  } catch (error: any) {
    logger.error({ error }, "Error diagnosing Meta app configuration")
    return { success: false, error: error.message }
  }
}

function generateRecommendations(tests: any[], accountTypeCheck: any = null) {
  const recommendations = []

  const conversationsTest = tests.find(t => t.name === "Conversations Endpoint (Messaging)")
  const accountTypeTest = tests.find(t => t.name === "Account Type Verification")

  // PRIORIDAD 1: Verificar tipo de cuenta primero
  if (accountTypeTest && !accountTypeTest.passed) {
    recommendations.push({
      severity: "critical",
      title: "❌ Instagram Account Type Issue",
      message: `Your Instagram account appears to be CREATOR or PERSONAL, not BUSINESS. Instagram Messaging API ONLY works with Business Accounts.`,
      actions: [
        "🔧 HOW TO FIX - Switch to Business Account:",
        "",
        "1. Open Instagram app on your phone",
        "2. Go to your profile",
        "3. Tap the menu icon (☰) → Settings",
        "4. Tap 'Account'",
        "5. Tap 'Switch account type'",
        "6. Select 'Switch to Business Account'",
        "7. Follow the setup process",
        "8. Connect to your Facebook Page",
        "",
        "⚠️ IMPORTANT:",
        "  • Creator accounts DO NOT support messaging API",
        "  • You MUST use Business account",
        "  • Wait 5 minutes after switching",
        "  • Then reconnect your account in this app",
      ],
    })
  }

  if (conversationsTest && !conversationsTest.passed) {
    if (conversationsTest.errorCode === 3) {
      recommendations.push({
        severity: "critical",
        title: "Instagram Messaging API Not Enabled",
        message: "Error #3 means your app doesn't have Instagram Messaging capability. This is different from just having Messenger added.",
        actions: [
          "OPTION 1 - Configure Messenger Platform for Instagram:",
          "  1. Go to developers.facebook.com/apps → Your App",
          "  2. Click 'Messenger' in the left menu",
          "  3. Go to 'Settings'",
          "  4. Scroll to 'Instagram Integration'",
          "  5. Click 'Add or Remove Pages'",
          "  6. Select your Facebook Page connected to Instagram",
          "  7. Make sure 'messages' and 'messaging_postbacks' are enabled",
          "",
          "OPTION 2 - Use Instagram Messaging API (if available):",
          "  1. In your app dashboard, look for 'Instagram Messaging' product",
          "  2. If not available, you may need to request access",
          "  3. Some apps need Business Verification first",
          "",
          "OPTION 3 - Check Account Type:",
          "  1. Verify Instagram account is BUSINESS (not Creator)",
          "  2. In Instagram app: Profile → Settings → Account Type",
          "  3. Should say 'Business Account'",
          "  4. If it's 'Creator', switch to Business",
          "",
          "OPTION 4 - Request Advanced Access (for production):",
          "  1. Go to App Review → Permissions and Features",
          "  2. Find 'instagram_manage_messages'",
          "  3. If it says 'Standard Access' or needs review, request it",
          "  4. You may need to submit your app for review",
        ],
      })
    } else if (conversationsTest.errorCode === 10) {
      recommendations.push({
        severity: "high",
        title: "Missing Permission",
        message: "The instagram_manage_messages permission is not granted or not requested.",
        actions: [
          "Disconnect and reconnect your Instagram account",
          "Make sure to authorize all permissions when prompted",
        ],
      })
    } else if (conversationsTest.errorCode === 190) {
      recommendations.push({
        severity: "high",
        title: "Token Expired or Invalid",
        message: "Your access token has expired or is invalid.",
        actions: [
          "Reconnect your Instagram account to get a fresh token",
        ],
      })
    }
  }

  const mediaTest = tests.find(t => t.name === "Media Endpoint")
  if (mediaTest && !mediaTest.passed) {
    recommendations.push({
      severity: "medium",
      title: "Basic Instagram Access Issue",
      message: "Cannot access basic Instagram data. This suggests a fundamental configuration problem.",
      actions: [
        "Verify your Instagram account is a Business account",
        "Verify it's linked to a Facebook Page",
        "Check that instagram_basic permission is granted",
      ],
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      severity: "info",
      title: "All Tests Passed",
      message: "Your Instagram configuration appears to be correct!",
      actions: [],
    })
  }

  return recommendations
}

/**
 * Debug: Check Instagram account permissions and status
 * Verifica que el PAGE_ACCESS_TOKEN tenga los permisos necesarios
 */
export async function debugInstagramPermissions(brandId: string) {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: {
        brandId,
        platform: "INSTAGRAM",
        isActive: true,
      },
    })

    if (!account) {
      return { success: false, error: "No Instagram account connected" }
    }

    // Este es el PAGE_ACCESS_TOKEN guardado durante OAuth
    const pageAccessToken = decrypt(account.accessToken)
    // Este es el IG_USER_ID (instagram_business_account.id)
    const igUserId = account.platformAccountId

    logger.info({ igUserId }, "Starting debug for Instagram account")

    // 1. Verificar el token y obtener información
    const tokenInfo = await verifyAccessToken(pageAccessToken)

    // 2. Obtener permisos
    const permissions = await getTokenPermissions(pageAccessToken)

    // 3. Verificar scopes específicos para mensajería
    const scopeCheck = await verifyMessagingScopes(pageAccessToken)

    // 4. Obtener detalles de la cuenta de Instagram
    const igDetailsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}?fields=id,username,name,profile_picture_url&access_token=${pageAccessToken}`
    )
    const igDetails = await igDetailsResponse.json()

    // 5. Test conversations endpoint
    const conversationsResult = await getInstagramConversations(igUserId, pageAccessToken)

    return {
      success: true,
      debug: {
        accountId: igUserId,
        tokenInfo: {
          isValid: tokenInfo.isValid,
          type: tokenInfo.type,
          scopes: tokenInfo.scopes,
          expiresAt: tokenInfo.expiresAt,
          appId: tokenInfo.appId,
        },
        igDetails,
        scopeCheck: {
          hasAllScopes: scopeCheck.hasAllScopes,
          missingScopes: scopeCheck.missingScopes,
          grantedScopes: scopeCheck.grantedScopes,
        },
        permissions: permissions,
        conversationsEndpoint: {
          success: conversationsResult.success,
          error: conversationsResult.error,
          count: conversationsResult.conversations?.length || 0,
        },
      },
    }
  } catch (error: any) {
    logger.error({ error }, "Error debugging Instagram permissions")
    return { success: false, error: error.message }
  }
}

/**
 * Sync conversations from Instagram API to database
 * Requires: instagram_manage_messages permission
 * Uses PAGE_ACCESS_TOKEN (not user token)
 */
export async function syncConversationsFromInstagram(brandId: string) {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: {
        brandId,
        platform: "INSTAGRAM",
        isActive: true,
      },
    })

    if (!account) {
      return { success: false, error: "No Instagram account connected" }
    }

    // Este es el PAGE_ACCESS_TOKEN guardado durante OAuth
    const pageAccessToken = decrypt(account.accessToken)
    // Este es el IG_USER_ID (instagram_business_account.id)
    const igUserId = account.platformAccountId

    logger.info({ igUserId }, "Starting sync for Instagram conversations")

    // Usar la función centralizada para obtener conversaciones
    const result = await getInstagramConversations(igUserId, pageAccessToken)

    if (!result.success) {
      logger.error({ error: result.error }, "Failed to fetch conversations from Instagram")
      return {
        success: false,
        error: result.error,
      }
    }

    const conversations = result.conversations

    logger.info({
      count: conversations.length,
      igUserId,
    }, "Fetched conversations from Instagram")

    // If no conversations found, return early with helpful message
    if (conversations.length === 0) {
      return {
        success: true,
        synced: 0,
        total: 0,
        message: "No conversations found. Make sure you have messages in your Instagram inbox.",
      }
    }

    // Save each conversation to database
    let syncedCount = 0
    for (const conv of conversations) {
      try {
        // Get participant info (the user who's chatting with you)
        const participant = conv.participants?.data?.find((p: any) => p.id !== igUserId)

        if (!participant) continue

        // Get user details usando el PAGE_ACCESS_TOKEN
        const userResponse = await fetch(
          `https://graph.facebook.com/v19.0/${participant.id}?fields=username,name,profile_pic&access_token=${pageAccessToken}`
        )

        let username = participant.username || participant.id
        let displayName = participant.name
        let avatar = null

        if (userResponse.ok) {
          const userData = await userResponse.json()
          username = userData.username || username
          displayName = userData.name || displayName
          avatar = userData.profile_pic
        }

        // Upsert conversation
        const savedConv = await prisma.conversation.upsert({
          where: {
            platform_externalId: {
              platform: "INSTAGRAM",
              externalId: conv.id,
            },
          },
          create: {
            brandId,
            socialAccountId: account.id,
            platform: "INSTAGRAM",
            type: "DM",
            externalId: conv.id,
            fromUserId: participant.id,
            fromUsername: username,
            fromDisplayName: displayName,
            fromAvatar: avatar,
            status: "NEW",
            lastMessageAt: new Date(conv.updated_time),
          },
          update: {
            fromUsername: username,
            fromDisplayName: displayName,
            fromAvatar: avatar,
            lastMessageAt: new Date(conv.updated_time),
          },
        })

        // Save last message if exists
        const lastMessage = conv.messages?.data?.[0]
        if (lastMessage) {
          await prisma.message.upsert({
            where: {
              platform_externalId: {
                platform: "INSTAGRAM",
                externalId: lastMessage.id || `${conv.id}-last`,
              },
            },
            create: {
              conversationId: savedConv.id,
              platform: "INSTAGRAM",
              externalId: lastMessage.id || `${conv.id}-last`,
              content: lastMessage.message || "",
              from: lastMessage.from?.id === igUserId ? "BRAND" : "USER",
              createdAt: new Date(lastMessage.created_time),
            },
            update: {
              content: lastMessage.message || "",
            },
          })
        }

        syncedCount++
      } catch (convError: any) {
        logger.error({ error: convError, conversationId: conv.id }, "Error syncing conversation")
      }
    }

    logger.info({ syncedCount }, "Conversations synced successfully")

    return {
      success: true,
      synced: syncedCount,
      total: conversations.length,
    }
  } catch (error: any) {
    logger.error({ error }, "Error syncing conversations")
    return { success: false, error: error.message }
  }
}
