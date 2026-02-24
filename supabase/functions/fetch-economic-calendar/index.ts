import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const today = new Date();
    const yyyy = today.getUTCFullYear();
    const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(today.getUTCDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // Try primary source: Nager.Date public holidays + Trading Economics style
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

    // Filter today's events and map to our format
    const events: CalendarEvent[] = rawData
      .filter((item: any) => {
        if (!item.date) return false;
        const eventDate = item.date.substring(0, 10);
        return eventDate === dateStr;
      })
      .map((item: any, idx: number) => {
        const eventDate = item.date ? item.date.substring(0, 10) : dateStr;
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
  } catch {
    return new Response(JSON.stringify([]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
