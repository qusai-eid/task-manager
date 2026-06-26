import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { requireAdmin, requireAdminOrManager } from '../middleware/permissions';
import { validate } from '../middleware/validate';
import { getMembers, getMember, createMember, updateMember, deleteMember, getMemberStats } from '../controllers/memberController';

const router = Router();
router.use(authenticate);

router.get('/', requireAdminOrManager, getMembers);
router.get('/:id', requireAdminOrManager, getMember);
router.get('/:id/stats', requireAdminOrManager, getMemberStats);

router.post('/',
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('role').optional().isIn(['admin', 'manager', 'member']).withMessage('Invalid role'),
  ],
  validate,
  createMember
);

router.put('/:id',
  requireAdmin,
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('role').optional().isIn(['admin', 'manager', 'member']),
    body('status').optional().isIn(['active', 'inactive']),
  ],
  validate,
  updateMember
);

router.delete('/:id', requireAdmin, deleteMember);

export default router;
