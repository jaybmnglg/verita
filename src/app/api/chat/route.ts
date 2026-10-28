import { NextRequest, NextResponse } from "next/server";
import { parseN8nResponse } from "@/lib/parse-n8n-response";

const DEFAULT_WEBHOOK_ID = "c755f93c-2603-45f4-b463-d5ad48ccec0b";

function getResolvedWebhookUrl(): string | null {
  if (process.env.N8N_WEBHOOK_URL && process.env.N8N_WEBHOOK_URL.trim() !== "") {
    return process.env.N8N_WEBHOOK_URL.trim();
  }

  const baseUrl = process.env.N8N_BASE_URL || process.env.N8N_HOST;
  if (baseUrl && baseUrl.trim() !== "") {
    const cleanBase = baseUrl.trim().replace(/\/+$/, "");
    const webhookId = process.env.N8N_WEBHOOK_ID || DEFAULT_WEBHOOK_ID;
    return `${cleanBase}/webhook/${webhookId}/chat`;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : undefined;

    if (!question) {
      return NextResponse.json(
        {
          error: "invalid_request",
          message: "A non-empty question is required.",
        },
        { status: 400 }
      );
    }

    const webhookUrl = getResolvedWebhookUrl();

    // If n8n webhook is not configured in environment
    if (!webhookUrl) {
      return NextResponse.json(
        {
          error: "unconfigured_backend",
          message:
            "The n8n workflow backend endpoint is not configured. Please set N8N_WEBHOOK_URL or N8N_BASE_URL in your .env.local file.",
          configured: false,
        },
        { status: 503 }
      );
    }

    // Build the request payload expected by the n8n LangChain chat trigger / agent
    // In verita.json, the agent reads {{ $json.chatInput }}
    const n8nPayload = {
      chatInput: question,
      message: question,
      sessionId: sessionId || `verita-${Date.now()}`,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    };

    if (process.env.N8N_API_KEY) {
      headers["Authorization"] = `Bearer ${process.env.N8N_API_KEY.trim()}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    let n8nResponse: Response;
    try {
      n8nResponse = await fetch(webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(n8nPayload),
        signal: controller.signal,
      });
    } catch (fetchErr: unknown) {
      clearTimeout(timeoutId);
      const isAbort = (fetchErr as Error)?.name === "AbortError";
      const errMsg = isAbort
        ? "The request to the handbook assistant timed out. Please try again."
        : "Could not connect to the n8n backend service. Please ensure n8n is running and accessible.";

      return NextResponse.json(
        {
          error: isAbort ? "timeout" : "connection_failed",
          message: errMsg,
        },
        { status: isAbort ? 504 : 502 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text().catch(() => "");
      return NextResponse.json(
        {
          error: "backend_error",
          message: `The handbook assistant backend returned an error (HTTP ${n8nResponse.status}).`,
          details: errorText.slice(0, 300),
        },
        { status: 502 }
      );
    }

    // Read the response from n8n
    const contentType = n8nResponse.headers.get("content-type") || "";
    let responseData: unknown;

    if (contentType.includes("application/json")) {
      responseData = await n8nResponse.json().catch(() => ({}));
    } else {
      responseData = await n8nResponse.text();
    }

    // Normalize using our parser
    const normalized = parseN8nResponse(responseData);

    return NextResponse.json({
      answer: normalized.answer,
      citations: normalized.citations,
      isInsufficientEvidence: normalized.isInsufficientEvidence,
      sessionId: sessionId || n8nPayload.sessionId,
    });
  } catch (err: unknown) {
    console.error("Unexpected error in /api/chat:", err);
    return NextResponse.json(
      {
        error: "server_error",
        message: "An unexpected error occurred while processing your question.",
      },
      { status: 500 }
    );
  }
}
