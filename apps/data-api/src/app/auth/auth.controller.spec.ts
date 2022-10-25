import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ // mock the auth service, to avoid providing its dependencies
        provide: AuthService,
        useValue: {
          registerUser: jest.fn(),
          generateToken: jest.fn(),
        },
      }],
    }).compile();
  });

  describe('register', () => {
    it('should call the register method of the auth service', async () => {
      const authController = app.get<AuthController>(AuthController);
      const authService = app.get<AuthService>(AuthService);

      const exampleUser = {
        username: 'henk',
        password: 'supersecret123',
      }

      const register = jest.spyOn(authService, 'registerUser')
        .mockImplementation(async (_u: string, _p: string) => {return;});

      await authController.register(exampleUser);

      expect(register).toHaveBeenCalledWith(exampleUser.username, exampleUser.password);
    });
  });

  describe('login', () => {
    it('should call the generateToken method of the auth service', async () => {
      const authController = app.get<AuthController>(AuthController);
      const authService = app.get<AuthService>(AuthService);

      const exampleUser = {
        username: 'henk',
        password: 'supersecret123',
      };
      const mockedToken = 'mockedToken';

      const register = jest.spyOn(authService, 'generateToken')
        .mockImplementation(async (_u: string, _p: string) => {return mockedToken;});

      expect(await authController.login(exampleUser)).toBe(mockedToken);

      expect(register).toHaveBeenCalledWith(exampleUser.username, exampleUser.password);
    });
  });
});
