import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const principles = [
  {
    number: '01',
    title: 'Privacy is not a feature. It\'s the default.',
    description: 'Every tool I ship runs on your machine. Your documents, your models, your data. No server ever sees it.',
  },
  {
    number: '02',
    title: 'Ship fast. Fix in public.',
    description: '46 releases of RLama. 1,100 stars. The best version is the one someone can use today, not the perfect one that never ships.',
  },
  {
    number: '03',
    title: 'Good tools stay out of the way.',
    description: 'A CLI you reach for without thinking. A memory app that just works in the background. The less you notice, the better I did.',
  },
];

const AnalysisSection = () => {
  return (
    <section id="analysis" className="section-padding" style={{ backgroundColor: 'hsl(210, 80%, 6%)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <Link
            to="/analysis"
            className="inline-flex items-center gap-2 text-xl md:text-2xl font-semibold tracking-wide group/link"
          >
            <span className="text-accent">Phân Tích Crypto</span>
            <ArrowRight size={20} className="text-accent group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {principles.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="warm-gradient-card rounded-2xl p-8 border border-border/40 hover:border-accent/30 transition-colors"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/15 text-accent font-semibold text-sm mb-5">
                {p.number}
              </span>
              <h3 className="text-lg font-semibold text-foreground mb-3 leading-snug">
                {p.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {p.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnalysisSection;
