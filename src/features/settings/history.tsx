import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

import Typography from "@/components/typography"
import { showError } from "@/features/globals/global-message-store"
import { Button } from "@/features/ui/button"
import { Card } from "@/features/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/features/ui/table"
import { FindAllChatThreadsForReporting } from "@/features/user-management/history-service"

export type ReportingProp = {
  searchParams: {
    pageSize?: number
    pageNumber?: number
  }
}

export const Reporting = async (props: ReportingProp): Promise<JSX.Element> => {
  const pageSize = Number(props.searchParams.pageSize ?? 20)
  const pageNumber = Math.max(Number(props.searchParams.pageNumber ?? 0), 0)
  const nextPage = Number(pageNumber) + 1
  const previousPage = Number(pageNumber) - 1

  const chatThreads = await FindAllChatThreadsForReporting(pageSize, pageNumber)
  if (chatThreads.status !== "OK") showError(chatThreads.errors[0].message)

  const hasMoreResults = chatThreads.status === "OK" && chatThreads.response.length === pageSize

  return (
    <Card className="flex h-full overflow-y-auto pt-8">
      <div className="container mx-auto max-w-5xl space-y-8">
        <div>
          <Typography variant="h2" className="text-2xl font-bold tracking-tight">
            Chat Reporting
          </Typography>
          <Typography variant="p" className="text-muted-foreground">
            Your history for this month
          </Typography>
        </div>
        <div className="flex items-center space-x-2">
          <Card className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chat Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Style</TableHead>
                  <TableHead>Sensitivity</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chatThreads.status === "OK" &&
                  chatThreads.response?.map(chatThread => (
                    <TableRow key={chatThread.id}>
                      <TableCell className="font-medium">
                        <Link href={"/reporting/" + chatThread.id}>{chatThread.name}</Link>
                      </TableCell>
                      <TableCell>{chatThread.chatCategory}</TableCell>
                      <TableCell>{chatThread.chatType}</TableCell>
                      <TableCell>{chatThread.conversationStyle}</TableCell>
                      <TableCell>{chatThread.conversationSensitivity}</TableCell>
                      <TableCell>{new Date(chatThread.createdAt).toLocaleDateString("en-AU")}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <div className="flex justify-end gap-2 p-2">
              <Button size={"icon"} variant={"outline"} ariaLabel="Previous page" disabled={pageNumber === 0}>
                <Link
                  href={{
                    pathname: "/reporting",
                    search: `?pageNumber=${previousPage}`,
                  }}
                >
                  <ChevronLeft />
                </Link>
              </Button>
              <Button size={"icon"} variant={"outline"} ariaLabel="Next page" disabled={!hasMoreResults}>
                <Link
                  href={{
                    pathname: "/reporting",
                    search: `?pageNumber=${nextPage}`,
                  }}
                >
                  <ChevronRight />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  )
}
