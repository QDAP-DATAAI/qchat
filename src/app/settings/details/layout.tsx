export default async function Layout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  return <div className="mb-8 grid size-full w-full grid-cols-1 gap-8 p-4 pt-5 sm:grid-cols-2 sm:gap-2">{children}</div>
}
