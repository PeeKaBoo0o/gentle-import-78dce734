import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

const impactDot = (impact: string | null) => {
  switch (impact) {
    case 'high': return 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]';
    case 'medium': return 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.4)]';
    case 'low': return 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]';
    default: return 'bg-muted-foreground/30';
  }
};

const currencyFlag: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', AUD: '🇦🇺',
  CAD: '🇨🇦', CHF: '🇨🇭', CNY: '🇨🇳', NZD: '🇳🇿', KRW: '🇰🇷',
};

const CalendarSection = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('fetch-economic-calendar');
        if (!error && data && Array.isArray(data)) {
          setEvents(data as CalendarEvent[]);
        }
      } catch {
        // silently handle fetch errors
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const todayStr = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });

  return (
    <section id="calendar" className="section-padding" style={{ background: 'linear-gradient(180deg, hsl(210 80% 8%) 0%, hsl(210 60% 12%) 50%, hsl(210 80% 8%) 100%)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <Link
            to="/calendar"
            className="inline-flex items-center gap-2 text-xl md:text-2xl font-semibold tracking-wide group/link"
          >
            <span className="text-accent">Lịch Kinh Tế</span>
            <ArrowRight size={20} className="text-accent group-hover/link:translate-x-1 transition-transform" />
          </Link>
          <p className="text-sm text-muted-foreground mt-2 capitalize">{todayStr}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="warm-gradient-card rounded-2xl border border-border/40 overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <span className="ml-2 text-muted-foreground text-sm">Đang tải...</span>
            </div>
          ) : events.length === 0 ? (
            <p className="text-muted-foreground text-center py-10 text-sm">Kết nối backend để hiển thị lịch kinh tế</p>
          ) : (
            <div className="divide-y divide-border/30">
              {events.map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  className="hover:bg-secondary/20 transition-colors px-6 py-3 flex items-center gap-3"
                >
                  <div className="flex items-center gap-2 min-w-[70px]">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${impactDot(ev.impact)}`} />
                    <span className="text-[12px] text-muted-foreground font-mono">{ev.event_time || '—'}</span>
                  </div>
                  <span className="text-[12px] text-foreground/70 min-w-[40px]">
                    {currencyFlag[ev.currency || ''] || ''} {ev.currency}
                  </span>
                  <span className="flex-1 text-sm text-foreground truncate">{ev.event_name}</span>
                  <div className="hidden sm:flex items-center gap-3 text-[12px] font-mono">
                    <span className="text-foreground min-w-[40px] text-right">{ev.actual || '–'}</span>
                    <span className="text-muted-foreground min-w-[40px] text-right">{ev.forecast || '–'}</span>
                    <span className="text-muted-foreground/60 min-w-[40px] text-right">{ev.previous || '–'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default CalendarSection;
