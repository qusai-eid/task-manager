import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
  glowColor: string;
  subtitle?: string;
  delay?: number;
}

function AnimatedNumber({ value }: { value: number }) {
  const mv      = useMotionValue(0);
  const spring  = useSpring(mv, { stiffness: 55, damping: 14 });
  const display = useTransform(spring, v => Math.round(v).toLocaleString());
  useEffect(() => { mv.set(value); }, [value, mv]);
  return <motion.span>{display}</motion.span>;
}

export default function StatsCard({ title, value, icon: Icon, gradient, glowColor, subtitle, delay = 0 }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <Tilt
      tiltMaxAngleX={10} tiltMaxAngleY={10}
      glareEnable glareMaxOpacity={0.08} glareColor="#ffffff" glarePosition="all"
      scale={1.025} transitionSpeed={500}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: delay / 1000, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative overflow-hidden rounded-2xl p-5 cursor-default h-full shine-hover"
        style={{
          background: 'var(--elevated-bg)',
          border: '1px solid var(--elevated-border)',
          boxShadow: 'var(--elevated-shadow)',
          transformStyle: 'preserve-3d',
        }}
        whileHover={{
          borderColor: `${glowColor}45`,
          boxShadow: `var(--elevated-hover-shadow), 0 0 28px ${glowColor}28`,
          transition: { duration: 0.2 },
        }}
      >
        {/* Gradient orb */}
        <div
          className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-18 blur-3xl pointer-events-none"
          style={{ background: gradient, transform: 'translateZ(8px)' }}
        />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${glowColor}60, transparent)` }} />

        {/* Icon */}
        <div
          className="relative z-10 w-11 h-11 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: gradient,
            boxShadow: `0 8px 24px ${glowColor}45`,
            transform: 'translateZ(12px)',
          }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>

        {/* Value */}
        <div className="relative z-10" style={{ transform: 'translateZ(6px)' }}>
          <p className="text-3xl font-bold tracking-tight font-display" style={{ color: 'var(--text)' }}>
            {mounted ? <AnimatedNumber value={value} /> : '0'}
          </p>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-2)' }}>{title}</p>
          {subtitle && (
            <p className="text-xs mt-1 font-medium" style={{ color: glowColor, opacity: 0.8 }}>{subtitle}</p>
          )}
        </div>
      </motion.div>
    </Tilt>
  );
}
