import { motion } from 'framer-motion';

const DictionarySection = () => {
  return (
    <section id="contact" className="section-padding" style={{ backgroundColor: 'hsl(210, 80%, 6%)' }}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Liên hệ với chúng tôi
          </h2>
          <p className="text-muted-foreground mb-10">
            Nếu bạn có câu hỏi hoặc muốn hợp tác, hãy liên hệ ngay.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="warm-gradient-card rounded-2xl p-8 border border-border/40 flex flex-col items-center gap-3">
            <span className="text-2xl">📧</span>
            <h3 className="text-sm tracking-widest text-muted-foreground uppercase">Email</h3>
            <a href="mailto:elyes.melbouci@gmail.com" className="text-accent hover:underline text-sm">
              elyes.melbouci@gmail.com
            </a>
          </div>
          <div className="warm-gradient-card rounded-2xl p-8 border border-border/40 flex flex-col items-center gap-3">
            <span className="text-2xl">💬</span>
            <h3 className="text-sm tracking-widest text-muted-foreground uppercase">Telegram</h3>
            <a href="https://t.me/TBNcrypto" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-sm">
              @TBNcrypto
            </a>
          </div>
          <div className="warm-gradient-card rounded-2xl p-8 border border-border/40 flex flex-col items-center gap-3">
            <span className="text-2xl">🌐</span>
            <h3 className="text-sm tracking-widest text-muted-foreground uppercase">Cộng đồng</h3>
            <p className="text-muted-foreground text-sm">Tham gia cộng đồng TBN</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DictionarySection;
