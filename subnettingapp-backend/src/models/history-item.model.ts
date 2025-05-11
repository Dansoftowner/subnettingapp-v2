import mongoose, { Document, Schema } from 'mongoose';

export interface IHistoryItem extends Document {
  userId: mongoose.Types.ObjectId;
  title?: string;
  type?: 'si' | 'sp' | 'rp';
  networkAddress?: string;
  networkMask?: number;
  hostsCounts?: number[];
  count?: number;
  createdAt: Date;
  updatedAt: Date;
}

const HistoryItemSchema = new Schema<IHistoryItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: '' },
    type: { type: String, enum: ['si', 'sp', 'rp'], default: null },
    networkAddress: { type: String, default: '' },
    networkMask: { type: Number, default: null },
    hostsCounts: { type: [Number], default: [] },
    count: { type: Number, default: null },
  },
  { timestamps: true },
);

export const HistoryItem = mongoose.model<IHistoryItem>(
  'HistoryItem',
  HistoryItemSchema,
);
