"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

interface ReportChartsProps {
  data: {
    dailyMetrics: Array<{
      date: string
      followers: number
      posts: number
      engagement: number
      reach: number
    }>
    postsByPlatform: Record<string, number>
  }
}

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: "#E4405F",
  FACEBOOK: "#1877F2",
  X: "#000000",
  LINKEDIN: "#0A66C2",
  YOUTUBE: "#FF0000",
  TIKTOK: "#000000",
}

export function ReportCharts({ data }: ReportChartsProps) {
  // Prepare platform data for pie chart
  const platformData = Object.entries(data.postsByPlatform).map(
    ([platform, count]) => ({
      name: platform,
      value: count,
      color: PLATFORM_COLORS[platform] || "#999999",
    })
  )

  // Format daily metrics for line chart
  const formattedDailyMetrics = data.dailyMetrics.map((metric) => ({
    ...metric,
    date: new Date(metric.date).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    }),
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Followers Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Crecimiento de Seguidores</CardTitle>
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
                dataKey="followers"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Seguidores"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engagement Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Diario</CardTitle>
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
                name="Engagement"
              />
            </LineChart>
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
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
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

      {/* Reach Chart */}
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
              <Legend />
              <Bar dataKey="reach" fill="#3b82f6" name="Alcance" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
