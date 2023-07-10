const isTest = process.env.NODE_ENV === 'test';

import * as dotenv from 'dotenv';

dotenv.config();

export const jwtConstants = {
  secret: isTest ? 'testingSecret' : process.env.JWT_SECRET,
  expirationTime: process.env.JWT_EXPIRATION_TIME,
};
