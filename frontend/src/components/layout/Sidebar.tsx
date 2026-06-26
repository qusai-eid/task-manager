import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CheckSquare, Users, User, Kanban,
  X, Activity, Zap, BarChart2, Building2, Menu,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useState } from 'react';

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
      { to: '/tasks',     label: 'My Tasks',   icon: CheckSquare     },
      { to: '/kanban',    label: 'Kanban Board',icon: Kanban          },
    ],
  },
  {
    label: 'Management',
    managerOnly: true,
    items: [
      { to: '/members',   label: 'Members',    icon: Users    },
      { to: '/team-kpis', label: 'Team KPIs',  icon: BarChart2},
      { to: '/activity',  label: 'Activity',   icon: Activity },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile',   label: 'Profile',    icon: User },
    ],
  },
];

export default function Sidebar() {
  const { canManage, user } = useAuth();
  const { dark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const visibleGroups = NAV_GROUPS
    .filter(g => !g.managerOnly || canManage)
    .map(g => ({ ...g, items: g.items }));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between h-16 px-5 shrink-0"
        style={{ borderBottom: '1px solid var(--chrome-border)' }}>
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex items-center gap-3"
        >
          {/* Icon with animated glow */}
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--gradient)', boxShadow: '0 0 18px rgba(124,58,237,0.45)' }}>
              <Building2 className="w-4.5 h-4.5 text-white" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-xl -z-10"
              style={{ background: 'var(--gradient)', filter: 'blur(10px)', opacity: 0.45 }}
              animate={{ opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight leading-none" style={{ color: 'var(--text)' }}>
              PrecastFlow
            </p>
            <p className="text-[9px] font-semibold tracking-widest uppercase mt-0.5" style={{ color: 'var(--text-3)' }}>
              Design Suite
            </p>
          </div>
        </motion.div>
        <button className="md:hidden btn-ghost p-1.5" onClick={() => setMobileOpen(false)}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {visibleGroups.map((group, gi) => (
          <div key={group.label}>
            <p className="text-[9px] font-bold tracking-[0.12em] uppercase px-3 mb-1.5"
              style={{ color: 'var(--text-3)' }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }, i) => {
                const isActive = location.pathname === to ||
                  (to !== '/dashboard' && location.pathname.startsWith(to));
                return (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (gi * group.items.length + i) * 0.04 + 0.08, duration: 0.3 }}
                  >
                    <NavLink
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 group"
                      style={{ color: isActive ? (dark ? '#fff' : '#0d1117') : 'var(--text-3)' }}
                    >
                      {/* Active background pill */}
                      {isActive && (
                        <motion.div
                          layoutId={`nav-active-${gi}`}
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: dark
                              ? 'linear-gradient(135deg,rgba(124,58,237,0.28)0%,rgba(37,99,235,0.16)55%,rgba(6,182,212,0.1)100%)'
                              : 'linear-gradient(135deg,rgba(124,58,237,0.1)0%,rgba(37,99,235,0.06)55%,rgba(6,182,212,0.04)100%)',
                            border: '1px solid var(--accent-glow)',
                            boxShadow: dark ? '0 0 14px rgba(124,58,237,0.18)' : 'none',
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}

                      {/* Left accent line */}
                      {isActive && (
                        <div
                          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full"
                          style={{ background: 'var(--gradient)', boxShadow: '0 0 8px rgba(124,58,237,0.6)' }}
                        />
                      )}

                      {/* Icon */}
                      <div className="relative z-10 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150"
                        style={{ background: isActive ? 'var(--accent-light)' : 'transparent' }}>
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                      </div>

                      {/* Label */}
                      <span className="relative z-10 tracking-tight text-[13px]">{label}</span>
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Workspace card ───────────────────────────────── */}
      <div className="px-3 pb-4 pt-2" style={{ borderTop: '1px solid var(--chrome-border)' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="px-3 py-2.5 rounded-xl relative overflow-hidden"
          style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-glow)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--gradient)' }}>
              <Zap className="w-3 h-3 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--text)' }}>
                {user?.name?.split(' ')[0] ?? 'Workspace'}
              </p>
              <p className="text-[9px] capitalize" style={{ color: 'var(--text-3)' }}>{user?.role}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────── */}
      <div
        className="hidden md:flex flex-col w-60 shrink-0 relative"
        style={{
          background: 'var(--chrome-bg)',
          backdropFilter: 'blur(48px) saturate(180%)',
          WebkitBackdropFilter: 'blur(48px) saturate(180%)',
          borderRight: '1px solid var(--chrome-border)',
          boxShadow: dark ? '4px 0 40px rgba(0,0,0,0.55)' : '4px 0 20px rgba(10,30,80,0.07)',
        }}
      >
        <SidebarContent />
      </div>

      {/* ── Mobile trigger ────────────────────────────── */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-xl"
        style={{ background: 'var(--chrome-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--chrome-border)', boxShadow: 'var(--shadow-md)' }}
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5" style={{ color: 'var(--text-2)' }} />
      </button>

      {/* ── Mobile overlay + sidebar ──────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40"
              style={{ background: 'rgba(0,4,20,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: -264 }} animate={{ x: 0 }} exit={{ x: -264 }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-60 flex flex-col"
              style={{
                background: 'var(--chrome-bg)',
                backdropFilter: 'blur(48px) saturate(180%)',
                borderRight: '1px solid var(--chrome-border)',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
