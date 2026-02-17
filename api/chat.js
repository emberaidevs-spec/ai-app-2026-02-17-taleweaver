export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      return res.status(200).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').end();
    }

    if (req.method !== 'POST') {
      return res.status(405).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Method not allowed' });
    }

    const { prompt, theme } = req.body;

    if (!prompt || !theme) {
      return res.status(400).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Prompt and theme are required' });
    }

    const systemPrompt = `Generate a ${theme} story or poem based on the following prompt: ${prompt}. Be creative and engaging, and provide a unique and interesting response.`;
    const messages = [{ role: 'system', content: systemPrompt }];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate response: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return res.status(200).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    return res.status(500).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Failed to generate response' });
  }
}