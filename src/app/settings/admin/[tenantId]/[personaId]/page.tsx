export const dynamic = "force-dynamic"

type Props = {
  params: {
    tenantId: string
    personaId: string
  }
}
export default async function Home({ params: { personaId } }: Props): Promise<JSX.Element> {
  return (
    <div className="mb-8 grid size-full w-full grid-cols-1 gap-8 p-4 pt-5 sm:grid-cols-2 sm:gap-2">
      Persona Content {personaId}
    </div>
  )
}
