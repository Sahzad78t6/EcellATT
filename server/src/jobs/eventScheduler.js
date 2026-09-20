import cron from 'node-cron';
import { Event } from '../models/Event.js';
import { Settings } from '../models/Settings.js';
import { eventService } from '../services/event.service.js';
import { EVENT_STATUS } from '../config/constants.js';

export const startEventScheduler = () => {
  // Run every minute
  const task = cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const settings = await Settings.getSettings();
      const bufferMinutes = settings.autoCloseBufferMinutes || 30;

      // 1. Transition SCHEDULED -> OPEN
      const scheduledEvents = await Event.find({
        status: EVENT_STATUS.SCHEDULED,
        manualOverride: false,
        startTime: { $lte: now }
      });

      for (const event of scheduledEvents) {
        try {
          const updated = await Event.findOneAndUpdate(
            { _id: event._id, status: EVENT_STATUS.SCHEDULED },
            { $set: { status: EVENT_STATUS.OPEN } },
            { new: true }
          );
          if (updated) {
            console.log(`[EventScheduler] Auto-opened event: "${event.name}" (${event._id})`);
          }
        } catch (openErr) {
          console.error(`[EventScheduler] Error auto-opening event ${event._id}:`, openErr.message);
        }
      }

      // 2. Transition OPEN -> CLOSED (after endTime + buffer)
      const openEvents = await Event.find({
        status: EVENT_STATUS.OPEN,
        manualOverride: false
      });

      for (const event of openEvents) {
        try {
          const closeThreshold = new Date(event.endTime.getTime() + bufferMinutes * 60 * 1000);
          if (now >= closeThreshold) {
            // Atomic close transition
            const closedEvent = await Event.findOneAndUpdate(
              { _id: event._id, status: EVENT_STATUS.OPEN },
              { $set: { status: EVENT_STATUS.CLOSED } },
              { new: true }
            );

            if (closedEvent) {
              console.log(`[EventScheduler] Auto-closed event: "${event.name}". Finalizing absents and alerts...`);
              await eventService.finalizeEventAbsentsAndAlerts(closedEvent);
            }
          }
        } catch (closeErr) {
          console.error(`[EventScheduler] Error auto-closing event ${event._id}:`, closeErr.message);
        }
      }
    } catch (err) {
      console.error('[EventScheduler] Error during scheduled cron run:', err.message);
    }
  });

  console.log('[EventScheduler] Cron job registered (runs every minute).');
  return task;
};
