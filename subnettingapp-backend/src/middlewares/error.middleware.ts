import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../error/api-error';

export default (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.httpStatus).send({ message: err.message });
    return;
  }
  res.status(500).json({ message: 'Internal server error' });
};
