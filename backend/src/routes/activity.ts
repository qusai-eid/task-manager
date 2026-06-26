import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdminOrManager } from '../middleware/permissions';
import { getActivity } from '../controllers/activityController';

const router = Router();
router.use(authenticate, requireAdminOrManager);
router.get('/', getActivity);

export default router;
