import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown, BarChart3, Activity, DollarSign, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Ticker {
  symbol: string;
  price: number;
  priceChange: number;
  volume: number;
  high: number;
  low: number;
}

interface Derivative {
  symbol: string;
  fundingRate: number;
  openInterest: number;
  volume24h: number;
  spread: number;
}

interface MarketData {
  tickers: Ticker[];
  derivatives: Derivative[];
  btcDominance: number;
  totalMarketCap: number;
  totalVolume24h: number;
  updatedAt: string;
}

const formatCompact = (n: number) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString('en-US')}`;
};

const formatPrice = (p: number) => {
  if (p >= 1) return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${p.toFixed(6)}`;
};

const AnalysisSection = () => {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const cacheRef = useRef<MarketData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: res, error } = await supabase.functions.invoke('market-data');
        if (!error && res && res.tickers) {
          setData(res as MarketData);
          cacheRef.current = res as MarketData;
        } else if (cacheRef.current) {
          setData(cacheRef.current);
        }
      } catch {
        if (cacheRef.current) setData(cacheRef.current);
      }
      setLoading(false);
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = data ? [
    { label: 'BTC Dominance', value: `${data.btcDominance}%`, icon: Activity },
    { label: 'Tổng vốn hóa', value: formatCompact(data.totalMarketCap), icon: DollarSign },
    { label: 'Volume 24h', value: formatCompact(data.totalVolume24h), icon: BarChart3 },
  ] : [];

  return (
    <section id="analysis" className="section-padding" style={{ backgroundColor: 'hsl(210, 80%, 6%)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <Link
            to="/analysis"
            className="inline-flex items-center gap-2 text-xl md:text-2xl font-semibold tracking-wide group/link"
          >
            <span className="text-accent">Phân Tích Crypto</span>
            <ArrowRight size={20} className="text-accent group-hover/link:translate-x-1 transition-transform" />
          </Link>
          <p className="text-sm max-w-xl mx-auto mt-2" style={{ color: 'hsl(210, 20%, 65%)' }}>
            Dữ liệu thị trường realtime từ Binance · Cập nhật mỗi 30 giây
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span className="ml-2 text-muted-foreground text-sm">Đang tải dữ liệu...</span>
          </div>
        ) : !data ? (
          <p className="text-muted-foreground text-center py-12 text-sm">Không thể tải dữ liệu thị trường</p>
        ) : (
          <>
            {/* Global Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-3 gap-3 mb-6"
            >
              {statCards.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="rounded-xl p-4 border border-border/40 text-center"
                    style={{ background: 'hsl(210, 50%, 9%)' }}
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                      <Icon className="w-3.5 h-3.5 text-accent/70" />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</span>
                    </div>
                    <span className="text-lg md:text-xl font-bold" style={{ color: 'hsl(210, 20%, 93%)' }}>{s.value}</span>
                  </div>
                );
              })}
            </motion.div>

            {/* Tickers Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-border/40 overflow-hidden"
              style={{ background: 'hsl(210, 50%, 9%)' }}
            >
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/30">
                <span>Coin</span>
                <span className="text-right min-w-[80px]">Giá</span>
                <span className="text-right min-w-[60px]">24h %</span>
                <span className="hidden md:block text-right min-w-[90px]">Volume</span>
                <span className="text-right min-w-[70px]">H/L</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-border/20">
                {data.tickers.map((t, i) => {
                  const isUp = t.priceChange >= 0;
                  return (
                    <div
                      key={t.symbol}
                      className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-3 hover:bg-white/[0.03] transition-colors text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">
                          {i + 1}
                        </span>
                        <span className="font-semibold" style={{ color: 'hsl(210, 20%, 93%)' }}>{t.symbol}</span>
                        <span className="text-[10px] text-muted-foreground">/USDT</span>
                      </div>
                      <span className="text-right font-mono font-medium min-w-[80px]" style={{ color: 'hsl(210, 20%, 93%)' }}>
                        {formatPrice(t.price)}
                      </span>
                      <span className={`text-right font-mono text-xs min-w-[60px] flex items-center justify-end gap-0.5 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? '+' : ''}{t.priceChange.toFixed(2)}%
                      </span>
                      <span className="hidden md:block text-right text-xs font-mono text-muted-foreground min-w-[90px]">
                        {formatCompact(t.volume)}
                      </span>
                      <span className="text-right text-[10px] font-mono min-w-[70px]">
                        <span className="text-emerald-400/60">{formatPrice(t.high)}</span>
                        <span className="text-muted-foreground/40 mx-0.5">/</span>
                        <span className="text-red-400/60">{formatPrice(t.low)}</span>
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Footer with timestamp */}
              <div className="px-4 py-2 border-t border-border/20 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground/50 font-mono">
                  Nguồn: Binance · CoinGecko
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-muted-foreground/50">LIVE</span>
                </div>
              </div>
            </motion.div>

            {/* Derivatives from CoinGecko */}
            {data.derivatives && data.derivatives.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 rounded-2xl border border-border/40 overflow-hidden"
                style={{ background: 'hsl(210, 50%, 9%)' }}
              >
                <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-accent/70" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Derivatives Data</span>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto_auto] items-center px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/30">
                  <span>Coin</span>
                  <span className="text-right min-w-[80px]">Funding Rate</span>
                  <span className="text-right min-w-[90px]">Open Interest</span>
                  <span className="text-right min-w-[80px]">Volume 24h</span>
                </div>
                <div className="divide-y divide-border/20">
                  {data.derivatives.map((d) => {
                    const frPositive = d.fundingRate >= 0;
                    return (
                      <div
                        key={d.symbol}
                        className="grid grid-cols-[1fr_auto_auto_auto] items-center px-4 py-3 hover:bg-white/[0.03] transition-colors text-sm"
                      >
                        <span className="font-semibold" style={{ color: 'hsl(210, 20%, 93%)' }}>{d.symbol}</span>
                        <span className={`text-right font-mono text-xs min-w-[80px] ${frPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {frPositive ? '+' : ''}{(d.fundingRate * 100).toFixed(4)}%
                        </span>
                        <span className="text-right text-xs font-mono text-muted-foreground min-w-[90px]">
                          {formatCompact(d.openInterest)}
                        </span>
                        <span className="text-right text-xs font-mono text-muted-foreground min-w-[80px]">
                          {formatCompact(d.volume24h)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 py-2 border-t border-border/20">
                  <span className="text-[10px] text-muted-foreground/50 font-mono">Nguồn: CoinGecko Derivatives</span>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default AnalysisSection;
