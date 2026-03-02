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
    <section id="news" className="relative section-padding overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(210 80% 10%) 0%, hsl(210 60% 16%) 50%, hsl(210 80% 10%) 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold" style={{ color: 'hsl(0, 0%, 100%)' }}>
            Tin Tức <em className="font-display italic" style={{ color: 'hsl(48, 100%, 50%)' }}>Crypto</em>
          </h2>
          <p className="text-sm max-w-lg mx-auto mt-3" style={{ color: 'hsl(210, 20%, 65%)' }}>
            Tổng hợp tin tức crypto nổi bật từ các nguồn uy tín hàng đầu
          </p>
        </motion.div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto flex gap-6 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl p-4 min-w-[320px]" style={{ background: 'hsl(210, 30%, 95%)' }}>
              <div className="rounded-xl h-44 mb-3" style={{ background: 'hsl(210, 20%, 88%)' }} />
              <div className="rounded h-4 w-3/4 mb-2" style={{ background: 'hsl(210, 20%, 88%)' }} />
              <div className="rounded h-3 w-full mb-1" style={{ background: 'hsl(210, 20%, 88%)' }} />
              <div className="rounded h-3 w-2/3" style={{ background: 'hsl(210, 20%, 88%)' }} />
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
            style={{ background: 'linear-gradient(to right, hsl(210 60% 16%) 0%, hsl(210 60% 16% / 0.6) 30%, transparent 100%)' }}
          />
          <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 z-20 pointer-events-none"
            style={{ background: 'linear-gradient(to left, hsl(210 60% 16%) 0%, hsl(210 60% 16% / 0.6) 30%, transparent 100%)' }}
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
                className="group block rounded-2xl overflow-hidden transition-all duration-300 flex-shrink-0 hover:-translate-y-1"
                style={{
                  width: CARD_WIDTH,
                  background: 'linear-gradient(145deg, hsl(210 50% 16%) 0%, hsl(210 55% 11%) 100%)',
                  border: '1px solid hsl(0, 0%, 100%, 0.15)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.imageurl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(210,55%,8%)] via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={12} style={{ color: 'hsl(0, 0%, 100%, 0.8)' }} />
                  </div>
                  <span className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ color: 'hsl(48, 100%, 70%)', background: 'hsl(0, 0%, 0%, 0.5)', border: '1px solid hsl(48, 100%, 50%, 0.2)' }}
                  >
                    {item.source}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-[13px] font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-amber-300 transition-colors" style={{ color: 'hsl(0, 0%, 100%)' }}>
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'hsl(0, 0%, 100%, 0.5)' }}>
                    {item.body}
                  </p>
                  <div className="flex items-center gap-1.5" style={{ color: 'hsl(48, 100%, 50%, 0.5)' }}>
                    <Clock size={11} />
                    <span className="text-[10px] font-mono">{formatTimeAgo(item.published_on)}</span>
                  </div>
                </div>
              </a>
            ))}
          </motion.div>
        </div>
      ) : (
        <p className="text-sm text-center" style={{ color: 'hsl(210, 20%, 50%)' }}>Không thể tải tin tức. Vui lòng thử lại sau.</p>
      )}

      <div className="max-w-7xl mx-auto text-center mt-8">
        <Link
          to="/news"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all hover:brightness-110"
          style={{ backgroundColor: 'hsl(210, 100%, 28%)', color: 'hsl(0, 0%, 100%)' }}
        >
          Xem tất cả tin trong tuần
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default NewsSection;
