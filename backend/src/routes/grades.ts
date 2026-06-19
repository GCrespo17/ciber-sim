import { Router } from 'express';
import { gradesController } from '../controllers/grades.js';

const router = Router();

router.post('/', gradesController.create);
router.put('/:id', gradesController.update);

export default router;
