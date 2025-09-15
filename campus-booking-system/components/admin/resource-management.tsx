import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, MapPin, Users } from "lucide-react"

export async function ResourceManagement() {
  const supabase = await createClient()

  const { data: resources } = await supabase.from("resources").select("*").order("name", { ascending: true })

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">All Resources</h2>
          <p className="text-sm text-muted-foreground">
            {resources?.length || 0} resources • {resources?.filter((r) => r.is_active).length || 0} active
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources?.map((resource) => (
          <Card key={resource.id} className={`${!resource.is_active ? "opacity-60" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{resource.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getTypeColor(resource.type)} variant="secondary">
                      {formatType(resource.type)}
                    </Badge>
                    {!resource.is_active && (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{resource.description}</p>

              <div className="space-y-2">
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
                <div className="mt-4">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
