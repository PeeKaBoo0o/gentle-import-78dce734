import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Activity, DollarSign, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

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

const Analysis = () => {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const cacheRef = useRef<MarketData | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchData = async () => {
    try {
      const { data: res, error } = await supabase.functions.invoke('market-data');
      if (!error && res && res.tickers) {
        setData(res as MarketData);
        cacheRef.current = res as MarketData;
        setLastUpdated(new Date());
      } else if (cacheRef.current) {
        setData(cacheRef.current);
      }
    } catch {
      if (cacheRef.current) setData(cacheRef.current);
    }
    setLoading(false);
  };

  useEffect(() => {
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">📊 Phân Tích Crypto</h1>
                <p className="text-sm text-muted-foreground mt-1">Dữ liệu thị trường realtime từ Binance · Cập nhật mỗi 30 giây</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-muted-foreground font-mono">LIVE</span>
              </div>
            </div>
          </motion.div>

          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl border border-border bg-card"
          >
            <span className="text-xs text-muted-foreground font-medium">Nguồn: Binance · CoinGecko</span>
            <span className="w-px h-5 bg-border mx-1 hidden sm:block" />
            {lastUpdated && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <RefreshCw size={10} />
                {lastUpdated.toLocaleTimeString('vi-VN')}
              </span>
            )}
            <button
              onClick={fetchData}
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
          {loading && !data ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground text-sm">Đang tải dữ liệu...</span>
            </div>
          ) : !data ? (
            <div className="text-center py-20">
              <BarChart3 size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Không thể tải dữ liệu thị trường</p>
              <button onClick={fetchData} className="mt-4 text-primary text-sm hover:underline">Thử lại</button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Global Stats */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-3 gap-3"
              >
                {statCards.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="rounded-xl p-4 border border-border bg-card text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1.5">
                        <Icon className="w-3.5 h-3.5 text-primary/70" />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</span>
                      </div>
                      <span className="text-lg md:text-xl font-bold text-foreground">{s.value}</span>
                    </div>
                  );
                })}
              </motion.div>

              {/* Tickers Table */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-border overflow-hidden bg-card"
              >
                <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-muted/30">
                  <TrendingUp className="w-4 h-4 text-primary/70" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Spot Market</span>
                  <span className="ml-auto text-[10px] text-muted-foreground font-mono">{data.tickers.length} coins</span>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border font-medium">
                  <span>Coin</span>
                  <span className="text-right min-w-[80px]">Giá</span>
                  <span className="text-right min-w-[60px]">24h %</span>
                  <span className="hidden md:block text-right min-w-[90px]">Volume</span>
                  <span className="text-right min-w-[70px]">H/L</span>
                </div>
                <div className="divide-y divide-border">
                  {data.tickers.map((t, i) => {
                    const isUp = t.priceChange >= 0;
                    return (
                      <div
                        key={t.symbol}
                        className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-3 hover:bg-muted/50 transition-colors text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {i + 1}
                          </span>
                          <span className="font-semibold text-foreground">{t.symbol}</span>
                          <span className="text-[10px] text-muted-foreground">/USDT</span>
                        </div>
                        <span className="text-right font-mono font-medium min-w-[80px] text-foreground">
                          {formatPrice(t.price)}
                        </span>
                        <span className={`text-right font-mono text-xs min-w-[60px] flex items-center justify-end gap-0.5 ${isUp ? 'text-emerald-500' : 'text-destructive'}`}>
                          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isUp ? '+' : ''}{t.priceChange.toFixed(2)}%
                        </span>
                        <span className="hidden md:block text-right text-xs font-mono text-muted-foreground min-w-[90px]">
                          {formatCompact(t.volume)}
                        </span>
                        <span className="text-right text-[10px] font-mono min-w-[70px]">
                          <span className="text-emerald-500/60">{formatPrice(t.high)}</span>
                          <span className="text-muted-foreground/40 mx-0.5">/</span>
                          <span className="text-destructive/60">{formatPrice(t.low)}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Derivatives */}
              {data.derivatives && data.derivatives.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="rounded-xl border border-border overflow-hidden bg-card"
                >
                  <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-muted/30">
                    <Activity className="w-4 h-4 text-primary/70" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Derivatives Data</span>
                    <span className="ml-auto text-[10px] text-muted-foreground font-mono">{data.derivatives.length} coins</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_auto_auto] items-center px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border font-medium">
                    <span>Coin</span>
                    <span className="text-right min-w-[80px]">Funding Rate</span>
                    <span className="text-right min-w-[90px]">Open Interest</span>
                    <span className="text-right min-w-[80px]">Volume 24h</span>
                  </div>
                  <div className="divide-y divide-border">
                    {data.derivatives.map((d) => {
                      const frPositive = d.fundingRate >= 0;
                      return (
                        <div
                          key={d.symbol}
                          className="grid grid-cols-[1fr_auto_auto_auto] items-center px-4 py-3 hover:bg-muted/50 transition-colors text-sm"
                        >
                          <span className="font-semibold text-foreground">{d.symbol}</span>
                          <span className={`text-right font-mono text-xs min-w-[80px] ${frPositive ? 'text-emerald-500' : 'text-destructive'}`}>
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
                  <div className="px-4 py-2 border-t border-border">
                    <span className="text-[10px] text-muted-foreground/50 font-mono">Nguồn: CoinGecko Derivatives</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analysis;
