"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Users, Heart, MessageSquare, Eye, Share2, ArrowUpRight } from "lucide-react"
import { mockBrands } from "@/lib/mock-data"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts"

const engagementData = [
  { date: "Jan 1", likes: 4200, comments: 890, shares: 450 },
  { date: "Jan 8", likes: 5100, comments: 1020, shares: 520 },
  { date: "Jan 15", likes: 4800, comments: 950, shares: 480 },
  { date: "Jan 22", likes: 6200, comments: 1180, shares: 620 },
  { date: "Jan 29", likes: 7100, comments: 1350, shares: 710 },
  { date: "Feb 5", likes: 5900, comments: 1100, shares: 590 },
  { date: "Feb 12", likes: 6800, comments: 1280, shares: 680 },
]

const reachData = [
  { date: "Jan 1", reach: 12000, impressions: 18000 },
  { date: "Jan 8", reach: 15000, impressions: 22500 },
  { date: "Jan 15", reach: 14500, impressions: 21750 },
  { date: "Jan 22", reach: 18000, impressions: 27000 },
  { date: "Jan 29", reach: 21000, impressions: 31500 },
  { date: "Feb 5", reach: 19000, impressions: 28500 },
  { date: "Feb 12", reach: 22000, impressions: 33000 },
]

const networkDistribution = [
  { name: "Instagram", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Facebook", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Twitter", value: 15, color: "hsl(var(--chart-3))" },
  { name: "LinkedIn", value: 10, color: "hsl(var(--chart-4))" },
  { name: "TikTok", value: 5, color: "hsl(var(--chart-5))" },
]

const topPosts = [
  {
    id: "1",
    content: "Excited to announce our new product line! 🚀",
    network: "instagram",
    likes: 12500,
    comments: 890,
    shares: 450,
    reach: 125000,
  },
  {
    id: "2",
    content: "Behind the scenes of our latest campaign",
    network: "facebook",
    likes: 8900,
    comments: 560,
    shares: 320,
    reach: 89000,
  },
  {
    id: "3",
    content: "Tips for maximizing your productivity",
    network: "linkedin",
    likes: 6700,
    comments: 420,
    shares: 280,
    reach: 67000,
  },
]

export default function AnalyticsPage() {
  const params = useParams()
  const brandId = params.brandId as string
  const brand = mockBrands.find((b) => b.id === brandId)

  const [timeRange, setTimeRange] = useState("7d")

  if (!brand) {
    return <div>Brand not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your social media performance and insights</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
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
              <span>+18.2% vs last period</span>
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
              <span>+2.4% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2M</div>
            <div className="flex items-center gap-1 text-xs text-destructive mt-1">
              <TrendingDown className="h-3 w-3" />
              <span>-5.1% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Follower Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{brand.metrics.growth}%</div>
            <div className="flex items-center gap-1 text-xs text-accent mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+3.2% vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="reach">Reach & Impressions</TabsTrigger>
          <TabsTrigger value="distribution">Platform Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Engagement Over Time</CardTitle>
              <CardDescription>Likes, comments, and shares across all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={engagementData}>
                  <defs>
                    <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="likes"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorLikes)"
                  />
                  <Area
                    type="monotone"
                    dataKey="comments"
                    stroke="hsl(var(--secondary))"
                    fillOpacity={1}
                    fill="url(#colorComments)"
                  />
                  <Area
                    type="monotone"
                    dataKey="shares"
                    stroke="hsl(var(--accent))"
                    fillOpacity={1}
                    fill="url(#colorShares)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reach" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Reach & Impressions</CardTitle>
              <CardDescription>Unique users reached vs total impressions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={reachData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="reach" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="impressions" stroke="hsl(var(--accent))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Engagement by Platform</CardTitle>
                <CardDescription>Distribution of engagement across networks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={networkDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {networkDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>Key metrics by social network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {brand.accounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="capitalize">
                          {account.network}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">{account.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {account.followers.toLocaleString()} followers
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-accent">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-semibold">+12.5%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Top Performing Posts */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Performing Posts</CardTitle>
              <CardDescription>Your best content from the selected period</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPosts.map((post, index) => (
              <div key={post.id} className="flex items-start gap-4 p-4 rounded-lg border border-border/50">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold">
                  #{index + 1}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm flex-1">{post.content}</p>
                    <Badge variant="secondary" className="capitalize">
                      {post.network}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Heart className="h-3.5 w-3.5" />
                        <span className="text-xs">Likes</span>
                      </div>
                      <p className="text-sm font-semibold">{post.likes.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="text-xs">Comments</span>
                      </div>
                      <p className="text-sm font-semibold">{post.comments.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Share2 className="h-3.5 w-3.5" />
                        <span className="text-xs">Shares</span>
                      </div>
                      <p className="text-sm font-semibold">{post.shares.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        <span className="text-xs">Reach</span>
                      </div>
                      <p className="text-sm font-semibold">{(post.reach / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
