"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Copy,
  Send,
  Image as ImageIcon,
  Video,
  Layout,
  Film,
  MessageSquare,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  InfoIcon,
} from "lucide-react"
import {
  createScheduledPost,
  getScheduledPosts,
  updateScheduledPost,
  deleteScheduledPost,
  duplicatePost,
  getPostsCalendarStats,
} from "./actions"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"

export default function SchedulePage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.brandId as string

  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<any[]>([])
  const [calendarStats, setCalendarStats] = useState<any>({})
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Create post dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createResult, setCreateResult] = useState<any>(null)

  // Form state
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO" | "CAROUSEL" | "REEL">("IMAGE")
  const [content, setContent] = useState("")
  const [mediaUrls, setMediaUrls] = useState<string[]>([""])
  const [hashtags, setHashtags] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")

  // Edit dialog
  const [editingPost, setEditingPost] = useState<any>(null)

  const loadData = async () => {
    setLoading(true)

    const startDate = startOfMonth(currentMonth)
    const endDate = endOfMonth(currentMonth)

    const [postsResult, statsResult] = await Promise.all([
      getScheduledPosts(brandId, { startDate, endDate }),
      getPostsCalendarStats(brandId, currentMonth.getMonth() + 1, currentMonth.getFullYear()),
    ])

    if (postsResult.success) {
      setPosts(postsResult.posts || [])
    }

    if (statsResult.success) {
      setCalendarStats(statsResult.postsByDate || {})
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [brandId, currentMonth])

  const handleCreatePost = async () => {
    if (!content || !scheduledDate || !scheduledTime) {
      setCreateResult({ success: false, error: "Please fill all required fields" })
      return
    }

    const validMediaUrls = mediaUrls.filter((url) => url.trim() !== "")
    if (validMediaUrls.length === 0) {
      setCreateResult({ success: false, error: "Please provide at least one media URL" })
      return
    }

    setCreateLoading(true)
    setCreateResult(null)

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
    const hashtagsArray = hashtags
      .split(/[\s,]+/)
      .filter((tag) => tag.trim() !== "")
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))

    const result = await createScheduledPost(brandId, {
      content,
      mediaUrls: validMediaUrls,
      hashtags: hashtagsArray,
      scheduledAt: scheduledDateTime,
      mediaType,
    })

    setCreateResult(result)
    setCreateLoading(false)

    if (result.success) {
      setTimeout(() => {
        setShowCreateDialog(false)
        setContent("")
        setMediaUrls([""])
        setHashtags("")
        setScheduledDate("")
        setScheduledTime("")
        setCreateResult(null)
        loadData()
      }, 2000)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this scheduled post?")) return

    const result = await deleteScheduledPost(postId)
    if (result.success) {
      loadData()
    }
  }

  const handleDuplicatePost = async (postId: string) => {
    const result = await duplicatePost(postId)
    if (result.success) {
      loadData()
    }
  }

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }

  const getPostsForDate = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd")
    return calendarStats[dateKey] || []
  }

  const postsForSelectedDate = posts.filter((post) =>
    post.scheduledAt && isSameDay(new Date(post.scheduledAt), selectedDate)
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedule Posts</h1>
          <p className="text-muted-foreground mt-1">
            Plan and schedule your Instagram content
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Post
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
          variant="secondary"
          size="sm"
          className="bg-primary/10 text-primary hover:bg-primary/20"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Schedule
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Calendar</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-[150px] text-center font-semibold">
                  {format(currentMonth, "MMMM yyyy")}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {getDaysInMonth().map((date) => {
                const postsOnDate = getPostsForDate(date)
                const isSelected = isSameDay(date, selectedDate)
                const isToday = isSameDay(date, new Date())

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      aspect-square p-2 rounded-lg border transition-all
                      ${isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}
                      ${isToday ? "font-bold" : ""}
                      ${!isSameMonth(date, currentMonth) ? "opacity-50" : ""}
                    `}
                  >
                    <div className="text-sm">{format(date, "d")}</div>
                    {postsOnDate.length > 0 && (
                      <div className="flex justify-center mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Posts for selected date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {format(selectedDate, "MMMM d, yyyy")}
            </CardTitle>
            <CardDescription>
              {postsForSelectedDate.length} scheduled posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {postsForSelectedDate.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p>No posts scheduled</p>
                </div>
              ) : (
                postsForSelectedDate.map((post) => (
                  <div key={post.id} className="border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(post.scheduledAt), "h:mm a")}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {post.status}
                          </Badge>
                        </div>
                        {post.items[0] && (
                          <p className="text-sm line-clamp-2">
                            {post.items[0].content}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicatePost(post.id)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Scheduled Posts */}
      <Card>
        <CardHeader>
          <CardTitle>All Scheduled Posts</CardTitle>
          <CardDescription>
            {posts.length} posts in queue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No scheduled posts</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Your First Post
                </Button>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(post.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        <Badge variant={post.status === "SCHEDULED" ? "default" : "secondary"}>
                          {post.status}
                        </Badge>
                      </div>
                      {post.items[0] && (
                        <>
                          <p className="text-sm mb-2">{post.items[0].content}</p>
                          {post.items[0].hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.items[0].hashtags.map((tag: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicatePost(post.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Post Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Media Type *</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "IMAGE" as const, icon: ImageIcon, label: "Photo" },
                  { value: "VIDEO" as const, icon: Video, label: "Video" },
                  { value: "CAROUSEL" as const, icon: Layout, label: "Carousel" },
                  { value: "REEL" as const, icon: Film, label: "Reel" },
                ].map((type) => (
                  <Button
                    key={type.value}
                    variant={mediaType === type.value ? "default" : "outline"}
                    onClick={() => setMediaType(type.value)}
                    className="flex flex-col h-auto py-3"
                  >
                    <type.icon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Caption *</Label>
              <Textarea
                id="content"
                placeholder="Write your caption..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                maxLength={2200}
              />
              <p className="text-xs text-muted-foreground">{content.length}/2,200 characters</p>
            </div>

            <div className="space-y-2">
              <Label>Media URLs *</Label>
              {mediaUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...mediaUrls]
                      newUrls[index] = e.target.value
                      setMediaUrls(newUrls)
                    }}
                  />
                  {mediaUrls.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {mediaType === "CAROUSEL" && mediaUrls.length < 10 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMediaUrls([...mediaUrls, ""])}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Media ({mediaUrls.length}/10)
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hashtags">Hashtags (optional)</Label>
              <Input
                id="hashtags"
                placeholder="#travel #photography #beautiful"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>

            {createResult && (
              <Alert variant={createResult.success ? "default" : "destructive"}>
                {createResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {createResult.message || createResult.error}
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Note: Scheduled posts will be stored but automatic publishing requires a background
                worker to be set up. For now, you'll need to manually publish at the scheduled time.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleCreatePost}
              disabled={createLoading}
              className="w-full"
            >
              {createLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Post
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
