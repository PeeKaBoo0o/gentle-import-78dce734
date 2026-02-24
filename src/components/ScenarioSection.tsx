import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Target, ShieldAlert, Zap, BarChart3, RefreshCw, CircleDollarSign, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Scenario {
  id: string;
  title: string;
  bias: 'LONG' | 'SHORT' | 'NEUTRAL';
  probability: number;
  condition: string;
  action: string;
  invalidation: string;
  keyLevels: string[];
}

interface AssetData {
  currentPrice: number;
  change24h: number;
  scenarios: Scenario[];
}

interface PricePoint {
  time: string;
  price: number;
}

const biasConfig = {
  LONG: { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'LONG' },
  SHORT: { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'SHORT' },
  NEUTRAL: { icon: Minus, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'NEUTRAL' },
};

const MiniChart = ({ data, color, label }: { data: PricePoint[]; color: string; label: string }) => {
  if (data.length < 2) {
    return (
      <div className="h-[180px] flex items-center justify-center text-sm" style={{ color: 'hsl(20, 15%, 55%)' }}>
        <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Đang tải {label}...
      </div>
    );
  }

  const prices = data.map(d => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const padding = (max - min) * 0.1 || max * 0.001;

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'hsl(25, 15%, 55%)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis domain={[min - padding, max + padding]} tick={{ fontSize: 9, fill: 'hsl(25, 15%, 55%)' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`} width={55} />
        <Tooltip
          contentStyle={{ background: 'hsl(40, 30%, 96%)', border: '1px solid hsl(30, 20%, 85%)', borderRadius: '8px', fontSize: '11px', color: 'hsl(15, 25%, 15%)' }}
          formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, label]}
        />
        <Line type="monotone" dataKey="price" stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 3, fill: color }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

