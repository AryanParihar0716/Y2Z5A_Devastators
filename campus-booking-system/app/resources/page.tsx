import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ResourceFilters } from "@/components/resources/resource-filters"
import { ResourceGrid } from "@/components/resources/resource-grid"
import { ResourceSearch } from "@/components/resources/resource-search"

interface ResourcesPageProps {
  searchParams: Promise<{
    type?: string
    search?: string
    location?: string
  }>
}

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} profile={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse Resources</h1>
          <p className="text-gray-600">Find and book campus resources that fit your needs</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <ResourceFilters />
          </aside>

          <div className="flex-1">
            <div className="mb-6">
              <ResourceSearch />
            </div>

            <Suspense fallback={<div>Loading resources...</div>}>
              <ResourceGrid searchParams={params} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}
