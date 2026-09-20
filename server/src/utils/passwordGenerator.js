import crypto from 'crypto';

export const generateTemporaryPassword = (length = 10) => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const specials = '!@#$%&*';

  let pwd = '';
  pwd += upper[crypto.randomInt(0, upper.length)];
  pwd += lower[crypto.randomInt(0, lower.length)];
  pwd += digits[crypto.randomInt(0, digits.length)];
  pwd += specials[crypto.randomInt(0, specials.length)];

  const allChars = upper + lower + digits + specials;
  for (let i = pwd.length; i < length; i++) {
    pwd += allChars[crypto.randomInt(0, allChars.length)];
  }

  // Shuffle the password
  return pwd
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
};
