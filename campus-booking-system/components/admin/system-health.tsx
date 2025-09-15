import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Clock, Wrench } from "lucide-react"
import Link from "next/link"

export async function SystemHealth() {
  const supabase = await createClient()

  // Get fault reports by status
  const { data: faultReports } = await supabase
    .from("fault_reports")
    .select(`
      *,
      resources (
        name,
        type
      ),
      users!fault_reports_reported_by_fkey (
        first_name,
        last_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "reported":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Wrench className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "reported":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatRelativeTime = (dateTime: string) => {
    const now = new Date()
    const date = new Date(dateTime)
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    return "Just now"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          System Health & Issues
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/faults">Manage Issues</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {faultReports && faultReports.length > 0 ? (
          <div className="space-y-4">
            {faultReports.map((report) => (
              <div key={report.id} className="flex items-start gap-3 p-4 border rounded-lg">
                {getStatusIcon(report.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{report.title}</h4>
                    <Badge className={getPriorityColor(report.priority)} variant="secondary">
                      {report.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{report.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{report.resources?.name}</span>
                    <span>
                      Reported by {report.users?.first_name} {report.users?.last_name}
                    </span>
                    <span>{formatRelativeTime(report.created_at)}</span>
                  </div>
                </div>
                <Badge className={getStatusColor(report.status)}>{report.status.replace("_", " ")}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
            <p>All systems running smoothly</p>
            <p className="text-sm">No active issues reported</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
