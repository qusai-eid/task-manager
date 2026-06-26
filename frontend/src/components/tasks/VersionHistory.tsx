import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Eye, Trash2, Clock, ChevronDown, ChevronUp,
  History, X, AlertCircle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TaskFile } from '../../types';
import {
  downloadFile, deleteTaskFile, getPreviewBlobUrl,
  versionLabel, formatBytes, fileIcon, isPreviewable,
} from '../../services/fileService';
import { Avatar } from './TaskCard';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Props {
  taskId: number;
  files: TaskFile[];
  onDeleted: (fileId: number) => void;
}

function StageBadge({ stage }: { stage: string }) {
  const labels: Record<string, string> = {
    new_request: 'New Request', under_review: 'Under Review',
    concept_design: 'Concept Design', structural_design: 'Structural Design',
    shop_drawings: 'Shop Drawings', internal_review: 'Int. Review',
    client_review: 'Client Review', revisions: 'Revisions',
    approved: 'Approved', issued: 'Issued',
  };
  return (
    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
      style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}>
      {labels[stage] ?? stage}
    </span>
  );
}

function PreviewModal({
  taskId, file, onClose,
}: { taskId: number; file: TaskFile; onClose: () => void }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState('');

  useState(() => {
    getPreviewBlobUrl(taskId, file.id)
      .then(url => { setBlobUrl(url); setLoading(false); })
      .catch(() => { setError('Could not load preview'); setLoading(false); });
  });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: '#0a0820', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl shrink-0">{fileIcon(file.mime_type, file.original_name)}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{file.original_name}</p>
              <p className="text-[10px] text-white/35">{versionLabel(file)} · {formatBytes(file.file_size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button
              onClick={() => downloadFile(taskId, file).catch(() => toast.error('Download failed'))}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>
              <Download className="w-3.5 h-3.5" />Download
            </button>
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-hidden bg-black/40 flex items-center justify-center min-h-[400px]">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-white/30">
              <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              <p className="text-sm">Loading preview…</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center gap-2 text-white/30">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          {blobUrl && !error && (
            file.mime_type.startsWith('image/')
              ? <img src={blobUrl} alt={file.original_name} className="max-h-full max-w-full object-contain" />
              : <iframe src={blobUrl} title={file.original_name} className="w-full h-full" style={{ minHeight: 500, border: 'none' }} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function VersionHistory({ taskId, files, onDeleted }: Props) {
  const { canManage } = useAuth();
  const [expanded,  setExpanded]  = useState(true);
  const [preview,   setPreview]   = useState<TaskFile | null>(null);
  const [deleting,  setDeleting]  = useState<number | null>(null);

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2 rounded-xl"
        style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
        <History className="w-8 h-8 text-white/15" />
        <p className="text-sm text-white/25">No files uploaded yet</p>
      </div>
    );
  }

  const latest  = files[0];
  const history = files.slice(1);

  async function handleDelete(file: TaskFile) {
    if (!confirm(`Delete "${file.original_name}" (${versionLabel(file)})? This cannot be undone.`)) return;
    setDeleting(file.id);
    try {
      await deleteTaskFile(taskId, file.id);
      onDeleted(file.id);
      toast.success('File version deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(null);
    }
  }

  function FileRow({ file, isLatest = false }: { file: TaskFile; isLatest?: boolean }) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="group flex items-start gap-3 p-3 rounded-xl transition-all"
        style={{
          background: isLatest ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
          border: isLatest ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* File type icon */}
        <span className="text-xl shrink-0 mt-0.5">{fileIcon(file.mime_type, file.original_name)}</span>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {/* Version badge */}
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={isLatest
                ? { background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }
                : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {versionLabel(file)}
            </span>
            {isLatest && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                LATEST
              </span>
            )}
            <StageBadge stage={file.stage} />
          </div>

          <p className="text-xs font-medium text-white/80 truncate">{file.original_name}</p>

          {file.change_notes && (
            <p className="text-[11px] text-white/45 mt-1 leading-relaxed line-clamp-2">
              {file.change_notes}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Avatar name={file.uploader_name} avatar={file.uploader_avatar} size={14} />
              <span className="text-[10px] text-white/35">{file.uploader_name}</span>
            </div>
            <span className="text-white/20">·</span>
            <span className="text-[10px] text-white/30 flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {format(parseISO(file.created_at), 'MMM d, yyyy HH:mm')}
            </span>
            <span className="text-white/20">·</span>
            <span className="text-[10px] text-white/30">{formatBytes(file.file_size)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {isPreviewable(file.mime_type) && (
            <button onClick={() => setPreview(file)}
              className="p-1.5 rounded-lg text-white/35 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
              title="Preview">
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => downloadFile(taskId, file).catch(() => toast.error('Download failed'))}
            className="p-1.5 rounded-lg text-white/35 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
            title="Download">
            <Download className="w-3.5 h-3.5" />
          </button>
          {canManage && (
            <button
              onClick={() => handleDelete(file)}
              disabled={deleting === file.id}
              className="p-1.5 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
              title="Delete version">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[10px] font-bold text-white/35 uppercase tracking-wider">
              Version History
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
              {files.length}
            </span>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors">
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Collapse' : `Show ${history.length} older`}
            </button>
          )}
        </div>

        {/* Latest version always visible */}
        <FileRow file={latest} isLatest />

        {/* Older versions */}
        <AnimatePresence>
          {expanded && history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5 overflow-hidden">
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span className="text-[9px] text-white/25 uppercase tracking-widest">Previous versions</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
              {history.map(f => (
                <FileRow key={f.id} file={f} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <PreviewModal taskId={taskId} file={preview} onClose={() => setPreview(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
