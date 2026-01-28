// API route for Moonshot AI (Kimi) integration
// This proxy avoids CORS issues by making the API call from the server
// Moonshot API is fully OpenAI-compatible

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security: Only use env var, no fallback
  const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY;
  if (!MOONSHOT_API_KEY) {
    return res.status(500).json({ error: 'MOONSHOT_API_KEY not configured' });
  }

  // Debug: Check key format (mask most of it)
  const keyPrefix = MOONSHOT_API_KEY.substring(0, 6);
  const keyLength = MOONSHOT_API_KEY.length;
  console.log(`API Key format: ${keyPrefix}... (length: ${keyLength})`);

  // Validate request body
  if (!req.body.messages || !Array.isArray(req.body.messages)) {
    return res.status(400).json({ error: 'Messages array required' });
  }

  try {
    // Moonshot API is OpenAI-compatible, so we can pass the request directly
    console.log('Calling Moonshot API with model:', req.body.model || 'kimi-k2.5');
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOONSHOT_API_KEY}`
      },
      body: JSON.stringify({
        model: req.body.model || 'kimi-k2.5',
        messages: req.body.messages,
        temperature: req.body.temperature ?? 0.7,
        max_tokens: req.body.max_tokens ?? 32768,
        thinking: { type: 'disabled' } // Disable thinking mode for faster responses
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Moonshot API error:', data);
      console.error('API Key issue - using fallback. Get valid key from https://platform.moonshot.cn/');
      // Return error so frontend can use mock recommendations
      return res.status(response.status).json({
        error: data.error?.message || 'API request failed',
        type: data.error?.type,
        fallback: true
      });
    }

    // Response is already in OpenAI format, return directly
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      fallback: true 
    });
  }
}
