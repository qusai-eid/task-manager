import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getProfile, updateProfile } from '../controllers/userController';

const router = Router();

router.use(authenticate);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.delete('/avatar', (req: AuthRequest, res: Response, next: NextFunction) => {
  req.body = { avatar: null };
  updateProfile(req, res).catch(next);
});

export default router;
