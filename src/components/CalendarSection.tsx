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
  source?: 'tradingview' | 'coinmarketcal';
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

const MAX_PREVIEW = 8;

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
    <section id="calendar" className="section-padding" style={{ background: 'hsl(0, 0%, 100%)' }}>
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
            <span style={{ color: 'hsl(210, 100%, 28%)' }}>Lịch Kinh Tế</span>
            <ArrowRight size={20} style={{ color: 'hsl(210, 100%, 28%)' }} className="group-hover/link:translate-x-1 transition-transform" />
          </Link>
          <p className="text-sm mt-2 capitalize" style={{ color: 'hsl(210, 20%, 40%)' }}>{todayStr}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-white/10 overflow-hidden"
          style={{ backgroundColor: 'hsl(215, 30%, 14%)' }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="ml-2 text-white/50 text-xs">Đang tải...</span>
            </div>
          ) : events.length === 0 ? (
            <p className="text-white/40 text-center py-8 text-xs">Kết nối backend để hiển thị lịch kinh tế</p>
          ) : (
            <div className="divide-y divide-white/5">
              {events.slice(0, MAX_PREVIEW).map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  className="hover:bg-white/5 transition-colors px-5 py-2 flex items-center gap-3 text-[12px]"
                >
                  <div className="flex items-center gap-2 min-w-[65px]">
                    <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${impactDot(ev.impact)}`} />
                    <span className="text-amber-400/90 font-mono">{ev.event_time || '—'}</span>
                  </div>
                  <span className="min-w-[55px] font-medium">
                    <span className="text-[10px] text-white/40 mr-1">{currencyFlag[ev.currency || ''] || ''}</span>
                    <span className="text-white/80 font-semibold">{ev.currency}</span>
                  </span>
                  <span className="flex-1 text-white/60 truncate">
                    {ev.source === 'coinmarketcal' && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded mr-1.5">TIỀN SỐ</span>}
                    {ev.source === 'tradingview' && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded mr-1.5">VĨ MÔ</span>}
                    {ev.event_name}
                  </span>
                  <div className="hidden sm:flex items-center gap-4 font-mono">
                    <span className="text-white/80 min-w-[40px] text-right">{ev.actual || '–'}</span>
                    <span className="text-white/40 min-w-[40px] text-right">{ev.forecast || '–'}</span>
                    <span className="text-white/25 min-w-[40px] text-right">{ev.previous || '–'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && events.length > 0 && (
            <Link
              to="/calendar"
              className="flex items-center justify-center gap-2 py-3 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors border-t border-white/5"
            >
              Xem chi tiết
              <ArrowRight size={14} />
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default CalendarSection;
