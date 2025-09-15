"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Monitor, BookOpen, Wrench } from "lucide-react"
import Link from "next/link"

interface ResourceCardProps {
  resource: any
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "study_room":
        return <Users className="w-5 h-5" />
      case "computer":
        return <Monitor className="w-5 h-5" />
      case "book":
        return <BookOpen className="w-5 h-5" />
      case "equipment":
        return <Wrench className="w-5 h-5" />
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getResourceIcon(resource.type)}
            <CardTitle className="text-lg">{resource.name}</CardTitle>
          </div>
          <Badge className={getTypeColor(resource.type)} variant="secondary">
            {formatType(resource.type)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{resource.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{resource.location}</span>
          </div>
          {resource.capacity > 1 && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-400" />
              <span>Capacity: {resource.capacity}</span>
            </div>
          )}
        </div>

        {resource.features && Object.keys(resource.features).length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {Object.entries(resource.features)
                .filter(([_, value]) => value === true)
                .slice(0, 3)
                .map(([key]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key.replace("_", " ")}
                  </Badge>
                ))}
              {Object.keys(resource.features).length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{Object.keys(resource.features).length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <Button asChild className="w-full">
          <Link href={`/resources/${resource.id}/book`}>Book Now</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
