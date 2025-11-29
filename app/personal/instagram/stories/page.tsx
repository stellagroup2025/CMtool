"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Film as StoryIcon,
  Image as ImageIcon,
  Video,
  Send,
  Plus,
  RefreshCw,
  Eye,
  MessageSquare,
  TrendingUp,
  Calendar,
  AtSign,
  Inbox as InboxIcon,
  BarChart3,
  Loader2,
  CheckCircle,
  AlertCircle,
  InfoIcon,
} from "lucide-react"
import { getActiveStories, getStoryInsights, publishStory } from "./actions"
import { formatDistanceToNow } from "date-fns"

export default function StoriesPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.brandId as string

  const [loading, setLoading] = useState(true)
  const [stories, setStories] = useState<any[]>([])
  const [selectedStory, setSelectedStory] = useState<any>(null)
  const [storyInsights, setStoryInsights] = useState<any>(null)

  // Publish dialog
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [mediaUrl, setMediaUrl] = useState("")
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE")
  const [publishLoading, setPublishLoading] = useState(false)
  const [publishResult, setPublishResult] = useState<any>(null)

  const loadStories = async () => {
    setLoading(true)

    const result = await getActiveStories(brandId)
    if (result.success) {
      setStories(result.stories || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadStories()
  }, [brandId])

  const handleViewInsights = async (story: any) => {
    setSelectedStory(story)
    setStoryInsights(null)

    const result = await getStoryInsights(brandId, story.id)
    setStoryInsights(result)
  }

  const handlePublishStory = async () => {
    if (!mediaUrl) {
      setPublishResult({ success: false, error: "Please provide a media URL" })
      return
    }

    setPublishLoading(true)
    setPublishResult(null)

    const result = await publishStory(brandId, mediaUrl, mediaType)
    setPublishResult(result)
    setPublishLoading(false)

    if (result.success) {
      setTimeout(() => {
        setShowPublishDialog(false)
        setMediaUrl("")
        setPublishResult(null)
        loadStories()
      }, 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stories</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view your Instagram Stories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadStories} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowPublishDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Publish Story
          </Button>
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
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram/publish`)}
        >
          <Send className="mr-2 h-4 w-4" />
          Publish
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram/schedule`)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Schedule
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram/inbox`)}
        >
          <InboxIcon className="mr-2 h-4 w-4" />
          Inbox
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram/mentions`)}
        >
          <AtSign className="mr-2 h-4 w-4" />
          Mentions
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-primary/10 text-primary hover:bg-primary/20"
        >
          <StoryIcon className="mr-2 h-4 w-4" />
          Stories
        </Button>
      </div>

      {/* Permission Info */}
      <Alert className="border-blue-500/50 bg-blue-500/5">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Permissions Required</AlertTitle>
        <AlertDescription>
          To publish stories, you need the <code>instagram_content_publish</code> permission.
          For insights, you need <code>instagram_manage_insights</code>.
        </AlertDescription>
      </Alert>

      {/* Active Stories */}
      <Card>
        <CardHeader>
          <CardTitle>Active Stories (Last 24h)</CardTitle>
          <CardDescription>
            {stories.length} active stories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[9/16] rounded-lg" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <StoryIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No active stories</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowPublishDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Publish Your First Story
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stories.map((story) => (
                <div key={story.id} className="group cursor-pointer" onClick={() => handleViewInsights(story)}>
                  <div className="aspect-[9/16] rounded-lg overflow-hidden border-2 border-primary/50 relative">
                    <img
                      src={story.thumbnail_url || story.media_url}
                      alt="Story"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    {story.media_type === "VIDEO" && (
                      <Badge className="absolute top-2 right-2 bg-black/70">
                        <Video className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(story.timestamp), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Story Insights Dialog */}
      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Story Insights</DialogTitle>
          </DialogHeader>

          {selectedStory && (
            <div className="space-y-4">
              <div className="aspect-[9/16] rounded-lg overflow-hidden max-w-xs mx-auto">
                <img
                  src={selectedStory.thumbnail_url || selectedStory.media_url}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
              </div>

              {storyInsights ? (
                storyInsights.hasInsights ? (
                  <div className="grid grid-cols-2 gap-3">
                    {storyInsights.insights.map((insight: any) => (
                      <div key={insight.name} className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground capitalize">
                          {insight.name.replace(/_/g, " ")}
                        </p>
                        <p className="text-2xl font-bold">
                          {insight.values[0]?.value || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertDescription>{storyInsights.message}</AlertDescription>
                  </Alert>
                )
              ) : (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Publish Story Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Story</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Media Type *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={mediaType === "IMAGE" ? "default" : "outline"}
                  onClick={() => setMediaType("IMAGE")}
                  className="flex flex-col h-auto py-3"
                >
                  <ImageIcon className="h-5 w-5 mb-1" />
                  <span className="text-xs">Photo</span>
                </Button>
                <Button
                  variant={mediaType === "VIDEO" ? "default" : "outline"}
                  onClick={() => setMediaType("VIDEO")}
                  className="flex flex-col h-auto py-3"
                >
                  <Video className="h-5 w-5 mb-1" />
                  <span className="text-xs">Video</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="story-url">Media URL *</Label>
              <Input
                id="story-url"
                placeholder="https://example.com/image.jpg"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Publicly accessible URL to your {mediaType.toLowerCase()}
                {mediaType === "IMAGE"
                  ? " (JPEG or PNG, max 8MB, 9:16 ratio recommended)"
                  : " (MP4, max 100MB, 3-60 seconds, 9:16 ratio)"}
              </p>
            </div>

            {publishResult && (
              <Alert variant={publishResult.success ? "default" : "destructive"}>
                {publishResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {publishResult.message || publishResult.error}
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Stories disappear after 24 hours. They appear in a vertical format (9:16 ratio).
                {mediaType === "VIDEO" && " Video processing may take 1-2 minutes."}
              </AlertDescription>
            </Alert>

            <Button
              onClick={handlePublishStory}
              disabled={publishLoading || !mediaUrl}
              className="w-full"
            >
              {publishLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <StoryIcon className="mr-2 h-4 w-4" />
                  Publish Story
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
