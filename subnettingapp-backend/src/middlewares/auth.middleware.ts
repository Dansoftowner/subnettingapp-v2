import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from 'config';

const JWT_SECRET = config.get<string>('jwt.secret');
const JWT_HEADER = config.get<string>('jwt.headerName');

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.header(JWT_HEADER);
  if (!token) {
    res.status(401).json({ message: 'Authorization token required!' });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid authorization token' });
  }
}
