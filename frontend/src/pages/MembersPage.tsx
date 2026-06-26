import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search } from 'lucide-react';
import MemberCard from '../components/members/MemberCard';
import MemberForm from '../components/members/MemberForm';
import { User as UserType } from '../types';
import { fetchMembers, createMember, updateMember, deleteMember } from '../services/memberService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function MembersPage() {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMember, setEditMember] = useState<UserType | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchMembers().then(setMembers).catch(() => toast.error('Failed to load members')).finally(() => setLoading(false));
  }, []);

  async function handleCreate(data: Partial<UserType> & { password?: string }) {
    try {
      const m = await createMember(data);
      setMembers(p => [...p, m]);
      setShowForm(false);
      toast.success(`${m.name} added!`);
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed'); }
  }

  async function handleUpdate(data: Partial<UserType> & { password?: string }) {
    if (!editMember) return;
    try {
      const m = await updateMember(editMember.id, data);
      setMembers(p => p.map(x => x.id === m.id ? m : x));
      setEditMember(null);
      toast.success('Member updated!');
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed'); }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this member?')) return;
    try {
      await deleteMember(id);
      setMembers(p => p.filter(m => m.id !== id));
      toast.success('Member removed');
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed'); }
  }

  const filtered = members.filter(m => {
    const s = search.toLowerCase();
    return (!s || m.name.toLowerCase().includes(s) || m.email.toLowerCase().includes(s))
      && (!roleFilter || m.role === roleFilter);
  });

  const active = filtered.filter(m => m.status === 'active').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Team Members</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>{active} active · {members.length} total</p>
        </div>
        {isAdmin && (
          <motion.button onClick={() => setShowForm(true)} className="btn-primary"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <UserPlus className="w-4 h-4" />Add Member
          </motion.button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-3)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search members…"
            className="input-field pl-10" />
        </div>
        {(['', 'admin', 'manager', 'member'] as const).map(r => (
          <motion.button key={r} onClick={() => setRoleFilter(r)}
            whileTap={{ scale: 0.96 }}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={roleFilter === r
              ? { background: 'var(--accent-light)', border: '1px solid var(--accent-glow)', color: 'var(--accent)' }
              : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>
            {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><span className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/20">
          <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-semibold text-white/30">No members found</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, i) => (
            <motion.div key={m.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <MemberCard member={m} onEdit={setEditMember} onDelete={handleDelete} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {(showForm || editMember) && (
        <MemberForm member={editMember}
          onSubmit={editMember ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditMember(null); }} />
      )}
    </motion.div>
  );
}
