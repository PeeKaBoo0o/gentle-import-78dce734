import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DictionarySection = () => {
  const [contactInfo, setContactInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const detectType = (value: string): string => {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email';
    if (/^[\d\s\-+()]{8,15}$/.test(value.replace(/\s/g, ''))) return 'phone';
    return 'unknown';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = contactInfo.trim();
    if (!trimmed) return;

    const type = detectType(trimmed);
    if (type === 'unknown') {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập email hoặc số điện thoại hợp lệ.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('contacts').insert({ contact_info: trimmed, contact_type: type });
    setLoading(false);

    if (error) {
      toast({ title: 'Lỗi', description: 'Không thể gửi thông tin. Thử lại sau.', variant: 'destructive' });
    } else {
      toast({ title: 'Thành công!', description: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất.' });
      setContactInfo('');
    }
  };

  return (
    <section id="contact" className="section-padding">
      <div className="max-w-xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-3" style={{ color: 'hsl(210, 80%, 8%)' }}>
            Liên <em className="font-display italic" style={{ color: 'hsl(210, 100%, 28%)' }}>hệ</em>
          </h2>
          <p className="text-sm mb-8" style={{ color: 'hsl(210, 20%, 40%)' }}>
            Để lại email hoặc số điện thoại, chúng tôi sẽ liên hệ lại bạn.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl p-8 md:p-10 flex flex-col gap-4"
          style={{ background: 'hsl(210, 30%, 96%)', border: '1px solid hsl(210, 20%, 88%)' }}
        >
          <input
            type="text"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder="Email hoặc số điện thoại..."
            maxLength={255}
            className="w-full rounded-xl px-5 py-3.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all"
            style={{ background: 'hsl(210, 30%, 97%)', border: '1px solid hsl(210, 20%, 88%)', color: 'hsl(210, 80%, 8%)' }}
          />
          <button
            type="submit"
            disabled={loading || !contactInfo.trim()}
            className="w-full rounded-xl font-semibold py-3.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:brightness-110"
            style={{ backgroundColor: 'hsl(210, 100%, 28%)', color: 'hsl(0, 0%, 100%)' }}
          >
            {loading ? 'Đang gửi...' : 'Gửi liên hệ'}
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default DictionarySection;
