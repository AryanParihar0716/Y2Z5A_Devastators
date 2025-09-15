import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Computer, BookOpen, Users, Clock } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Book Study Room",
      description: "Reserve a quiet or collaborative space",
      icon: Users,
      href: "/resources?type=study_room",
      color: "bg-blue-500",
    },
    {
      title: "Reserve Computer",
      description: "Access high-performance workstations",
      icon: Computer,
      href: "/resources?type=computer",
      color: "bg-green-500",
    },
    {
      title: "Borrow Books",
      description: "Check out library materials",
      icon: BookOpen,
      href: "/resources?type=book",
      color: "bg-purple-500",
    },
    {
      title: "View Schedule",
      description: "See all your upcoming bookings",
      icon: Calendar,
      href: "/bookings",
      color: "bg-orange-500",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              asChild
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow bg-transparent"
            >
              <Link href={action.href}>
                <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
