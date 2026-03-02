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
    <section id="analysis" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold" style={{ color: 'hsl(210, 80%, 8%)' }}>
            Phân Tích <em className="font-display italic" style={{ color: 'hsl(210, 100%, 28%)' }}>Crypto</em>
          </h2>
          <p className="text-sm max-w-lg mx-auto mt-3" style={{ color: 'hsl(210, 20%, 40%)' }}>
            Dữ liệu thị trường realtime từ Binance · Cập nhật mỗi 30 giây
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'hsl(210, 100%, 28%)' }} />
            <span className="ml-2 text-sm" style={{ color: 'hsl(210, 20%, 50%)' }}>Đang tải dữ liệu...</span>
          </div>
        ) : !data ? (
          <p className="text-center py-12 text-sm" style={{ color: 'hsl(210, 20%, 50%)' }}>Không thể tải dữ liệu thị trường</p>
        ) : (
          <>
            {/* Global Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-3 gap-3 mb-6"
            >
              {statCards.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="rounded-xl p-4 text-center"
                    style={{ background: 'hsl(210, 30%, 96%)', border: '1px solid hsl(210, 20%, 90%)' }}
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                      <Icon className="w-3.5 h-3.5" style={{ color: 'hsl(210, 100%, 28%)' }} />
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: 'hsl(210, 20%, 50%)' }}>{s.label}</span>
                    </div>
                    <span className="text-lg md:text-xl font-bold" style={{ color: 'hsl(210, 80%, 8%)' }}>{s.value}</span>
                  </div>
                );
              })}
            </motion.div>

            {/* Tickers Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'hsl(210, 30%, 96%)', border: '1px solid hsl(210, 20%, 90%)' }}
            >
              <div className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-2.5 text-[10px] uppercase tracking-wider" style={{ color: 'hsl(210, 20%, 50%)', borderBottom: '1px solid hsl(210, 20%, 90%)' }}>
                <span>Coin</span>
                <span className="text-right min-w-[80px]">Giá</span>
                <span className="text-right min-w-[60px]">24h %</span>
                <span className="hidden md:block text-right min-w-[90px]">Volume</span>
                <span className="text-right min-w-[70px]">H/L</span>
              </div>

              <div>
                {data.tickers.map((t, i) => {
                  const isUp = t.priceChange >= 0;
                  return (
                    <div
                      key={t.symbol}
                      className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-3 hover:bg-white/60 transition-colors text-sm"
                      style={{ borderBottom: '1px solid hsl(210, 20%, 92%)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'hsl(210, 30%, 90%)', color: 'hsl(210, 100%, 28%)' }}>
                          {i + 1}
                        </span>
                        <span className="font-semibold" style={{ color: 'hsl(210, 80%, 8%)' }}>{t.symbol}</span>
                        <span className="text-[10px]" style={{ color: 'hsl(210, 20%, 50%)' }}>/USDT</span>
                      </div>
                      <span className="text-right font-mono font-medium min-w-[80px]" style={{ color: 'hsl(210, 80%, 8%)' }}>
                        {formatPrice(t.price)}
                      </span>
                      <span className={`text-right font-mono text-xs min-w-[60px] flex items-center justify-end gap-0.5 ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? '+' : ''}{t.priceChange.toFixed(2)}%
                      </span>
                      <span className="hidden md:block text-right text-xs font-mono min-w-[90px]" style={{ color: 'hsl(210, 20%, 50%)' }}>
                        {formatCompact(t.volume)}
                      </span>
                      <span className="text-right text-[10px] font-mono min-w-[70px]">
                        <span className="text-emerald-600">{formatPrice(t.high)}</span>
                        <span className="mx-0.5" style={{ color: 'hsl(210, 20%, 70%)' }}>/</span>
                        <span className="text-red-500">{formatPrice(t.low)}</span>
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 py-2 flex items-center justify-between" style={{ borderTop: '1px solid hsl(210, 20%, 90%)' }}>
                <span className="text-[10px] font-mono" style={{ color: 'hsl(210, 20%, 60%)' }}>
                  Nguồn: Binance · CoinGecko
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px]" style={{ color: 'hsl(210, 20%, 60%)' }}>LIVE</span>
                </div>
              </div>
            </motion.div>

            {/* Derivatives */}
            {data.derivatives && data.derivatives.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-4 rounded-2xl overflow-hidden"
                style={{ background: 'hsl(210, 30%, 96%)', border: '1px solid hsl(210, 20%, 90%)' }}
              >
                <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid hsl(210, 20%, 90%)' }}>
                  <Activity className="w-4 h-4" style={{ color: 'hsl(210, 100%, 28%)' }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(210, 20%, 50%)' }}>Derivatives Data</span>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto_auto] items-center px-4 py-2 text-[10px] uppercase tracking-wider" style={{ color: 'hsl(210, 20%, 50%)', borderBottom: '1px solid hsl(210, 20%, 90%)' }}>
                  <span>Coin</span>
                  <span className="text-right min-w-[80px]">Funding Rate</span>
                  <span className="text-right min-w-[90px]">Open Interest</span>
                  <span className="text-right min-w-[80px]">Volume 24h</span>
                </div>
                <div>
                  {data.derivatives.map((d) => {
                    const frPositive = d.fundingRate >= 0;
                    return (
                      <div
                        key={d.symbol}
                        className="grid grid-cols-[1fr_auto_auto_auto] items-center px-4 py-3 hover:bg-white/60 transition-colors text-sm"
                        style={{ borderBottom: '1px solid hsl(210, 20%, 92%)' }}
                      >
                        <span className="font-semibold" style={{ color: 'hsl(210, 80%, 8%)' }}>{d.symbol}</span>
                        <span className={`text-right font-mono text-xs min-w-[80px] ${frPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                          {frPositive ? '+' : ''}{(d.fundingRate * 100).toFixed(4)}%
                        </span>
                        <span className="text-right text-xs font-mono min-w-[90px]" style={{ color: 'hsl(210, 20%, 50%)' }}>
                          {formatCompact(d.openInterest)}
                        </span>
                        <span className="text-right text-xs font-mono min-w-[80px]" style={{ color: 'hsl(210, 20%, 50%)' }}>
                          {formatCompact(d.volume24h)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 py-2" style={{ borderTop: '1px solid hsl(210, 20%, 90%)' }}>
                  <span className="text-[10px] font-mono" style={{ color: 'hsl(210, 20%, 60%)' }}>Nguồn: CoinGecko Derivatives</span>
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
