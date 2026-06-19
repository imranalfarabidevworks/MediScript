import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const geminiBody = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key not configured. Set GEMINI_API_KEY in your .env.local file." },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      }
    );

    const data = await response.json();

    // Gemini returned an error (404, 403, 400, etc.) — surface it instead of
    // silently passing it through as if it were a successful response.
    if (!response.ok) {
      console.error("Gemini API error response:", JSON.stringify(data));
      return NextResponse.json(
        {
          error: data?.error?.message || "Gemini API request failed",
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Gemini API route error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed",
      },
      { status: 500 }
    );
  }
}