const MiniScenarioCard = ({ scenario }: { scenario: Scenario }) => {
  const config = biasConfig[scenario.bias] || biasConfig.NEUTRAL;
  const Icon = config.icon;

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'hsl(40, 30%, 93%)', border: '1px solid hsl(30, 20%, 85%)' }}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${config.bg} ${config.color} border ${config.border}`}>
          <Icon className="w-3 h-3" />
          {scenario.bias}
        </span>
        <span className="text-sm font-semibold" style={{ color: 'hsl(15, 25%, 15%)' }}>{scenario.title}</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(30, 20%, 85%)' }}>
            <div className={`h-full rounded-full ${scenario.probability >= 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${scenario.probability}%` }} />
          </div>
          <span className="text-xs font-mono" style={{ color: 'hsl(20, 15%, 45%)' }}>{scenario.probability}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg p-2.5 space-y-1" style={{ background: 'hsl(40, 30%, 97%)' }}>
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider" style={{ color: 'hsl(20, 15%, 55%)' }}>
            <Target className="w-2.5 h-2.5" /> Điều kiện
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'hsl(15, 25%, 20%)' }}>{scenario.condition}</p>
        </div>
        <div className="rounded-lg p-2.5 space-y-1" style={{ background: 'hsl(40, 30%, 97%)' }}>
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider" style={{ color: 'hsl(20, 15%, 55%)' }}>
            <Zap className="w-2.5 h-2.5" /> Hành động
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'hsl(15, 25%, 20%)' }}>{scenario.action}</p>
        </div>
        <div className="rounded-lg p-2.5 space-y-1" style={{ background: 'hsl(40, 30%, 97%)' }}>
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider" style={{ color: 'hsl(20, 15%, 55%)' }}>
            <ShieldAlert className="w-2.5 h-2.5 text-red-400" /> Invalidation
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'hsl(15, 25%, 20%)' }}>{scenario.invalidation}</p>
        </div>
        <div className="rounded-lg p-2.5 space-y-1" style={{ background: 'hsl(40, 30%, 97%)' }}>
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider" style={{ color: 'hsl(20, 15%, 55%)' }}>
            <BarChart3 className="w-2.5 h-2.5" /> Key Levels
          </div>
          <div className="flex flex-wrap gap-1">
            {scenario.keyLevels.map((level, i) => (
              <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'hsl(30, 20%, 88%)', color: 'hsl(15, 25%, 25%)' }}>
                {level}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ScenarioSection = () => {
  const navigate = useNavigate();
  const [btcData, setBtcData] = useState<AssetData | null>(null);
  const [goldData, setGoldData] = useState<AssetData | null>(null);
  const [btcChart, setBtcChart] = useState<PricePoint[]>([]);
  const [goldChart, setGoldChart] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchChartData = useCallback(async () => {
    try {
      const [btcRes, goldRes] = await Promise.all([
        fetch('https://min-api.cryptocompare.com/data/v2/histominute?fsym=BTC&tsym=USD&limit=60'),
        fetch('https://min-api.cryptocompare.com/data/v2/histominute?fsym=PAXG&tsym=USD&limit=60'),
      ]);
      if (btcRes.ok) {
        const d = await btcRes.json();
        setBtcChart((d.Data?.Data || []).map((p: any) => ({ time: new Date(p.time * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), price: p.close })));
      }
      if (goldRes.ok) {
        const d = await goldRes.json();
        setGoldChart((d.Data?.Data || []).map((p: any) => ({ time: new Date(p.time * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), price: p.close })));
      }
    } catch (e) { console.error('Chart fetch error:', e); }
  }, []);

  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-all-scenarios');
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setBtcData(data.btc || null);
      setGoldData(data.gold || null);
    } catch (e: any) {
      console.error('Scenarios error:', e);
      setError(e.message || 'Không thể tạo kịch bản');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
    fetchChartData();
    chartIntervalRef.current = setInterval(fetchChartData, 60000);
    return () => { if (chartIntervalRef.current) clearInterval(chartIntervalRef.current); };
  }, [fetchScenarios, fetchChartData]);

  const hasScenarios = (btcData?.scenarios?.length || 0) > 0 || (goldData?.scenarios?.length || 0) > 0;

  return (
    <section id="scenarios" className="section-padding relative">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold" style={{ color: 'hsl(15, 25%, 15%)' }}>
            Kịch bản <em className="font-display italic text-accent">hôm nay</em>
          </h2>
          <p className="text-sm max-w-lg mx-auto mt-3" style={{ color: 'hsl(20, 15%, 40%)' }}>
            Phân tích kịch bản giao dịch BTC & Vàng dựa trên dữ liệu thị trường real-time.
          </p>
        </motion.div>

        {loading && !hasScenarios && (
          <div className="flex flex-col items-center gap-3 py-16">
            <RefreshCw className="w-6 h-6 animate-spin text-accent" />
            <p className="text-sm" style={{ color: 'hsl(20, 15%, 50%)' }}>Đang phân tích thị trường...</p>
          </div>
        )}

        {error && !hasScenarios && (
          <div className="text-center py-12">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <Button onClick={fetchScenarios} variant="outline" size="sm" className="rounded-full gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Thử lại
            </Button>
          </div>
        )}

        {(hasScenarios || btcChart.length > 0) && (
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <CircleDollarSign className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'hsl(15, 25%, 15%)' }}>Bitcoin (BTC)</h3>
                  {btcData && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono" style={{ color: 'hsl(15, 25%, 15%)' }}>${btcData.currentPrice?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      <span className={btcData.change24h >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                        {btcData.change24h >= 0 ? '+' : ''}{btcData.change24h?.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl p-3" style={{ background: 'hsl(40, 30%, 95%)', border: '1px solid hsl(30, 20%, 88%)' }}>
                <p className="text-[10px] mb-1" style={{ color: 'hsl(20, 15%, 55%)' }}>1 giờ gần nhất • cập nhật mỗi phút</p>
                <MiniChart data={btcChart} color="#d97706" label="BTC" />
              </div>

              {btcData?.scenarios?.map(s => <MiniScenarioCard key={s.id} scenario={s} />)}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <span className="text-base">🥇</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'hsl(15, 25%, 15%)' }}>Vàng (XAUUSD)</h3>
                  {goldData && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono" style={{ color: 'hsl(15, 25%, 15%)' }}>${goldData.currentPrice?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      {goldData.change24h != null && (
                        <span className={goldData.change24h >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                          {goldData.change24h >= 0 ? '+' : ''}{goldData.change24h?.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl p-3" style={{ background: 'hsl(40, 30%, 95%)', border: '1px solid hsl(30, 20%, 88%)' }}>
                <p className="text-[10px] mb-1" style={{ color: 'hsl(20, 15%, 55%)' }}>1 giờ gần nhất • cập nhật mỗi phút</p>
                <MiniChart data={goldChart} color="#ca8a04" label="Gold" />
              </div>

              {goldData?.scenarios?.map(s => <MiniScenarioCard key={s.id} scenario={s} />)}
            </motion.div>
          </div>
        )}

        <div className="text-center mt-8 space-y-3">
          <button
            onClick={() => navigate('/scenarios')}
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground hover:brightness-110 rounded-full px-6 py-3 text-sm font-semibold transition-all"
          >
            Xem chi tiết đầy đủ
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[10px]" style={{ color: 'hsl(20, 15%, 55%)' }}>⚠ Chỉ mang tính tham khảo, không phải lời khuyên đầu tư.</p>
        </div>
      </div>
    </section>
  );
};

export default ScenarioSection;
