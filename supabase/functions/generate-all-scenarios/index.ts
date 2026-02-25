import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch current prices from CoinGecko
    const priceRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,pax-gold&vs_currencies=usd&include_24hr_change=true'
    );
    
    let btcPrice = 0, btcChange = 0, goldPrice = 0, goldChange = 0;
    
    if (priceRes.ok) {
      const prices = await priceRes.json();
      btcPrice = prices.bitcoin?.usd || 0;
      btcChange = prices.bitcoin?.usd_24h_change || 0;
      goldPrice = prices['pax-gold']?.usd || 0;
      goldChange = prices['pax-gold']?.usd_24h_change || 0;
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('Missing LOVABLE_API_KEY');
    }

    const prompt = `You are a professional trading analyst. Given current market data, generate trading scenarios.

Current Data:
- BTC: $${btcPrice.toLocaleString()} (24h change: ${btcChange.toFixed(2)}%)
- Gold (PAXG): $${goldPrice.toFixed(2)} (24h change: ${goldChange.toFixed(2)}%)

Generate exactly this JSON (no markdown, no extra text):
{
  "btc": {
    "currentPrice": ${btcPrice},
    "change24h": ${btcChange.toFixed(2)},
    "scenarios": [
      {
        "id": "btc-1",
        "title": "<scenario title>",
        "bias": "LONG" or "SHORT" or "NEUTRAL",
        "probability": <number 1-100>,
        "condition": "<entry condition in Vietnamese>",
        "action": "<trading action in Vietnamese>",
        "invalidation": "<invalidation level in Vietnamese>",
        "keyLevels": ["$XX,XXX", "$XX,XXX"]
      }
    ]
  },
  "gold": {
    "currentPrice": ${goldPrice},
    "change24h": ${goldChange.toFixed(2)},
    "scenarios": [
      {
        "id": "gold-1",
        "title": "<scenario title>",
        "bias": "LONG" or "SHORT" or "NEUTRAL",
        "probability": <number 1-100>,
        "condition": "<entry condition in Vietnamese>",
        "action": "<trading action in Vietnamese>",
        "invalidation": "<invalidation level in Vietnamese>",
        "keyLevels": ["$X,XXX", "$X,XXX"]
      }
    ]
  },
  "generatedAt": "${new Date().toISOString()}"
}

Generate 2 scenarios for BTC and 2 for Gold. Write conditions/actions/invalidations in Vietnamese. Be specific with price levels.`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!aiRes.ok) {
      throw new Error(`AI API returned ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    // Return fallback data on error
    return new Response(JSON.stringify({
      error: 'Failed to generate scenarios',
      btc: { currentPrice: 0, change24h: 0, scenarios: [] },
      gold: { currentPrice: 0, change24h: 0, scenarios: [] },
      generatedAt: new Date().toISOString(),
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
