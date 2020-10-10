import express from 'express';
import * as todoRoutes from '../controllers/todo';

// @TODO: Add auth middleware and tie todos to users
const router = express.Router();
router.get('/todo', todoRoutes.getAll);
router.get('/todo/:todoId', todoRoutes.getOne);
router.post('/todo', todoRoutes.create);
router.patch('/todo/:todoId', todoRoutes.update);
router.delete('/todo/:todoId', todoRoutes.deleteOne);

export default router;