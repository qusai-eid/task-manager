import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try { await register(name, email, password); navigate('/dashboard'); toast.success('Welcome to TaskFlow!'); }
    catch (err: any) { toast.error(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  }

  const IS = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.875rem', color: 'rgba(255,255,255,0.9)',
    padding: '0.8125rem 1rem', fontSize: '0.9375rem', width: '100%', outline: 'none', transition: 'all 0.2s',
  };
  const focus = (e: any) => { e.target.style.borderColor = 'rgba(139,92,246,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)'; };
  const blur  = (e: any) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-15 animate-float"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full blur-[100px] opacity-12"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}>
            <Zap className="w-8 h-8 text-white" fill="white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Join TaskFlow</h1>
          <p className="text-white/40 text-sm">Create your enterprise workspace</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl p-8"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(40px)', boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', type: 'text', val: name, set: setName, placeholder: 'Jane Smith' },
              { label: 'Email', type: 'email', val: email, set: setEmail, placeholder: 'you@company.com' },
            ].map(({ label, type, val, set, placeholder }) => (
              <div key={label}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/35 mb-2">{label}</label>
                <input type={type} value={val} onChange={e => set(e.target.value)} required
                  style={IS} placeholder={placeholder} onFocus={focus} onBlur={blur} />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/35 mb-2">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ ...IS, paddingRight: '3rem' }} placeholder="Min 6 characters" onFocus={focus} onBlur={blur} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.01, boxShadow: '0 0 40px rgba(124,58,237,0.6)' } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
              className="w-full py-3.5 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 mt-2"
              style={{ background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 0 24px rgba(124,58,237,0.4)', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? <><span className="w-4.5 h-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />Creating…</>
                : <>Create Account<ArrowRight className="w-4.5 h-4.5" /></>}
            </motion.button>
          </form>
          <p className="text-center text-sm text-white/30 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
