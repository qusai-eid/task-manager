import api from './api';
import { TaskFile } from '../types';

export async function getTaskFiles(taskId: number): Promise<TaskFile[]> {
  const { data } = await api.get(`/tasks/${taskId}/files`);
  return data.files;
}

export async function uploadTaskFile(
  taskId: number,
  file: File,
  opts: { changeNotes?: string; bumpMajor?: boolean } = {}
): Promise<TaskFile> {
  const form = new FormData();
  form.append('file', file);
  if (opts.changeNotes?.trim()) form.append('change_notes', opts.changeNotes.trim());
  if (opts.bumpMajor) form.append('bump_major', 'true');

  const { data } = await api.post(`/tasks/${taskId}/files`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.file;
}

/** Fetch file as blob and trigger browser download */
export async function downloadFile(taskId: number, file: TaskFile): Promise<void> {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/tasks/${taskId}/files/${file.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = file.original_name;
  a.click();
  URL.revokeObjectURL(url);
}

/** Fetch file as blob URL for inline preview */
export async function getPreviewBlobUrl(taskId: number, fileId: number): Promise<string> {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/tasks/${taskId}/files/${fileId}?preview=true`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Preview failed');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function deleteTaskFile(taskId: number, fileId: number): Promise<void> {
  await api.delete(`/tasks/${taskId}/files/${fileId}`);
}

/* ── Helpers ─────────────────────────────────────────────── */
export function versionLabel(f: TaskFile): string {
  return `v${f.version_major}.${f.version_minor}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024)           return `${bytes} B`;
  if (bytes < 1024 * 1024)    return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileIcon(mimeType: string, name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (mimeType.startsWith('image/'))        return '🖼️';
  if (mimeType === 'application/pdf')        return '📄';
  if (ext === 'dwg' || ext === 'dxf')        return '📐';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || ext === 'xlsx' || ext === 'xls') return '📊';
  if (mimeType.includes('word') || ext === 'docx' || ext === 'doc') return '📝';
  if (mimeType.includes('zip'))              return '🗜️';
  return '📎';
}

export function isPreviewable(mimeType: string): boolean {
  return mimeType.startsWith('image/') || mimeType === 'application/pdf';
}
