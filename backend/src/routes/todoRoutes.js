import express from 'express';
import { createTask, createTodo, deleteTask, deleteTodo, getAllTodos, getTodoById, updateTask, updateTodoTitle } from '../controllers/todoControllers.js';

const router = express.Router();

router.get('/', getAllTodos);
router.get('/:id', getTodoById);
router.post('/', createTodo);
router.patch('/:id', updateTodoTitle);        // ✅ ADD: rename todo
router.delete('/:id', deleteTodo);

router.post('/:id/tasks', createTask);
router.patch('/:id/tasks/:taskId', updateTask); // ✅ FIX: was PUT /:id/:tasks/:taskId
router.delete('/:id/tasks/:taskId', deleteTask);

export default router;