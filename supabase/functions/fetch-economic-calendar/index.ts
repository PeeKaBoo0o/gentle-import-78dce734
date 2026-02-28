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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = `https://nfs.faireconomy.media/ff_calendar_thisweek.json`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) {
      throw new Error(`Calendar API returned ${res.status}`);
    }

    const rawData = await res.json();

    if (!Array.isArray(rawData)) {
      throw new Error('Invalid calendar data format');
    }

    // Get today's date string in UTC
    const today = new Date();
    const yyyy = today.getUTCFullYear();
    const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(today.getUTCDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    // Filter today's events first; if none, show all week events
    let filtered = rawData.filter((item: any) => {
      if (!item.date) return false;
      return item.date.substring(0, 10) === todayStr;
    });

    // If no events today (weekend, etc.), show all events for the week
    if (filtered.length === 0) {
      filtered = rawData;
    }

    const events: CalendarEvent[] = filtered
      .map((item: any, idx: number) => {
        const eventDate = item.date ? item.date.substring(0, 10) : todayStr;
        const eventTime = item.date ? item.date.substring(11, 16) : null;
        
        let impact: string | null = null;
        if (item.impact) {
          const impactLower = String(item.impact).toLowerCase();
          if (impactLower === 'high' || impactLower === 'red') impact = 'high';
          else if (impactLower === 'medium' || impactLower === 'orange' || impactLower === 'yellow') impact = 'medium';
          else if (impactLower === 'low' || impactLower === 'green') impact = 'low';
        }

        return {
          id: `${eventDate}-${idx}`,
          event_date: eventDate,
          event_time: eventTime || null,
          currency: item.country || null,
          event_name: String(item.title || 'Unknown Event').substring(0, 200),
          impact,
          actual: item.actual ? String(item.actual).substring(0, 20) : null,
          forecast: item.forecast ? String(item.forecast).substring(0, 20) : null,
          previous: item.previous ? String(item.previous).substring(0, 20) : null,
        };
      })
      .slice(0, 50);

    return new Response(JSON.stringify(events), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Calendar fetch error:', e);
    return new Response(JSON.stringify([]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
