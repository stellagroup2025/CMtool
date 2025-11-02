"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  Heart,
  MessageSquare,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  UserPlus,
  Calendar,
  BarChart3,
  Send,
  Inbox,
  AtSign,
  Video,
} from "lucide-react"
import { getInstagramData, getMediaInsights } from "./actions"
import { format } from "date-fns"

export default function InstagramPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.brandId as string

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<any>(null)
  const [mediaDetailsLoading, setMediaDetailsLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    const result = await getInstagramData(brandId)

    if (result.success) {
      setData(result)
    } else {
      setError(result.error || "Failed to load Instagram data")
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [brandId])

  const handleMediaClick = async (media: any) => {
    setSelectedMedia(media)
    setMediaDetailsLoading(true)

    const result = await getMediaInsights(brandId, media.id)
    if (result.success) {
      setSelectedMedia(result.data)
    }
    setMediaDetailsLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Instagram</h1>
          <p className="text-muted-foreground mt-1">View your Instagram analytics and posts</p>
        </div>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Instagram Data</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const account = data?.account
  const media = data?.media || []

  // Calculate engagement rate
  const totalEngagement = media.reduce(
    (sum: number, m: any) => sum + (m.like_count || 0) + (m.comments_count || 0),
    0
  )
  const avgEngagement = media.length > 0 ? totalEngagement / media.length : 0
  const engagementRate = account?.followersCount
    ? ((avgEngagement / account.followersCount) * 100).toFixed(2)
    : "0"

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instagram Analytics</h1>
          <p className="text-muted-foreground mt-1">@{account?.username || "stellagroup_"}</p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <Button
          variant="secondary"
          size="sm"
          className="bg-primary/10 text-primary hover:bg-primary/20"
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
          <Inbox className="mr-2 h-4 w-4" />
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
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram/stories`)}
        >
          <Video className="mr-2 h-4 w-4" />
          Stories
        </Button>
      </div>

      {/* Account Overview */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-2">
              <AvatarImage src={account?.profilePicture} alt={account?.username} />
              <AvatarFallback className="text-2xl">
                {account?.username?.charAt(0).toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{account?.name || "Stella Group"}</h2>
                <p className="text-muted-foreground">@{account?.username || "stellagroup_"}</p>
                {account?.biography && (
                  <p className="text-sm mt-2 max-w-2xl">{account.biography}</p>
                )}
                {account?.website && (
                  <a
                    href={account.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-1 inline-flex items-center gap-1"
                  >
                    {account.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-bold">{(account?.mediaCount || 0).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {(account?.followersCount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {(account?.followsCount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(account?.mediaCount || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {media.length} posts shown
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(account?.followersCount || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(account?.followsCount || 0).toLocaleString()} following
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Engagement
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagement.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">per post</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Engagement Rate
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">of followers</p>
          </CardContent>
        </Card>
      </div>

      {/* Posts Grid */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
          <CardDescription>
            {media.length} most recent posts from your Instagram account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {media.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No posts found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((post: any) => (
                <button
                  key={post.id}
                  onClick={() => handleMediaClick(post)}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-border/50 hover:border-primary transition-all cursor-pointer"
                >
                  <img
                    src={post.media_url || post.thumbnail_url}
                    alt={post.caption?.substring(0, 100) || "Instagram post"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {(post.like_count || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {(post.comments_count || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {post.media_type === "VIDEO" && (
                    <Badge className="absolute top-2 right-2 bg-black/70">Video</Badge>
                  )}
                  {post.media_type === "CAROUSEL_ALBUM" && (
                    <Badge className="absolute top-2 right-2 bg-black/70">Album</Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Details Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>

          {selectedMedia && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={selectedMedia.media_url || selectedMedia.thumbnail_url}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={account?.profilePicture} />
                        <AvatarFallback>
                          {account?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{account?.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedMedia.timestamp &&
                            format(new Date(selectedMedia.timestamp), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    {selectedMedia.caption && (
                      <p className="text-sm whitespace-pre-wrap">{selectedMedia.caption}</p>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">Likes</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {(selectedMedia.like_count || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">Comments</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {(selectedMedia.comments_count || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Insights */}
                  {selectedMedia.insights && selectedMedia.insights.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Insights</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedMedia.insights.map((insight: any) => (
                          <div key={insight.name} className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground capitalize">
                              {insight.name}
                            </p>
                            <p className="text-lg font-semibold">
                              {insight.values[0]?.value?.toLocaleString() || "N/A"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Link to Instagram */}
                  {selectedMedia.permalink && (
                    <Button asChild variant="outline" className="w-full">
                      <a
                        href={selectedMedia.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Instagram
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
