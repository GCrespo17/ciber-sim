import { Router } from 'express';
import { sectionsController } from '../controllers/sections.js';

const router = Router();

router.get('/', sectionsController.list);
router.get('/:id/students', sectionsController.students);

export default router;
