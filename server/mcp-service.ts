import OpenAI from "openai";
import { storage } from "./storage";
import type { McpMessage } from "@shared/schema";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export interface McpChatOptions {
  connectionId: number;
  userMessage: string;
  model?: string;
  systemPrompt?: string;
}

export interface McpChatResponse {
  message: McpMessage;
  assistantMessage: McpMessage;
}

export class McpService {
  async chat(options: McpChatOptions): Promise<McpChatResponse> {
    const { connectionId, userMessage, model = "gpt-4o-mini", systemPrompt } = options;

    const userMsg = await storage.createMcpMessage({
      connectionId,
      role: "user",
      content: userMessage,
      metadata: { model },
    });

    const conversationHistory = await storage.getMcpMessages(connectionId);
    
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    
    conversationHistory.forEach((msg) => {
      messages.push({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      });
    });

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model,
        messages,
      });
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }

    const assistantContent = completion.choices[0]?.message?.content || "No response";

    const assistantMsg = await storage.createMcpMessage({
      connectionId,
      role: "assistant",
      content: assistantContent,
      metadata: {
        model,
        tokens: completion.usage?.total_tokens,
      },
    });

    return {
      message: userMsg,
      assistantMessage: assistantMsg,
    };
  }

  async streamChat(options: McpChatOptions): Promise<ReadableStream> {
    const { connectionId, userMessage, model = "gpt-4o-mini", systemPrompt } = options;

    await storage.createMcpMessage({
      connectionId,
      role: "user",
      content: userMessage,
      metadata: { model },
    });

    const conversationHistory = await storage.getMcpMessages(connectionId);
    
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    
    conversationHistory.forEach((msg) => {
      messages.push({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      });
    });

    let stream;
    try {
      stream = await openai.chat.completions.create({
        model,
        messages,
        stream: true,
      });
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }

    let fullResponse = "";
    
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            fullResponse += content;
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
          
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        } finally {
          if (fullResponse) {
            await storage.createMcpMessage({
              connectionId,
              role: "assistant",
              content: fullResponse,
              metadata: { model },
            });
          }
        }
      },
    });
  }

  async clearHistory(connectionId: number): Promise<boolean> {
    return await storage.deleteMcpMessages(connectionId);
  }

  async getHistory(connectionId: number, limit?: number): Promise<McpMessage[]> {
    return await storage.getMcpMessages(connectionId, limit);
  }
}

export const mcpService = new McpService();
