import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import config from 'config';

export interface IPasswordToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  createdAt: Date;
  compareToken(raw: string): Promise<boolean>;
}

const PasswordTokenSchema = new Schema<IPasswordToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

PasswordTokenSchema.index({ createdAt: 1 }, { expires: '1h' });

PasswordTokenSchema.pre('save', async function (next) {
  if (!this.isModified('token')) return next();
  try {
    const salt = await bcrypt.genSalt(config.get('crypto.bcryptRounds'));
    this.token = await bcrypt.hash(this.token, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

PasswordTokenSchema.methods.compareToken = async function (
  raw: string,
): Promise<boolean> {
  return bcrypt.compare(raw, this.token);
};

export const PasswordToken = mongoose.model<IPasswordToken>(
  'PasswordToken',
  PasswordTokenSchema,
);
