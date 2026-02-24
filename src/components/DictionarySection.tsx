import { motion } from 'framer-motion';

const DictionarySection = () => {
  return (
    <section id="dictionary" className="section-padding" style={{ backgroundColor: 'hsl(15, 25%, 5%)' }}>
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="warm-gradient-card rounded-2xl p-10 md:p-14 border border-border/40"
        >
          <h2 className="text-sm tracking-widest text-muted-foreground uppercase mb-6">
            Elyes Rayane Melbouci
          </h2>
          <p className="text-xl md:text-2xl text-foreground font-semibold mb-8">
            If you're building something that matters, let's talk.
          </p>
          <a
            href="mailto:elyes.melbouci@gmail.com"
            className="inline-flex items-center gap-2 text-sm text-accent bg-accent/10 hover:bg-accent/20 px-6 py-3 rounded-full transition-colors"
          >
            elyes.melbouci@gmail.com
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default DictionarySection;
