const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface CalendarEvent {
  id: string;
  event_date: string;
  event_time: string | null;
  currency: string | null;
  event_name: string;
  impact: string | null;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  source: 'tradingview' | 'coinmarketcal';
}

const extractionSchema = {
  type: 'object',
  properties: {
    events: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Event date in YYYY-MM-DD format' },
          time: { type: 'string', description: 'Event time in HH:MM format, or null' },
          currency: { type: 'string', description: 'Currency code like USD, EUR, GBP, JPY etc.' },
          name: { type: 'string', description: 'Name of the economic event' },
          impact: { type: 'string', description: 'Impact level: high, medium, or low' },
          actual: { type: 'string', description: 'Actual value if available' },
          forecast: { type: 'string', description: 'Forecast value if available' },
          previous: { type: 'string', description: 'Previous value if available' },
        },
        required: ['date', 'name'],
      },
    },
  },
  required: ['events'],
};

const cryptoExtractionSchema = {
  type: 'object',
  properties: {
    events: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Event date in YYYY-MM-DD format' },
          coins: { type: 'string', description: 'Coin symbols like BTC, ETH, etc.' },
          title: { type: 'string', description: 'Event title/description' },
          categories: { type: 'string', description: 'Event category like listing, airdrop, fork, etc.' },
          confidence: { type: 'string', description: 'Confidence percentage if shown' },
        },
        required: ['date', 'title'],
      },
    },
  },
  required: ['events'],
};

async function scrapeWithFirecrawl(url: string, schema: any, prompt: string): Promise<any> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    console.error('FIRECRAWL_API_KEY not configured');
    return null;
  }

  try {
    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['extract'],
        extract: { schema, prompt },
        waitFor: 6000,
      }),
    });

    console.log(`Firecrawl scrape ${url}: status=${res.status}`);
    if (!res.ok) {
      const text = await res.text();
      console.error('Firecrawl error:', text.substring(0, 500));
      return null;
    }

    const json = await res.json();
    return json.data?.extract || json.extract || null;
  } catch (e) {
    console.error('Firecrawl error:', e);
    return null;
  }
}

// ── TradingView ────────────────────────────────────────────────
async function fetchTradingView(): Promise<CalendarEvent[]> {
  const data = await scrapeWithFirecrawl(
    'https://www.tradingview.com/economic-calendar/',
    extractionSchema,
    'Extract ALL economic calendar events visible on this page. For each event extract: the date (YYYY-MM-DD), time (HH:MM), currency code (USD/EUR/GBP/JPY/etc), event name, impact level (high/medium/low), actual value, forecast value, and previous value. Return them as an array of event objects.'
  );

  if (!data?.events || !Array.isArray(data.events)) {
    console.log('TradingView: no events extracted');
    return [];
  }

  console.log('TradingView extracted events:', data.events.length);

  return data.events
    .filter((ev: any) => ev.date && ev.name)
    .map((ev: any, idx: number) => ({
      id: `tv-${ev.date}-${idx}`,
      event_date: String(ev.date).substring(0, 10),
      event_time: ev.time || null,
      currency: ev.currency || null,
      event_name: String(ev.name).substring(0, 200),
      impact: ['high', 'medium', 'low'].includes(ev.impact?.toLowerCase()) ? ev.impact.toLowerCase() : null,
      actual: ev.actual || null,
      forecast: ev.forecast || null,
      previous: ev.previous || null,
      source: 'tradingview' as const,
    }));
}

