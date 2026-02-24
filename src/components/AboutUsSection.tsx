import { motion } from 'framer-motion';
import { BarChart3, Eye, Target } from 'lucide-react';

const values = [
  {
    icon: Eye,
    title: 'Minh bạch',
    desc: 'Mọi tín hiệu đều có lý do, mọi phân tích đều có dữ liệu đi kèm.',
  },
  {
    icon: BarChart3,
    title: 'Dữ liệu thực',
    desc: 'Không hứa hẹn lợi nhuận. Chỉ cung cấp dữ liệu để bạn tự quyết định.',
  },
  {
    icon: Target,
    title: 'Thực chiến',
    desc: 'Công cụ được xây dựng từ kinh nghiệm giao dịch thực tế hàng ngày.',
  },
];

const AboutUsSection = () => {
  return (
    <section id="about" className="section-padding bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-foreground leading-tight mb-4">
            Hỗ trợ trader Việt <span className="text-accent">ra quyết định tốt hơn.</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
            TBN cung cấp tín hiệu crypto, phân tích chuyên sâu và công cụ giao dịch miễn phí. Chúng tôi tin rằng mọi nhà đầu tư đều xứng đáng có công cụ tốt — không cần trả phí.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="warm-gradient-card rounded-2xl border border-border/30 p-6 hover:border-accent/20 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-colors">
                <v.icon size={20} className="text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
