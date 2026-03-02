import { motion } from 'framer-motion';
import { ExternalLink, Clock, Newspaper, RefreshCw } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

interface NewsItem {
  id: string;
  title: string;
  body: string;
  imageurl: string;
  url: string;
  source: string;
  published_on: number;
  categories: string;
}

const formatTimeAgo = (timestamp: number) => {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=popular&extraParams=AlphaNet'
      );
      if (res.ok) {
        const data = await res.json();
        if (data.Data) {
          const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 86400;
          const weeklyNews = data.Data.filter(
            (item: NewsItem) => item.published_on >= oneWeekAgo
          );
          setNews(weeklyNews);
          setLastUpdated(new Date());
        }
      }
    } catch {
      // silently handle fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const groupedNews = news.reduce<Record<string, NewsItem[]>>((acc, item) => {
    const dateKey = formatDate(item.published_on);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">📰 Tin Tức Crypto</h1>
                <p className="text-sm text-muted-foreground mt-1">Tổng hợp tin tức nổi bật trong 7 ngày qua</p>
              </div>
              {!loading && (
                <div className="text-right hidden sm:block">
                  <p className="text-2xl font-bold text-foreground">{news.length}</p>
                  <p className="text-xs text-muted-foreground">tin tức</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl border border-border bg-card"
          >
            <span className="text-xs text-muted-foreground font-medium">📅 7 ngày gần nhất</span>
            <span className="w-px h-5 bg-border mx-1 hidden sm:block" />
            {lastUpdated && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <RefreshCw size={10} />
                Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
              </span>
            )}
            <button
              onClick={fetchNews}
              disabled={loading}
              className={cn(
                'ml-auto px-3 py-1.5 rounded-md text-[11px] font-medium transition-all border flex items-center gap-1.5',
                'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
              )}
            >
              <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
          </motion.div>

          {/* Content */}
          {loading && news.length === 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-border overflow-hidden">
                  <div className="bg-muted h-44" />
                  <div className="p-4 space-y-3">
                    <div className="bg-muted rounded h-4 w-3/4" />
                    <div className="bg-muted rounded h-3 w-full" />
                    <div className="bg-muted rounded h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : news.length > 0 ? (
            <div className="space-y-10">
              {Object.entries(groupedNews).map(([date, items]) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-sm font-semibold capitalize text-primary whitespace-nowrap">{date}</h2>
                    <div className="h-px bg-border flex-1" />
                    <span className="text-[11px] text-muted-foreground font-mono">{items.length} tin</span>
                  </div>
                  <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((newsItem) => (
                      <motion.a
                        key={newsItem.id}
                        variants={item}
                        href={newsItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="relative h-44 overflow-hidden">
                          <img
                            src={newsItem.imageurl}
                            alt={newsItem.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                          <div className="absolute top-3 right-3">
                            <ExternalLink size={14} className="text-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-wider text-primary bg-background/70 backdrop-blur-sm px-2 py-0.5 rounded-full font-medium">
                            {newsItem.source}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-medium text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">{newsItem.title}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">{newsItem.body}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-muted-foreground/60">
                              <Clock size={11} />
                              <span className="text-[10px]">{formatTimeAgo(newsItem.published_on)}</span>
                            </div>
                            {newsItem.categories && (
                              <span className="text-[10px] text-muted-foreground/50 font-mono truncate max-w-[120px]">{newsItem.categories.split('|')[0]}</span>
                            )}
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Newspaper size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Không thể tải tin tức. Vui lòng thử lại sau.</p>
              <button onClick={fetchNews} className="mt-4 text-primary text-sm hover:underline">Thử lại</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default News;
