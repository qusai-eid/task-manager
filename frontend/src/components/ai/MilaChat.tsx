import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
import { findAnswer, FALLBACK_RESPONSE } from './milaKnowledge';

/* ── Welcome message ─────────────────────────────────────────────── */
interface Msg { role: 'user' | 'assistant'; content: string }

const WELCOME: Msg = {
  role: 'assistant',
  content: `Hi there! I'm **Mila** ✨\n\nI'm your built-in PrecastFlow assistant. I can help you navigate any page, understand features, learn about the 10 workflow stages, or figure out what your role can do.\n\nWhat would you like to know?`,
};

/* ── Quick starters ──────────────────────────────────────────────── */
const QUICK = [
  'How do I move a task to the next stage?',
  'What can a Member role do?',
  'How does file version control work?',
  'Explain the 10 workflow stages',
];

/* ── Markdown renderer ───────────────────────────────────────────── */
function bold(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function MsgLine({ line, i }: { line: string; i: number }) {
  if (/^\d+\.\s/.test(line)) {
    const dot  = line.indexOf('. ');
    return (
      <div key={i} className="flex gap-2 my-0.5">
        <span className="text-violet-400 font-bold text-xs shrink-0 mt-0.5">{line.slice(0, dot)}.</span>
        <span className="text-[13px] leading-snug" dangerouslySetInnerHTML={{ __html: bold(line.slice(dot + 2)) }} />
      </div>
    );
  }
  if (/^[-•●✅⚠️]\s/.test(line)) {
    return (
      <div key={i} className="flex gap-2 my-0.5">
        <span className="text-violet-400 text-[8px] mt-1.5 shrink-0">●</span>
        <span className="text-[13px] leading-snug" dangerouslySetInnerHTML={{ __html: bold(line.replace(/^[-•●✅⚠️]\s/, '')) }} />
      </div>
    );
  }
  if (!line.trim()) return <div key={i} className="h-1.5" />;
  return (
    <p key={i} className="text-[13px] leading-relaxed my-0.5"
      dangerouslySetInnerHTML={{ __html: bold(line) }} />
  );
}

function MsgBody({ content }: { content: string }) {
  const lines = content.split('\n');
  return <div className="space-y-0.5">{lines.map((l, i) => <MsgLine key={i} line={l} i={i} />)}</div>;
}

/* ── Typing dots ─────────────────────────────────────────────────── */
function Dots() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2.5">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-2 h-2 rounded-full"
          style={{ background: 'var(--accent)' }}
          animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 0.65, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

/* ── Mila avatar ─────────────────────────────────────────────────── */
function Avatar({ size = 28 }: { size?: number }) {
  return (
    <div className="rounded-full flex items-center justify-center text-white font-black shrink-0 select-none"
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg,#7c3aed 0%,#2563eb 55%,#06b6d4 100%)',
        fontSize: size * 0.42,
        boxShadow: '0 0 14px rgba(124,58,237,0.5)',
      }}>
      M
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function MilaChat() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [hasNew,   setHasNew]   = useState(false);
  const [lastTopic, setLastTopic] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  /* auto-scroll */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  /* focus on open */
  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 300); setHasNew(false); }
  }, [open]);

  /* notification pulse after 8 s */
  useEffect(() => {
    const t = setTimeout(() => { if (!open) setHasNew(true); }, 8000);
    return () => clearTimeout(t);
  }, []);

  const send = useCallback(async (text = input.trim()) => {
    if (!text || loading) return;
    setInput('');

    const userMsg: Msg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    /* Simulate a brief "thinking" delay for natural feel */
    await new Promise(r => setTimeout(r, 420 + Math.random() * 280));

    const entry = findAnswer(text, lastTopic);
    const reply = entry ? entry.response : FALLBACK_RESPONSE;
    if (entry) setLastTopic(entry.topic);

    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    setLoading(false);
  }, [input, loading, lastTopic]);

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const reset = () => { setMessages([WELCOME]); setInput(''); setLastTopic(null); };

  const canSend = !!input.trim() && !loading;

  return (
    <>
      {/* ─────────────────────────────── FLOATING BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 select-none">

        {/* Outer pulse ring */}
        <motion.div className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', filter: 'blur(2px)' }}
          animate={{ scale: [1, 1.38, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} />

        {/* Float wrapper */}
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}>

          <motion.button
            onClick={() => setOpen(o => !o)}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            className="relative w-14 h-14 rounded-full flex items-center justify-center text-white focus-visible:outline-none"
            style={{
              background: 'linear-gradient(135deg,#7c3aed 0%,#2563eb 55%,#06b6d4 100%)',
              boxShadow: open
                ? '0 0 0 3px rgba(124,58,237,0.5), 0 8px 28px rgba(124,58,237,0.55)'
                : '0 0 22px rgba(124,58,237,0.5), 0 4px 16px rgba(0,0,0,0.35)',
            }}
            aria-label={open ? 'Close Mila' : 'Open Mila assistant'}>

            {/* Icon swap */}
            <AnimatePresence mode="wait">
              {open ? (
                <motion.span key="x"
                  initial={{ opacity: 0, rotate: -80, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 80, scale: 0.5 }}
                  transition={{ duration: 0.22 }}>
                  <ChevronDown className="w-6 h-6" />
                </motion.span>
              ) : (
                <motion.span key="m"
                  initial={{ opacity: 0, rotate: 80, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: -80, scale: 0.5 }}
                  transition={{ duration: 0.22 }}
                  className="font-black text-xl leading-none">
                  M
                </motion.span>
              )}
            </AnimatePresence>

            {/* Sparkle */}
            {!open && (
              <motion.div className="absolute -top-0.5 -right-0.5"
                animate={{ scale: [1, 1.3, 1], rotate: [0, 18, 0] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}>
                <Sparkles className="w-4 h-4 text-cyan-200" />
              </motion.div>
            )}

            {/* Notification dot */}
            <AnimatePresence>
              {hasNew && !open && (
                <motion.div key="dot"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1 -left-1 w-4 h-4 bg-emerald-400 rounded-full border-2"
                  style={{ borderColor: '#020c1f' }} />
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>

      {/* ─────────────────────────────── CHAT PANEL */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.88, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 24 }}
            transition={{ type: 'spring', stiffness: 440, damping: 36 }}
            className="fixed z-50 flex flex-col rounded-2xl overflow-hidden"
            style={{
              bottom: '5.5rem', right: '1.5rem',
              width: 'min(400px, calc(100vw - 2.5rem))',
              height: 'min(580px, calc(100vh - 9rem))',
              background: 'var(--modal-bg)',
              border: '1px solid var(--modal-border)',
              boxShadow: 'var(--modal-shadow)',
              transformOrigin: 'bottom right',
            }}>

            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px z-10"
              style={{ background: 'linear-gradient(90deg,#7c3aed,#2563eb 50%,#06b6d4)' }} />

            {/* ── Header ───────────────────── */}
            <div className="flex items-center gap-3 px-4 py-3.5 shrink-0"
              style={{
                background: 'linear-gradient(135deg,rgba(124,58,237,0.12) 0%,rgba(6,182,212,0.06) 100%)',
                borderBottom: '1px solid var(--border)',
              }}>
              <Avatar size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Mila</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                  <p className="text-[10px] font-medium" style={{ color: 'var(--text-3)' }}>PrecastFlow Assistant · Always available</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <motion.button onClick={reset} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                  className="p-1.5 rounded-lg btn-ghost" title="New conversation">
                  <RotateCcw className="w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} />
                </motion.button>
                <motion.button onClick={() => setOpen(false)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                  className="p-1.5 rounded-lg btn-ghost">
                  <X className="w-4 h-4" style={{ color: 'var(--text-3)' }} />
                </motion.button>
              </div>
            </div>

            {/* ── Messages ─────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                    {msg.role === 'assistant' && <Avatar size={26} />}

                    <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl"
                      style={msg.role === 'user' ? {
                        background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                        borderBottomRightRadius: 4,
                        color: '#fff',
                      } : {
                        background: 'var(--elevated-bg)',
                        border: '1px solid var(--elevated-border)',
                        borderBottomLeftRadius: 4,
                        color: 'var(--text)',
                      }}>
                      <MsgBody content={msg.content} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5">
                  <Avatar size={26} />
                  <div className="rounded-2xl" style={{ borderBottomLeftRadius: 4, background: 'var(--elevated-bg)', border: '1px solid var(--elevated-border)' }}>
                    <Dots />
                  </div>
                </motion.div>
              )}

              {/* Quick prompts — only on first open */}
              {messages.length === 1 && !loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }} className="pt-1 space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-center"
                    style={{ color: 'var(--text-3)' }}>Quick questions</p>
                  {QUICK.map(q => (
                    <motion.button key={q} onClick={() => send(q)}
                      whileHover={{ scale: 1.015, x: 2 }} whileTap={{ scale: 0.98 }}
                      className="w-full text-left text-[12px] px-3 py-2 rounded-xl transition-all"
                      style={{ background: 'var(--elevated-bg)', border: '1px solid var(--elevated-border)', color: 'var(--text-2)' }}>
                      {q}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Input ────────────────────── */}
            <div className="shrink-0 px-3 py-3"
              style={{ borderTop: '1px solid var(--border)', background: 'var(--modal-bg)' }}>
              <div className="flex items-end gap-2 rounded-xl px-3 py-2"
                style={{ background: 'var(--elevated-bg)', border: '1px solid var(--elevated-border)' }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask Mila about any feature…"
                  rows={1}
                  disabled={loading}
                  className="flex-1 resize-none outline-none bg-transparent text-sm leading-relaxed"
                  style={{ color: 'var(--text)', maxHeight: 88, overflowY: 'hidden' }}
                  onInput={e => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = Math.min(el.scrollHeight, 88) + 'px';
                  }}
                />
                <motion.button
                  onClick={() => send()}
                  disabled={!canSend}
                  whileHover={canSend ? { scale: 1.1 } : {}}
                  whileTap={canSend ? { scale: 0.9 } : {}}
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background: canSend ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : 'var(--surface-3)',
                    boxShadow: canSend ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
                  }}>
                  <Send className="w-3.5 h-3.5" style={{ color: canSend ? '#fff' : 'var(--text-3)' }} />
                </motion.button>
              </div>
              <p className="text-[10px] text-center mt-1.5" style={{ color: 'var(--text-3)' }}>
                Mila explains PrecastFlow · She never edits your data
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
