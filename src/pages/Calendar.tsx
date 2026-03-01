import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';

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

const impactLabel = (impact: string | null) => {
  switch (impact) {
    case 'high': return { color: 'bg-red-500', text: 'Cao' };
    case 'medium': return { color: 'bg-yellow-500', text: 'TB' };
    case 'low': return { color: 'bg-emerald-500', text: 'Thấp' };
    default: return { color: 'bg-muted-foreground/30', text: '—' };
  }
};

const currencyFlag: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', AUD: '🇦🇺',
  CAD: '🇨🇦', CHF: '🇨🇭', CNY: '🇨🇳', NZD: '🇳🇿', KRW: '🇰🇷',
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });
};

const formatShortDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  const weekday = d.toLocaleDateString('vi-VN', { weekday: 'short' });
  const day = d.getDate();
  const month = d.getMonth() + 1;
  return `${weekday} ${day}/${month}`;
};

const Calendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // null = all

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('fetch-economic-calendar');
        if (!error && data && Array.isArray(data)) {
          setEvents(data as CalendarEvent[]);
        }
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  // Get unique dates from data
  const uniqueDates = [...new Set(events.map(ev => ev.event_date))].sort();

  const tabFilteredEvents = selectedDate
    ? events.filter(ev => ev.event_date === selectedDate)
    : events;

  const filteredEvents = filter
    ? tabFilteredEvents.filter(ev => ev.impact === filter)
    : tabFilteredEvents;

  // Group by date
  const grouped = filteredEvents.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    const date = ev.event_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(ev);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(0, 0%, 100%)' }}>
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link to="/" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline" style={{ color: 'hsl(210, 100%, 28%)' }}>
              <ArrowLeft size={16} /> Trang chủ
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <CalendarIcon size={28} style={{ color: 'hsl(210, 100%, 28%)' }} />
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'hsl(210, 100%, 28%)' }}>Lịch Kinh Tế</h1>
            </div>
            <p className="text-sm text-muted-foreground">Các sự kiện kinh tế quan trọng trong tuần</p>
          </motion.div>

          {/* Date Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex gap-1 mb-5 p-1 rounded-lg bg-gray-100 w-fit overflow-x-auto"
          >
            <button
              onClick={() => setSelectedDate(null)}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedDate === null
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              style={selectedDate === null ? { backgroundColor: 'hsl(210, 100%, 28%)' } : {}}
            >
              Tất cả
              {!loading && (
                <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-mono ${
                  selectedDate === null ? 'bg-white/20' : 'bg-gray-200 text-gray-500'
                }`}>
                  {events.length}
                </span>
              )}
            </button>
            {uniqueDates.map(date => {
              const count = events.filter(ev => ev.event_date === date).length;
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-4 py-2 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    selectedDate === date
                      ? 'text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                  style={selectedDate === date ? { backgroundColor: 'hsl(210, 100%, 28%)' } : {}}
                >
                  {formatShortDate(date)}
                  {!loading && (
                    <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-mono ${
                      selectedDate === date ? 'bg-white/20' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>

          {/* Impact Filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2 mb-6 flex-wrap"
          >
            {[
              { key: null, label: 'Tất cả' },
              { key: 'high', label: '🔴 Cao' },
              { key: 'medium', label: '🟡 Trung bình' },
              { key: 'low', label: '🟢 Thấp' },
            ].map(f => (
              <button
                key={f.key || 'all'}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  filter === f.key
                    ? 'text-white border-transparent'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
                style={filter === f.key ? { backgroundColor: 'hsl(210, 100%, 28%)' } : {}}
              >
                {f.label}
              </button>
            ))}
          </motion.div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'hsl(210, 100%, 28%)' }} />
              <span className="ml-2 text-muted-foreground text-sm">Đang tải dữ liệu...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">Không có sự kiện nào</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([date, dateEvents], gi) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.08 }}
                >
                  <h2 className="text-sm font-semibold mb-3 capitalize" style={{ color: 'hsl(210, 100%, 28%)' }}>
                    {formatDate(date)}
                  </h2>
                  <div
                    className="rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5"
                    style={{ backgroundColor: 'hsl(215, 30%, 14%)' }}
                  >
                    <div className="hidden sm:flex items-center gap-3 px-5 py-2 text-[10px] uppercase tracking-wider text-white/30 font-medium">
                      <span className="w-[6px]" />
                      <span className="min-w-[50px]">Giờ</span>
                      <span className="min-w-[55px]">Tiền tệ</span>
                      <span className="flex-1">Sự kiện</span>
                      <span className="min-w-[50px] text-right">TT</span>
                      <span className="min-w-[50px] text-right">DB</span>
                      <span className="min-w-[50px] text-right">Trước</span>
                    </div>
                    {dateEvents.map((ev, idx) => {
                      const imp = impactLabel(ev.impact);
                      return (
                        <div
                          key={ev.id || idx}
                          className="hover:bg-white/5 transition-colors px-5 py-2.5 flex items-center gap-3 text-[12px]"
                        >
                          <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${imp.color}`} />
                          <span className="min-w-[50px] text-amber-400/90 font-mono text-xs">{ev.event_time || '—'}</span>
                          <span className="min-w-[55px]">
                            <span className="text-[10px] text-white/40 mr-1">{currencyFlag[ev.currency || ''] || ''}</span>
                            <span className="text-white/80 font-semibold">{ev.currency}</span>
                          </span>
                          <span className="flex-1 text-white/60 truncate">{ev.event_name}</span>
                          <div className="hidden sm:flex items-center gap-0 font-mono">
                            <span className="text-white/80 min-w-[50px] text-right">{ev.actual || '–'}</span>
                            <span className="text-white/40 min-w-[50px] text-right">{ev.forecast || '–'}</span>
                            <span className="text-white/25 min-w-[50px] text-right">{ev.previous || '–'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Calendar;
