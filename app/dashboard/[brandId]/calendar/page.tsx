"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { ChevronLeft, ChevronRight, Clock, ImageIcon } from "lucide-react"
import { mockBrands, mockPosts } from "@/lib/mock-data"

export default function CalendarPage() {
  const params = useParams()
  const brandId = params.brandId as string
  const brand = mockBrands.find((b) => b.id === brandId)

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())

  if (!brand) {
    return <div>Brand not found</div>
  }

  const scheduledPosts = mockPosts.filter((p) => p.brandId === brandId && p.status === "scheduled")

  // Get posts for selected date
  const postsForSelectedDate = selectedDate
    ? scheduledPosts.filter((post) => {
        const postDate = new Date(post.scheduledFor)
        return (
          postDate.getDate() === selectedDate.getDate() &&
          postDate.getMonth() === selectedDate.getMonth() &&
          postDate.getFullYear() === selectedDate.getFullYear()
        )
      })
    : []

  // Get all posts for the current month
  const postsForMonth = scheduledPosts.filter((post) => {
    const postDate = new Date(post.scheduledFor)
    return postDate.getMonth() === currentMonth.getMonth() && postDate.getFullYear() === currentMonth.getFullYear()
  })

  // Create a map of dates with posts
  const datesWithPosts = new Set(
    postsForMonth.map((post) => {
      const date = new Date(post.scheduledFor)
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    }),
  )

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-accent/10 text-accent border-accent/20"
      case "published":
        return "bg-primary/10 text-primary border-primary/20"
      case "draft":
        return "bg-muted/10 text-muted-foreground border-muted/20"
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20"
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Content Calendar</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage your social media posts</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">Schedule New Post</Button>
      </div>

      {/* Calendar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border-0"
              modifiers={{
                hasPost: (date) => {
                  const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
                  return datesWithPosts.has(dateKey)
                },
              }}
              modifiersStyles={{
                hasPost: {
                  fontWeight: "bold",
                  textDecoration: "underline",
                  textDecorationColor: "hsl(var(--primary))",
                },
              }}
            />
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span>Has scheduled posts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Posts for Selected Date */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate
                ? selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {postsForSelectedDate.length > 0 ? (
              <div className="space-y-3">
                {postsForSelectedDate.map((post) => (
                  <div key={post.id} className="p-3 rounded-lg border border-border/50 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(post.scheduledFor).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(post.status)}`}>
                        {post.status}
                      </Badge>
                    </div>
                    <p className="text-sm line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.networks.map((network) => (
                        <Badge key={network} variant="secondary" className="text-xs">
                          {network}
                        </Badge>
                      ))}
                      {post.media.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ImageIcon className="h-3 w-3" />
                          {post.media.length}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No posts scheduled for this date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Posts Timeline */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Upcoming Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledPosts.slice(0, 5).map((post, index) => (
              <div key={post.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  {index < scheduledPosts.slice(0, 5).length - 1 && <div className="w-px h-full bg-border mt-2" />}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(post.scheduledFor).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.scheduledFor).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(post.status)}`}>
                      {post.status}
                    </Badge>
                  </div>
                  <p className="text-sm mb-3">{post.content}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.networks.map((network) => (
                      <Badge key={network} variant="secondary" className="text-xs">
                        {network}
                      </Badge>
                    ))}
                    {post.media.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ImageIcon className="h-3 w-3" />
                        {post.media.length} media
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
