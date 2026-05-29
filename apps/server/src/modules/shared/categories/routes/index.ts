import { Router } from 'express';
import * as ctrl from '../controllers/index.js';

const router = Router();
router.get('/', ctrl.getCategories);

export default router;
