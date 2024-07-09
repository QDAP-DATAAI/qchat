"use client"

import { ChevronLeft, ChevronRight, FileDown } from "lucide-react"
import Link from "next/link"
import { useState, useCallback, useMemo } from "react"

import Typography from "@/components/typography"
import { convertUserListToWordDocument } from "@/features/common/user-export"
import { useAdminContext } from "@/features/settings/admin/admin-provider"
import { Button } from "@/features/ui/button"
import { Card } from "@/features/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/features/ui/table"

const HIGH_FAILED_LOGINS = 5

export type UserListProps = {
  searchParams: {
    tenantId?: string
    pageSize?: number
    pageNumber?: number
  }
}

export const UserList = (props: UserListProps): JSX.Element => {
  const { users, selectedTenant } = useAdminContext()

  const [showFailedLogins, setShowFailedLogins] = useState(false)

  const filteredUsers = useMemo(() => {
    return showFailedLogins
      ? users?.filter(user => user.failed_login_attempts >= HIGH_FAILED_LOGINS) || []
      : users || []
  }, [showFailedLogins, users])

  const handleExport = useCallback(async (): Promise<void> => {
    await convertUserListToWordDocument(filteredUsers, "UserList.docx")
  }, [filteredUsers])

  const toggleShowFailedLogins = useCallback(() => {
    setShowFailedLogins(prevState => !prevState)
  }, [])

  const renderTableRow = useCallback(
    (user: (typeof users)[0], rowIndex: number) => (
      <TableRow key={user.id} data-row-index={rowIndex + 1}>
        <TableCell data-col-index={0}>
          <Link
            href={`/settings/admin/${selectedTenant?.id}/${user.id}`}
            className="hover:underline"
            aria-label={`View details for ${user.name || "user"}`}
          >
            {user.name || "-"}
          </Link>
        </TableCell>
        <TableCell data-col-index={1}>{user.email || "-"}</TableCell>
        <TableCell data-col-index={2}>
          {user.last_login ? new Date(user.last_login).toLocaleString("en-AU") : "-"}
        </TableCell>
        <TableCell data-col-index={3}>
          {user.last_failed_login ? new Date(user.last_failed_login).toLocaleString("en-AU") : "-"}
        </TableCell>
        <TableCell
          data-col-index={4}
          className={user.failed_login_attempts >= HIGH_FAILED_LOGINS ? "bg-alert text-black" : ""}
        >
          {user.failed_login_attempts !== null && user.failed_login_attempts !== undefined
            ? user.failed_login_attempts.toString()
            : "-"}
        </TableCell>
      </TableRow>
    ),
    [selectedTenant]
  )

  const _pageNumber = Number(props.searchParams.pageNumber ?? 0)
  const pageSize = Number(props.searchParams.pageSize ?? 20)
  const pageNumber = _pageNumber < 0 ? 0 : _pageNumber
  const nextPage = Number(pageNumber) + 1
  const previousPage = Number(pageNumber) - 1
  const hasMoreResults = filteredUsers.length === pageSize

  const previousPageLink = useMemo(
    () => ({
      pathname: "/settings/users",
      search: `?pageNumber=${previousPage}`,
    }),
    [previousPage]
  )

  const nextPageLink = useMemo(
    () => ({
      pathname: "/settings/users",
      search: `?pageNumber=${nextPage}`,
    }),
    [nextPage]
  )

  if (!users) return <div>Error loading users</div>

  return (
    <div className="flex size-full overflow-y-auto pt-8">
      <div className="container mx-auto size-full space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h2" className="text-2xl font-bold tracking-tight">
              User Management
            </Typography>
            <Typography variant="h3" className="text-muted-foreground">
              Below is a list of users
            </Typography>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={toggleShowFailedLogins} variant="outline" aria-label="Toggle failed login attempts">
              {showFailedLogins ? "Show all Users" : "Show failed login attempts"}
            </Button>
            <Button onClick={handleExport} variant="outline" aria-label="Export user list">
              <FileDown size={14} />
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Card className="flex-1">
            <Table>
              <TableHeader>
                <TableRow data-row-index={0}>
                  <TableHead scope="col" data-col-index={0}>
                    Name
                  </TableHead>
                  <TableHead scope="col" data-col-index={1}>
                    Email
                  </TableHead>
                  <TableHead scope="col" data-col-index={2}>
                    Last Login
                  </TableHead>
                  <TableHead scope="col" data-col-index={3}>
                    Last Failed Login
                  </TableHead>
                  <TableHead scope="col" data-col-index={4}>
                    Failed Login Count
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{filteredUsers.map(renderTableRow)}</TableBody>
            </Table>
            <div className="flex justify-end gap-2 p-2">
              {previousPage >= 0 && (
                <Button asChild size="icon" variant="outline" aria-label="Previous page">
                  <Link href={previousPageLink}>
                    <ChevronLeft />
                  </Link>
                </Button>
              )}
              {hasMoreResults && (
                <Button asChild size="icon" variant="outline" aria-label="Next page">
                  <Link href={nextPageLink}>
                    <ChevronRight />
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
export default UserList
