import type { Metadata } from 'next'

import { notFound } from 'next/navigation'
import { ProjectDetail } from '@/components/sections/ProjectDetail'
import { projectBySlug, publishedProjects } from '@/data/projects'

type Params = { params: Promise<{ slug: string }> }

/**
 * Unknown slugs 404 through `notFound()` rather than through
 * `dynamicParams: false`.
 *
 * The stricter-looking option is worse here: with no published projects,
 * `generateStaticParams` returns an empty list, and Next then has no fallback
 * to serve — it still returns 404, but logs an internal NoFallbackError on
 * every miss. Letting the route render and call `notFound()` produces the same
 * status with a clean server log and the site's real 404 page.
 */

export function generateStaticParams() {
  return publishedProjects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const project = projectBySlug(slug)
  if (!project) return {}
  return { title: project.name, description: project.summary }
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params
  const project = projectBySlug(slug)
  if (!project) notFound()

  return <ProjectDetail project={project} />
}
