import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const UPLOAD_DIR = path.join(__dirname, '..', '..', 'data', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/tiff',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip', 'application/x-zip-compressed',
  'application/octet-stream', // DWG / DXF often land here
  'text/plain',
]);

const ALLOWED_EXT = new Set([
  '.pdf', '.jpg', '.jpeg', '.png', '.webp', '.svg', '.tif', '.tiff',
  '.doc', '.docx', '.xls', '.xlsx',
  '.zip', '.dwg', '.dxf', '.txt',
]);

// Explicit blocklist — always rejected regardless of MIME type
const BLOCKED_EXT = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.ps1', '.php', '.py', '.rb',
  '.js', '.ts', '.mjs', '.cjs', '.vbs', '.msi', '.dll', '.so',
  '.jar', '.class', '.com', '.scr', '.pif', '.htaccess',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ts   = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const safe = file.originalname.replace(/[^a-zA-Z0-9._\-]/g, '_').slice(0, 120);
    cb(null, `${ts}-${rand}-${safe}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Blocked extensions always rejected — regardless of MIME type
    if (BLOCKED_EXT.has(ext)) {
      cb(new Error(`File type not supported: ${file.originalname}`)); return;
    }
    if (ALLOWED_MIME.has(file.mimetype) || ALLOWED_EXT.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not supported: ${file.originalname}`));
    }
  },
});
