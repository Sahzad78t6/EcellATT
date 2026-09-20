import mongoose from 'mongoose';
import { Settings } from '../models/Settings.js';
import { Event } from '../models/Event.js';
import { ENV } from '../config/env.js';

async function updateSession() {
  console.log('Connecting to database:', ENV.MONGO_URI);
  await mongoose.connect(ENV.MONGO_URI);

  // Update or set Settings
  const settings = await Settings.findOneAndUpdate(
    {},
    { currentSession: '2026-2027' },
    { new: true, upsert: true }
  );
  console.log('Updated Settings currentSession to:', settings.currentSession);

  // Update existing events if any
  const eventUpdate = await Event.updateMany({}, { session: '2026-2027' });
  console.log(`Updated ${eventUpdate.modifiedCount} existing events to session 2026-2027.`);

  await mongoose.disconnect();
  console.log('Database session update complete!');
}

updateSession().catch((err) => {
  console.error('Error updating session:', err);
  process.exit(1);
});
