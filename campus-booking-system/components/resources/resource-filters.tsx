"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Filter, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export function ResourceFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get("type") ? [searchParams.get("type")!] : [],
  )

  const resourceTypes = [
    { value: "study_room", label: "Study Rooms" },
    { value: "computer", label: "Computers" },
    { value: "book", label: "Books" },
    { value: "equipment", label: "Equipment" },
  ]

  const locations = ["Library Floor 1", "Library Floor 2", "Library Floor 3", "Computer Lab 1", "IT Services Desk"]

  const handleTypeChange = (type: string, checked: boolean) => {
    let newTypes: string[]
    if (checked) {
      newTypes = [...selectedTypes, type]
    } else {
      newTypes = selectedTypes.filter((t) => t !== type)
    }
    setSelectedTypes(newTypes)
    updateFilters({ type: newTypes.length > 0 ? newTypes[0] : undefined })
  }

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`/resources?${params.toString()}`)
  }

  const clearFilters = () => {
    setSelectedTypes([])
    router.push("/resources")
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
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Resource Type</h4>
          <div className="space-y-2">
            {resourceTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={type.value}
                  checked={selectedTypes.includes(type.value)}
                  onCheckedChange={(checked) => handleTypeChange(type.value, checked as boolean)}
                />
                <Label htmlFor={type.value} className="text-sm">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Location</h4>
          <div className="space-y-2">
            {locations.map((location) => (
              <Button
                key={location}
                variant={searchParams.get("location") === location ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => updateFilters({ location: location })}
              >
                {location}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
