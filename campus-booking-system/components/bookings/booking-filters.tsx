"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function BookingFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const statuses = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
    { value: "completed", label: "Completed", color: "bg-blue-100 text-blue-800" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
    { value: "no_show", label: "No Show", color: "bg-yellow-100 text-yellow-800" },
  ]

  const updateFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get("status") === status) {
      params.delete("status")
    } else {
      params.set("status", status)
    }
    router.push(`/bookings?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/bookings")
  }

  const hasActiveFilters = searchParams.toString().length > 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="w-4 h-4" />
          Filters
        </CardTitle>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-3">Status</h4>
          <div className="space-y-2">
            {statuses.map((status) => (
              <Button
                key={status.value}
                variant={searchParams.get("status") === status.value ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => updateFilter(status.value)}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
