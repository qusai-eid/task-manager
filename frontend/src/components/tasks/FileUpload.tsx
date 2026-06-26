import { useState, useRef, useCallback, DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, RotateCw, FileCheck2, AlertCircle } from 'lucide-react';
import { uploadTaskFile, fileIcon, formatBytes } from '../../services/fileService';
import { TaskFile } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  taskId: number;
  latestVersion?: { major: number; minor: number } | null;
  onUploaded: (file: TaskFile) => void;
}

const ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.svg,.tif,.tiff,.doc,.docx,.xls,.xlsx,.zip,.dwg,.dxf,.txt';
const MAX_MB  = 50;

export default function FileUpload({ taskId, latestVersion, onUploaded }: Props) {
  const [dragging,    setDragging]    = useState(false);
  const [pending,     setPending]     = useState<File | null>(null);
  const [changeNotes, setChangeNotes] = useState('');
  const [bumpMajor,   setBumpMajor]   = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const nextVersion = () => {
    if (!latestVersion) return 'v1.0';
    if (bumpMajor) return `v${latestVersion.major + 1}.0`;
    return `v${latestVersion.major}.${latestVersion.minor + 1}`;
  };

  const accept = useCallback((file: File) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File exceeds ${MAX_MB} MB limit`);
      return;
    }
    setPending(file);
    setBumpMajor(false);
    setChangeNotes('');
  }, []);

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) accept(file);
  }, [accept]);

  async function handleUpload() {
    if (!pending) return;
    setUploading(true);
    try {
      const uploaded = await uploadTaskFile(taskId, pending, { changeNotes, bumpMajor });
      onUploaded(uploaded);
      setPending(null);
      setChangeNotes('');
      setBumpMajor(false);
      toast.success(`Uploaded as ${nextVersion()}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {!pending && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className="relative flex flex-col items-center justify-center gap-2 py-7 rounded-xl cursor-pointer transition-all"
          style={{
            border: `1.5px dashed ${dragging ? 'rgba(139,92,246,0.7)' : 'rgba(255,255,255,0.15)'}`,
            background: dragging ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.02)',
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.12)' }}>
            <Upload className="w-5 h-5 text-violet-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/70">
              {latestVersion
                ? `Upload new version (will be ${nextVersion()})`
                : 'Upload initial file (v1.0)'}
            </p>
            <p className="text-[11px] text-white/30 mt-0.5">
              PDF, DWG, DXF, Images, Word, Excel, ZIP · max {MAX_MB} MB
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) accept(f); e.target.value = ''; }}
          />
        </div>
      )}

      {/* Pending file card */}
      <AnimatePresence>
        {pending && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(139,92,246,0.25)', background: 'rgba(139,92,246,0.06)' }}
          >
            {/* File preview row */}
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-2xl shrink-0">{fileIcon(pending.type, pending.name)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/85 truncate">{pending.name}</p>
                <p className="text-[11px] text-white/35 mt-0.5">{formatBytes(pending.size)}</p>
              </div>
              <button onClick={() => setPending(null)}
                className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="px-4 pb-4 space-y-3">
              {/* Change notes */}
              <div>
                <label className="text-[10px] font-semibold text-white/35 uppercase tracking-wider block mb-1.5">
                  Change Notes <span className="normal-case font-normal">(optional)</span>
                </label>
                <textarea
                  value={changeNotes}
                  onChange={e => setChangeNotes(e.target.value)}
                  rows={2}
                  placeholder="Describe what changed in this version…"
                  className="w-full text-xs rounded-lg px-3 py-2 outline-none resize-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.75)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.5)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </div>

              {/* Major version bump */}
              {latestVersion && (
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => setBumpMajor(b => !b)}
                    className="w-4 h-4 rounded flex items-center justify-center transition-all shrink-0"
                    style={{
                      background:  bumpMajor ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.08)',
                      border:      bumpMajor ? '1px solid rgba(139,92,246,0.9)' : '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {bumpMajor && <span className="text-[8px] text-white font-bold">✓</span>}
                  </div>
                  <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                    Major revision — bump to v{latestVersion.major + 1}.0
                    <span className="ml-1 text-white/30">(otherwise {`v${latestVersion.major}.${latestVersion.minor + 1}`})</span>
                  </span>
                </label>
              )}

              {/* Version badge preview + upload button */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
                  {nextVersion()}
                </span>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ml-auto"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    color: 'white',
                    opacity: uploading ? 0.6 : 1,
                  }}
                >
                  {uploading
                    ? <><RotateCw className="w-3.5 h-3.5 animate-spin" />Uploading…</>
                    : <><FileCheck2 className="w-3.5 h-3.5" />Upload {nextVersion()}</>}
                </button>
              </div>

              {/* Size warning */}
              {pending.size > 20 * 1024 * 1024 && (
                <p className="text-[10px] text-amber-400/80 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  Large file — upload may take a moment
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
