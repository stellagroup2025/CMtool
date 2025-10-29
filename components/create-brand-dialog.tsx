"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { createBrandAction } from "@/app/brands/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function CreateBrandDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [logo, setLogo] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await createBrandAction({
        name,
        logo: logo || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })

      if (result.success) {
        toast.success(`Brand "${name}" created successfully!`)
        setOpen(false)
        setName("")
        setLogo("")
        router.refresh()
      }
    } catch (error) {
      toast.error("Failed to create brand. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="border-dashed border-2 border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold">Add New Brand</p>
              <p className="text-sm text-muted-foreground">Create a new brand to manage</p>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Brand</DialogTitle>
            <DialogDescription>
              Add a new brand to manage its social media accounts and content.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Brand Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Acme Corporation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="logo">Logo URL (optional)</Label>
              <Input
                id="logo"
                type="url"
                placeholder="https://example.com/logo.png"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                You can add a logo later in settings
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name}>
              {isLoading ? "Creating..." : "Create Brand"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
