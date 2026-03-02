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
    <section id="about" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-semibold" style={{ color: 'hsl(210, 80%, 8%)' }}>
            Hỗ trợ trader Việt <em className="font-display italic" style={{ color: 'hsl(210, 100%, 28%)' }}>ra quyết định tốt hơn.</em>
          </h2>
          <p className="text-sm max-w-lg mx-auto mt-3" style={{ color: 'hsl(210, 20%, 40%)' }}>
            TBN cung cấp tín hiệu crypto, phân tích chuyên sâu và công cụ giao dịch miễn phí.
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
              className="rounded-2xl p-6 group"
              style={{ background: 'hsl(210, 30%, 96%)', border: '1px solid hsl(210, 20%, 88%)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'hsl(210, 30%, 90%)' }}>
                <v.icon size={20} style={{ color: 'hsl(210, 100%, 28%)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'hsl(210, 80%, 8%)' }}>{v.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'hsl(210, 15%, 40%)' }}>{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
