import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { User } from '../../types';
import { Edit2, Trash2, Mail, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ROLE_STYLE: Record<string, { color: string; bg: string; glow: string; label: string }> = {
  admin:   { color: '#f87171', bg: 'rgba(239,68,68,0.12)',   glow: 'rgba(239,68,68,0.3)',   label: '👑 Admin' },
  manager: { color: '#a78bfa', bg: 'rgba(139,92,246,0.12)',  glow: 'rgba(139,92,246,0.3)',  label: '⚡ Manager' },
  member:  { color: '#22d3ee', bg: 'rgba(6,182,212,0.12)',   glow: 'rgba(6,182,212,0.3)',   label: '👤 Member' },
};

interface Props {
  member: User;
  onEdit: (m: User) => void;
  onDelete: (id: number) => void;
}

export default function MemberCard({ member, onEdit, onDelete }: Props) {
  const { user, isAdmin } = useAuth();
  const isSelf = user?.id === member.id;
  const role = ROLE_STYLE[member.role];

  return (
    <Tilt
      tiltMaxAngleX={6}
      tiltMaxAngleY={6}
      glareEnable
      glareMaxOpacity={0.05}
      glarePosition="all"
      scale={1.015}
      transitionSpeed={500}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ boxShadow: `0 16px 50px rgba(0,0,0,0.5), 0 0 0 1px ${role.color}30` }}
        transition={{ duration: 0.2 }}
        className="relative rounded-2xl p-5 overflow-hidden group h-full"
        style={{
          background: 'var(--elevated-bg)',
          border: '1px solid var(--elevated-border)',
          boxShadow: 'var(--elevated-shadow)',
        }}
      >
        {/* Glow blob */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20 transition-opacity group-hover:opacity-30"
          style={{ background: role.glow }} />

        {/* Actions */}
        {isAdmin && (
          <div className="absolute top-3.5 right-3.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={() => onEdit(member)}
              className="p-1.5 rounded-lg hover:bg-white/8 transition-all" style={{ color: 'var(--text-3)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'}>
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            {!isSelf && (
              <button onClick={() => onDelete(member.id)}
                className="p-1.5 rounded-lg hover:text-red-400 hover:bg-red-500/10 transition-all" style={{ color: 'var(--text-3)' }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Avatar */}
        <div className="relative w-14 h-14 mb-4">
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-2xl object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
              style={{ background: `linear-gradient(135deg, ${role.color}80, ${role.color}30)`, border: `1px solid ${role.color}30` }}>
              {member.name[0]?.toUpperCase()}
            </div>
          )}
          {/* Online dot */}
          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${member.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'}`}
            style={{ borderColor: 'var(--dot-ring)' }} />
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{member.name}</h3>
            {isSelf && <span className="text-[10px] font-medium" style={{ color: 'var(--text-3)' }}>(you)</span>}
          </div>
          <div className="flex items-center gap-1.5 mb-3">
            <Mail className="w-3 h-3" style={{ color: 'var(--text-3)' }} />
            <span className="text-xs truncate max-w-[160px]" style={{ color: 'var(--text-3)' }}>{member.email}</span>
          </div>
          {member.bio && <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-3)' }}>{member.bio}</p>}

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ color: role.color, background: role.bg, border: `1px solid ${role.color}25` }}>
              {role.label}
            </span>
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              member.status === 'active'
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                : 'text-slate-400 bg-slate-500/10 border border-slate-500/20'
            }`}>
              {member.status === 'active' ? <CheckCircle className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
              {member.status}
            </span>
          </div>
        </div>

        {/* Bottom shimmer */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${role.color}40, transparent)` }} />
      </motion.div>
    </Tilt>
  );
}
