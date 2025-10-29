"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Image as ImageIcon,
  Video,
  Layout,
  Film,
  Send,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  MessageSquare,
  BarChart3,
  InfoIcon,
} from "lucide-react"
import { publishPhoto, publishVideo, publishCarousel, publishReel } from "./actions"

export default function PublishPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.brandId as string

  // Photo state
  const [photoUrl, setPhotoUrl] = useState("")
  const [photoCaption, setPhotoCaption] = useState("")
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoResult, setPhotoResult] = useState<any>(null)

  // Video state
  const [videoUrl, setVideoUrl] = useState("")
  const [videoCaption, setVideoCaption] = useState("")
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoResult, setVideoResult] = useState<any>(null)

  // Carousel state
  const [carouselItems, setCarouselItems] = useState<Array<{ type: "IMAGE" | "VIDEO"; url: string }>>([
    { type: "IMAGE", url: "" },
  ])
  const [carouselCaption, setCarouselCaption] = useState("")
  const [carouselLoading, setCarouselLoading] = useState(false)
  const [carouselResult, setCarouselResult] = useState<any>(null)

  // Reel state
  const [reelUrl, setReelUrl] = useState("")
  const [reelCaption, setReelCaption] = useState("")
  const [reelCoverUrl, setReelCoverUrl] = useState("")
  const [reelLoading, setReelLoading] = useState(false)
  const [reelResult, setReelResult] = useState<any>(null)

  const handlePublishPhoto = async () => {
    if (!photoUrl) {
      setPhotoResult({ success: false, error: "Please provide an image URL" })
      return
    }

    setPhotoLoading(true)
    setPhotoResult(null)

    const result = await publishPhoto(brandId, photoUrl, photoCaption)
    setPhotoResult(result)
    setPhotoLoading(false)

    if (result.success) {
      setTimeout(() => {
        setPhotoUrl("")
        setPhotoCaption("")
        setPhotoResult(null)
      }, 3000)
    }
  }

  const handlePublishVideo = async () => {
    if (!videoUrl) {
      setVideoResult({ success: false, error: "Please provide a video URL" })
      return
    }

    setVideoLoading(true)
    setVideoResult(null)

    const result = await publishVideo(brandId, videoUrl, videoCaption)
    setVideoResult(result)
    setVideoLoading(false)

    if (result.success) {
      setTimeout(() => {
        setVideoUrl("")
        setVideoCaption("")
        setVideoResult(null)
      }, 3000)
    }
  }

  const handlePublishCarousel = async () => {
    const validItems = carouselItems.filter((item) => item.url.trim() !== "")

    if (validItems.length < 2) {
      setCarouselResult({ success: false, error: "Carousel must have at least 2 items" })
      return
    }

    if (validItems.length > 10) {
      setCarouselResult({ success: false, error: "Carousel can have maximum 10 items" })
      return
    }

    setCarouselLoading(true)
    setCarouselResult(null)

    const result = await publishCarousel(brandId, validItems, carouselCaption)
    setCarouselResult(result)
    setCarouselLoading(false)

    if (result.success) {
      setTimeout(() => {
        setCarouselItems([{ type: "IMAGE", url: "" }])
        setCarouselCaption("")
        setCarouselResult(null)
      }, 3000)
    }
  }

  const handlePublishReel = async () => {
    if (!reelUrl) {
      setReelResult({ success: false, error: "Please provide a video URL" })
      return
    }

    setReelLoading(true)
    setReelResult(null)

    const result = await publishReel(brandId, reelUrl, reelCaption, reelCoverUrl || undefined)
    setReelResult(result)
    setReelLoading(false)

    if (result.success) {
      setTimeout(() => {
        setReelUrl("")
        setReelCaption("")
        setReelCoverUrl("")
        setReelResult(null)
      }, 3000)
    }
  }

  const addCarouselItem = () => {
    if (carouselItems.length < 10) {
      setCarouselItems([...carouselItems, { type: "IMAGE", url: "" }])
    }
  }

  const removeCarouselItem = (index: number) => {
    if (carouselItems.length > 1) {
      setCarouselItems(carouselItems.filter((_, i) => i !== index))
    }
  }

  const updateCarouselItem = (index: number, field: "type" | "url", value: any) => {
    const newItems = [...carouselItems]
    newItems[index][field] = value
    setCarouselItems(newItems)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Publish Content</h1>
          <p className="text-muted-foreground mt-1">
            Create and publish content to Instagram
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram`)}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Feed
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram/comments`)}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Comments
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram/analytics`)}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Analytics
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-primary/10 text-primary hover:bg-primary/20"
        >
          <Send className="mr-2 h-4 w-4" />
          Publish
        </Button>
      </div>

      {/* Permission Info Banner */}
      <Alert className="border-blue-500/50 bg-blue-500/5">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Permissions Required</AlertTitle>
        <AlertDescription>
          To publish content, you need the <code>instagram_content_publish</code> and{" "}
          <code>pages_manage_posts</code> permissions. Update your app permissions in Meta Business settings.
        </AlertDescription>
      </Alert>

      {/* Publishing Tabs */}
      <Tabs defaultValue="photo" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="photo">
            <ImageIcon className="mr-2 h-4 w-4" />
            Photo
          </TabsTrigger>
          <TabsTrigger value="video">
            <Video className="mr-2 h-4 w-4" />
            Video
          </TabsTrigger>
          <TabsTrigger value="carousel">
            <Layout className="mr-2 h-4 w-4" />
            Carousel
          </TabsTrigger>
          <TabsTrigger value="reel">
            <Film className="mr-2 h-4 w-4" />
            Reel
          </TabsTrigger>
        </TabsList>

        {/* Photo Tab */}
        <TabsContent value="photo">
          <Card>
            <CardHeader>
              <CardTitle>Publish Photo</CardTitle>
              <CardDescription>
                Upload and publish a single photo to your Instagram feed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photo-url">Image URL *</Label>
                <Input
                  id="photo-url"
                  placeholder="https://example.com/image.jpg"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Publicly accessible URL to your image (JPEG or PNG, max 8MB, ratio 4:5 to 1.91:1)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo-caption">Caption (optional)</Label>
                <Textarea
                  id="photo-caption"
                  placeholder="Write a caption... #hashtags"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  rows={4}
                  maxLength={2200}
                />
                <p className="text-xs text-muted-foreground">
                  {photoCaption.length}/2,200 characters
                </p>
              </div>

              {photoResult && (
                <Alert variant={photoResult.success ? "default" : "destructive"}>
                  {photoResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{photoResult.success ? "Success!" : "Error"}</AlertTitle>
                  <AlertDescription>
                    {photoResult.message || photoResult.error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handlePublishPhoto}
                disabled={photoLoading || !photoUrl}
                className="w-full"
              >
                {photoLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publish Photo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Tab */}
        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>Publish Video</CardTitle>
              <CardDescription>
                Upload and publish a video to your Instagram feed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL *</Label>
                <Input
                  id="video-url"
                  placeholder="https://example.com/video.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Publicly accessible URL to your video (MP4, max 100MB, 3-60 seconds)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video-caption">Caption (optional)</Label>
                <Textarea
                  id="video-caption"
                  placeholder="Write a caption... #hashtags"
                  value={videoCaption}
                  onChange={(e) => setVideoCaption(e.target.value)}
                  rows={4}
                  maxLength={2200}
                />
                <p className="text-xs text-muted-foreground">
                  {videoCaption.length}/2,200 characters
                </p>
              </div>

              {videoResult && (
                <Alert variant={videoResult.success ? "default" : "destructive"}>
                  {videoResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{videoResult.success ? "Success!" : "Error"}</AlertTitle>
                  <AlertDescription>
                    {videoResult.message || videoResult.error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handlePublishVideo}
                disabled={videoLoading || !videoUrl}
                className="w-full"
              >
                {videoLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing... (this may take a minute)
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publish Video
                  </>
                )}
              </Button>

              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Video publishing takes longer as Instagram needs to process the video first.
                  This can take 1-2 minutes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Carousel Tab */}
        <TabsContent value="carousel">
          <Card>
            <CardHeader>
              <CardTitle>Publish Carousel</CardTitle>
              <CardDescription>
                Upload and publish multiple images/videos (2-10 items)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Carousel Items (2-10 items required) *</Label>
                {carouselItems.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={item.type}
                      onChange={(e) =>
                        updateCarouselItem(index, "type", e.target.value as "IMAGE" | "VIDEO")
                      }
                    >
                      <option value="IMAGE">Image</option>
                      <option value="VIDEO">Video</option>
                    </select>
                    <Input
                      placeholder={`${item.type === "IMAGE" ? "Image" : "Video"} URL`}
                      value={item.url}
                      onChange={(e) => updateCarouselItem(index, "url", e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeCarouselItem(index)}
                      disabled={carouselItems.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addCarouselItem}
                  disabled={carouselItems.length >= 10}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item ({carouselItems.length}/10)
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carousel-caption">Caption (optional)</Label>
                <Textarea
                  id="carousel-caption"
                  placeholder="Write a caption... #hashtags"
                  value={carouselCaption}
                  onChange={(e) => setCarouselCaption(e.target.value)}
                  rows={4}
                  maxLength={2200}
                />
                <p className="text-xs text-muted-foreground">
                  {carouselCaption.length}/2,200 characters
                </p>
              </div>

              {carouselResult && (
                <Alert variant={carouselResult.success ? "default" : "destructive"}>
                  {carouselResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{carouselResult.success ? "Success!" : "Error"}</AlertTitle>
                  <AlertDescription>
                    {carouselResult.message || carouselResult.error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handlePublishCarousel}
                disabled={carouselLoading}
                className="w-full"
              >
                {carouselLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing... (this may take a while)
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publish Carousel
                  </>
                )}
              </Button>

              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Carousel publishing takes longer, especially with videos. Each video must be
                  processed before the carousel can be published.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reel Tab */}
        <TabsContent value="reel">
          <Card>
            <CardHeader>
              <CardTitle>Publish Reel</CardTitle>
              <CardDescription>
                Upload and publish a short-form vertical video (Reel)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reel-url">Video URL *</Label>
                <Input
                  id="reel-url"
                  placeholder="https://example.com/reel.mp4"
                  value={reelUrl}
                  onChange={(e) => setReelUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Publicly accessible URL to your vertical video (9:16 ratio, 15-90 seconds)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reel-cover">Cover Image URL (optional)</Label>
                <Input
                  id="reel-cover"
                  placeholder="https://example.com/cover.jpg"
                  value={reelCoverUrl}
                  onChange={(e) => setReelCoverUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Custom thumbnail for your Reel
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reel-caption">Caption (optional)</Label>
                <Textarea
                  id="reel-caption"
                  placeholder="Write a caption... #hashtags"
                  value={reelCaption}
                  onChange={(e) => setReelCaption(e.target.value)}
                  rows={4}
                  maxLength={2200}
                />
                <p className="text-xs text-muted-foreground">
                  {reelCaption.length}/2,200 characters
                </p>
              </div>

              {reelResult && (
                <Alert variant={reelResult.success ? "default" : "destructive"}>
                  {reelResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{reelResult.success ? "Success!" : "Error"}</AlertTitle>
                  <AlertDescription>
                    {reelResult.message || reelResult.error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handlePublishReel}
                disabled={reelLoading || !reelUrl}
                className="w-full"
              >
                {reelLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing... (this may take a minute)
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publish Reel
                  </>
                )}
              </Button>

              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Reel publishing takes 1-2 minutes as Instagram needs to process the video.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
