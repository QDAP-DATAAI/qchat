import React, { useEffect, FC } from "react"
import { GetUserByUpn } from "@/features/user-management/user-service"
import { useSession } from "next-auth/react"

export const UserDataFetcher: FC = () => {
  const { data: session } = useSession()

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const session = await useSession()
      if (session && session.user) {
        const response = await GetUserByUpn(session.user.tenantId, session.user.upn)
        if (response.status === "OK") {
          setUserData(response.response)
        }
      }
    }

    fetchData().catch(error => console.error(error))
  }, [])

  if (!userData) {
    return <div>Loading...</div>
  }

  return <PromptForm userData={userData} />
}

export default UserDataFetcher
