"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, MessageSquare, Calendar, Heart, MoreVertical } from "lucide-react"
import { mockBrands, mockConversations, mockPosts } from "@/lib/mock-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

const engagementData = [
  { day: "Mon", engagement: 4200 },
  { day: "Tue", engagement: 5100 },
  { day: "Wed", engagement: 4800 },
  { day: "Thu", engagement: 6200 },
  { day: "Fri", engagement: 7100 },
  { day: "Sat", engagement: 5900 },
  { day: "Sun", engagement: 4500 },
]

const reachData = [
  { day: "Mon", reach: 12000 },
  { day: "Tue", reach: 15000 },
  { day: "Wed", reach: 14500 },
  { day: "Thu", reach: 18000 },
  { day: "Fri", reach: 21000 },
  { day: "Sat", reach: 19000 },
  { day: "Sun", reach: 16000 },
]

export default function DashboardPage() {
  const params = useParams()
  const brandId = params.brandId as string
  const brand = mockBrands.find((b) => b.id === brandId)

  if (!brand) {
    return <div>Brand not found</div>
  }

  const recentConversations = mockConversations
    .filter((c) => brand.accounts.some((a) => a.id === c.accountId))
    .slice(0, 3)

  const upcomingPosts = mockPosts.filter((p) => p.brandId === brandId && p.status === "scheduled")

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your social media performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(brand.metrics.reach / 1000000).toFixed(2)}M</div>
            <div className="flex items-center gap-1 text-xs text-accent mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+12.5% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brand.metrics.engagement}%</div>
            <div className="flex items-center gap-1 text-xs text-accent mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+0.8% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brand.metrics.pendingDMs}</div>
            <div className="flex items-center gap-1 text-xs text-destructive mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+5 new today</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{brand.metrics.growth}%</div>
            <div className="flex items-center gap-1 text-xs text-accent mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+2.3% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Weekly Engagement</CardTitle>
            <CardDescription>Total interactions across all platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Weekly Reach</CardTitle>
            <CardDescription>Unique users reached this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={reachData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="reach" stroke="hsl(var(--accent))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Upcoming Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversations */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Conversations</CardTitle>
                <CardDescription>Latest messages from your audience</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conversation.from.avatar || "/placeholder.svg"} alt={conversation.from.name} />
                  <AvatarFallback>{conversation.from.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{conversation.from.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {conversation.network}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conversation.preview}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(conversation.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Posts */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Posts</CardTitle>
                <CardDescription>Scheduled content for this week</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingPosts.length > 0 ? (
              upcomingPosts.map((post) => (
                <div key={post.id} className="p-3 rounded-lg border border-border/50 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm flex-1">{post.content}</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {post.networks.map((network) => (
                        <Badge key={network} variant="secondary" className="text-xs">
                          {network}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.scheduledFor).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No upcoming posts scheduled</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Manage your social media accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brand.accounts.map((account) => (
              <div key={account.id} className="p-4 rounded-lg border border-border/50 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={account.avatar || "/placeholder.svg"} alt={account.username} />
                    <AvatarFallback>{account.network.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{account.username}</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {account.network}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Followers</span>
                    <span className="font-semibold">{(account.followers / 1000).toFixed(1)}K</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
