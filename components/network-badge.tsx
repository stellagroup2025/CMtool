import { Instagram, Facebook, Twitter, Music, Linkedin, Youtube } from "lucide-react"
import type { SocialNetwork } from "@/lib/mock-data"

interface NetworkBadgeProps {
  network: SocialNetwork
  size?: "sm" | "md"
}

export function NetworkBadge({ network, size = "sm" }: NetworkBadgeProps) {
  const icons = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    tiktok: Music,
    linkedin: Linkedin,
    youtube: Youtube,
  }

  const colors = {
    instagram: "bg-gradient-to-br from-pink-500 to-purple-500",
    facebook: "bg-gradient-to-br from-blue-600 to-blue-700",
    twitter: "bg-gradient-to-br from-sky-400 to-sky-500",
    tiktok: "bg-gradient-to-br from-black to-pink-500",
    linkedin: "bg-gradient-to-br from-blue-700 to-blue-800",
    youtube: "bg-gradient-to-br from-red-600 to-red-700",
  }

  const Icon = icons[network]
  const sizeClasses = size === "sm" ? "h-5 w-5 p-1" : "h-6 w-6 p-1"
  const iconSize = size === "sm" ? 12 : 14

  return (
    <div className={`${sizeClasses} ${colors[network]} rounded-md flex items-center justify-center`}>
      <Icon size={iconSize} className="text-white" />
    </div>
  )
}
