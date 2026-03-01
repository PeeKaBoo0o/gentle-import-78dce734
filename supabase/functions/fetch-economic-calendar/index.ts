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
}

function parseRawEvents(rawData: any[], prefix: string): CalendarEvent[] {
  if (!Array.isArray(rawData)) return [];
  return rawData.map((item: any, idx: number) => {
    const eventDate = item.date ? item.date.substring(0, 10) : '';
    const eventTime = item.date ? item.date.substring(11, 16) : null;

    let impact: string | null = null;
    if (item.impact) {
      const impactLower = String(item.impact).toLowerCase();
      if (impactLower === 'high' || impactLower === 'red') impact = 'high';
      else if (impactLower === 'medium' || impactLower === 'orange' || impactLower === 'yellow') impact = 'medium';
      else if (impactLower === 'low' || impactLower === 'green') impact = 'low';
    }

    return {
      id: `${prefix}-${eventDate}-${idx}`,
      event_date: eventDate,
      event_time: eventTime || null,
      currency: item.country || null,
      event_name: String(item.title || 'Unknown Event').substring(0, 200),
      impact,
      actual: item.actual ? String(item.actual).substring(0, 20) : null,
      forecast: item.forecast ? String(item.forecast).substring(0, 20) : null,
      previous: item.previous ? String(item.previous).substring(0, 20) : null,
    };
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const urls = [
      { url: 'https://nfs.faireconomy.media/ff_calendar_lastweek.json', prefix: 'lw' },
      { url: 'https://nfs.faireconomy.media/ff_calendar_thisweek.json', prefix: 'tw' },
      { url: 'https://nfs.faireconomy.media/ff_calendar_nextweek.json', prefix: 'nw' },
    ];

    const results = await Promise.allSettled(
      urls.map(({ url }) =>
        fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => {
          console.log(`Fetch ${url}: status=${r.status}`);
          return r.ok ? r.json() : [];
        })
      )
    );

    let allEvents: CalendarEvent[] = [];
    results.forEach((result, i) => {
      const count = result.status === 'fulfilled' && Array.isArray(result.value) ? result.value.length : 0;
      console.log(`Source ${urls[i].prefix}: ${result.status}, count=${count}`);
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        allEvents = allEvents.concat(parseRawEvents(result.value, urls[i].prefix));
      }
    });

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
