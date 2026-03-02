import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import indicatorImg from '@/assets/indicator-liquidity-hunter.png';
import indicatorVolatilityImg from '@/assets/indicator-volatility.png';
import indicatorSltpImg from '@/assets/indicator-sltp.png';

const projects = [
  {
    label: '[Jan - 6] 2025',
    title: 'Alpha Net Liquidity Hunter',
    subtitle: 'Smart Money',
    description: 'Chỉ báo phát hiện các vùng thanh khoản bị quét (liquidity sweep) dựa trên khái niệm Smart Money Concepts (SMC) và Market Structure Shift.',
    tech: 'Phát hiện liquidity sweep · Dựa trên Smart Money Concepts · Xác định Market Structure Shift · Nhận diện điểm reversal tiềm năng',
    image: indicatorImg,
  },
  {
    label: '[Jan - 6] 2025',
    title: 'Alpha Net Matrix Pro',
    subtitle: 'Volatility',
    description: 'Sử dụng Gaussian Weighted Envelopes để xác định vùng cân bằng giá và các điểm breakout có xác suất cao.',
    tech: 'Gaussian Weighted Envelopes · Xác định vùng cân bằng giá · Phát hiện breakout xác suất cao · Điểm vào lệnh tối ưu',
    image: indicatorVolatilityImg,
  },
  {
    label: '[Jan - 6] 2025',
    title: 'Alpha Net Stop Loss & Take Profit %',
    subtitle: 'Risk Management',
    description: 'Chỉ báo tự động xác định và vẽ các vùng Stop Loss (SL) và Take Profit (TP) dựa trên phần trăm biến động giá từ điểm giao cắt EMA.',
    tech: 'Tự động tính toán vùng SL/TP theo % · Dựa trên EMA cross · Hiển thị trực quan trên chart · Hỗ trợ đa timeframe',
    image: indicatorSltpImg,
  },
];

const IndicatorsSection = () => {
  const navigate = useNavigate();

  return (
    <section id="indicators" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold" style={{ color: 'hsl(210, 80%, 8%)' }}>
            Chỉ báo <em className="font-display italic" style={{ color: 'hsl(210, 100%, 28%)' }}>kỹ thuật</em>
          </h2>
          <p className="text-sm max-w-lg mx-auto mt-3" style={{ color: 'hsl(210, 20%, 40%)' }}>
            Bộ công cụ chỉ báo kỹ thuật chuyên sâu dành cho trader chuyên nghiệp.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl overflow-hidden group"
              style={{ background: 'hsl(210, 30%, 96%)', border: '1px solid hsl(210, 20%, 88%)' }}
            >
              <div className="relative h-48 overflow-hidden">
                <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5 space-y-3">
                <span className="inline-flex items-center gap-2 text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full"
                  style={{ color: 'hsl(210, 100%, 28%)', background: 'hsl(210, 30%, 92%)' }}
                >
                  {project.label}
                </span>
                <h3 className="text-lg font-semibold" style={{ color: 'hsl(210, 80%, 8%)' }}>{project.title}</h3>
                <p className="text-xs font-medium" style={{ color: 'hsl(210, 100%, 28%)' }}>{project.subtitle}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'hsl(210, 15%, 40%)' }}>{project.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.split(' · ').map((item, idx) => (
                    <span key={idx} className="text-[10px] px-2.5 py-0.5 rounded-full"
                      style={{ color: 'hsl(210, 20%, 40%)', background: 'hsl(210, 20%, 92%)' }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/indicators')}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all hover:brightness-110"
            style={{ backgroundColor: 'hsl(210, 100%, 28%)', color: 'hsl(0, 0%, 100%)' }}
          >
            Sử dụng công cụ
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default IndicatorsSection;
