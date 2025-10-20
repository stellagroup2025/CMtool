"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ImageIcon, Video, CalendarIcon, Clock, Sparkles, Send } from "lucide-react"
import { mockBrands } from "@/lib/mock-data"
import type { SocialNetwork } from "@/lib/mock-data"

export default function CreatePostPage() {
  const params = useParams()
  const brandId = params.brandId as string
  const brand = mockBrands.find((b) => b.id === brandId)

  const [postContent, setPostContent] = useState("")
  const [selectedNetworks, setSelectedNetworks] = useState<SocialNetwork[]>([])
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [scheduledTime, setScheduledTime] = useState("12:00")
  const [hashtags, setHashtags] = useState("")

  if (!brand) {
    return <div>Brand not found</div>
  }

  const availableNetworks = brand.accounts.map((account) => account.network)

  const toggleNetwork = (network: SocialNetwork) => {
    setSelectedNetworks((prev) => (prev.includes(network) ? prev.filter((n) => n !== network) : [...prev, network]))
  }

  const handleAIGenerate = () => {
    // Mock AI generation
    setPostContent(
      "Exciting news! We're launching something amazing that will transform the way you work. Stay tuned for more details coming soon!",
    )
    setHashtags("#Innovation #ComingSoon #Excited")
  }

  const handleSchedulePost = () => {
    // Mock scheduling
    alert("Post scheduled successfully!")
  }

  const getNetworkColor = (network: SocialNetwork) => {
    const colors: Record<SocialNetwork, string> = {
      instagram: "bg-gradient-to-r from-pink-500 to-purple-500",
      facebook: "bg-blue-600",
      twitter: "bg-sky-400",
      tiktok: "bg-black",
      linkedin: "bg-blue-700",
      youtube: "bg-red-600",
    }
    return colors[network] || "bg-muted"
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Create Post</h1>
        <p className="text-muted-foreground mt-1">Compose and schedule content across multiple platforms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post Composer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Editor */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
              <CardDescription>Write your post content or use AI to generate it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Content</Label>
                  <Button variant="outline" size="sm" onClick={handleAIGenerate} className="gap-2 bg-transparent">
                    <Sparkles className="h-4 w-4" />
                    AI Generate
                  </Button>
                </div>
                <Textarea
                  id="content"
                  placeholder="What's on your mind?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{postContent.length} characters</span>
                  <span>Recommended: 100-280 characters</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashtags">Hashtags</Label>
                <Input
                  id="hashtags"
                  placeholder="#marketing #socialmedia #content"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <ImageIcon className="h-4 w-4" />
                  Add Image
                </Button>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Video className="h-4 w-4" />
                  Add Video
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Network-Specific Variations */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Platform Variations</CardTitle>
              <CardDescription>Customize content for each platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="instagram" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  {selectedNetworks.slice(0, 3).map((network) => (
                    <TabsTrigger key={network} value={network} className="capitalize">
                      {network}
                    </TabsTrigger>
                  ))}
                  {selectedNetworks.length === 0 && (
                    <div className="col-span-3 text-center text-sm text-muted-foreground py-2">
                      Select platforms to customize
                    </div>
                  )}
                </TabsList>
                {selectedNetworks.map((network) => (
                  <TabsContent key={network} value={network} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Content for {network}</Label>
                      <Textarea
                        placeholder={`Customize content for ${network}...`}
                        defaultValue={postContent}
                        className="min-h-[120px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Platform-specific hashtags</Label>
                      <Input placeholder={`Hashtags for ${network}...`} defaultValue={hashtags} />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Select Networks */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Select Platforms</CardTitle>
              <CardDescription>Choose where to publish</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableNetworks.map((network) => (
                <div key={network} className="flex items-center space-x-3">
                  <Checkbox
                    id={network}
                    checked={selectedNetworks.includes(network)}
                    onCheckedChange={() => toggleNetwork(network)}
                  />
                  <label
                    htmlFor={network}
                    className="flex-1 flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    <div className={`h-3 w-3 rounded-full ${getNetworkColor(network)}`} />
                    <span className="capitalize">{network}</span>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Choose when to publish</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? scheduledDate.toLocaleDateString() : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={scheduledDate} onSelect={setScheduledDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>

              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <Sparkles className="h-4 w-4" />
                Suggest Best Time
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium">{brand.name}</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
                <p className="text-sm">{postContent || "Your post content will appear here..."}</p>
                {hashtags && <p className="text-sm text-primary">{hashtags}</p>}
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedNetworks.map((network) => (
                    <Badge key={network} variant="secondary" className="text-xs">
                      {network}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full bg-primary hover:bg-primary/90 gap-2" onClick={handleSchedulePost}>
              <CalendarIcon className="h-4 w-4" />
              Schedule Post
            </Button>
            <Button variant="outline" className="w-full gap-2 bg-transparent">
              <Send className="h-4 w-4" />
              Publish Now
            </Button>
            <Button variant="ghost" className="w-full">
              Save as Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
