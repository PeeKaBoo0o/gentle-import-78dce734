import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, BarChart3, Shield, Target, Zap, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const featured = {
  icon: TrendingUp,
  tag: 'NỔI BẬT',
  title: 'Phân tích xu hướng thị trường',
  description:
    'Đánh giá xu hướng tổng quan của BTC, ETH và các altcoin chính dựa trên cấu trúc thị trường, dòng tiền và tâm lý nhà đầu tư. Kết hợp phân tích on-chain để xác định giai đoạn tích lũy hay phân phối.',
};

const topics = [
  {
    icon: BarChart3,
    title: 'Phân tích kỹ thuật chuyên sâu',
    description: 'Sử dụng Price Action, Supply/Demand, Order Block và Smart Money Concepts để xác định vùng giá quan trọng.',
  },
  {
    icon: Shield,
    title: 'Quản trị rủi ro & vốn',
    description: 'Xây dựng kế hoạch quản lý vốn, đặt SL/TP hợp lý và kiểm soát cảm xúc khi giao dịch.',
  },
  {
    icon: Target,
    title: 'Xác định vùng Entry tối ưu',
    description: 'Phân tích vùng giá tiềm năng để vào lệnh dựa trên confluence của nhiều yếu tố kỹ thuật.',
  },
  {
    icon: Zap,
    title: 'Tin tức & sự kiện tác động',
    description: 'Cập nhật các sự kiện macro, quyết định lãi suất, CPI và ảnh hưởng đến thị trường crypto.',
  },
  {
    icon: BookOpen,
    title: 'Kiến thức nền tảng',
    description: 'Chia sẻ về blockchain, tokenomics, DeFi và các khái niệm cốt lõi giúp trader hiểu sâu thị trường.',
  },
];

const AnalysisSection = () => {
  const FeaturedIcon = featured.icon;

  return (
    <section id="analysis" className="section-padding" style={{ backgroundColor: 'hsl(210, 80%, 6%)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <Link
            to="/analysis"
            className="inline-flex items-center gap-2 text-xl md:text-2xl font-semibold tracking-wide group/link"
          >
            <span className="text-accent">Phân Tích Crypto</span>
            <ArrowRight size={20} className="text-accent group-hover/link:translate-x-1 transition-transform" />
          </Link>
          <p className="text-sm max-w-xl mx-auto mt-3" style={{ color: 'hsl(210, 20%, 65%)' }}>
            Tổng hợp phân tích thị trường crypto từ nhiều góc nhìn — kỹ thuật, on-chain và macro.
          </p>
        </motion.div>

        {/* Featured card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl p-8 md:p-10 mb-6 overflow-hidden border border-accent/20 group cursor-default"
          style={{ background: 'linear-gradient(135deg, hsl(210, 60%, 10%) 0%, hsl(210, 80%, 6%) 100%)' }}
        >
          {/* Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'hsl(var(--accent))' }} />

          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center">
              <FeaturedIcon className="w-8 h-8 text-accent" />
            </div>
            <div className="flex-1 space-y-3">
              <span className="inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/25">
                {featured.tag}
              </span>
              <h3 className="text-xl md:text-2xl font-bold leading-tight" style={{ color: 'hsl(210, 20%, 93%)' }}>
                {featured.title}
              </h3>
              <p className="text-sm md:text-base leading-relaxed max-w-2xl" style={{ color: 'hsl(210, 20%, 65%)' }}>
                {featured.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Topic grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic, i) => {
            const Icon = topic.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="rounded-xl p-6 border border-border/40 hover:border-accent/30 transition-all group/card cursor-default"
                style={{ background: 'hsl(210, 50%, 9%)' }}
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 group-hover/card:bg-accent/20 transition-colors">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h4 className="text-sm font-semibold mb-2" style={{ color: 'hsl(210, 20%, 93%)' }}>{topic.title}</h4>
                <p className="text-xs leading-relaxed" style={{ color: 'hsl(210, 20%, 60%)' }}>{topic.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AnalysisSection;
