export const DEFAULT_MODEL = 'deepseek-v4-pro';

export async function listModels(apiKey: string): Promise<string[]> {
  const res = await fetch('https://api.deepseek.com/models', {
    headers: { Authorization: `Bearer ${apiKey}` }
  });

  if (!res.ok) {
    throw new Error(`DeepSeek API ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { data: { id: string }[] };
  return data.data.map((m) => m.id);
}

export async function askDeepSeek(
  apiKey: string,
  prompt: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    throw new Error(`DeepSeek API ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message.content ?? 'No response.';
}
