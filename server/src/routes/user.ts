import express from 'express';
import { requireSignin, adminMiddleware } from '../controllers/auth';
import { read, update } from '../controllers/user';

const router = express.Router();
router.get('/user/:id', requireSignin, read);
router.put('/user/update', requireSignin, update);
router.put('/admin/update', requireSignin, adminMiddleware, update);

export default router;
