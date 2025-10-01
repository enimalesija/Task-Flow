import { Schema, model, models } from 'mongoose';

const RefreshTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  rtHash: { type: String, index: true },   // hashed refresh token
  userAgent: String,
  createdAt: { type: Date, default: Date.now, expires: '8d' } // TTL index
});

export const RefreshToken = models.RefreshToken || model('RefreshToken', RefreshTokenSchema);
