import Image from "next/image"

interface BrandLogoProps {
  src: string
  alt: string
  size?: "sm" | "md" | "lg"
}

export function BrandLogo({ src, alt, size = "md" }: BrandLogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  return (
    <div className={`${sizeClasses[size]} relative rounded-xl overflow-hidden bg-card border border-border`}>
      <Image src={src || "/placeholder.svg"} alt={alt} fill className="object-cover" />
    </div>
  )
}
