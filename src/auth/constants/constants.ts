const isTest = process.env.NODE_ENV === 'test';

export const jwtConstants = {
  secret: isTest ? 'testingSecret' : process.env.jwt_secret,
};
