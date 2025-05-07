import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from 'config';
import asyncErrorHandler from '../middlewares/async-error-handler';
import { User } from '../models/user.model';
import { ApiError } from '../error/api-error';

const router = Router();
const JWT_SECRET: string = config.get('jwt.secret');

router.post(
  '/registration',
  asyncErrorHandler(async (req: Request, res: Response) => {
    const { fullName, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({ fullName, email, password });
    await user.save();

    return res.status(201).json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    });
  }),
);

router.post(
  '/login',
  asyncErrorHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(401, 'Invalid credentials');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new ApiError(401, 'Invalid credentials');

    const payload = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.setHeader(config.get('jwt.headerName'), token);

    return res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    });
  }),
);

export default router;
