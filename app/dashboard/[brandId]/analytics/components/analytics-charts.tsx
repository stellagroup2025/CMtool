"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AnalyticsChartsProps {
  dailyMetrics: Array<{
    date: string
    followers: number
    posts: number
    engagement: number
    reach: number
    likes: number
    comments: number
  }>
  platformMetrics: Array<{
    platform: string
    followers: number
    posts: number
    engagement: number
    reach: number
  }>
}

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: "#E4405F",
  FACEBOOK: "#1877F2",
  X: "#000000",
  LINKEDIN: "#0A66C2",
  YOUTUBE: "#FF0000",
  TIKTOK: "#000000",
}

export function AnalyticsCharts({ dailyMetrics, platformMetrics }: AnalyticsChartsProps) {
  // Format dates for better display
  const formattedDailyMetrics = dailyMetrics.map((metric) => ({
    ...metric,
    date: new Date(metric.date).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    }),
  }))

  // Prepare platform data
  const platformData = platformMetrics.map((metric) => ({
    ...metric,
    color: PLATFORM_COLORS[metric.platform] || "#999999",
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Followers Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Crecimiento de Seguidores</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedDailyMetrics}>
              <defs>
                <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="followers"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorFollowers)"
                name="Seguidores"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engagement Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedDailyMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Engagement"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Reach by Day */}
      <Card>
        <CardHeader>
          <CardTitle>Alcance Diario</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedDailyMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reach" fill="#3b82f6" name="Alcance" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Likes vs Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Likes vs Comentarios</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedDailyMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="likes"
                stroke="#ec4899"
                strokeWidth={2}
                name="Likes"
              />
              <Line
                type="monotone"
                dataKey="comments"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Comentarios"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Followers by Platform */}
      <Card>
        <CardHeader>
          <CardTitle>Seguidores por Plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="platform" type="category" />
              <Tooltip />
              <Bar dataKey="followers" name="Seguidores">
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Posts by Platform */}
      <Card>
        <CardHeader>
          <CardTitle>Posts por Plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ platform, posts }) => `${platform}: ${posts}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="posts"
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
