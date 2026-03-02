import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CARD_PEEK = 60;

const IndicatorsSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const TARGET_BG = 'hsl(0, 0%, 100%)';
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.35, 0.5, 0.58, 0.62, 1],
    ['hsl(210, 80%, 6%)', 'hsl(210, 80%, 6%)', 'hsl(210, 30%, 40%)', 'hsl(0, 0%, 90%)', TARGET_BG, TARGET_BG]
  );

  return (
    <motion.section
      ref={sectionRef}
      id="indicators"
      className="section-padding"
      style={{ backgroundColor }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="relative" style={{ height: '220vh' }}>
          {projects.map((project, i) => (
            <div
              key={i}
              className="sticky"
              style={{
                top: `calc(50vh - 200px + ${i * CARD_PEEK}px)`,
                zIndex: i + 1,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
               className="rounded-2xl overflow-hidden shadow-lg border border-[hsl(210,20%,85%)]/50"
                style={{
                  transform: `scale(${1 - i * 0.02})`,
                  transformOrigin: 'top center',
                  backgroundColor: 'hsl(210, 20%, 95%)',
                }}
              >
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-8 flex flex-col justify-center">
                    <span className="inline-flex items-center gap-2 text-[11px] tracking-wider uppercase px-3 py-1 rounded-full w-fit mb-4"
                      style={{ color: 'hsl(210, 60%, 35%)', backgroundColor: 'hsl(210, 20%, 92%)' }}
                    >
                      {project.label}
                    </span>
                    <h3 className="text-xl md:text-2xl font-semibold" style={{ color: 'hsl(210, 80%, 10%)' }}>{project.title}</h3>
                    <p className="text-sm mt-1 mb-3" style={{ color: 'hsl(210, 100%, 30%)' }}>{project.subtitle}</p>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'hsl(210, 15%, 40%)' }}>{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {project.tech.split(' · ').map((item, idx) => (
                        <span key={idx} className="text-[11px] px-3 py-1 rounded-full"
                          style={{ color: 'hsl(210, 20%, 40%)', backgroundColor: 'hsl(210, 20%, 92%)' }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors w-fit"
                      style={{ backgroundColor: 'hsl(210, 100%, 28%)', color: 'hsl(0, 0%, 100%)', border: '1px solid hsl(210, 100%, 35%)' }}
                    >
                      Tham gia sử dụng chỉ báo
                    </button>
                  </div>
                  <div className="relative h-64 md:h-auto overflow-hidden">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{
                      boxShadow: 'inset 40px 0 30px -10px hsl(210, 20%, 95%)',
                    }} />
                  </div>
                </div>
              </motion.div>
            </div>
          ))}

          <div
            className="sticky"
            style={{
              top: `calc(50vh - 200px + ${projects.length * CARD_PEEK}px)`,
              zIndex: projects.length + 1,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: projects.length * 0.1 }}
              className="flex justify-center py-6"
            >
              <button
                onClick={() => navigate('/indicators')}
                className="px-8 py-3.5 rounded-full text-base font-semibold shadow-lg transition-shadow hover:shadow-xl cursor-pointer"
                style={{
                  backgroundColor: 'hsl(48, 100%, 50%)',
                  color: 'hsl(210, 80%, 8%)',
                  border: '2px solid hsl(48, 100%, 60%)',
                }}
              >
                Sử dụng công cụ →
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default IndicatorsSection;
