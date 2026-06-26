import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { milaChat } from '../controllers/aiController';

const router = Router();
router.use(authenticate);

router.post(
  '/chat',
  [
    body('messages').isArray({ min: 1 }).withMessage('Messages array required'),
    body('messages.*.role').isIn(['user', 'assistant']).withMessage('Invalid role'),
    body('messages.*.content').isString().notEmpty().withMessage('Content required'),
  ],
  validate,
  milaChat
);

export default router;
