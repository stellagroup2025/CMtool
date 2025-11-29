"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Image as ImageIcon, Video, Images, CheckCircle2, XCircle, Upload, X, Folder } from "lucide-react"

interface InstagramAccount {
  id: string
  username: string
  displayName: string | null
  avatar: string | null
}

export default function PublishPage() {
  const params = useParams()
  const brandId = params.brandId as string

  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  // Instagram accounts
  const [accounts, setAccounts] = useState<InstagramAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")

  // Media Library
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [libraryImages, setLibraryImages] = useState<any[]>([])
  const [loadingLibrary, setLoadingLibrary] = useState(false)
  const [carouselItemIndexForLibrary, setCarouselItemIndexForLibrary] = useState<number | null>(null)

  // Image state
  const [imageUrl, setImageUrl] = useState("")
  const [imageCaption, setImageCaption] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Reel state
  const [reelVideoUrl, setReelVideoUrl] = useState("")
  const [reelCaption, setReelCaption] = useState("")
  const [reelCoverUrl, setReelCoverUrl] = useState("")
  const [reelVideoFile, setReelVideoFile] = useState<File | null>(null)
  const [reelCoverFile, setReelCoverFile] = useState<File | null>(null)
  const [shareToFeed, setShareToFeed] = useState(true)

  // Carousel state
  const [carouselItems, setCarouselItems] = useState([
    { imageUrl: "", videoUrl: "", file: null as File | null, preview: null as string | null },
    { imageUrl: "", videoUrl: "", file: null as File | null, preview: null as string | null },
  ])
  const [carouselCaption, setCarouselCaption] = useState("")

  const resetForm = () => {
    setImageUrl("")
    setImageCaption("")
    setImageFile(null)
    setImagePreview(null)
    setReelVideoUrl("")
    setReelCaption("")
    setReelCoverUrl("")
    setReelVideoFile(null)
    setReelCoverFile(null)
    setCarouselItems([
      { imageUrl: "", videoUrl: "", file: null, preview: null },
      { imageUrl: "", videoUrl: "", file: null, preview: null },
    ])
    setCarouselCaption("")
  }

  // Upload file to server
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to upload file")
    }

    const data = await response.json()
    return data.url
  }

  // Handle image file selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle reel video file selection
  const handleReelVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReelVideoFile(file)
    }
  }

  // Handle reel cover file selection
  const handleReelCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReelCoverFile(file)
    }
  }

  // Handle carousel item file selection
  const handleCarouselFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const newItems = [...carouselItems]
      newItems[index].file = file
      newItems[index].imageUrl = "" // Clear URLs when file is selected
      newItems[index].videoUrl = ""

      // Create preview if it's an image
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const updatedItems = [...carouselItems]
          updatedItems[index].preview = reader.result as string
          setCarouselItems(updatedItems)
        }
        reader.readAsDataURL(file)
      } else {
        newItems[index].preview = null
      }

      setCarouselItems(newItems)
    }
  }

  // Load Instagram accounts on mount
  useEffect(() => {
    const loadAccounts = async () => {
      setLoadingAccounts(true)
      try {
        const response = await fetch(`/api/instagram/accounts?brandId=${brandId}`)
        if (response.ok) {
          const data = await response.json()
          setAccounts(data.accounts || [])
          // Auto-select first account if available
          if (data.accounts && data.accounts.length > 0) {
            setSelectedAccountId(data.accounts[0].id)
          }
        }
      } catch (error) {
        console.error("Error loading Instagram accounts:", error)
      } finally {
        setLoadingAccounts(false)
      }
    }

    loadAccounts()
  }, [brandId])

  // Load media library images
  const loadMediaLibrary = async () => {
    setLoadingLibrary(true)
    try {
      const response = await fetch(`/api/media/list?brandId=${brandId}`)
      if (response.ok) {
        const data = await response.json()
        setLibraryImages(data.images || [])
      }
    } catch (error) {
      console.error("Error loading media library:", error)
    } finally {
      setLoadingLibrary(false)
    }
  }

  // Open media library modal
  const openMediaLibrary = () => {
    setShowMediaLibrary(true)
    loadMediaLibrary()
  }

  // Select image from library
  const selectFromLibrary = (url: string) => {
    // Check if we're selecting for carousel item
    if (carouselItemIndexForLibrary !== null) {
      const newItems = [...carouselItems]
      newItems[carouselItemIndexForLibrary].imageUrl = url
      newItems[carouselItemIndexForLibrary].videoUrl = "" // Clear video URL
      newItems[carouselItemIndexForLibrary].file = null
      newItems[carouselItemIndexForLibrary].preview = url
      setCarouselItems(newItems)
      setCarouselItemIndexForLibrary(null)
    } else {
      // Single image selection
      setImageUrl(url)
      setImageFile(null)
      setImagePreview(null)
    }
    setShowMediaLibrary(false)
  }

  // Open media library for carousel item
  const openMediaLibraryForCarousel = (index: number) => {
    setCarouselItemIndexForLibrary(index)
    setShowMediaLibrary(true)
    loadMediaLibrary()
  }

  const handlePublishImage = async () => {
    if (!imageUrl && !imageFile) {
      setResult({ success: false, error: "Please provide an image URL or select a file" })
      return
    }

    if (!selectedAccountId) {
      setResult({ success: false, error: "Please select an Instagram account" })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      let finalImageUrl = imageUrl

      // Upload file if selected
      if (imageFile) {
        setUploadingFile(true)
        finalImageUrl = await uploadFile(imageFile)
        setUploadingFile(false)
      }

      // Remove query parameters from URL (like Cloudinary analytics)
      if (finalImageUrl) {
        try {
          const url = new URL(finalImageUrl)
          url.search = ''
          finalImageUrl = url.toString()
        } catch {
          // Keep original URL if parsing fails
        }
      }

      const response = await fetch("/api/instagram/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "image",
          brandId,
          socialAccountId: selectedAccountId,
          imageUrl: finalImageUrl,
          caption: imageCaption || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: `Image published successfully! Post ID: ${data.postId}` })
        resetForm()
      } else {
        setResult({ success: false, error: data.error || "Failed to publish image" })
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message || "An error occurred" })
    } finally {
      setLoading(false)
      setUploadingFile(false)
    }
  }

  const handlePublishReel = async () => {
    if (!reelVideoUrl && !reelVideoFile) {
      setResult({ success: false, error: "Please provide a video URL or select a file" })
      return
    }

    if (!selectedAccountId) {
      setResult({ success: false, error: "Please select an Instagram account" })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      let finalVideoUrl = reelVideoUrl
      let finalCoverUrl = reelCoverUrl

      // Upload files if selected
      setUploadingFile(true)
      if (reelVideoFile) {
        finalVideoUrl = await uploadFile(reelVideoFile)
      }
      if (reelCoverFile) {
        finalCoverUrl = await uploadFile(reelCoverFile)
      }
      setUploadingFile(false)

      const response = await fetch("/api/instagram/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "reel",
          brandId,
          socialAccountId: selectedAccountId,
          videoUrl: finalVideoUrl,
          caption: reelCaption || undefined,
          coverUrl: finalCoverUrl || undefined,
          shareToFeed,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: `Reel published successfully! Post ID: ${data.postId}` })
        resetForm()
      } else {
        setResult({ success: false, error: data.error || "Failed to publish reel" })
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message || "An error occurred" })
    } finally {
      setLoading(false)
      setUploadingFile(false)
    }
  }

  const handlePublishCarousel = async () => {
    const validItems = carouselItems.filter(item => item.imageUrl || item.videoUrl || item.file)

    if (validItems.length < 2) {
      setResult({ success: false, error: "Please provide at least 2 items for the carousel" })
      return
    }

    if (validItems.length > 10) {
      setResult({ success: false, error: "Carousel can have at most 10 items" })
      return
    }

    if (!selectedAccountId) {
      setResult({ success: false, error: "Please select an Instagram account" })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Upload files if present
      setUploadingFile(true)
      const processedItems = await Promise.all(
        validItems.map(async (item) => {
          if (item.file) {
            const url = await uploadFile(item.file)
            // Only include the field that has a value
            if (item.file.type.startsWith("image/")) {
              return { imageUrl: url }
            } else {
              return { videoUrl: url }
            }
          }
          // Only include the field that has a value
          if (item.imageUrl) {
            return { imageUrl: item.imageUrl }
          } else if (item.videoUrl) {
            return { videoUrl: item.videoUrl }
          } else {
            return {} // Should not happen due to filter
          }
        })
      )
      setUploadingFile(false)

      // Filter out any empty items (just in case)
      const cleanedItems = processedItems.filter(item => item.imageUrl || item.videoUrl).map(item => {
        // Remove query parameters from Cloudinary URLs (like ?_a=...)
        if (item.imageUrl) {
          try {
            const url = new URL(item.imageUrl)
            url.search = ''
            return { imageUrl: url.toString() }
          } catch {
            return { imageUrl: item.imageUrl }
          }
        }
        if (item.videoUrl) {
          try {
            const url = new URL(item.videoUrl)
            url.search = ''
            return { videoUrl: url.toString() }
          } catch {
            return { videoUrl: item.videoUrl }
          }
        }
        return item
      })

      console.log("Sending carousel items:", cleanedItems)

      const response = await fetch("/api/instagram/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "carousel",
          brandId,
          socialAccountId: selectedAccountId,
          items: cleanedItems,
          caption: carouselCaption || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: `Carousel published successfully! Post ID: ${data.postId}` })
        resetForm()
      } else {
        setResult({ success: false, error: data.error || "Failed to publish carousel" })
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message || "An error occurred" })
    } finally {
      setLoading(false)
      setUploadingFile(false)
    }
  }

  const addCarouselItem = () => {
    if (carouselItems.length < 10) {
      setCarouselItems([...carouselItems, { imageUrl: "", videoUrl: "", file: null, preview: null }])
    }
  }

  const removeCarouselItem = (index: number) => {
    if (carouselItems.length > 2) {
      setCarouselItems(carouselItems.filter((_, i) => i !== index))
    }
  }

  const updateCarouselItem = (index: number, field: "imageUrl" | "videoUrl", value: string) => {
    const newItems = [...carouselItems]
    newItems[index][field] = value

    // If setting imageUrl, clear videoUrl and update preview
    if (field === "imageUrl") {
      newItems[index].videoUrl = ""
      newItems[index].preview = value || null
    }
    // If setting videoUrl, clear imageUrl and preview
    else if (field === "videoUrl") {
      newItems[index].imageUrl = ""
      newItems[index].preview = null
    }

    setCarouselItems(newItems)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Publish Content</h1>
        <p className="text-muted-foreground mt-1">
          Publish images, reels, and carousels to Instagram
        </p>
      </div>

      {/* Account Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="account-select">Instagram Account</Label>
            {loadingAccounts ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading accounts...</span>
              </div>
            ) : accounts.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No Instagram accounts found. Please connect an Instagram account first.
                </AlertDescription>
              </Alert>
            ) : (
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger id="account-select">
                  <SelectValue placeholder="Select an Instagram account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <span>@{account.username}</span>
                        {account.displayName && (
                          <span className="text-muted-foreground">({account.displayName})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Result Alert */}
      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {result.success ? result.message : result.error}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="image" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="image">
            <ImageIcon className="mr-2 h-4 w-4" />
            Image
          </TabsTrigger>
          <TabsTrigger value="reel">
            <Video className="mr-2 h-4 w-4" />
            Reel
          </TabsTrigger>
          <TabsTrigger value="carousel">
            <Images className="mr-2 h-4 w-4" />
            Carousel
          </TabsTrigger>
        </TabsList>

        {/* Image Tab */}
        <TabsContent value="image">
          <Card>
            <CardHeader>
              <CardTitle>Publish Image</CardTitle>
              <CardDescription>
                Share a single image to your Instagram feed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="image-file">Select Image from Computer</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="image-file"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="cursor-pointer"
                  />
                  {imageFile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="text-center text-sm text-muted-foreground">OR</div>

              {/* Choose from Library */}
              <div className="space-y-2">
                <Label>Choose from Media Library</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={openMediaLibrary}
                >
                  <Folder className="mr-2 h-4 w-4" />
                  Browse Library
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">OR</div>

              {/* URL Input */}
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={!!imageFile}
                />
                <p className="text-xs text-muted-foreground">
                  Or provide a public image URL
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-caption">Caption</Label>
                <Textarea
                  id="image-caption"
                  placeholder="Write a caption..."
                  rows={4}
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                />
              </div>

              <Button
                onClick={handlePublishImage}
                disabled={loading || uploadingFile}
                className="w-full"
              >
                {(loading || uploadingFile) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {uploadingFile ? "Uploading..." : loading ? "Publishing..." : "Publish Image"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reel Tab */}
        <TabsContent value="reel">
          <Card>
            <CardHeader>
              <CardTitle>Publish Reel</CardTitle>
              <CardDescription>
                Share a video as a Reel (video will be processed by Instagram)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video File Upload */}
              <div className="space-y-2">
                <Label htmlFor="reel-video-file">Select Video from Computer</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="reel-video-file"
                    type="file"
                    accept="video/*"
                    onChange={handleReelVideoFileChange}
                    className="cursor-pointer"
                  />
                  {reelVideoFile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setReelVideoFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {reelVideoFile && (
                  <p className="text-sm text-green-600">
                    Selected: {reelVideoFile.name}
                  </p>
                )}
              </div>

              <div className="text-center text-sm text-muted-foreground">OR</div>

              {/* Video URL */}
              <div className="space-y-2">
                <Label htmlFor="reel-video-url">Video URL</Label>
                <Input
                  id="reel-video-url"
                  placeholder="https://example.com/video.mp4"
                  value={reelVideoUrl}
                  onChange={(e) => setReelVideoUrl(e.target.value)}
                  disabled={!!reelVideoFile}
                />
                <p className="text-xs text-muted-foreground">
                  Or provide a public video URL
                </p>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label>Cover Image (optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleReelCoverFileChange}
                    className="cursor-pointer"
                  />
                  {reelCoverFile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setReelCoverFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {!reelCoverFile && (
                  <Input
                    placeholder="https://example.com/thumbnail.jpg"
                    value={reelCoverUrl}
                    onChange={(e) => setReelCoverUrl(e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reel-caption">Caption</Label>
                <Textarea
                  id="reel-caption"
                  placeholder="Write a caption..."
                  rows={4}
                  value={reelCaption}
                  onChange={(e) => setReelCaption(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="share-to-feed"
                  checked={shareToFeed}
                  onChange={(e) => setShareToFeed(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="share-to-feed" className="cursor-pointer">
                  Share to feed (also appears in main feed, not just Reels)
                </Label>
              </div>

              <Button
                onClick={handlePublishReel}
                disabled={loading || uploadingFile}
                className="w-full"
              >
                {(loading || uploadingFile) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {uploadingFile ? "Uploading..." : loading ? "Publishing..." : "Publish Reel"}
              </Button>

              <p className="text-xs text-muted-foreground">
                Note: Video processing may take up to 1 minute
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Carousel Tab */}
        <TabsContent value="carousel">
          <Card>
            <CardHeader>
              <CardTitle>Publish Carousel</CardTitle>
              <CardDescription>
                Share multiple images/videos in a single post (2-10 items)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {carouselItems.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Item {index + 1}</Label>
                    {carouselItems.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCarouselItem(index)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>

                  {/* Preview if available */}
                  {item.preview && (
                    <div className="relative">
                      <img
                        src={item.preview}
                        alt={`Preview ${index + 1}`}
                        className="max-h-48 rounded-lg border w-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                        onClick={() => {
                          const newItems = [...carouselItems]
                          newItems[index].file = null
                          newItems[index].preview = null
                          newItems[index].imageUrl = ""
                          setCarouselItems(newItems)
                        }}
                      >
                        <X className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Select Image from Computer</Label>
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleCarouselFileChange(index, e)}
                      className="cursor-pointer"
                      disabled={!!item.imageUrl && !item.file}
                    />
                  </div>

                  <div className="text-center text-sm text-muted-foreground">OR</div>

                  {/* Choose from Library */}
                  <div className="space-y-2">
                    <Label>Choose from Media Library</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => openMediaLibraryForCarousel(index)}
                      disabled={!!item.file}
                    >
                      <Folder className="mr-2 h-4 w-4" />
                      Browse Library
                    </Button>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">OR</div>

                  {/* URL Inputs */}
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={item.imageUrl}
                      onChange={(e) => updateCarouselItem(index, "imageUrl", e.target.value)}
                      disabled={!!item.file}
                    />
                  </div>

                  <div className="text-center text-sm text-muted-foreground">OR</div>

                  <div className="space-y-2">
                    <Label>Video URL</Label>
                    <Input
                      placeholder="https://example.com/video.mp4"
                      value={item.videoUrl}
                      onChange={(e) => updateCarouselItem(index, "videoUrl", e.target.value)}
                      disabled={!!item.file}
                    />
                  </div>
                </div>
              ))}

              {carouselItems.length < 10 && (
                <Button
                  variant="outline"
                  onClick={addCarouselItem}
                  className="w-full"
                >
                  Add Item
                </Button>
              )}

              <div className="space-y-2">
                <Label htmlFor="carousel-caption">Caption</Label>
                <Textarea
                  id="carousel-caption"
                  placeholder="Write a caption..."
                  rows={4}
                  value={carouselCaption}
                  onChange={(e) => setCarouselCaption(e.target.value)}
                />
              </div>

              <Button
                onClick={handlePublishCarousel}
                disabled={loading || uploadingFile}
                className="w-full"
              >
                {(loading || uploadingFile) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {uploadingFile ? "Uploading..." : loading ? "Publishing..." : "Publish Carousel"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• You can choose images from your Media Library or upload new ones</p>
          <p>• Images should be at least 320px wide</p>
          <p>• Videos must be H.264 codec, AAC audio, 3gp/mov/mp4 format</p>
          <p>• Reels: 4-90 seconds, vertical orientation recommended</p>
          <p>• Feed videos: 3-60 seconds</p>
          <p>• Caption max: 2,200 characters</p>
          <p>• You need the instagram_content_publish permission</p>
          <p>• Aspect ratio: 4:5 to 1.91:1 (cuadrado 1:1 recomendado)</p>
        </CardContent>
      </Card>

      {/* Media Library Modal */}
      <Dialog open={showMediaLibrary} onOpenChange={() => {
        setShowMediaLibrary(false)
        setCarouselItemIndexForLibrary(null)
      }}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {carouselItemIndexForLibrary !== null
                ? `Select Image for Item ${carouselItemIndexForLibrary + 1}`
                : "Media Library - Select an Image"}
            </DialogTitle>
          </DialogHeader>

          {loadingLibrary ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : libraryImages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Folder className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="mb-2">No images in your library yet</p>
              <Button variant="outline" onClick={() => window.open(`/dashboard/${brandId}/media`, '_blank')}>
                Go to Media Library
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {libraryImages.map((image: any) => (
                <button
                  key={image.id}
                  onClick={() => selectFromLibrary(image.url)}
                  className="group relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-all cursor-pointer"
                >
                  <img
                    src={image.thumbnail}
                    alt="Library image"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                    {image.width}x{image.height}
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
