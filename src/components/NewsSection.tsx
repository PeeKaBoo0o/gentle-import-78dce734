import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

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

const CARD_WIDTH = 320;
const GAP = 24;
const PAUSE_DURATION = 1.5;

const NewsSection = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(
          'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=popular'
        );
        if (res.ok) {
          const data = await res.json();
          if (data.Data) {
            setNews(data.Data.slice(0, 6));
          }
        }
      } catch {
        // silently handle fetch errors
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, []);

  const buildKeyframes = (): number[] => {
    if (news.length === 0) return [0, 0];
    const steps: number[] = [];
    const count = news.length;
    for (let i = 0; i <= count; i++) {
      const pos = -(i * (CARD_WIDTH + GAP));
      steps.push(pos);
      if (i < count) steps.push(pos);
    }
    return steps;
  };

  const buildTimes = () => {
    if (news.length === 0) return [0, 1];
    const count = news.length;
    const scrollSegment = 1.5;
    const totalDur = count * (scrollSegment + PAUSE_DURATION);
    const times: number[] = [];
    for (let i = 0; i <= count; i++) {
      const scrollEnd = (i * (scrollSegment + PAUSE_DURATION)) / totalDur;
      times.push(scrollEnd);
      if (i < count) {
        const pauseEnd = (i * (scrollSegment + PAUSE_DURATION) + PAUSE_DURATION) / totalDur;
        times.push(pauseEnd);
      }
    }
    return times;
  };

  const xKeyframes = buildKeyframes();
  const timeKeyframes = buildTimes();
  const animDuration = news.length * (1.5 + PAUSE_DURATION);

  return (
    <section id="news" className="section-padding overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="text-foreground">Tin Tức</span>{' '}
            <span className="text-accent italic">Crypto</span>
          </h2>
        </motion.div>
      </div>

      {loading ? (
        <div className="max-w-6xl mx-auto flex gap-6 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse warm-gradient-card rounded-2xl p-4 min-w-[320px]">
              <div className="bg-muted rounded-xl h-44 mb-3" />
              <div className="bg-muted rounded h-4 w-3/4 mb-2" />
              <div className="bg-muted rounded h-3 w-full mb-1" />
              <div className="bg-muted rounded h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : news.length > 0 ? (
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 z-20 pointer-events-none"
            style={{ background: 'linear-gradient(to right, hsl(15 25% 5%) 0%, hsl(15 25% 5% / 0.8) 30%, transparent 100%)' }}
          />
          <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 z-20 pointer-events-none"
            style={{ background: 'linear-gradient(to left, hsl(15 25% 5%) 0%, hsl(15 25% 5% / 0.8) 30%, transparent 100%)' }}
          />

          <motion.div
            ref={scrollRef}
            className="flex gap-6 px-6"
            animate={isPaused ? {} : { x: xKeyframes }}
            transition={isPaused ? {} : {
              x: {
                duration: animDuration,
                times: timeKeyframes,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          >
            {[...news, ...news].map((item, i) => (
              <a
                key={`${item.id}-${i}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl overflow-hidden border border-border/40 warm-gradient-card hover:border-accent/30 transition-all duration-300 flex-shrink-0"
                style={{ width: CARD_WIDTH }}
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.imageurl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <ExternalLink size={14} className="text-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-wider text-accent bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    {item.source}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-medium text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                    {item.body}
                  </p>
                  <div className="flex items-center gap-1.5 text-muted-foreground/60">
                    <Clock size={11} />
                    <span className="text-[10px]">{formatTimeAgo(item.published_on)}</span>
                  </div>
                </div>
              </a>
            ))}
          </motion.div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm text-center">Không thể tải tin tức. Vui lòng thử lại sau.</p>
      )}

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent bg-accent/10 hover:bg-accent/20 px-6 py-3 rounded-full transition-colors group/all"
          >
            <span>Xem tất cả tin trong tuần</span>
            <ArrowRight size={16} className="group-hover/all:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;
