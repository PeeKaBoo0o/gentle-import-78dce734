import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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

const getDateStr = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

type TabKey = 'all' | 'today' | 'tomorrow' | 'yesterday';

/* ── Mini date picker for "Tất cả" tab ── */
const MiniDatePicker = ({
  dates,
  selected,
  onSelect,
}: {
  dates: string[];
  selected: string | null;
  onSelect: (d: string | null) => void;
}) => {
  const todayStr = getDateStr(0);

  return (
    <div className="flex items-center gap-1 flex-wrap mb-4">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
          selected === null
            ? 'text-white border-transparent'
            : 'border-gray-200 text-gray-500 hover:border-gray-400'
        }`}
        style={selected === null ? { backgroundColor: 'hsl(210, 100%, 28%)' } : {}}
      >
        Tất cả ngày
      </button>
      {dates.map(date => {
        const d = new Date(date + 'T00:00:00');
        const label = `${d.getDate()}/${d.getMonth() + 1}`;
        const weekday = d.toLocaleDateString('vi-VN', { weekday: 'short' });
        const isToday = date === todayStr;
        return (
          <button
            key={date}
            onClick={() => onSelect(date)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
              selected === date
                ? 'text-white border-transparent'
                : isToday
                  ? 'border-amber-300 text-amber-600 hover:border-amber-400'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
            }`}
            style={selected === date ? { backgroundColor: 'hsl(210, 100%, 28%)' } : {}}
          >
            {weekday} {label}
          </button>
        );
      })}
    </div>
  );
};

/* ── Event table ── */
const EventTable = ({ events }: { events: CalendarEvent[] }) => {
  const grouped = events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    if (!acc[ev.event_date]) acc[ev.event_date] = [];
    acc[ev.event_date].push(ev);
    return acc;
  }, {});

  if (events.length === 0) {
    return <p className="text-center text-muted-foreground py-16">Không có sự kiện nào</p>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, dateEvents], gi) => (
        <motion.div
          key={date}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.06 }}
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
  );
};

/* ── Main page ── */
const Calendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>('all');
  const [pickerDate, setPickerDate] = useState<string | null>(null);

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

  const todayStr = getDateStr(0);
  const yesterdayStr = getDateStr(-1);
  const tomorrowStr = getDateStr(1);

  const uniqueDates = useMemo(() => [...new Set(events.map(ev => ev.event_date))].sort(), [events]);

  const tabFilteredEvents = useMemo(() => {
    let base: CalendarEvent[];
    switch (tab) {
      case 'today':
        base = events.filter(ev => ev.event_date === todayStr);
        break;
      case 'yesterday':
        base = events.filter(ev => ev.event_date === yesterdayStr);
        break;
      case 'tomorrow':
        base = events.filter(ev => ev.event_date === tomorrowStr);
        break;
      case 'all':
      default:
        base = pickerDate ? events.filter(ev => ev.event_date === pickerDate) : events;
        break;
    }
    return filter ? base.filter(ev => ev.impact === filter) : base;
  }, [events, tab, filter, pickerDate, todayStr, yesterdayStr, tomorrowStr]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'yesterday', label: 'Hôm qua' },
    { key: 'today', label: 'Hôm nay' },
    { key: 'tomorrow', label: 'Ngày mai' },
  ];

  const tabCounts = useMemo(() => ({
    all: events.length,
    yesterday: events.filter(ev => ev.event_date === yesterdayStr).length,
    today: events.filter(ev => ev.event_date === todayStr).length,
    tomorrow: events.filter(ev => ev.event_date === tomorrowStr).length,
  }), [events, todayStr, yesterdayStr, tomorrowStr]);

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

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex gap-1 mb-5 p-1 rounded-lg bg-gray-100 w-fit overflow-x-auto"
          >
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); if (t.key !== 'all') setPickerDate(null); }}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  tab === t.key
                    ? 'text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                style={tab === t.key ? { backgroundColor: 'hsl(210, 100%, 28%)' } : {}}
              >
                {t.label}
                {!loading && (
                  <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-mono ${
                    tab === t.key ? 'bg-white/20' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {tabCounts[t.key]}
                  </span>
                )}
              </button>
            ))}
          </motion.div>

          {/* Date picker for "Tất cả" tab */}
          {tab === 'all' && !loading && uniqueDates.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <MiniDatePicker dates={uniqueDates} selected={pickerDate} onSelect={setPickerDate} />
            </motion.div>
          )}

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
          ) : (
            <EventTable events={tabFilteredEvents} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Calendar;
