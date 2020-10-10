import { Request, Response } from 'express';
import Todo from '../models/todo';

export const getAll = (_: Request, res: Response) => {
    Todo.find({})
        .then(todos => res.json(todos))
        .catch(err => res.json(err));
};
export const getOne = (req: Request, res: Response) => {
    Todo.findOne({ _id: req.params.todoId })
        .then(todo => res.json(todo))
        .catch(err => res.json(err));
};
export const create = (req: Request, res: Response) => {
    const newTodo = new Todo({
       description: req.body.description,
       complete: req.body.complete,
       color: req.body.color,
       pinned: req.body.pinned, 
    });

    Todo.create(newTodo)
        .then(todo => res.json(todo))
        .catch(err => res.json(err));
};
export const update = (req: Request, res: Response) => {
    Todo.updateOne({ _id: req.params.todoId }, { ...req.body })
        .then(todo => res.json(todo))
        .catch(err => res.json(err));
};
export const deleteOne = (req: Request, res: Response) => {
    Todo.deleteOne({ _id: req.params.todoId })
        .then(todo => res.json(todo))
        .catch(err => res.json(err));
};