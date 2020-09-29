import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

export const runValidation = (
    req: Request,
    res: Response,
    next: NextFunction
): Response<ValidationError> | void  => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg
        });
    }
    next();
};
