import mongoose from 'mongoose';
import { ATTENDANCE_STATUS, ATTENDANCE_SOURCE } from '../config/constants.js';

const attendanceSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    vertical: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vertical',
      required: false,
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      required: true
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    markedAt: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      enum: Object.values(ATTENDANCE_SOURCE),
      default: ATTENDANCE_SOURCE.MANUAL
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

attendanceSchema.index({ event: 1, member: 1 }, { unique: true });
attendanceSchema.index({ vertical: 1, event: 1 });
attendanceSchema.index({ member: 1, status: 1 });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
