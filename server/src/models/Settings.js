import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    lowAttendanceThreshold: {
      type: Number,
      default: 75,
      min: 1,
      max: 100
    },
    minEventsForAlert: {
      type: Number,
      default: 3,
      min: 1
    },
    alertCooldownDays: {
      type: Number,
      default: 7,
      min: 0
    },
    autoCloseBufferMinutes: {
      type: Number,
      default: 30,
      min: 0
    },
    emailAlertsEnabled: {
      type: Boolean,
      default: true
    },
    currentSession: {
      type: String,
      default: '2024-2025'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    }
  },
  {
    timestamps: true
  }
);

settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export const Settings = mongoose.model('Settings', settingsSchema);
