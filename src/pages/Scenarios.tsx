import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Target, ShieldAlert, Zap, BarChart3, RefreshCw, Clock, ArrowLeft, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

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
  LONG: { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'LONG' },
  SHORT: { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', label: 'SHORT' },
  NEUTRAL: { icon: Minus, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', label: 'NEUTRAL' },
};

const PriceChart = ({ data, color, label }: { data: PricePoint[]; color: string; label: string }) => {
  if (data.length < 2) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Đang tải dữ liệu {label}...
      </div>
    );
  }

  const prices = data.map(d => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const padding = (max - min) * 0.1 || max * 0.001;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10, fill: 'hsl(25, 15%, 55%)' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[min - padding, max + padding]}
          tick={{ fontSize: 10, fill: 'hsl(25, 15%, 55%)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`}
          width={65}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(15, 20%, 12%)',
            border: '1px solid hsl(20, 15%, 25%)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'hsl(30, 20%, 90%)',
          }}
          formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, label]}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const ScenarioCard = ({ scenario }: { scenario: Scenario }) => {
  const config = biasConfig[scenario.bias] || biasConfig.NEUTRAL;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="warm-gradient-card border border-border/50 rounded-2xl p-5 md:p-6 space-y-4"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color} border ${config.border}`}>
          <Icon className="w-3.5 h-3.5" />
          {scenario.bias}
        </span>
        <h3 className="text-base font-semibold text-foreground">{scenario.title}</h3>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${scenario.probability >= 50 ? 'bg-emerald-400' : 'bg-amber-400'}`}
              style={{ width: `${scenario.probability}%` }}
            />
          </div>
          <span className="text-sm font-mono text-muted-foreground">{scenario.probability}%</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-background/40 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
            <Target className="w-3 h-3 text-accent" /> Điều kiện
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed">{scenario.condition}</p>
        </div>
        <div className="bg-background/40 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
            <Zap className="w-3 h-3 text-accent" /> Hành động
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed">{scenario.action}</p>
        </div>
        <div className="bg-background/40 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
            <ShieldAlert className="w-3 h-3 text-red-400" /> Invalidation
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed">{scenario.invalidation}</p>
        </div>
        <div className="bg-background/40 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
            <BarChart3 className="w-3 h-3 text-accent" /> Key Levels
          </div>
          <div className="flex flex-wrap gap-1.5">
            {scenario.keyLevels.map((level, i) => (
              <span key={i} className="text-[10px] font-mono bg-secondary/60 text-foreground/80 px-2 py-0.5 rounded-md">
                {level}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Scenarios = () => {
  const navigate = useNavigate();
  const [btcData, setBtcData] = useState<AssetData | null>(null);
  const [goldData, setGoldData] = useState<AssetData | null>(null);
  const [btcChart, setBtcChart] = useState<PricePoint[]>([]);
  const [goldChart, setGoldChart] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const chartIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchChartData = useCallback(async () => {
    try {
      const btcRes = await fetch('https://min-api.cryptocompare.com/data/v2/histominute?fsym=BTC&tsym=USD&limit=60');
      if (btcRes.ok) {
        const btcJson = await btcRes.json();
        const btcPoints: PricePoint[] = (btcJson.Data?.Data || []).map((d: any) => ({
          time: new Date(d.time * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          price: d.close,
        }));
        setBtcChart(btcPoints);
      }

      const goldRes = await fetch('https://min-api.cryptocompare.com/data/v2/histominute?fsym=PAXG&tsym=USD&limit=60');
      if (goldRes.ok) {
        const goldJson = await goldRes.json();
        const goldPoints: PricePoint[] = (goldJson.Data?.Data || []).map((d: any) => ({
          time: new Date(d.time * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          price: d.close,
        }));
        setGoldChart(goldPoints);
      }
    } catch (e) {
      console.error('Chart data fetch error:', e);
    }
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
      setGeneratedAt(data.generatedAt);
    } catch (e: any) {
      console.error('Fetch scenarios error:', e);
      setError(e.message || 'Không thể tạo kịch bản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
    fetchChartData();

    chartIntervalRef.current = setInterval(fetchChartData, 60000);
    return () => {
      if (chartIntervalRef.current) clearInterval(chartIntervalRef.current);
    };
  }, [fetchScenarios, fetchChartData]);

  const hasScenarios = (btcData?.scenarios?.length || 0) > 0 || (goldData?.scenarios?.length || 0) > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Trang chủ
          </button>
          <h1 className="text-lg font-semibold text-foreground">Kịch bản hôm nay</h1>
          <div className="flex items-center gap-2">
            {generatedAt && (
              <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(generatedAt).toLocaleTimeString('vi-VN')}
              </span>
            )}
            <Button
              onClick={() => { fetchScenarios(); fetchChartData(); }}
              variant="ghost"
              size="sm"
              disabled={loading}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-8">
        {loading && !hasScenarios && (
          <div className="flex flex-col items-center gap-4 py-24">
            <RefreshCw className="w-8 h-8 text-accent animate-spin" />
            <p className="text-muted-foreground text-sm">Đang phân tích thị trường BTC & Vàng...</p>
          </div>
        )}

        {error && !hasScenarios && (
          <div className="text-center py-16">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <Button onClick={fetchScenarios} variant="outline" className="rounded-full gap-2">
              <RefreshCw className="w-4 h-4" /> Thử lại
            </Button>
          </div>
        )}

        {(hasScenarios || btcChart.length > 0) && (
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <CircleDollarSign className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Bitcoin (BTC)</h2>
                  {btcData && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-foreground">${btcData.currentPrice?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      <span className={btcData.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {btcData.change24h >= 0 ? '+' : ''}{btcData.change24h?.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="warm-gradient-card border border-border/50 rounded-2xl p-4">
                <p className="text-xs text-muted-foreground mb-2">Biểu đồ 1 giờ gần nhất (cập nhật mỗi phút)</p>
                <PriceChart data={btcChart} color="#f59e0b" label="BTC" />
              </div>

              {btcData?.scenarios?.map(s => (
                <ScenarioCard key={s.id} scenario={s} />
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <span className="text-lg">🥇</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Vàng (XAUUSD)</h2>
                  {goldData && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-foreground">${goldData.currentPrice?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      {goldData.change24h != null && (
                        <span className={goldData.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {goldData.change24h >= 0 ? '+' : ''}{goldData.change24h?.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="warm-gradient-card border border-border/50 rounded-2xl p-4">
                <p className="text-xs text-muted-foreground mb-2">Biểu đồ 1 giờ gần nhất (cập nhật mỗi phút)</p>
                <PriceChart data={goldChart} color="#eab308" label="Gold" />
              </div>

              {goldData?.scenarios?.map(s => (
                <ScenarioCard key={s.id} scenario={s} />
              ))}
            </motion.div>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground/40 pt-4">
          ⚠ Chỉ mang tính tham khảo, không phải lời khuyên đầu tư. Dữ liệu vàng dựa trên PAXG (Pax Gold).
        </p>
      </div>
    </div>
  );
};

export default Scenarios;
