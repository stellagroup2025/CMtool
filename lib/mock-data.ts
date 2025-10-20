// Mock data for the social media management platform

export type SocialNetwork = "instagram" | "facebook" | "twitter" | "tiktok" | "linkedin" | "youtube"

export interface Brand {
  id: string
  name: string
  logo: string
  accounts: Account[]
  metrics: {
    reach: number
    engagement: number
    growth: number
    pendingDMs: number
  }
}

export interface Account {
  id: string
  network: SocialNetwork
  username: string
  avatar: string
  followers: number
}

export interface Conversation {
  id: string
  accountId: string
  network: SocialNetwork
  type: "dm" | "comment" | "mention"
  from: {
    name: string
    username: string
    avatar: string
  }
  preview: string
  timestamp: Date
  status: "new" | "in-progress" | "resolved"
  sentiment: "positive" | "neutral" | "negative"
  priority: "high" | "medium" | "low"
  sla: number // hours remaining
  tags: string[]
  messages: Message[]
}

export interface Message {
  id: string
  from: "user" | "brand"
  content: string
  timestamp: Date
  attachments?: string[]
}

export interface Post {
  id: string
  brandId: string
  networks: SocialNetwork[]
  content: string
  media: string[]
  scheduledFor: Date
  status: "draft" | "scheduled" | "published" | "failed"
  variations: Record<SocialNetwork, { content: string; hashtags: string[] }>
  approvals: Approval[]
}

export interface Approval {
  id: string
  userId: string
  userName: string
  status: "pending" | "approved" | "rejected"
  comment?: string
  timestamp: Date
}

export const mockBrands: Brand[] = [
  {
    id: "1",
    name: "Acme",
    logo: "/generic-company-logo.png",
    accounts: [
      { id: "a1", network: "instagram", username: "@acme", avatar: "/acme-instagram.jpg", followers: 125000 },
      { id: "a2", network: "twitter", username: "@acme", avatar: "/acme-twitter.jpg", followers: 89000 },
      { id: "a3", network: "linkedin", username: "Acme Inc", avatar: "/acme-linkedin.jpg", followers: 45000 },
    ],
    metrics: {
      reach: 1250000,
      engagement: 4.8,
      growth: 12.5,
      pendingDMs: 23,
    },
  },
  {
    id: "2",
    name: "Bloom",
    logo: "/bloom-logo.jpg",
    accounts: [
      { id: "b1", network: "instagram", username: "@bloom", avatar: "/bloom-instagram.jpg", followers: 89000 },
      { id: "b2", network: "tiktok", username: "@bloom", avatar: "/bloom-tiktok.jpg", followers: 234000 },
      { id: "b3", network: "facebook", username: "Bloom", avatar: "/bloom-facebook.jpg", followers: 67000 },
    ],
    metrics: {
      reach: 890000,
      engagement: 6.2,
      growth: 18.3,
      pendingDMs: 15,
    },
  },
  {
    id: "3",
    name: "Nova",
    logo: "/nova-logo.png",
    accounts: [
      { id: "n1", network: "instagram", username: "@nova", avatar: "/nova-instagram.jpg", followers: 156000 },
      { id: "n2", network: "twitter", username: "@nova", avatar: "/nova-twitter.jpg", followers: 112000 },
      { id: "n3", network: "youtube", username: "Nova", avatar: "/nova-youtube.jpg", followers: 78000 },
    ],
    metrics: {
      reach: 1560000,
      engagement: 5.4,
      growth: 15.7,
      pendingDMs: 31,
    },
  },
]

export const mockConversations: Conversation[] = [
  {
    id: "1",
    accountId: "a1",
    network: "instagram",
    type: "dm",
    from: {
      name: "Sarah Johnson",
      username: "@sarahj",
      avatar: "/user-avatar-1.png",
    },
    preview: "Hi! I love your products. When will the new collection be available?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: "new",
    sentiment: "positive",
    priority: "high",
    sla: 2,
    tags: ["product-inquiry", "new-collection"],
    messages: [
      {
        id: "m1",
        from: "user",
        content: "Hi! I love your products. When will the new collection be available?",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
      },
    ],
  },
  {
    id: "2",
    accountId: "a1",
    network: "instagram",
    type: "comment",
    from: {
      name: "Mike Chen",
      username: "@mikechen",
      avatar: "/diverse-user-avatar-set-2.png",
    },
    preview: "This is amazing! 🔥",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    status: "new",
    sentiment: "positive",
    priority: "low",
    sla: 4,
    tags: ["engagement"],
    messages: [
      {
        id: "m2",
        from: "user",
        content: "This is amazing! 🔥",
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
      },
    ],
  },
  {
    id: "3",
    accountId: "b1",
    network: "instagram",
    type: "dm",
    from: {
      name: "Emma Wilson",
      username: "@emmaw",
      avatar: "/diverse-user-avatars-3.png",
    },
    preview: "I have an issue with my recent order. Can you help?",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    status: "in-progress",
    sentiment: "negative",
    priority: "high",
    sla: 1,
    tags: ["support", "order-issue"],
    messages: [
      {
        id: "m3",
        from: "user",
        content: "I have an issue with my recent order. Can you help?",
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
      },
      {
        id: "m4",
        from: "brand",
        content: "Hi Emma! I'm sorry to hear that. Can you provide your order number?",
        timestamp: new Date(Date.now() - 1000 * 60 * 100),
      },
    ],
  },
]

export const mockPosts: Post[] = [
  {
    id: "1",
    brandId: "1",
    networks: ["instagram", "facebook"],
    content: "Excited to announce our new product line! 🚀",
    media: ["/product-launch-excitement.png"],
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    status: "scheduled",
    variations: {
      instagram: {
        content: "Excited to announce our new product line! 🚀 #NewLaunch #Innovation",
        hashtags: ["NewLaunch", "Innovation", "ProductDrop"],
      },
      facebook: {
        content: "We're thrilled to announce our new product line! Check it out.",
        hashtags: [],
      },
      twitter: { content: "", hashtags: [] },
      tiktok: { content: "", hashtags: [] },
      linkedin: { content: "", hashtags: [] },
      youtube: { content: "", hashtags: [] },
    },
    approvals: [
      {
        id: "ap1",
        userId: "u1",
        userName: "John Doe",
        status: "approved",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    ],
  },
]

export const networkColors: Record<SocialNetwork, string> = {
  instagram: "from-pink-500 to-purple-500",
  facebook: "from-blue-600 to-blue-700",
  twitter: "from-sky-400 to-sky-500",
  tiktok: "from-black to-pink-500",
  linkedin: "from-blue-700 to-blue-800",
  youtube: "from-red-600 to-red-700",
}

export const networkIcons: Record<SocialNetwork, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter",
  tiktok: "Music",
  linkedin: "Linkedin",
  youtube: "Youtube",
}
