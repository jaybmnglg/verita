import { NextResponse } from "next/server";

export async function GET() {
  const isConfigured = Boolean(
    (process.env.N8N_WEBHOOK_URL && process.env.N8N_WEBHOOK_URL.trim() !== "") ||
    (process.env.N8N_BASE_URL && process.env.N8N_BASE_URL.trim() !== "")
  );

  return NextResponse.json({
    status: "ok",
    backendConfigured: isConfigured,
    product: "Verita — Student Handbook Assistant",
  });
}
