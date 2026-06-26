import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Bell, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notificationService';
import { Notification } from '../../types';
import { formatDistanceToNow } from 'date-fns';

function Avatar({ name, avatar, size = 32 }: { name: string; avatar?: string | null; size?: number }) {
  const ring = { boxShadow: '0 0 0 2px rgba(139,92,246,0.45), 0 0 14px rgba(139,92,246,0.22)' };
  if (avatar) return (
    <img src={avatar} alt="" className="rounded-full object-cover"
      style={{ width: size, height: size, ...ring }} />
  );
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold"
      style={{ width: size, height: size, background: 'var(--gradient)', fontSize: size * 0.38, ...ring }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

const ROLE_META: Record<string, { bg: string; color: string; label: string }> = {
  admin:   { bg: 'rgba(239,68,68,0.12)',   color: '#f87171', label: 'Admin'   },
  manager: { bg: 'rgba(139,92,246,0.12)',  color: '#a78bfa', label: 'Manager' },
  member:  { bg: 'rgba(6,182,212,0.12)',   color: '#22d3ee', label: 'Member'  },
};

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const { user, logout, canManage } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifs();
    const iv = setInterval(loadNotifs, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function loadNotifs() {
    try {
      const d = await fetchNotifications();
      setNotifications(d.notifications);
      setUnread(d.unreadCount);
    } catch { /* ignore */ }
  }

  async function handleNotifClick(n: Notification) {
    if (!n.read) {
      await markNotificationRead(n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: 1 } : x));
      setUnread(c => Math.max(0, c - 1));
    }
    if (n.task_id) navigate(`/tasks`);
    setNotifOpen(false);
  }

  const glassMenu = {
    background: 'var(--menu-bg)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    border: '1px solid var(--menu-border)',
    boxShadow: 'var(--menu-shadow)',
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-4 md:px-6 shrink-0 z-30"
      style={{
        background: 'var(--chrome-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--chrome-border)',
      }}
    >
      <div className="md:hidden w-10" /> {/* Spacer for mobile menu button */}

      {/* Right actions */}
      <div className="flex items-center gap-1.5 ml-auto">
        {/* Theme toggle */}
        <motion.button
          onClick={toggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 rounded-xl transition-colors"
          style={{ color: 'var(--icon-color)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--icon-hover)'; (e.currentTarget as HTMLElement).style.background = 'var(--icon-hover-bg)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--icon-color)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </motion.button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <motion.button
            onClick={() => setNotifOpen(!notifOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 rounded-xl transition-colors"
            style={{ color: 'var(--icon-color)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--icon-hover)'; (e.currentTarget as HTMLElement).style.background = 'var(--icon-hover-bg)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--icon-color)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <Bell className="w-4.5 h-4.5" />
            <AnimatePresence>
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute top-1 right-1 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                  style={{ background: 'var(--gradient)', boxShadow: '0 0 8px rgba(124,58,237,0.7)', animation: 'pulse-glow 2s ease-out infinite' }}
                >
                  {unread > 9 ? '9+' : unread}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50"
                style={glassMenu}
              >
                <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--menu-border)' }}>
                  <span className="text-sm font-bold" style={{ color: 'var(--menu-text-strong)' }}>Notifications</span>
                  {unread > 0 && (
                    <button onClick={() => { markAllNotificationsRead(); setNotifications(n => n.map(x => ({ ...x, read: 1 }))); setUnread(0); }}
                      className="text-xs text-violet-400 hover:text-violet-300 font-medium">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0
                    ? <div className="py-10 text-center text-sm" style={{ color: 'var(--menu-text-muted)' }}>No notifications</div>
                    : notifications.map(n => (
                      <motion.button key={n.id} onClick={() => handleNotifClick(n)}
                        whileHover={{ backgroundColor: 'var(--menu-item-hover)' }}
                        className={`w-full text-left px-4 py-3.5 last:border-0 transition-colors ${!n.read ? 'bg-violet-500/5' : ''}`}
                        style={{ borderBottom: '1px solid var(--menu-border)' }}>
                        <div className="flex gap-3">
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${!n.read ? 'bg-violet-400' : ''}`}
                            style={!n.read ? {} : { background: 'var(--border-strong)' }} />
                          <div>
                            <p className="text-xs font-semibold" style={{ color: 'var(--menu-text-strong)' }}>{n.title}</p>
                            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--menu-text-muted)' }}>{n.message}</p>
                            <p className="text-[10px] mt-1.5" style={{ color: 'var(--menu-text-muted)' }}>{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative ml-1" ref={userRef}>
          <motion.button
            onClick={() => setUserOpen(!userOpen)}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all"
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--icon-hover-bg)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <Avatar name={user?.name || '?'} avatar={user?.avatar} size={32} />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold leading-tight max-w-[110px] truncate" style={{ color: 'var(--text)' }}>{user?.name}</p>
              {(() => {
                const rm = ROLE_META[user?.role || 'member'];
                return (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{ background: rm.bg, color: rm.color }}>
                    {rm.label}
                  </span>
                );
              })()}
            </div>
            <ChevronDown className="w-3.5 h-3.5 hidden sm:block" style={{ color: 'var(--icon-color)' }} />
          </motion.button>

          <AnimatePresence>
            {userOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden z-50"
                style={glassMenu}
              >
                <div className="px-4 py-3.5" style={{ borderBottom: '1px solid var(--menu-border)' }}>
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--menu-text-strong)' }}>{user?.name}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--menu-text-muted)' }}>{user?.email}</p>
                </div>
                <div className="p-1.5">
                  <Link to="/profile" onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all"
                    style={{ color: 'var(--menu-text)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--menu-item-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--menu-text-strong)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--menu-text)'; }}
                  >
                    <Settings className="w-4 h-4" />Profile Settings
                  </Link>
                  <button onClick={logout}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
                    <LogOut className="w-4 h-4" />Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
