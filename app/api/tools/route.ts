import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  UIMessage,
  streamText,
  tool,
  InferUITools,
  UIDataTypes,
  stepCountIs,
} from "ai";
import { z } from "zod";

const tools = {
  getWeather: tool({
    description: "Get the current weather for a specific location.",
    inputSchema: z.object({
      city: z
        .string()
        .min(2)
        .max(100)
        .describe("The name of the city to get the weather for."),
    }),
    execute: async ({ city }) => {
      const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
      const response = await fetch(url);
      const data = await response.text();
      return data;
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const result = streamText({
      model: openai("gpt-4.1-nano"),
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(2),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
