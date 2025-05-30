import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from 'config';
import asyncErrorHandler from '../middlewares/async-error-handler';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { User } from '../models/user.model';
import { PasswordToken } from '../models/password-token.model';
import { ApiError } from '../error/api-error';
import { mailTransporter, loadMailTemplate } from '../mail-transporter';

const router = Router();
const JWT_SECRET: string = config.get('jwt.secret');
const JWT_HEADER: string = config.get('jwt.headerName');

router.post(
  '/registration',
  asyncErrorHandler(async (req: Request, res: Response) => {
    const { fullName, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(400, 'Email already registered');

    const user = new User({ fullName, email, password });
    await user.save();

    res
      .status(201)
      .json({ id: user._id, fullName: user.fullName, email: user.email });
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

    const token = jwt.sign(payload, JWT_SECRET);
    res.setHeader(JWT_HEADER, token);
    res.json({ id: user._id, fullName: user.fullName, email: user.email });
  }),
);

router.post(
  '/forgotten-password',
  asyncErrorHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      await PasswordToken.deleteMany({ userId: user._id });

      const token = crypto.randomBytes(32).toString('hex');
      await new PasswordToken({ userId: user._id, token }).save();

      const resetLink = `${config.get('frontend.host')}/forgotten-password/${user._id}/${token}`;

      await mailTransporter.sendMail({
        from: config.get('smtp.from'),
        to: email,
        subject: 'Jelszó visszaállítás',
        text: loadMailTemplate('forgot_password.txt', {
          fullName: user.fullName,
          resetLink,
        }),
        html: loadMailTemplate('forgot_password', {
          fullName: user.fullName,
          resetLink,
        }),
      });
    }
    res.status(202).json({
      message: 'If that email is registered, a reset link has been sent.',
    });
  }),
);

router.post(
  '/forgotten-password/:userId/:token',
  asyncErrorHandler(async (req: Request, res: Response) => {
    const { userId, token } = req.params;
    const { password } = req.body;

    const record = await PasswordToken.findOne({ userId });
    if (!record) throw new ApiError(400, 'Invalid or expired reset token');

    const isValid = await record.compareToken(token);
    if (!isValid) throw new ApiError(400, 'Invalid or expired reset token');

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    user.password = password;

    await user.save();
    await PasswordToken.deleteMany({ userId });

    res.json({ message: 'Password has been reset successfully' });
  }),
);

export default router;
