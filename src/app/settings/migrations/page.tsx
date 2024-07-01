"use client"
import { useState } from "react"

import Typography from "@/components/typography"
import { Button } from "@/features/ui/button"

import { MigrationItem } from "@/app/api/migrations/history/route"

export default function Page(): JSX.Element {
  const [items, setItems] = useState<MigrationItem[]>([])
  const [isLoading, setIsLoading] = useState<{ [upn: string]: boolean }>({})
  const [error, setError] = useState<string>("")
  const [result, setResult] = useState<string>("")

  const handleMigration = async (items: MigrationItem[]): Promise<void> => {
    setIsLoading({
      ...items.reduce((acc, item) => ({ ...acc, [item.id]: true }), {}),
    })
    try {
      const response = await fetch("/api/migrations/history", {
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({ items }),
      })
      const { data } = await response.json()
      setResult(data)
      setError("")
    } catch (error) {
      setError(`Error: ${error}`)
    } finally {
      setIsLoading({
        ...items.reduce((acc, item) => ({ ...acc, [item.id]: false }), {}),
      })
    }
  }
  const handleGetUsers = async (): Promise<void> => {
    setItems([])
    const response = await fetch("/api/migrations/history", { method: "GET" })
    const data = (await response.json()).data as MigrationItem[]
    setItems(data)
  }

  return (
    <div className="flex size-full flex-col gap-8 p-4">
      <div className="mb-4">
        <Typography variant="h4" className="pt-4 font-bold text-siteTitle">
          Emergency migrations
        </Typography>
      </div>
      <div className="m-2">
        <Button onClick={handleGetUsers}>Get affected users</Button>
        <br />
        {!!items.length && <p>{items.length} users found</p>}
        {!!items.length && (
          <table className="mt-4 size-full table-auto border-4">
            <thead className="border-b-4">
              <tr>
                <th>ID</th>
                <th>Tenant</th>
                <th>User ID</th>
                <th>Thread ID</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td className="border-2">{item.id}</td>
                  <td className="border-2">{item.tenant}</td>
                  <td className="border-2">{item.user}</td>
                  <td className="border-2">{item.threadId}</td>
                  <td className="border-2">
                    <Button onClick={async () => await handleMigration([item])} disabled={isLoading[item.id]}>
                      Run migration
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <br />
        {!!items.length && (
          <Button onClick={async () => await handleMigration(items)} disabled={items.some(item => isLoading[item.id])}>
            Run all migrations
          </Button>
        )}
        <br />
        {result && (
          <Typography variant="h2" className="text-green-500">
            {result}
          </Typography>
        )}
        {error && (
          <Typography variant="h2" className="text-red-500">
            {error}
          </Typography>
        )}
      </div>
    </div>
  )
}
