import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Megaphone, Calendar } from "lucide-react"

export async function SystemUpdates() {
  const supabase = await createClient()

  const { data: updates } = await supabase
    .from("system_updates")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(5)

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "bg-blue-100 text-blue-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "general":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5" />
          Latest Updates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {updates && updates.length > 0 ? (
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update.id} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{update.title}</h4>
                  <Badge className={getTypeColor(update.type)} variant="secondary">
                    {update.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{update.content}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formatDate(update.published_at)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No updates available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
