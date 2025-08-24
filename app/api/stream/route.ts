import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { perplexity } from "@ai-sdk/perplexity";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = streamText({
      // model: perplexity("sonar"),
      // model: google("gemini-1.5-flash"),
      model: openai("gpt-4.1-nano"),
      prompt,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
