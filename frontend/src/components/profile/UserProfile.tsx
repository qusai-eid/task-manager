import { useState, FormEvent } from 'react';
import { User, Camera, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from '../../services/userService';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateProfile({
        name,
        bio,
        avatar: avatar || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      updateUser(updated);
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700" />

        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-12 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-gray-800 bg-primary-600 flex items-center justify-center overflow-hidden shadow-lg">
                {avatar ? (
                  <img src={avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                )}
              </div>
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="Tell us a little about yourself…"
              />
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                Avatar URL
              </label>
              <input
                type="url"
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                className="input-field"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="input-field"
                    placeholder="Leave blank to keep current"
                  />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="input-field"
                    placeholder="Min. 6 characters"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
