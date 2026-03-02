const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TOP_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOTUSDT', 'LINKUSDT'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch Binance 24h tickers + CoinGecko global + derivatives in parallel
    const [tickerRes, globalRes, derivativesRes] = await Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/24hr', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }),
      fetch('https://api.coingecko.com/api/v3/global', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }),
      fetch('https://api.coingecko.com/api/v3/derivatives', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }),
    ]);

    if (!tickerRes.ok) throw new Error(`Binance API ${tickerRes.status}`);

    const allTickers = await tickerRes.json();

    // Filter top symbols
    const filtered = allTickers
      .filter((t: any) => TOP_SYMBOLS.includes(t.symbol))
      .map((t: any) => ({
        symbol: t.symbol.replace('USDT', ''),
        price: parseFloat(t.lastPrice),
        priceChange: parseFloat(t.priceChangePercent),
        volume: parseFloat(t.quoteVolume),
        high: parseFloat(t.highPrice),
        low: parseFloat(t.lowPrice),
      }));

    // BTC Dominance from CoinGecko global
    let btcDominance = 0;
    let totalMarketCap = 0;
    let totalVolume24h = 0;
    if (globalRes.ok) {
      const globalData = await globalRes.json();
      btcDominance = globalData?.data?.market_cap_percentage?.btc ?? 0;
      totalMarketCap = globalData?.data?.total_market_cap?.usd ?? 0;
      totalVolume24h = globalData?.data?.total_volume?.usd ?? 0;
    }

    // Derivatives data from CoinGecko
    let derivatives: any[] = [];
    if (derivativesRes.ok) {
      const derivData = await derivativesRes.json();
      const targetSymbols = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'DOT', 'LINK'];
      const seen = new Set<string>();
      derivatives = (derivData || [])
        .filter((d: any) => {
          const base = (d.symbol || '').split('/')[0]?.toUpperCase();
          if (!targetSymbols.includes(base) || seen.has(base)) return false;
          seen.add(base);
          return true;
        })
        .map((d: any) => ({
          symbol: (d.symbol || '').split('/')[0]?.toUpperCase(),
          fundingRate: d.funding_rate ?? 0,
          openInterest: d.open_interest ?? 0,
          volume24h: d.volume_24h ?? 0,
          spread: d.bid_ask_spread ?? 0,
        }));
    }

    const result = {
      tickers: filtered,
      btcDominance: Math.round(btcDominance * 100) / 100,
      totalMarketCap,
      totalVolume24h,
      derivatives,
      updatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Market data error:', e);
    return new Response(JSON.stringify({ tickers: [], btcDominance: 0, totalMarketCap: 0, totalVolume24h: 0, derivatives: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
