import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { requireAdminOrManager } from '../middleware/permissions';
import { validate } from '../middleware/validate';
import { getTasks, getTask, createTask, updateTask, deleteTask, getKanban, getAnalytics } from '../controllers/taskController';
import { getTeamAnalytics } from '../controllers/teamAnalyticsController';
import { listFiles, uploadFile, serveFile, deleteFile } from '../controllers/fileController';
import { upload } from '../middleware/upload';
import { getComments, addComment, deleteComment } from '../controllers/commentController';
import { getTaskActivity } from '../controllers/activityController';
import { NextFunction, Request, Response } from 'express';

const router = Router();
router.use(authenticate);

router.get('/', getTasks);
router.get('/analytics', getAnalytics);
router.get('/team-analytics', requireAdminOrManager, getTeamAnalytics);
router.get('/kanban', getKanban);
router.get('/:id', getTask);
router.get('/:taskId/comments', getComments);
router.get('/:taskId/activity', getTaskActivity);

router.post('/',
  requireAdminOrManager,
  [body('title').trim().notEmpty().withMessage('Title required')],
  validate,
  createTask
);

router.put('/:id',
  [
    body('status').optional().isIn([
      'new_request','under_review','concept_design','structural_design',
      'shop_drawings','internal_review','client_review','revisions',
      'approved','issued',
    ]),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  ],
  validate,
  updateTask
);

router.delete('/:id', requireAdminOrManager, deleteTask);

router.post('/:taskId/comments',
  [body('content').trim().notEmpty().withMessage('Comment cannot be empty')],
  validate,
  addComment
);

router.delete('/:taskId/comments/:id', deleteComment);

/* ── File version control ───────────────────────────────── */
router.get('/:id/files', listFiles);

// Multer error wrapper: converts multer errors to JSON 400 responses
function multerUpload(req: Request, res: Response, next: NextFunction) {
  upload.single('file')(req, res, (err) => {
    if (!err) { next(); return; }
    const msg = err.message || 'Upload failed';
    res.status(400).json({ error: msg });
  });
}
router.post('/:id/files', multerUpload, uploadFile);
router.get('/:id/files/:fileId', serveFile);
router.delete('/:id/files/:fileId', requireAdminOrManager, deleteFile);

export default router;
