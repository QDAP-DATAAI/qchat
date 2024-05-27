import { Client } from "@microsoft/microsoft-graph-client"
import { NextRequest, NextResponse } from "next/server"
import { getToken, JWT } from "next-auth/jwt"
import * as yup from "yup"

const groupValidationSchema = yup
  .object({
    groupGuids: yup.array().of(yup.string().required()).required(),
  })
  .noUnknown(true, "Attempted to validate invalid fields")

const getAccessTokenFromJWT = async (req: NextRequest): Promise<string | null> => {
  const token = (await getToken({ req, secret: process.env.NEXTAUTH_SECRET })) as JWT | null
  console.log("JWT Token:", token) // Debug statement
  if (!token) {
    console.error("No token found")
    return null
  }
  const accessToken = token.accessToken as string | null
  if (!accessToken) {
    console.error("No access token found in JWT")
  }
  return accessToken
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const requestBody = await req.json()
    const accessToken = await getAccessTokenFromJWT(req)

    if (!accessToken) {
      console.error("Unauthorized: No access token available")
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const validatedData = await groupValidationSchema.validate(requestBody, {
      abortEarly: false,
      stripUnknown: true,
    })

    const client = Client.init({
      authProvider: done => {
        done(null, accessToken)
      },
    })

    const { groupGuids } = validatedData

    try {
      const groupDetails = await Promise.all(
        groupGuids.map(async guid => {
          try {
            const group = await client.api(`/groups/${guid}`).get()
            return {
              guid,
              name: group.displayName,
              isValid: group.securityEnabled,
            }
          } catch (error) {
            console.error(`Error fetching group ${guid}:`, error)
            return {
              guid,
              name: null,
              isValid: false,
            }
          }
        })
      )

      const response = groupDetails.map(group => ({
        guid: group.guid,
        name: group.name,
        isValid: group.isValid,
      }))

      return new NextResponse(JSON.stringify(response), { status: 200 })
    } catch (error: unknown) {
      console.error("Error validating groups:", error)
      return new NextResponse(JSON.stringify({ error: "Error validating groups", details: (error as Error).message }), {
        status: 500,
      })
    }
  } catch (error) {
    const errorMessage = error instanceof yup.ValidationError ? { errors: error.errors } : "Internal Server Error"
    console.error("Validation or Internal Server Error:", errorMessage)
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: error instanceof yup.ValidationError ? 400 : 500,
    })
  }
}
