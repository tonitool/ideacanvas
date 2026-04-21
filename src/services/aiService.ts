import type { AIGenerateResult } from '@/types';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';

async function chatCompletion(
  apiKey: string,
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  model = DEFAULT_MODEL,
  maxTokens = 1024
): Promise<string> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ideacanvas.app',
      'X-Title': 'IdeaCanvas',
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ||
      `OpenRouter error ${res.status}`
    );
  }

  const data = await res.json() as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content ?? '';
}

export async function generateIdeas(
  apiKey: string,
  prompt: string,
  context: string[]
): Promise<AIGenerateResult> {
  const contextBlock =
    context.length > 0
      ? `\n\nContext from connected nodes:\n${context.map((c, i) => `[${i + 1}] ${c}`).join('\n')}`
      : '';

  const text = await chatCompletion(
    apiKey,
    [
      {
        role: 'system',
        content: `You are an idea expansion AI. Given a user prompt and optional context, you:
1. Generate a concise summary (2-3 sentences) that synthesizes the prompt and context.
2. Generate exactly 4 distinct, actionable sub-ideas that expand on the topic.

Always respond with valid JSON in this exact format:
{
  "summary": "...",
  "ideas": ["idea 1", "idea 2", "idea 3", "idea 4"]
}

Keep ideas concise (1-2 sentences each). Be creative and insightful.`,
      },
      {
        role: 'user',
        content: `Prompt: ${prompt}${contextBlock}`,
      },
    ]
  );

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI response did not contain valid JSON');

  const parsed = JSON.parse(jsonMatch[0]) as AIGenerateResult;
  if (!parsed.summary || !Array.isArray(parsed.ideas)) {
    throw new Error('AI response had unexpected structure');
  }

  return parsed;
}

export async function summarizeNodes(apiKey: string, nodeContents: string[]): Promise<string> {
  return chatCompletion(
    apiKey,
    [
      {
        role: 'user',
        content: `Summarize these ideas into a single cohesive paragraph (3-4 sentences max):\n\n${nodeContents.map((c, i) => `${i + 1}. ${c}`).join('\n')}`,
      },
    ],
    DEFAULT_MODEL,
    512
  );
}
