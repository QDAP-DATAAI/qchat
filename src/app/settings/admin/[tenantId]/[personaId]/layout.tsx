import ErrorBoundary from "@/components/error-boundary"

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: {
    tenantId: string
    personaId: string
  }
}): Promise<JSX.Element> {
  return await Promise.resolve(
    <div>
      {params.personaId}
      <br />
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  )
}
