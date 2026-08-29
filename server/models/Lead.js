import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    insight: { type: String, required: true },
    intent: { type: String, enum: ['high', 'medium', 'low'], default: 'high' },
    product: { type: String, default: 'Family Protection' },
    lastActive: { type: String, default: 'Just now' },
    phone: { type: String },
  },
  { timestamps: true }
);

leadSchema.index({ customerName: 1, insight: 1 });

export const Lead = mongoose.model('Lead', leadSchema);
