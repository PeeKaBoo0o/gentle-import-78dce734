import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

const impactLabel = (impact: string | null) => {
  switch (impact) {
    case 'high': return { color: 'bg-destructive', text: 'Cao' };
    case 'medium': return { color: 'bg-yellow-500', text: 'TB' };
    case 'low': return { color: 'bg-emerald-500', text: 'Thấp' };
    default: return { color: 'bg-muted-foreground/30', text: '—' };
  }
};

const currencyFlag: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', AUD: '🇦🇺',
  CAD: '🇨🇦', CHF: '🇨🇭', CNY: '🇨🇳', NZD: '🇳🇿', KRW: '🇰🇷',
};

const getDateStr = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDateHeading = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return format(d, "EEEE, dd/MM/yyyy", { locale: vi });
};

type TabKey = 'all' | 'today' | 'tomorrow' | 'yesterday';

const getEmptyMessage = (tab: TabKey) => {
  const dayOfWeek = new Date().getDay();
  if (tab === 'today' && (dayOfWeek === 0 || dayOfWeek === 6)) {
    return 'Hôm nay là cuối tuần — thị trường không có sự kiện kinh tế.';
  }
  if (tab === 'yesterday' && (dayOfWeek === 0 || dayOfWeek === 1)) {
    return 'Hôm qua là cuối tuần — thị trường không có sự kiện kinh tế.';
  }
  if (tab === 'tomorrow' && (dayOfWeek === 5 || dayOfWeek === 6)) {
    return 'Ngày mai là cuối tuần — thị trường không có sự kiện kinh tế.';
  }
  return 'Không có sự kiện nào cho ngày này. Dữ liệu sẽ được cập nhật khi có lịch mới.';
};

