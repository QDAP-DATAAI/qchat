import { UserContainer } from "@/features/common/services/cosmos"

// Utilize TypeScript for request and response types (if applicable).
// This might require installing types for Express.js if using it.
export async function upsertUserHandler(req: Request): Promise<Response> {
  // Restrict the method to POST to accept user data.
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  try {
    // Parse and validate the incoming user data.
    // Consider using a library like Joi or Yup for structured validation.
    const userData = await req.json()
    // Perform input validation here. Placeholder for actual validation logic.
    // if (!isValidUser(userData)) { return new Response("Invalid user data", { status: 400 }); }

    const container = await UserContainer()
    const { resource } = await container.items.upsert(userData)

    return new Response(JSON.stringify(resource), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    })
  } catch (error) {
    console.error("Failed to update user:", error)

    // Customize error handling based on the error properties.
    // Assuming 'code' exists on the error object and maps to HTTP status codes.
    const status = typeof (error as { code?: number }).code === "number" ? (error as { code?: number }).code : 500
    const message = status === 400 ? "Invalid user data" : "Failed to update user"

    return new Response(message, { status: status })
  }
}
