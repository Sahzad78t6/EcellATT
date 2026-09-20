import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Attendance } from '../models/Attendance.js';
import { ROLES } from '../config/constants.js';
import { ENV } from '../config/env.js';

async function cleanLeadershipAttendance() {
  console.log('Connecting to database:', ENV.MONGO_URI);
  await mongoose.connect(ENV.MONGO_URI);

  // Find all non-member users
  const nonMembers = await User.find({ role: { $in: [ROLES.ADMIN, ROLES.LEAD, ROLES.SECRETARY] } });
  const nonMemberIds = nonMembers.map((u) => u._id);

  console.log(`Found ${nonMembers.length} leadership/admin users.`);

  // Delete any attendance records associated with these users
  const result = await Attendance.deleteMany({ member: { $in: nonMemberIds } });
  console.log(`Successfully removed ${result.deletedCount} attendance records associated with Leadership/Admin accounts.`);

  await mongoose.disconnect();
  console.log('Done!');
}

cleanLeadershipAttendance().catch((err) => {
  console.error('Error cleaning leadership attendance:', err);
  process.exit(1);
});