const EventTable = ({ events, emptyMessage }: { events: CalendarEvent[]; emptyMessage: string }) => {
  const grouped = useMemo(() => {
    return events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
      if (!acc[ev.event_date]) acc[ev.event_date] = [];
      acc[ev.event_date].push(ev);
      return acc;
    }, {});
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <p className="text-muted-foreground">📅 {emptyMessage}</p>
        <p className="text-xs text-muted-foreground/60">Chuyển sang tab "Tất cả" để xem toàn bộ lịch có sẵn.</p>
      </div>
    );
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
          <h2 className="text-sm font-semibold mb-3 capitalize text-primary">
            {formatDateHeading(date)}
          </h2>
          <div className="rounded-xl border border-border overflow-hidden divide-y divide-border bg-card">
            <div className="hidden sm:flex items-center gap-3 px-5 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium bg-muted/30">
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
                  className="hover:bg-muted/50 transition-colors px-5 py-2.5 flex items-center gap-3 text-[12px]"
                >
                  <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${imp.color}`} />
                  <span className="min-w-[50px] text-amber-500 font-mono text-xs">{ev.event_time || '—'}</span>
                  <span className="min-w-[55px]">
                    <span className="text-[10px] text-muted-foreground mr-1">{currencyFlag[ev.currency || ''] || ''}</span>
                    <span className="text-foreground font-semibold">{ev.currency}</span>
                  </span>
                  <span className="flex-1 text-muted-foreground truncate">
                    {ev.source === 'coinmarketcal' && <span className="text-[9px] bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1 py-0.5 rounded mr-1.5 font-semibold">TIỀN SỐ</span>}
                    {ev.source === 'tradingview' && <span className="text-[9px] bg-blue-500/15 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded mr-1.5 font-semibold">VĨ MÔ</span>}
                    {ev.event_name}
                  </span>
                  <div className="hidden sm:flex items-center gap-0 font-mono">
                    <span className="text-foreground min-w-[50px] text-right">{ev.actual || '–'}</span>
                    <span className="text-muted-foreground min-w-[50px] text-right">{ev.forecast || '–'}</span>
                    <span className="text-muted-foreground/50 min-w-[50px] text-right">{ev.previous || '–'}</span>
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

const Calendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('today');
  const [filter, setFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [pickerDate, setPickerDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const filteredEvents = useMemo(() => {
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
        if (pickerDate) {
          const pd = `${pickerDate.getFullYear()}-${String(pickerDate.getMonth() + 1).padStart(2, '0')}-${String(pickerDate.getDate()).padStart(2, '0')}`;
          base = events.filter(ev => ev.event_date === pd);
        } else {
          base = events;
        }
        break;
    }
    let result = filter ? base.filter(ev => ev.impact === filter) : base;
    return sourceFilter ? result.filter(ev => ev.source === sourceFilter) : result;
  }, [events, tab, filter, sourceFilter, pickerDate, todayStr, yesterdayStr, tomorrowStr]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'today', label: 'Hôm nay' },
    { key: 'yesterday', label: 'Hôm qua' },
    { key: 'tomorrow', label: 'Ngày mai' },
    { key: 'all', label: 'Tất cả' },
  ];

  const tabCounts = useMemo(() => ({
    all: events.length,
    yesterday: events.filter(ev => ev.event_date === yesterdayStr).length,
    today: events.filter(ev => ev.event_date === todayStr).length,
    tomorrow: events.filter(ev => ev.event_date === tomorrowStr).length,
  }), [events, todayStr, yesterdayStr, tomorrowStr]);

  const hasActiveFilters = filter !== null || sourceFilter !== null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">📅 Lịch Kinh Tế</h1>
                <p className="text-sm text-muted-foreground mt-1">Các sự kiện kinh tế quan trọng trong tuần</p>
              </div>
              {!loading && (
                <div className="text-right hidden sm:block">
                  <p className="text-2xl font-bold text-foreground">{filteredEvents.length}</p>
                  <p className="text-xs text-muted-foreground">sự kiện</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
            <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit overflow-x-auto">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); if (t.key !== 'all') setPickerDate(undefined); }}
                  className={cn(
                    'px-4 py-2 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap',
                    tab === t.key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t.label}
                  {!loading && (
                    <span className={cn(
                      'text-[10px] rounded-full px-1.5 py-0.5 font-mono',
                      tab === t.key ? 'bg-primary-foreground/20' : 'bg-background text-muted-foreground'
                    )}>
                      {tabCounts[t.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Filters toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl border border-border bg-card"
          >
            <Filter size={14} className="text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground font-medium mr-1">Lọc:</span>

            {/* Impact filters */}
            {[
              { key: null, label: 'Tất cả' },
              { key: 'high', label: '🔴 Cao' },
              { key: 'medium', label: '🟡 TB' },
              { key: 'low', label: '🟢 Thấp' },
            ].map(f => (
              <button
                key={f.key || 'all'}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border',
                  filter === f.key
                    ? 'bg-primary text-primary-foreground border-transparent'
                    : 'border-border text-muted-foreground hover:border-foreground/30'
                )}
              >
                {f.label}
              </button>
            ))}

            <span className="w-px h-5 bg-border mx-1 hidden sm:block" />

            {/* Source filters */}
            {[
              { key: null, label: 'Tất cả nguồn' },
              { key: 'tradingview', label: '📊 Vĩ mô' },
              { key: 'coinmarketcal', label: '🪙 Tiền số' },
            ].map(f => (
              <button
                key={f.key || 'all-source'}
                onClick={() => setSourceFilter(f.key)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border',
                  sourceFilter === f.key
                    ? 'bg-primary text-primary-foreground border-transparent'
                    : 'border-border text-muted-foreground hover:border-foreground/30'
                )}
              >
                {f.label}
              </button>
            ))}

            {/* Date picker in "all" tab */}
            {tab === 'all' && !loading && (
              <>
                <span className="w-px h-5 bg-border mx-1 hidden sm:block" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn('h-7 text-[11px] font-medium', !pickerDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-1.5 h-3 w-3" />
                      {pickerDate ? format(pickerDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={pickerDate}
                      onSelect={setPickerDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                {pickerDate && (
                  <button onClick={() => setPickerDate(undefined)} className="text-[11px] text-primary hover:underline">
                    Xóa
                  </button>
                )}
              </>
            )}

            {/* Clear all filters */}
            {hasActiveFilters && (
              <button
                onClick={() => { setFilter(null); setSourceFilter(null); }}
                className="ml-auto text-[11px] text-destructive hover:underline"
              >
                Xóa bộ lọc
              </button>
            )}
          </motion.div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground text-sm">Đang tải dữ liệu...</span>
            </div>
          ) : (
            <EventTable events={filteredEvents} emptyMessage={getEmptyMessage(tab)} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Calendar;
