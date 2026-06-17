import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { apiKey, ...geminiBody } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 400 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch from Gemini" }, { status: 500 });
  }
}