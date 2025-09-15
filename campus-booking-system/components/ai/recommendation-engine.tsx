import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Clock, MapPin, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

interface RecommendationEngineProps {
  userId: string
}

export async function RecommendationEngine({ userId }: RecommendationEngineProps) {
  const supabase = await createClient()

  // Get user's booking history and preferences
  const { data: userBookings } = await supabase
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
    .order("booking_date", { ascending: false })
    .limit(20)

  const { data: userPreferences } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single()

  // Get current time and day for time-based recommendations
  const now = new Date()
  const currentHour = now.getHours()
  const currentDay = now.getDay()

  // Analyze user patterns
  const preferredTypes = new Map<string, number>()
  const preferredLocations = new Map<string, number>()
  const preferredTimes = new Map<number, number>()

  if (userBookings) {
    userBookings.forEach((booking) => {
      const type = booking.resources?.type
      const location = booking.resources?.location
      const bookingHour = new Date(booking.booking_date).getHours()

      if (type) {
        preferredTypes.set(type, (preferredTypes.get(type) || 0) + 1)
      }
      if (location) {
        preferredLocations.set(location, (preferredLocations.get(location) || 0) + 1)
      }
      preferredTimes.set(bookingHour, (preferredTimes.get(bookingHour) || 0) + 1)
    })
  }

  // Get available resources for recommendations
  const { data: availableResources } = await supabase
    .from("resources")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true })

  // Generate AI-powered recommendations
  const recommendations = []

  if (availableResources) {
    // Time-based recommendations
    if (currentHour >= 9 && currentHour <= 11) {
      const studyRooms = availableResources.filter((r) => r.type === "study_room")
      if (studyRooms.length > 0) {
        recommendations.push({
          id: `time-study-${studyRooms[0].id}`,
          resource: studyRooms[0],
          reason: "Perfect time for focused study sessions",
          confidence: 85,
          type: "time_based",
          icon: Clock,
        })
      }
    }

    // Pattern-based recommendations
    const mostUsedType = Array.from(preferredTypes.entries()).sort((a, b) => b[1] - a[1])[0]
    if (mostUsedType) {
      const similarResources = availableResources.filter((r) => r.type === mostUsedType[0])
      if (similarResources.length > 0) {
        recommendations.push({
          id: `pattern-${similarResources[0].id}`,
          resource: similarResources[0],
          reason: `You frequently book ${mostUsedType[0].replace("_", " ")}s`,
          confidence: 75,
          type: "pattern_based",
          icon: TrendingUp,
        })
      }
    }

    // Location-based recommendations
    const mostUsedLocation = Array.from(preferredLocations.entries()).sort((a, b) => b[1] - a[1])[0]
    if (mostUsedLocation) {
      const nearbyResources = availableResources.filter((r) => r.location === mostUsedLocation[0])
      if (nearbyResources.length > 0) {
        recommendations.push({
          id: `location-${nearbyResources[0].id}`,
          resource: nearbyResources[0],
          reason: `Available at your preferred location: ${mostUsedLocation[0]}`,
          confidence: 70,
          type: "location_based",
          icon: MapPin,
        })
      }
    }

    // Collaborative recommendations (if user books study rooms frequently)
    if (preferredTypes.get("study_room") && preferredTypes.get("study_room")! > 2) {
      const collaborativeRooms = availableResources.filter(
        (r) => r.type === "study_room" && r.features?.collaborative === true,
      )
      if (collaborativeRooms.length > 0) {
        recommendations.push({
          id: `collab-${collaborativeRooms[0].id}`,
          resource: collaborativeRooms[0],
          reason: "Great for group study sessions",
          confidence: 65,
          type: "feature_based",
          icon: Users,
        })
      }
    }
  }

  // Sort by confidence and limit to top 3
  const topRecommendations = recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 3)

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-100 text-green-800"
    if (confidence >= 70) return "bg-blue-100 text-blue-800"
    return "bg-yellow-100 text-yellow-800"
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "study_room":
        return "bg-blue-100 text-blue-800"
      case "computer":
        return "bg-green-100 text-green-800"
      case "book":
        return "bg-purple-100 text-purple-800"
      case "equipment":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (topRecommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Start booking resources to get personalized recommendations!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topRecommendations.map((rec) => (
            <div key={rec.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <rec.icon className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium">{rec.resource.name}</h4>
                  <Badge className={getTypeColor(rec.resource.type)} variant="secondary">
                    {rec.resource.type.replace("_", " ")}
                  </Badge>
                </div>
                <Badge className={getConfidenceColor(rec.confidence)} variant="secondary">
                  {rec.confidence}% match
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{rec.reason}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {rec.resource.location}
                </div>
                <Button asChild size="sm">
                  <Link href={`/resources/${rec.resource.id}/book`}>Book Now</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
