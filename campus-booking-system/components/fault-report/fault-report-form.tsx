"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface FaultReportFormProps {
  userId: string
}

export function FaultReportForm({ userId }: FaultReportFormProps) {
  const [resources, setResources] = useState<any[]>([])
  const [selectedResource, setSelectedResource] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    const { data, error } = await supabase.from("resources").select("id, name, type, location").eq("is_active", true)

    if (!error && data) {
      setResources(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedResource || !title || !description) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error: reportError } = await supabase.from("fault_reports").insert({
        resource_id: selectedResource,
        reported_by: userId,
        title,
        description,
        priority,
      })

      if (reportError) {
        setError("Failed to submit report. Please try again.")
        return
      }

      // Create notification for admins (simplified - in real app would notify all admins)
      await supabase.from("notifications").insert({
        user_id: userId, // In real app, this would be sent to admin users
        type: "system_update",
        title: "Fault Report Submitted",
        message: "Your fault report has been submitted and will be reviewed by our maintenance team.",
        data: { report_type: "fault_report" },
      })

      router.push("/dashboard?fault_report=success")
    } catch (error) {
      console.error("Fault report error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Report Issue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="resource">Resource *</Label>
            <Select value={selectedResource} onValueChange={setSelectedResource}>
              <SelectTrigger>
                <SelectValue placeholder="Select the resource with the issue" />
              </SelectTrigger>
              <SelectContent>
                {resources.map((resource) => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.name} - {resource.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Minor inconvenience</SelectItem>
                <SelectItem value="medium">Medium - Affects functionality</SelectItem>
                <SelectItem value="high">High - Major problem</SelectItem>
                <SelectItem value="critical">Critical - Safety concern or completely unusable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide as much detail as possible about the issue, including when it occurred and any steps to reproduce it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting Report..." : "Submit Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
