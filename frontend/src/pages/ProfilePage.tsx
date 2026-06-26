import { useState, FormEvent, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Shield, Lock, User, Upload, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/userService';
import toast from 'react-hot-toast';

const ROLE_META: Record<string, { color: string; bg: string; border: string; label: string; desc: string }> = {
  admin:   { color: '#dc2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.18)',  label: '👑 Admin',   desc: 'Full access to all features and settings' },
  manager: { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.18)', label: '⚡ Manager', desc: 'Can create tasks, manage members, and view all data' },
  member:  { color: '#0284c7', bg: 'rgba(2,132,199,0.08)',  border: 'rgba(2,132,199,0.18)', label: '👤 Member',  desc: 'Can view and update assigned tasks' },
};

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName]         = useState(user?.name || '');
  const [bio, setBio]           = useState(user?.bio || '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]       = useState('');
  const [loading, setLoading]   = useState(false);

  const [preview, setPreview]     = useState<string | null>(user?.avatar ?? null);
  const [pendingAvatar, setPending] = useState<string | null | undefined>(undefined);

  const fileRef = useRef<HTMLInputElement>(null);
  const role = ROLE_META[user?.role || 'member'];

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > MAX_SIZE_BYTES) {
      toast.error('Image must be under 5 MB');
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Supported formats: JPG, PNG, WebP');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      setPending(result);
    };
    reader.readAsDataURL(file);
  }, []);

  function handleRemoveAvatar() {
    setPreview(null);
    setPending(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: Parameters<typeof updateProfile>[0] = {
        name: name || user?.name,
        bio,
      };
      if (pendingAvatar !== undefined) {
        payload.avatar = pendingAvatar;
      }
      if (newPw) {
        payload.currentPassword = currentPw;
        payload.newPassword = newPw;
      }

      const updated = await updateProfile(payload);
      updateUser(updated);
      setPreview(updated.avatar ?? null);
      setPending(undefined);
      setCurrentPw('');
      setNewPw('');
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  const hasAvatarChange = pendingAvatar !== undefined;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Profile Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Manage your account details and preferences</p>
      </div>

      <div className="card rounded-2xl overflow-hidden">
        {/* Banner */}
        <div className="h-28 relative overflow-hidden" style={{ background: 'var(--gradient)' }}>
          <div className="absolute inset-0"
            style={{ background: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.06) 0px,rgba(255,255,255,0.06) 1px,transparent 1px,transparent 18px)' }} />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar + identity row */}
          <div className="flex items-end gap-5 -mt-10 mb-6">
            <div className="relative shrink-0">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group relative w-20 h-20 rounded-2xl overflow-hidden shadow-xl focus-visible:outline-none"
                style={{ outline: '4px solid var(--surface)', outlineOffset: 0 }}
                title="Click to change photo"
              >
                {preview ? (
                  <img src={preview} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
                    style={{ background: 'var(--gradient)' }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.45)' }}>
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </button>

              {hasAvatarChange && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: pendingAvatar ? '#10b981' : '#ef4444', border: '2px solid var(--surface)' }}>
                  {pendingAvatar ? <CheckCircle className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-white" />}
                </span>
              )}
            </div>

            <div className="pb-1 flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate" style={{ color: 'var(--text)' }}>{user?.name}</h2>
              <p className="text-sm truncate" style={{ color: 'var(--text-3)' }}>{user?.email}</p>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}
                >
                  <Upload className="w-3 h-3" />
                  {preview ? 'Change Photo' : 'Upload Photo'}
                </button>

                {preview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.22)', background: 'rgba(239,68,68,0.06)' }}
                  >
                    <X className="w-3 h-3" />Remove
                  </button>
                )}
              </div>

              <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-3)' }}>
                JPG · PNG · WebP · max 5 MB · click photo to change
              </p>
            </div>
          </div>

          {/* Role badge */}
          <div className="mb-6 p-4 rounded-xl flex items-center gap-3"
            style={{ background: role.bg, border: `1px solid ${role.border}` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${role.color}18` }}>
              <Shield className="w-[18px] h-[18px]" style={{ color: role.color }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: role.color }}>{role.label}</p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>{role.desc}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4" style={{ color: 'var(--text-3)' }} />
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>Personal Info</h3>
              </div>

              <div>
                <label className="label">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="label">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="Tell your team about yourself…"
                />
              </div>
            </div>

            <div className="pt-4 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" style={{ color: 'var(--text-3)' }} />
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>Change Password</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    className="input-field"
                    placeholder="Current password"
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    className="input-field"
                    placeholder="Min 6 chars"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {hasAvatarChange && (
                <p className="text-xs" style={{ color: pendingAvatar ? '#10b981' : '#f59e0b' }}>
                  {pendingAvatar ? '✓ New photo ready — save to apply' : '✓ Photo will be removed on save'}
                </p>
              )}
              <div className="ml-auto">
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {loading
                    ? <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Saving…
                      </span>
                    : <><Save className="w-4 h-4" />Save Changes</>}
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
