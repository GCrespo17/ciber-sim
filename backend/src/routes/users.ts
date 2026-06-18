import { Router } from 'express';
import { usersController } from '../controllers/users.js';

const router = Router();

router.get('/:id/profile', usersController.profile);

export default router;
