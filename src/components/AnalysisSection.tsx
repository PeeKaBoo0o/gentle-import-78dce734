import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, BarChart3, Shield, Target, Zap, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const analysisTopics = [
  {
    number: '01',
    icon: TrendingUp,
    title: 'Phân tích xu hướng thị trường',
    description: 'Đánh giá xu hướng tổng quan của BTC, ETH và các altcoin chính dựa trên cấu trúc thị trường, dòng tiền và tâm lý nhà đầu tư.',
  },
  {
    number: '02',
    icon: BarChart3,
    title: 'Phân tích kỹ thuật chuyên sâu',
    description: 'Sử dụng các mô hình Price Action, Supply/Demand, Order Block và Smart Money Concepts để xác định vùng giá quan trọng.',
  },
  {
    number: '03',
    icon: Shield,
    title: 'Quản trị rủi ro & vốn',
    description: 'Hướng dẫn xây dựng kế hoạch quản lý vốn, đặt SL/TP hợp lý và kiểm soát cảm xúc khi giao dịch.',
  },
  {
    number: '04',
    icon: Target,
    title: 'Xác định vùng Entry tối ưu',
    description: 'Phân tích các vùng giá tiềm năng để vào lệnh dựa trên confluence của nhiều yếu tố kỹ thuật và on-chain.',
  },
  {
    number: '05',
    icon: Zap,
    title: 'Tin tức & sự kiện tác động',
    description: 'Cập nhật và phân tích các sự kiện macro, quyết định lãi suất, CPI và ảnh hưởng đến thị trường crypto.',
  },
  {
    number: '06',
    icon: BookOpen,
    title: 'Kiến thức nền tảng',
    description: 'Chia sẻ kiến thức về blockchain, tokenomics, DeFi và các khái niệm cốt lõi giúp trader hiểu sâu thị trường.',
  },
];

const AnalysisSection = () => {
  return (
    <section id="analysis" className="section-padding" style={{ backgroundColor: 'hsl(210, 80%, 6%)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <Link
            to="/analysis"
            className="inline-flex items-center gap-2 text-xl md:text-2xl font-semibold tracking-wide group/link"
          >
            <span className="text-accent">Phân Tích Crypto</span>
            <ArrowRight size={20} className="text-accent group-hover/link:translate-x-1 transition-transform" />
          </Link>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto mt-3">
            Tổng hợp phân tích thị trường crypto từ nhiều góc nhìn — kỹ thuật, on-chain và macro — giúp bạn ra quyết định giao dịch sáng suốt hơn.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {analysisTopics.map((topic, i) => {
            const Icon = topic.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="warm-gradient-card rounded-2xl p-7 border border-border/40 hover:border-accent/30 transition-all group cursor-default"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/15 text-accent">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">{topic.number}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2 leading-snug">
                  {topic.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {topic.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AnalysisSection;