// ── CoinMarketCal ──────────────────────────────────────────────
async function fetchCoinMarketCal(): Promise<CalendarEvent[]> {
  // First try the API with the key
  const apiKey = Deno.env.get('COINMARKETCAL_API_KEY');
  if (apiKey) {
    try {
      const today = new Date();
      const dateFrom = new Date(today);
      dateFrom.setDate(today.getDate() - 3);
      const dateTo = new Date(today);
      dateTo.setDate(today.getDate() + 14);
      const fmt = (d: Date) => d.toISOString().substring(0, 10);

      const url = `https://developers.coinmarketcal.com/v1/events?max=75&dateRangeStart=${fmt(dateFrom)}&dateRangeEnd=${fmt(dateTo)}`;
      console.log('CoinMarketCal API fetch:', url);

      const res = await fetch(url, {
        headers: { 'x-api-key': apiKey, 'Accept': 'application/json' },
      });

      console.log('CoinMarketCal API status:', res.status);
      if (res.ok) {
        const json = await res.json();
        const items = json.body || json.data || json;
        if (Array.isArray(items) && items.length > 0) {
          console.log('CoinMarketCal API events:', items.length);
          return items.map((item: any, idx: number) => {
            const dateStr = item.date_event ? String(item.date_event).substring(0, 10) : '';
            const coins = Array.isArray(item.coins) ? item.coins.map((c: any) => c.symbol || c.name).join(', ') : '';
            let impact: string | null = null;
            if (item.percentage !== undefined) {
              const pct = Number(item.percentage);
              if (pct >= 70) impact = 'high';
              else if (pct >= 40) impact = 'medium';
              else impact = 'low';
            }
            return {
              id: `cmc-${dateStr}-${idx}`,
              event_date: dateStr,
              event_time: null,
              currency: coins || null,
              event_name: String(item.title?.en || item.title || 'Crypto Event').substring(0, 200),
              impact,
              actual: null,
              forecast: null,
              previous: null,
              source: 'coinmarketcal' as const,
            };
          });
        }
      } else {
        const text = await res.text();
        console.warn('CoinMarketCal API failed:', text.substring(0, 200));
      }
    } catch (e) {
      console.warn('CoinMarketCal API error:', e);
    }
  }

  // Fallback: scrape the website via Firecrawl
  console.log('CoinMarketCal: falling back to Firecrawl scraping');
  const data = await scrapeWithFirecrawl(
    'https://coinmarketcal.com/en/',
    cryptoExtractionSchema,
    'Extract ALL crypto events visible on this page. For each event extract: the date (YYYY-MM-DD format), coin symbols (BTC, ETH, etc), event title/description, category (listing, airdrop, fork, update, partnership, etc), and confidence percentage if shown. Return them as an array.'
  );

  if (!data?.events || !Array.isArray(data.events)) {
    console.log('CoinMarketCal scrape: no events found');
    return [];
  }

  console.log('CoinMarketCal scraped events:', data.events.length);

  return data.events
    .filter((ev: any) => ev.date && ev.title)
    .map((ev: any, idx: number) => {
      let impact: string | null = null;
      if (ev.confidence) {
        const pct = parseInt(ev.confidence);
        if (!isNaN(pct)) {
          if (pct >= 70) impact = 'high';
          else if (pct >= 40) impact = 'medium';
          else impact = 'low';
        }
      }
      return {
        id: `cmc-${ev.date}-${idx}`,
        event_date: String(ev.date).substring(0, 10),
        event_time: null,
        currency: ev.coins || null,
        event_name: `${String(ev.title).substring(0, 180)}${ev.categories ? ` [${ev.categories}]` : ''}`,
        impact,
        actual: null,
        forecast: null,
        previous: null,
        source: 'coinmarketcal' as const,
      };
    });
}

// ── Main ───────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const [macroEvents, cryptoEvents] = await Promise.all([
      fetchTradingView(),
      fetchCoinMarketCal(),
    ]);

    console.log(`Total: TradingView=${macroEvents.length}, CoinMarketCal=${cryptoEvents.length}`);

    const allEvents = [...macroEvents, ...cryptoEvents];

    allEvents.sort((a, b) => {
      const da = `${a.event_date} ${a.event_time || '00:00'}`;
      const db = `${b.event_date} ${b.event_time || '00:00'}`;
      return da.localeCompare(db);
    });

    return new Response(JSON.stringify(allEvents), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Calendar fetch error:', e);
    return new Response(JSON.stringify([]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
