import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Contact {
  id: string;
  contact_info: string;
  contact_type: string;
  created_at: string;
}

const Admin = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [visitCount, setVisitCount] = useState(0);
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthed) return;
    const fetchData = async () => {
      const [contactsRes, visitsRes] = await Promise.all([
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('page_visits').select('id', { count: 'exact', head: true }),
      ]);
      if (contactsRes.data) setContacts(contactsRes.data as Contact[]);
      if (visitsRes.count !== null) setVisitCount(visitsRes.count);
    };
    fetchData();
  }, [isAuthed]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError('Sai email hoặc mật khẩu.');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDelete = async (id: string) => {
    await supabase.from('contacts').delete().eq('id', id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>;

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-card rounded-2xl border border-border/40 p-8 flex flex-col gap-4">
          <h1 className="text-xl font-bold text-foreground text-center">Admin Login</h1>
          {authError && <p className="text-destructive text-sm text-center">{authError}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl bg-background border border-border/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl bg-background border border-border/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <button type="submit" className="rounded-xl bg-accent text-accent-foreground font-semibold py-3 hover:bg-accent/90 transition-colors">
            Đăng nhập
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Đăng xuất
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border/40 p-6 text-center">
            <p className="text-3xl font-bold text-accent">{contacts.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Liên hệ</p>
          </div>
          <div className="bg-card rounded-xl border border-border/40 p-6 text-center">
            <p className="text-3xl font-bold text-accent">{visitCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Lượt truy cập</p>
          </div>
        </div>

        {/* Contacts table */}
        <div className="bg-card rounded-xl border border-border/40 overflow-hidden">
          <div className="p-4 border-b border-border/30">
            <h2 className="text-lg font-semibold text-foreground">Danh sách liên hệ</h2>
          </div>
          {contacts.length === 0 ? (
            <p className="p-6 text-muted-foreground text-center">Chưa có liên hệ nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30 text-muted-foreground">
                    <th className="text-left p-4">Thông tin</th>
                    <th className="text-left p-4">Loại</th>
                    <th className="text-left p-4">Thời gian</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c.id} className="border-b border-border/20 text-foreground">
                      <td className="p-4 font-mono">{c.contact_info}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.contact_type === 'email' ? 'bg-primary/20 text-secondary' : 'bg-accent/20 text-accent'}`}>
                          {c.contact_type}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{new Date(c.created_at).toLocaleString('vi-VN')}</td>
                      <td className="p-4">
                        <button onClick={() => handleDelete(c.id)} className="text-destructive hover:text-destructive/80 text-xs">
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
