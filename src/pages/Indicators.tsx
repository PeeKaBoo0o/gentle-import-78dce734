import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, Zap, Shield, BarChart3, TrendingUp, Eye, Layers, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import indicatorImg from '@/assets/indicator-liquidity-hunter.png';
import indicatorVolatilityImg from '@/assets/indicator-volatility.png';
import indicatorSltpImg from '@/assets/indicator-sltp.png';

const indicators = [
  {
    id: 'liquidity-hunter',
    label: '[Jan - 6] 2025',
    title: 'Alpha Net Liquidity Hunter',
    subtitle: 'Smart Money',
    description:
      'Chỉ báo phát hiện các vùng thanh khoản bị quét (liquidity sweep) dựa trên khái niệm Smart Money Concepts (SMC) và Market Structure Shift.',
    longDescription:
      'Alpha Net Liquidity Hunter sử dụng thuật toán phân tích cấu trúc thị trường để xác định các vùng thanh khoản quan trọng — nơi các lệnh stop loss tập trung. Khi giá quét qua các vùng này (liquidity sweep), chỉ báo sẽ phát tín hiệu reversal tiềm năng, giúp trader vào lệnh tại các điểm có xác suất cao.',
    features: [
      { icon: Eye, text: 'Phát hiện liquidity sweep realtime' },
      { icon: Layers, text: 'Dựa trên Smart Money Concepts (SMC)' },
      { icon: TrendingUp, text: 'Xác định Market Structure Shift' },
      { icon: Zap, text: 'Nhận diện điểm reversal tiềm năng' },
    ],
    tech: ['Liquidity Sweep Detection', 'SMC Framework', 'Market Structure', 'Multi-Timeframe'],
    image: indicatorImg,
    version: '2.1.0',
    compatibility: 'TradingView',
    timeframes: 'M1 – Monthly',
    color: 'hsl(48, 100%, 50%)',
  },
  {
    id: 'matrix-pro',
    label: '[Jan - 6] 2025',
    title: 'Alpha Net Matrix Pro',
    subtitle: 'Volatility',
    description:
      'Sử dụng Gaussian Weighted Envelopes để xác định vùng cân bằng giá và các điểm breakout có xác suất cao.',
    longDescription:
      'Alpha Net Matrix Pro áp dụng phương pháp Gaussian Weighted Envelopes — một biến thể tiên tiến của Bollinger Bands — để tạo ra các dải giá động. Khi giá phá vỡ khỏi vùng cân bằng, chỉ báo xác nhận breakout bằng volume và momentum, giảm thiểu tín hiệu giả và tối ưu điểm vào lệnh.',
    features: [
      { icon: BarChart3, text: 'Gaussian Weighted Envelopes' },
      { icon: Eye, text: 'Xác định vùng cân bằng giá' },
      { icon: Zap, text: 'Phát hiện breakout xác suất cao' },
      { icon: TrendingUp, text: 'Điểm vào lệnh tối ưu' },
    ],
    tech: ['Gaussian Envelopes', 'Volatility Bands', 'Breakout Confirm', 'Volume Analysis'],
    image: indicatorVolatilityImg,
    version: '1.8.0',
    compatibility: 'TradingView',
    timeframes: 'M5 – Weekly',
    color: 'hsl(197, 43%, 60%)',
  },
  {
    id: 'sltp',
    label: '[Jan - 6] 2025',
    title: 'Alpha Net SL/TP %',
    subtitle: 'Risk Management',
    description:
      'Chỉ báo tự động xác định và vẽ các vùng Stop Loss (SL) và Take Profit (TP) dựa trên phần trăm biến động giá từ điểm giao cắt EMA.',
    longDescription:
      'Alpha Net SL/TP tự động tính toán các mức cắt lỗ và chốt lời dựa trên tỷ lệ phần trăm biến động giá, sử dụng điểm giao cắt EMA làm tham chiếu. Chỉ báo hiển thị trực quan các vùng SL/TP trên chart, giúp trader quản lý rủi ro hiệu quả mà không cần tính toán thủ công.',
    features: [
      { icon: Shield, text: 'Tự động tính toán vùng SL/TP theo %' },
      { icon: TrendingUp, text: 'Dựa trên EMA cross' },
      { icon: Eye, text: 'Hiển thị trực quan trên chart' },
      { icon: Layers, text: 'Hỗ trợ đa timeframe' },
    ],
    tech: ['SL/TP Auto', 'EMA Cross', 'Risk/Reward Ratio', 'Multi-Timeframe'],
    image: indicatorSltpImg,
    version: '1.5.0',
    compatibility: 'TradingView',
    timeframes: 'M1 – Daily',
    color: 'hsl(142, 50%, 50%)',
  },
];

