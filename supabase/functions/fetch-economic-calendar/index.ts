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

// ── CoinMarketCal ──────────────────────────────────────────────
async function fetchCoinMarketCal(): Promise<CalendarEvent[]> {
  const apiKey = Deno.env.get('COINMARKETCAL_API_KEY');
  if (!apiKey) {
    console.error('COINMARKETCAL_API_KEY not configured');
    return [];
  }

  try {
    const today = new Date();
    const dateFrom = new Date(today);
    dateFrom.setDate(today.getDate() - 7);
    const dateTo = new Date(today);
    dateTo.setDate(today.getDate() + 14);

    const fmt = (d: Date) => d.toISOString().substring(0, 10);

    const url = `https://developers.coinmarketcal.com/v1/events?max=75&dateRangeStart=${fmt(dateFrom)}&dateRangeEnd=${fmt(dateTo)}`;
    console.log('CoinMarketCal fetch:', url);

    const res = await fetch(url, {
      headers: { 'x-api-key': apiKey, 'Accept': 'application/json' },
    });

    console.log('CoinMarketCal status:', res.status);
    if (!res.ok) {
      const text = await res.text();
      console.error('CoinMarketCal error body:', text.substring(0, 300));
      return [];
    }

    const json = await res.json();
    const items = json.body || json.data || json;
    if (!Array.isArray(items)) {
      console.warn('CoinMarketCal: unexpected response shape');
      return [];
    }

    console.log('CoinMarketCal events count:', items.length);

    return items.map((item: any, idx: number) => {
      const dateStr = item.date_event ? String(item.date_event).substring(0, 10) : '';
      const coins = Array.isArray(item.coins) ? item.coins.map((c: any) => c.symbol || c.name).join(', ') : '';
      const categories = Array.isArray(item.categories) ? item.categories.map((c: any) => c.name).join(', ') : '';

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
        event_name: String(item.title?.en || item.title || 'Crypto Event').substring(0, 200) + (categories ? ` [${categories}]` : ''),
        impact,
        actual: null,
        forecast: null,
        previous: null,
        source: 'coinmarketcal' as const,
      };
    });
  } catch (e) {
    console.error('CoinMarketCal fetch error:', e);
    return [];
  }
}

// ── TradingView via Firecrawl ──────────────────────────────────
async function fetchTradingView(): Promise<CalendarEvent[]> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    console.error('FIRECRAWL_API_KEY not configured');
    return [];
  }

  try {
    console.log('Scraping TradingView economic calendar via Firecrawl...');

    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.tradingview.com/economic-calendar/',
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 5000,
      }),
    });

    console.log('Firecrawl status:', res.status);
    if (!res.ok) {
      const text = await res.text();
      console.error('Firecrawl error:', text.substring(0, 300));
      return [];
    }

    const json = await res.json();
    const markdown = json.data?.markdown || json.markdown || '';
    console.log('TradingView markdown length:', markdown.length);

    if (!markdown) return [];

    return parseTradingViewMarkdown(markdown);
  } catch (e) {
    console.error('TradingView fetch error:', e);
    return [];
  }
}

function parseTradingViewMarkdown(md: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = md.split('\n');

  let currentDate = '';
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Try to find table rows or structured data
  // TradingView calendar typically shows: Time | Currency | Impact | Event | Actual | Forecast | Previous
  const timePattern = /^(\d{1,2}:\d{2})/;
  const datePattern = /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)[,\s]+(\w+\s+\d{1,2}(?:,?\s*\d{4})?)/i;
  const isoDatePattern = /(\d{4}-\d{2}-\d{2})/;

  // Also try table row pattern: | time | currency | event | ... |
  const tableRowPattern = /\|?\s*(\d{1,2}:\d{2})?\s*\|?\s*([A-Z]{2,3})?\s*\|/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check for date headers
    const dateMatch = line.match(datePattern);
    if (dateMatch) {
      const parsed = new Date(dateMatch[0]);
      if (!isNaN(parsed.getTime())) {
        currentDate = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
      }
      continue;
    }

    const isoMatch = line.match(isoDatePattern);
    if (isoMatch) {
      currentDate = isoMatch[1];
      continue;
    }

    // Parse event lines - look for currency codes (USD, EUR, etc.) as indicators
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'NZD', 'KRW', 'INR', 'BRL', 'MXN', 'ZAR', 'SGD', 'HKD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'TRY', 'RUB', 'ALL'];
    
    let foundCurrency: string | null = null;
    for (const cur of currencies) {
      if (line.includes(cur)) {
        foundCurrency = cur;
        break;
      }
    }

    if (!foundCurrency) continue;

    // Extract time
    const timeMatch = line.match(timePattern);
    const eventTime = timeMatch ? timeMatch[1] : null;

    // Determine impact from keywords or symbols
    let impact: string | null = null;
    const lineLower = line.toLowerCase();
    if (lineLower.includes('high') || line.includes('🔴') || line.includes('***')) impact = 'high';
    else if (lineLower.includes('medium') || lineLower.includes('moderate') || line.includes('🟡') || line.includes('**')) impact = 'medium';
    else if (lineLower.includes('low') || line.includes('🟢')) impact = 'low';

    // Clean event name - remove time, currency, and data values
    let eventName = line
      .replace(timePattern, '')
      .replace(/\|/g, ' ')
      .replace(/\*+/g, '')
      .trim();

    // Remove the currency from the event name
    eventName = eventName.replace(new RegExp(`\\b${foundCurrency}\\b`), '').trim();
    // Remove numeric values that look like data points
    eventName = eventName.replace(/\s+[-]?\d+\.?\d*%?\s*/g, ' ').trim();
    eventName = eventName.replace(/\s{2,}/g, ' ').trim();

    if (eventName.length < 3) continue;

    // Extract actual/forecast/previous from numbers in the line
    const numbers = line.match(/[-]?\d+\.?\d*%?/g) || [];
    const actual = numbers.length > 0 ? numbers[numbers.length - 3] || null : null;
    const forecast = numbers.length > 1 ? numbers[numbers.length - 2] || null : null;
    const previous = numbers.length > 2 ? numbers[numbers.length - 1] || null : null;

    const useDate = currentDate || todayStr;

    events.push({
      id: `tv-${useDate}-${events.length}`,
      event_date: useDate,
      event_time: eventTime,
      currency: foundCurrency,
      event_name: eventName.substring(0, 200),
      impact,
      actual,
      forecast,
      previous,
      source: 'tradingview' as const,
    });
  }

  console.log('TradingView parsed events:', events.length);
  return events;
}

// ── Main handler ───────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch both sources in parallel
    const [cryptoEvents, macroEvents] = await Promise.all([
      fetchCoinMarketCal(),
      fetchTradingView(),
    ]);

    console.log(`Total: CoinMarketCal=${cryptoEvents.length}, TradingView=${macroEvents.length}`);

    const allEvents = [...macroEvents, ...cryptoEvents];

    // Sort by date + time
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
