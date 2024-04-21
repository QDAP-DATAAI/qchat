export async function GET(): Promise<Response> {
  const prompt = (await process.env.SYSTEM_PROMPT)
    ? process.env.SYSTEM_PROMPT.replace(/\^(?!\\')/g, " ").replace(/\^\\'/g, "^'")
    : ""
  return new Response(JSON.stringify({ prompt }), { status: 200 })
}