const Indicators = () => {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const active = indicators.find((i) => i.id === selected);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(48, 100%, 50%) 0%, transparent 60%)' }} />
        <div className="relative max-w-6xl mx-auto px-6 md:px-12 pt-8 pb-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-mono text-sm transition-colors mb-16"
          >
            <ArrowLeft size={16} />
            Quay lại
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-accent font-mono text-sm tracking-widest uppercase mb-4">TradingView Indicators</p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Công cụ<br />
              <span className="text-muted-foreground font-light">phân tích</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Bộ chỉ báo kỹ thuật được thiết kế cho TradingView — hỗ trợ trader xác định điểm vào lệnh, quản lý rủi ro và nắm bắt cấu trúc thị trường.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 pb-24">
        <div className="grid md:grid-cols-3 gap-5">
          {indicators.map((ind, i) => (
            <motion.div
              key={ind.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onClick={() => setSelected(ind.id)}
              className="group cursor-pointer rounded-2xl border border-border/40 overflow-hidden bg-card hover:border-accent/40 transition-all duration-500 hover:shadow-[0_0_40px_-10px_hsl(48,100%,50%,0.15)]"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={ind.image}
                  alt={ind.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full bg-background/70 backdrop-blur text-muted-foreground font-mono">
                  v{ind.version}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-xs font-mono tracking-wider mb-2" style={{ color: ind.color }}>{ind.subtitle}</p>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">{ind.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{ind.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {ind.tech.slice(0, 3).map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2.5 py-1 rounded-full border border-border/60 text-muted-foreground font-mono">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-sm text-accent font-medium">
                  Chi tiết <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-card border border-border/40 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Image */}
              <div className="relative h-56 md:h-72 overflow-hidden rounded-t-2xl">
                <img src={active.image} alt={active.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-background/60 backdrop-blur hover:bg-background/80 transition-colors text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-mono tracking-wider" style={{ color: active.color }}>{active.subtitle}</span>
                  <span className="text-xs text-muted-foreground font-mono">{active.label}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{active.title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-8">{active.longDescription}</p>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {active.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/30">
                      <feat.icon size={16} className="text-accent mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground/80">{feat.text}</span>
                    </div>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {active.tech.map((t, idx) => (
                    <span key={idx} className="text-[11px] px-3 py-1.5 rounded-full border border-border/60 text-muted-foreground font-mono">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground font-mono mb-8">
                  <span>v{active.version}</span>
                  <span>{active.compatibility}</span>
                  <span>{active.timeframes}</span>
                </div>

                <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-opacity">
                  Sử dụng công cụ
                  <ExternalLink size={14} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl border border-border/40 overflow-hidden p-12 md:p-16 text-center"
          style={{ background: 'linear-gradient(135deg, hsl(210, 55%, 12%) 0%, hsl(210, 80%, 8%) 100%)' }}
        >
          <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 30% 50%, hsl(48, 100%, 50%) 0%, transparent 50%)' }} />
          <div className="relative">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Bắt đầu sử dụng <span className="text-accent">công cụ</span>
            </h3>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Tất cả chỉ báo đều được cung cấp miễn phí trên TradingView. Tham gia cộng đồng để nhận hỗ trợ và cập nhật mới nhất.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-8 py-3.5 rounded-full text-base font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-opacity">
                Tham gia cộng đồng →
              </button>
              <Link
                to="/"
                className="px-8 py-3.5 rounded-full text-base font-medium border border-border text-foreground hover:bg-muted transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Indicators;
