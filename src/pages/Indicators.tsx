import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Zap, Shield, BarChart3, TrendingUp, Eye, Layers } from 'lucide-react';
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
  },
  {
    id: 'sltp',
    label: '[Jan - 6] 2025',
    title: 'Alpha Net Stop Loss & Take Profit %',
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
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const Indicators = () => {
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
              <Zap size={14} />
              TradingView Indicators
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide mb-4">
              <span className="text-accent font-mono">Indicators</span>
              <span className="text-muted-foreground mx-3">/</span>
              <span className="text-muted-foreground font-light">Chỉ báo</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed text-lg max-w-2xl mb-4">
              Bộ công cụ phân tích kỹ thuật được thiết kế cho TradingView — hỗ trợ trader xác định điểm vào lệnh, quản lý rủi ro và nắm bắt cấu trúc thị trường.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-mono text-muted-foreground">
              <span className="border border-border px-3 py-1 rounded-full">3 chỉ báo</span>
              <span className="border border-border px-3 py-1 rounded-full">Sử dụng công cụ</span>
              <span className="border border-border px-3 py-1 rounded-full">TradingView Compatible</span>
            </div>
            <div className="h-px bg-border mt-12" />
          </motion.div>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-16 space-y-20"
      >
        {indicators.map((ind, i) => (
          <motion.article key={ind.id} variants={item} className="group">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
              <div className={`space-y-6 ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                <div>
                  <span className="label-tag text-[11px] mb-3">{ind.label}</span>
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-3">{ind.title}</h2>
                  <p className="text-accent font-mono text-sm mt-1">{ind.subtitle}</p>
                </div>

                <p className="text-muted-foreground leading-relaxed">{ind.longDescription}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ind.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border/40"
                    >
                      <feat.icon size={16} className="text-accent mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground/80">{feat.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {ind.tech.map((t, idx) => (
                    <span key={idx} className="tech-pill border border-border px-3 py-1 rounded-full text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground font-mono">
                  <span>v{ind.version}</span>
                  <span>{ind.compatibility}</span>
                  <span>{ind.timeframes}</span>
                </div>

                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-accent text-accent-foreground hover:opacity-90 transition-opacity">
                  Sử dụng công cụ
                  <ExternalLink size={14} />
                </button>
              </div>

              <div className={`relative rounded-2xl overflow-hidden border border-border/40 ${i % 2 === 1 ? 'md:order-1' : ''}`}>
                <img
                  src={ind.image}
                  alt={ind.title}
                  className="w-full h-64 md:h-80 lg:h-96 object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>
            </div>

            {i < indicators.length - 1 && <div className="h-px bg-border mt-20" />}
          </motion.article>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="section-padding pt-0"
      >
        <div className="max-w-6xl mx-auto text-center">
          <div className="warm-gradient-card rounded-2xl border border-border/40 p-12 md:p-16">
            <h3 className="text-2xl md:text-3xl font-light mb-4">
              Bắt đầu sử dụng <span className="text-accent font-mono">công cụ</span>
            </h3>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Tất cả chỉ báo đều được cung cấp miễn phí trên TradingView. Tham gia cộng đồng Alpha Net để nhận hỗ trợ và cập nhật mới nhất.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-8 py-3.5 rounded-full text-base font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-opacity">
                Tham gia cộng đồng →
              </button>
              <Link
                to="/"
                className="px-8 py-3.5 rounded-full text-base font-medium border border-border text-foreground hover:bg-secondary transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Indicators;
