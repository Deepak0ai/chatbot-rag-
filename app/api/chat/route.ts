import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { retrieveContext } from "@/lib/knowledgeBase";
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ reply: "Please ask something." });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { reply: "Missing GOOGLE_GENERATIVE_AI_API_KEY in Vercel environment variables." },
        { status: 500 }
      );
    }

    const context = retrieveContext(message);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
You are a helpful assistant.

Use only the context below to answer.
If the answer is not in the context, say you do not know.

Context:
${context}

User question:
${message}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return NextResponse.json({
      reply: response.text() || "No response.",
    });
  } catch (error) {
    console.error("CHAT API ERROR:", error);
    return NextResponse.json(
      { reply: "Error getting response." },
      { status: 500 }
    );
  }
}
