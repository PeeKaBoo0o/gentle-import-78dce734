import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BarChart3, Users, Clock } from 'lucide-react';
import WireframeMesh from './WireframeMesh';

const stats = [
  { value: '24/7', label: 'Cập nhật liên tục', icon: Clock },
  { value: '100+', label: 'Kịch bản mỗi tháng', icon: BarChart3 },
  { value: '5K+', label: 'Traders theo dõi', icon: Users },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background pt-24 pb-16">
      {/* Wireframe mesh background */}
      <WireframeMesh />

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-accent/6 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/4 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase">Live · Đang hoạt động</span>
          </div>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-foreground text-center mb-6"
        >
          Nâng cấp giao dịch
          <br />
          <span className="text-accent">crypto</span> của bạn.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto text-center mb-12"
        >
          Kịch bản, phân tích và công cụ hỗ trợ giao dịch — hoàn toàn miễn phí, cập nhật mỗi ngày bởi cộng đồng traders Việt Nam.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          <a
            href="#scenarios"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-semibold px-8 py-3.5 rounded-full hover:brightness-110 transition-all text-sm"
          >
            Xem kịch bản hôm nay
            <span>→</span>
          </a>
          <Link
            to="/indicators"
            className="inline-flex items-center gap-2 border border-border/60 text-foreground font-medium px-8 py-3.5 rounded-full hover:bg-secondary/50 transition-colors text-sm"
          >
            Khám phá công cụ
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-20"
        >
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl md:text-3xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 text-center text-[11px] text-muted-foreground/40"
        >
          ⚠ Thông tin chỉ mang tính tham khảo, không phải lời khuyên đầu tư.
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-px h-6 bg-muted-foreground/20"
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
