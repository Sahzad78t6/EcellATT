import mongoose from 'mongoose';
import { EMAIL_TYPES, EMAIL_STATUS } from '../config/constants.js';

const emailLogSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
      index: true
    },
    type: {
      type: String,
      enum: Object.values(EMAIL_TYPES),
      required: true
    },
    toEmail: {
      type: String,
      required: true,
      trim: true
    },
    attendancePercent: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: Object.values(EMAIL_STATUS),
      required: true,
      index: true
    },
    attempts: {
      type: Number,
      default: 1
    },
    error: {
      type: String,
      default: null
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

emailLogSchema.index({ member: 1, type: 1, sentAt: -1 });

export const EmailLog = mongoose.model('EmailLog', emailLogSchema);
