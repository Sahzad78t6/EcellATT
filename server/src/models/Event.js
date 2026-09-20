import mongoose from 'mongoose';
import { EVENT_STATUS, EVENT_TYPES } from '../config/constants.js';

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: EVENT_TYPES,
      default: 'Event'
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    startTime: {
      type: Date,
      required: true,
      index: true
    },
    endTime: {
      type: Date,
      required: true,
      index: true
    },
    venue: {
      type: String,
      default: 'E-Cell Hall / Virtual'
    },
    targetVerticals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vertical'
      }
    ],
    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.SCHEDULED,
      index: true
    },
    manualOverride: {
      type: Boolean,
      default: false
    },
    session: {
      type: String,
      required: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

eventSchema.index({ status: 1, startTime: 1, endTime: 1 });
eventSchema.index({ session: 1, date: -1 });

export const Event = mongoose.model('Event', eventSchema);
