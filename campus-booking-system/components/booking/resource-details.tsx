import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Clock, Wifi, Monitor, Zap } from "lucide-react"

interface ResourceDetailsProps {
  resource: any
}

export function ResourceDetails({ resource }: ResourceDetailsProps) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "study_room":
        return <Users className="w-5 h-5" />
      case "computer":
        return <Monitor className="w-5 h-5" />
      case "book":
        return <Users className="w-5 h-5" />
      case "equipment":
        return <Zap className="w-5 h-5" />
      default:
        return <Users className="w-5 h-5" />
    }
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

  const formatType = (type: string) => {
    return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-4 h-4" />
      case "projector":
      case "tv_screen":
        return <Monitor className="w-4 h-4" />
      case "power_outlets":
        return <Zap className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {getResourceIcon(resource.type)}
            <CardTitle>{resource.name}</CardTitle>
          </div>
          <Badge className={getTypeColor(resource.type)} variant="secondary">
            {formatType(resource.type)}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{resource.description}</p>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{resource.location}</span>
            </div>

            {resource.capacity > 1 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Capacity: {resource.capacity} people</span>
              </div>
            )}

            {resource.availability_schedule && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm">
                  Available: {resource.availability_schedule.monday?.open || "8:00"} -{" "}
                  {resource.availability_schedule.monday?.close || "22:00"}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      {resource.features && Object.keys(resource.features).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features & Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(resource.features)
                .filter(([_, value]) => value === true)
                .map(([key]) => (
                  <div key={key} className="flex items-center gap-2">
                    {getFeatureIcon(key)}
                    <span className="text-sm capitalize">{key.replace("_", " ")}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Booking Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Please arrive on time for your booking</p>
          <p>• Check in within 15 minutes to avoid no-show status</p>
          <p>• Cancel at least 2 hours in advance if you can't make it</p>
          <p>• Keep the space clean and tidy for the next user</p>
          <p>• Report any issues or damages immediately</p>
        </CardContent>
      </Card>
    </div>
  )
}
