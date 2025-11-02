"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Upload,
  Image as ImageIcon,
  X,
  Trash2,
  CheckCircle2,
  XCircle
} from "lucide-react"

interface MediaImage {
  id: string
  url: string
  thumbnail: string
  width: number
  height: number
  format: string
  createdAt: string
  bytes: number
  usedCount: number
  lastUsedAt?: string
}

export default function MediaLibraryPage() {
  const params = useParams()
  const brandId = params.brandId as string

  const [images, setImages] = useState<MediaImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<MediaImage | null>(null)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)
  const [filter, setFilter] = useState<"all" | "used" | "unused">("all")

  // Load images
  const loadImages = async (filterType: "all" | "used" | "unused" = filter) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/media/list?brandId=${brandId}&filter=${filterType}`)
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
      }
    } catch (error) {
      console.error("Error loading images:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadImages(filter)
  }, [brandId, filter])

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("brandId", brandId)

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: "Image uploaded successfully!" })
        loadImages() // Reload images
        // Reset file input
        e.target.value = ""
      } else {
        setResult({ success: false, error: data.error || "Failed to upload image" })
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message || "An error occurred" })
    } finally {
      setUploading(false)
    }
  }

  // Handle delete
  const handleDelete = async (publicId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      const response = await fetch("/api/media/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, brandId }),
      })

      if (response.ok) {
        setResult({ success: true, message: "Image deleted successfully!" })
        loadImages(filter)
        setSelectedImage(null)
      } else {
        const data = await response.json()
        setResult({ success: false, error: data.error || "Failed to delete image" })
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message || "An error occurred" })
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage your images for Instagram posts
          </p>
        </div>
      </div>

      {/* Result Alert */}
      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <AlertDescription>
            {result.success ? result.message : result.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>
            Upload images to your media library (Max 10MB, JPEG/PNG/WebP)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="cursor-pointer"
            />
            {uploading && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Your Images</CardTitle>
          <CardDescription>
            {loading ? "Loading..." : `${images.length} images`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="used">Usadas</TabsTrigger>
              <TabsTrigger value="unused">No usadas</TabsTrigger>
            </TabsList>

            <TabsContent value={filter}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>
                    {filter === "all" && "No images yet. Upload your first image!"}
                    {filter === "used" && "No images have been used yet"}
                    {filter === "unused" && "All images have been used"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(image)}
                      className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-all cursor-pointer"
                    >
                      <img
                        src={image.thumbnail}
                        alt="Media"
                        className="w-full h-full object-cover"
                      />
                      {/* Usage Badge */}
                      {image.usedCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="absolute top-2 right-2 bg-black/70 text-white border-0"
                        >
                          {image.usedCount}x
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {image.width} x {image.height}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Image Detail Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
          </DialogHeader>

          {selectedImage && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Preview */}
                <div>
                  <img
                    src={selectedImage.url}
                    alt="Preview"
                    className="w-full rounded-lg border"
                  />
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span>{selectedImage.width} x {selectedImage.height}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Format:</span>
                        <span className="uppercase">{selectedImage.format}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{formatBytes(selectedImage.bytes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Aspect Ratio:</span>
                        <span>
                          {(selectedImage.width / selectedImage.height).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Used:</span>
                        <span>
                          {selectedImage.usedCount === 0 ? (
                            <Badge variant="outline">Not used</Badge>
                          ) : (
                            <Badge variant="secondary">{selectedImage.usedCount}x</Badge>
                          )}
                        </span>
                      </div>
                      {selectedImage.lastUsedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last used:</span>
                          <span className="text-xs">
                            {new Date(selectedImage.lastUsedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">URL</h3>
                    <Input
                      value={selectedImage.url}
                      readOnly
                      onClick={(e) => e.currentTarget.select()}
                      className="text-xs"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedImage.url)
                        setResult({ success: true, message: "URL copied to clipboard!" })
                      }}
                    >
                      Copy URL
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(selectedImage.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
