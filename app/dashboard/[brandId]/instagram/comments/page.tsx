"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Heart,
  Search,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  Users,
  Filter,
  BarChart3,
  Image as ImageIcon,
  Send,
} from "lucide-react"
import { getAllRecentComments, getCommentStats } from "./actions"
import { format, formatDistanceToNow } from "date-fns"

export default function CommentsPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.brandId as string

  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)

    const [commentsResult, statsResult] = await Promise.all([
      getAllRecentComments(brandId, 100),
      getCommentStats(brandId),
    ])

    if (commentsResult.success) {
      setComments(commentsResult.comments || [])
    } else {
      setError(commentsResult.error || "Failed to load comments")
    }

    if (statsResult.success) {
      setStats(statsResult.stats)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [brandId])

  const filteredComments = comments.filter((comment) =>
    comment.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <h1 className="text-3xl font-bold">Comments</h1>
          <p className="text-muted-foreground mt-1">Manage and analyze your Instagram comments</p>
        </div>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Comments</CardTitle>
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comments</h1>
          <p className="text-muted-foreground mt-1">
            Manage and analyze your Instagram comments
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
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
          variant="secondary"
          size="sm"
          className="bg-primary/10 text-primary hover:bg-primary/20"
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Comments
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalComments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              from {stats?.totalPosts || 0} posts
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. per Post
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgComments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">comments per post</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Posts with Comments
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.postsWithComments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {stats?.totalPosts || 0} total
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Comments
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">loaded</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search comments or users..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Comments List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Comments ({filteredComments.length})
          </TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="most-liked">Most Liked</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredComments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No comments match your search" : "No comments found"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredComments.map((comment) => (
                <Card key={comment.id} className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {/* Post Thumbnail */}
                      {comment.media?.thumbnail && (
                        <div className="flex-shrink-0">
                          <img
                            src={comment.media.thumbnail}
                            alt="Post"
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        </div>
                      )}

                      {/* Comment Content */}
                      <div className="flex-1 space-y-3">
                        {/* User Info */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {comment.username?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">@{comment.username}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.timestamp), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {comment.like_count > 0 && (
                              <Badge variant="secondary" className="gap-1">
                                <Heart className="h-3 w-3" />
                                {comment.like_count}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Comment Text */}
                        <p className="text-sm">{comment.text}</p>

                        {/* Post Info */}
                        {comment.media && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>On:</span>
                            <a
                              href={comment.media.permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-foreground inline-flex items-center gap-1"
                            >
                              {comment.media.caption?.substring(0, 50) || "Post"}
                              {comment.media.caption && comment.media.caption.length > 50 && "..."}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" disabled>
                            Reply
                            <Badge className="ml-2" variant="secondary">
                              Soon
                            </Badge>
                          </Button>
                          <Button variant="ghost" size="sm" disabled>
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Showing comments from the last 7 days
          </p>
          {/* Same structure as "all" but filtered by date */}
        </TabsContent>

        <TabsContent value="most-liked" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Comments sorted by number of likes
          </p>
          {/* Same structure as "all" but sorted by likes */}
        </TabsContent>
      </Tabs>

      {/* Info Banner */}
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Want to reply to comments?
          </CardTitle>
          <CardDescription>
            To reply to comments, you need the <code>instagram_manage_comments</code> permission.
            Update your app permissions in Meta Business settings.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
