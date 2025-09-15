import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Clock, Users, Zap } from "lucide-react"
import Link from "next/link"

interface SmartSuggestionsProps {
  userId: string
  currentResourceType?: string
}

export async function SmartSuggestions({ userId, currentResourceType }: SmartSuggestionsProps) {
  const supabase = await createClient()

  // Get user's recent booking patterns
  const { data: recentBookings } = await supabase
    .from("booking_analytics")
    .select(`
      *,
      resources (
        id,
        name,
        type,
        location,
        features
      )
    `)
    .eq("user_id", userId)
    .gte("booking_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
    .order("booking_date", { ascending: false })

  // Get current time context
  const now = new Date()
  const currentHour = now.getHours()
  const isWeekend = now.getDay() === 0 || now.getDay() === 6

  // Generate smart suggestions based on context
  const suggestions = []

  // Time-based suggestions
  if (currentHour >= 8 && currentHour <= 10) {
    suggestions.push({
      id: "morning-study",
      title: "Morning Study Session",
      description: "Perfect time for focused individual study",
      action: "Find quiet study rooms",
      href: "/resources?type=study_room",
      icon: Clock,
      priority: "high",
    })
  } else if (currentHour >= 14 && currentHour <= 16) {
    suggestions.push({
      id: "afternoon-collab",
      title: "Afternoon Collaboration",
      description: "Great time for group work and discussions",
      action: "Book collaborative spaces",
      href: "/resources?type=study_room",
      icon: Users,
      priority: "medium",
    })
  }

  // Pattern-based suggestions
  if (recentBookings && recentBookings.length > 0) {
    const frequentTypes = new Map<string, number>()
    recentBookings.forEach((booking) => {
      const type = booking.resources?.type
      if (type) {
        frequentTypes.set(type, (frequentTypes.get(type) || 0) + 1)
      }
    })

    const mostFrequent = Array.from(frequentTypes.entries()).sort((a, b) => b[1] - a[1])[0]
    if (mostFrequent && mostFrequent[0] !== currentResourceType) {
      suggestions.push({
        id: "pattern-based",
        title: "Based on Your History",
        description: `You frequently use ${mostFrequent[0].replace("_", " ")}s`,
        action: `Browse ${mostFrequent[0].replace("_", " ")}s`,
        href: `/resources?type=${mostFrequent[0]}`,
        icon: Brain,
        priority: "medium",
      })
    }
  }

  // Weekend suggestions
  if (isWeekend) {
    suggestions.push({
      id: "weekend-special",
      title: "Weekend Study",
      description: "Extended hours available for deep work",
      action: "Find extended hour resources",
      href: "/resources",
      icon: Zap,
      priority: "low",
    })
  }

  // Limit to top 2 suggestions
  const topSuggestions = suggestions.slice(0, 2)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (topSuggestions.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Smart Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topSuggestions.map((suggestion) => (
            <div key={suggestion.id} className="p-3 border rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <suggestion.icon className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                </div>
                <Badge className={getPriorityColor(suggestion.priority)} variant="secondary">
                  {suggestion.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
              <Button asChild size="sm" variant="outline" className="w-full bg-transparent">
                <Link href={suggestion.href}>{suggestion.action}</Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
