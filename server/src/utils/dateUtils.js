import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { ENV } from '../config/env.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatInTimezone = (date, format = 'YYYY-MM-DD HH:mm:ss', tz = ENV.TIMEZONE) => {
  if (!date) return '';
  return dayjs(date).tz(tz).format(format);
};

export const toUTCDate = (dateString, tz = ENV.TIMEZONE) => {
  if (!dateString) return null;
  return dayjs.tz(dateString, tz).utc().toDate();
};

export const getNowUTC = () => {
  return dayjs().utc().toDate();
};

export { dayjs };
