import express from 'express';
import { requireSignin } from '../controllers/auth';
import * as todoRoutes from '../controllers/todo';

// @TODO: Add auth middleware and tie todos to users
const router = express.Router();
router.get('/todo', requireSignin, todoRoutes.getAll);
router.get('/todo/:todoId', requireSignin, todoRoutes.getOne);
router.post('/todo', requireSignin, todoRoutes.create);
router.patch('/todo/:todoId', requireSignin, todoRoutes.update);
router.delete('/todo/:todoId', requireSignin, todoRoutes.deleteOne);

export default router;