import express, { Request, Response } from 'express';
import { HistoryItem } from '../models/history-item.model';
import asyncErrorHandler from '../middlewares/async-error-handler';
import auth from '../middlewares/auth.middleware';

const router = express.Router();

// GET /api/history-items?offset=0&limit=10
router.get(
  '/history-items',
  auth,
  asyncErrorHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 10, 100);

    const items = await HistoryItem.find({ userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    res.json({
      offset,
      limit,
      items,
    });
  }),
);

router.get(
  '/history-items/:id',
  auth,
  asyncErrorHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const item = await HistoryItem.findById(id);
    if (!item || item.userId.toString() !== userId) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(item);
  }),
);

router.post(
  '/history-items',
  auth,
  asyncErrorHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { title, type, networkAddress, networkMask, hostsCounts, count } =
      req.body;

    const newItem = new HistoryItem({
      userId,
      title,
      type,
      networkAddress,
      networkMask,
      hostsCounts,
      count,
    });
    await newItem.save();

    res.status(201).json(newItem);
  }),
);

router.patch(
  '/history-items/:id',
  auth,
  asyncErrorHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verify ownership
    const item = await HistoryItem.findById(id);
    if (!item || item.userId.toString() !== userId) {
      return res.status(404).json({ message: 'Not found' });
    }

    Object.assign(item, req.body);
    await item.save();

    res.json(item);
  }),
);

export default router;
