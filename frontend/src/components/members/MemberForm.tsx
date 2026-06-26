import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { User } from '../../types';

interface Props {
  member?: User | null;
  onSubmit: (data: Partial<User> & { password?: string }) => Promise<void>;
  onCancel: () => void;
}

export default function MemberForm({ member, onSubmit, onCancel }: Props) {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [role,     setRole]     = useState<User['role']>('member');
  const [status,   setStatus]   = useState<User['status']>('active');
  const [avatar,   setAvatar]   = useState('');
  const [bio,      setBio]      = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name); setEmail(member.email);
      setRole(member.role); setStatus(member.status);
      setAvatar(member.avatar || ''); setBio(member.bio || '');
    }
  }, [member]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, email, role, status, avatar: avatar || null, bio: bio || null, ...(password ? { password } : {}) });
    } finally { setLoading(false); }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'var(--overlay-bg)', backdropFilter: 'blur(8px)' }}
        onClick={e => e.target === e.currentTarget && onCancel()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="modal-content w-full max-w-md rounded-2xl overflow-hidden"
          style={{ background: 'var(--modal-bg)', border: '1px solid var(--modal-border)', boxShadow: 'var(--modal-shadow)' }}
        >
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>{member ? 'Edit Member' : 'Add Member'}</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{member ? 'Update member details' : 'Invite someone to the team'}</p>
            </div>
            <button onClick={onCancel} className="btn-ghost p-2 rounded-xl">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-field" placeholder="Jane Smith" />
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" placeholder="jane@co.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Role</label>
                <select value={role} onChange={e => setRole(e.target.value as User['role'])} className="input-field">
                  <option value="admin">👑 Admin</option>
                  <option value="manager">⚡ Manager</option>
                  <option value="member">👤 Member</option>
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as User['status'])} className="input-field">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">{member ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required={!member} className="input-field"
                placeholder={member ? 'Leave blank to keep' : 'Min 6 characters'} />
            </div>
            <div>
              <label className="label">Avatar URL</label>
              <input type="url" value={avatar} onChange={e => setAvatar(e.target.value)} className="input-field" placeholder="https://…" />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}
                className="input-field" style={{ resize: 'none' }} placeholder="Short bio…" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Saving…</span>
                  : member ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
