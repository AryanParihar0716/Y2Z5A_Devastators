import { createClient } from "@/lib/supabase/server"
import { ResourceCard } from "./resource-card"

interface ResourceGridProps {
  searchParams: {
    type?: string
    search?: string
    location?: string
  }
}

export async function ResourceGrid({ searchParams }: ResourceGridProps) {
  const supabase = await createClient()

  let query = supabase.from("resources").select("*").eq("is_active", true).order("name", { ascending: true })

  // Apply filters
  if (searchParams.type) {
    query = query.eq("type", searchParams.type)
  }

  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`)
  }

  if (searchParams.location) {
    query = query.ilike("location", `%${searchParams.location}%`)
  }

  const { data: resources, error } = await query

  if (error) {
    console.log(error.message);
    return <div className="text-center py-8 text-red-600">Error loading resources : {error.message}</div>

  }

  if (!resources || resources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No resources found matching your criteria</p>
        <p className="text-sm text-gray-400">Try adjusting your filters or search terms</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  )
}
