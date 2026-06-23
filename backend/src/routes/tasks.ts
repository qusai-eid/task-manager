import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { getTasks, getTask, createTask, updateTask, deleteTask, getAnalytics } from '../controllers/taskController';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.get('/analytics', getAnalytics);
router.get('/:id', getTask);

router.post('/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('status').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  ],
  validate,
  createTask
);

router.put('/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('status').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  ],
  validate,
  updateTask
);

router.delete('/:id', deleteTask);

export default router;
