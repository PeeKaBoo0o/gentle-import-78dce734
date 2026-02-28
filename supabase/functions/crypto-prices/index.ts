const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const COINS = [
  'bitcoin', 'ethereum', 'tether', 'ripple', 'binancecoin',
  'usd-coin', 'solana', 'tron', 'dogecoin', 'bitcoin-cash',
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS.join(',')}&order=market_cap_desc&sparkline=false`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    if (!res.ok) {
      throw new Error(`CoinGecko API returned ${res.status}`);
    }

    const data = await res.json();

    const prices = data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      image: coin.image,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h ?? 0,
    }));

    return new Response(JSON.stringify(prices), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Crypto prices error:', e);
    return new Response(JSON.stringify([]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
