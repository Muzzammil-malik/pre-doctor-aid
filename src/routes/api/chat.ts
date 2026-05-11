import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

const SYSTEM_PROMPT = `You are a professional Medical Triage Assistant.

Your role is to help users organize and communicate their symptoms clearly before visiting a real doctor.

You are NOT a licensed physician and must never diagnose diseases, prescribe medications, or claim certainty.

Your tasks:
- Ask clear follow-up questions about symptoms
- Gather duration, severity, existing conditions, and medications
- Help structure information professionally
- Maintain a calm and supportive tone
- Encourage users to seek professional medical help for serious symptoms

SAFETY: If the user mentions any of the following — chest pain, difficulty breathing, severe bleeding, loss of consciousness, stroke-like symptoms, or suicidal thoughts — strongly and immediately urge them to seek emergency medical attention (call local emergency services) before continuing.

When the user says "generate report", create a detailed Patient Summary Card in markdown table format with these fields:
| Field | Details |
|---|---|
| Main Symptoms | ... |
| Duration | ... |
| Severity | ... |
| Existing Conditions | ... |
| Medications | ... |
| Notes | ... |

Always include this disclaimer at the bottom of the report:
"This report is AI-generated and not a substitute for professional medical advice."`;

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        // Low temperature keeps medical-style replies conservative and consistent.
        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          temperature: 0.2,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});