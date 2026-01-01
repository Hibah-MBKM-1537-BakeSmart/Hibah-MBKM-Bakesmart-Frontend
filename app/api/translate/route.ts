import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { text, targetLanguage, sourceLanguage = "en" } = body;

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing text or targetLanguage" },
        { status: 400 }
      );
    }

    // Skip translation if source and target are the same
    if (sourceLanguage === targetLanguage) {
      return NextResponse.json({
        translatedText: text,
      });
    }

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=${sourceLanguage}|${targetLanguage}`
    );

    if (!response.ok) {
      throw new Error("Translation API failed");
    }

    const data = await response.json();

    if (data.responseStatus !== 200) {
      throw new Error("Translation failed");
    }

    return NextResponse.json({
      translatedText: data.responseData.translatedText,
    });
  } catch (error) {
    console.error("[v0] Translation error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
