import Anthropic from '@anthropic-ai/sdk';
import type { AIGenerateResult } from '../types';

let _client: Anthropic | null = null;
let _clientKey = '';

function getClient(apiKey: string): Anthropic {
  if (!_client || _clientKey !== apiKey) {
    _client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    _clientKey = apiKey;
  }
  return _client;
}

export async function generateIdeas(
  apiKey: string,
  prompt: string,
  context: string[]
): Promise<AIGenerateResult> {
  const anthropic = getClient(apiKey);

  const contextBlock =
    context.length > 0
      ? `\n\nContext from connected nodes:\n${context.map((c, i) => `[${i + 1}] ${c}`).join('\n')}`
      : '';

  const systemPrompt = `You are an idea expansion AI. Given a user prompt and optional context, you:
1. Generate a concise summary (2-3 sentences) that synthesizes the prompt and context.
2. Generate exactly 4 distinct, actionable sub-ideas that expand on the topic.

Always respond with valid JSON in this exact format:
{
  "summary": "...",
  "ideas": ["idea 1", "idea 2", "idea 3", "idea 4"]
}

Keep ideas concise (1-2 sentences each). Be creative and insightful.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: `Prompt: ${prompt}${contextBlock}` }],
  });

  const text = message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI response did not contain valid JSON');

  const parsed = JSON.parse(jsonMatch[0]) as AIGenerateResult;
  if (!parsed.summary || !Array.isArray(parsed.ideas)) {
    throw new Error('AI response had unexpected structure');
  }

  return parsed;
}

export async function summarizeNodes(apiKey: string, nodeContents: string[]): Promise<string> {
  const anthropic = getClient(apiKey);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Summarize these ideas into a single cohesive paragraph (3-4 sentences max):\n\n${nodeContents.map((c, i) => `${i + 1}. ${c}`).join('\n')}`,
      },
    ],
  });

  return message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');
}
