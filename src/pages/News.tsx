import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Clock, Newspaper, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';

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
    <div className="min-h-screen bg-background text-foreground">
      <div className="section-padding pb-0">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-mono text-sm transition-colors mb-12"
          >
            <ArrowLeft size={16} />
            Quay lại
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="label-tag mb-6">
              <Newspaper size={14} />
              Crypto News
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide mb-4">
              <span className="text-accent font-mono">Tin Tức</span>
              <span className="text-muted-foreground mx-3">/</span>
              <span className="text-muted-foreground font-light">Trong Tuần</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed text-lg max-w-2xl mb-4">
              Tổng hợp tin tức crypto nổi bật trong 7 ngày qua — tự động cập nhật mỗi ngày từ các nguồn uy tín.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
              <span className="border border-border px-3 py-1 rounded-full">{news.length} tin tức</span>
              <span className="border border-border px-3 py-1 rounded-full">7 ngày gần nhất</span>
              {lastUpdated && (
                <span className="border border-border px-3 py-1 rounded-full flex items-center gap-1.5">
                  <RefreshCw size={10} />
                  Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
                </span>
              )}
              <button
                onClick={fetchNews}
                disabled={loading}
                className="border border-accent/30 text-accent px-3 py-1 rounded-full hover:bg-accent/10 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
                Làm mới
              </button>
            </div>
            <div className="h-px bg-border mt-12" />
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-12">
        {loading && news.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border/40 overflow-hidden">
                <div className="bg-muted h-48" />
                <div className="p-5 space-y-3">
                  <div className="bg-muted rounded h-4 w-3/4" />
                  <div className="bg-muted rounded h-3 w-full" />
                  <div className="bg-muted rounded h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="space-y-12">
            {Object.entries(groupedNews).map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-sm font-mono text-accent uppercase tracking-wider whitespace-nowrap">{date}</h2>
                  <div className="h-px bg-border flex-1" />
                  <span className="text-xs text-muted-foreground font-mono">{items.length} tin</span>
                </div>
                <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((newsItem) => (
                    <motion.a
                      key={newsItem.id}
                      variants={item}
                      href={newsItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-2xl overflow-hidden border border-border/40 bg-card hover:border-accent/30 transition-all duration-300"
                    >
                      <div className="relative h-48 overflow-hidden">
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
                        <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-wider text-accent bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          {newsItem.source}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="text-sm font-medium text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors">{newsItem.title}</h3>
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
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Newspaper size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Không thể tải tin tức. Vui lòng thử lại sau.</p>
            <button onClick={fetchNews} className="mt-4 text-accent text-sm hover:underline">Thử lại</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
