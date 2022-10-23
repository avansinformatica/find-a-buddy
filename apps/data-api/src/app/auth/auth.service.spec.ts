import { Test } from '@nestjs/testing';

import { AuthService } from './auth.service';

import { Jwt, sign } from 'jsonwebtoken';

describe('AuthService', () => {
  let service: AuthService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = app.get<AuthService>(AuthService);
  });

  describe('verify token', () => {
    it('should accept a valid token', async () => {
      const examplePayload = {user: 'userid'} 

      const token = sign(examplePayload, process.env.JWT_SECRET);

      const verifiedToken = await service.verifyToken(token);

      expect(verifiedToken).toHaveProperty('user', examplePayload.user);
    });

    it('should throw on invalid token', async () => {
      const token = 'fake.fake.fake';

      await expect(service.verifyToken(token)).rejects.toThrow();
    });
  })

  describe('generate token', () => {
    it.todo('should generate a token with user id');
  });

  describe('register user', () => {
    it.todo('should register a new user');
  })
});
