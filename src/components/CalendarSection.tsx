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
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-emerald-500';
    default: return 'bg-gray-300';
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
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold" style={{ color: 'hsl(210, 80%, 8%)' }}>
            Lịch <em className="font-display italic" style={{ color: 'hsl(210, 100%, 28%)' }}>Kinh Tế</em>
          </h2>
          <p className="text-sm max-w-lg mx-auto mt-3 capitalize" style={{ color: 'hsl(210, 20%, 40%)' }}>
            {todayStr} · Sự kiện kinh tế quan trọng trong ngày
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'hsl(210, 30%, 96%)', border: '1px solid hsl(210, 20%, 90%)' }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'hsl(210, 100%, 28%)' }} />
              <span className="ml-2 text-sm" style={{ color: 'hsl(210, 20%, 50%)' }}>Đang tải...</span>
            </div>
          ) : events.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'hsl(210, 20%, 50%)' }}>Kết nối backend để hiển thị lịch kinh tế</p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'hsl(210, 20%, 90%)' }}>
              {events.slice(0, MAX_PREVIEW).map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  className="hover:bg-white/60 transition-colors px-5 py-2.5 flex items-center gap-3 text-[12px]"
                >
                  <div className="flex items-center gap-2 min-w-[65px]">
                    <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${impactDot(ev.impact)}`} />
                    <span className="font-mono" style={{ color: 'hsl(210, 100%, 28%)' }}>{ev.event_time || '—'}</span>
                  </div>
                  <span className="min-w-[55px] font-medium">
                    <span className="text-[10px] mr-1" style={{ color: 'hsl(210, 20%, 50%)' }}>{currencyFlag[ev.currency || ''] || ''}</span>
                    <span className="font-semibold" style={{ color: 'hsl(210, 80%, 8%)' }}>{ev.currency}</span>
                  </span>
                  <span className="flex-1 truncate" style={{ color: 'hsl(210, 15%, 35%)' }}>
                    {ev.source === 'coinmarketcal' && <span className="text-[9px] bg-amber-500/15 text-amber-700 px-1 py-0.5 rounded mr-1.5">TIỀN SỐ</span>}
                    {ev.source === 'tradingview' && <span className="text-[9px] bg-blue-500/15 text-blue-700 px-1 py-0.5 rounded mr-1.5">VĨ MÔ</span>}
                    {ev.event_name}
                  </span>
                  <div className="hidden sm:flex items-center gap-4 font-mono">
                    <span className="min-w-[40px] text-right" style={{ color: 'hsl(210, 80%, 8%)' }}>{ev.actual || '–'}</span>
                    <span className="min-w-[40px] text-right" style={{ color: 'hsl(210, 20%, 50%)' }}>{ev.forecast || '–'}</span>
                    <span className="min-w-[40px] text-right" style={{ color: 'hsl(210, 20%, 70%)' }}>{ev.previous || '–'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && events.length > 0 && (
            <Link
              to="/calendar"
              className="flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors"
              style={{ color: 'hsl(210, 100%, 28%)', borderTop: '1px solid hsl(210, 20%, 90%)' }}
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
