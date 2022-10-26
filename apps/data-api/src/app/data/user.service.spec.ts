import { Test } from '@nestjs/testing';

import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { disconnect } from 'mongoose';
import { MongoClient } from 'mongodb';

import { UserService } from './user.service';
import { User, UserSchema } from '../schemas/user.schema';

describe('UserService', () => {
  let service: UserService;
  let mongod: MongoMemoryServer;
  let mongoc: MongoClient;
  
  beforeAll(async () => {
    let uri: string;
    
    const app = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => {
            mongod = await MongoMemoryServer.create();
            uri = mongod.getUri();
            return {uri};
          },
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
      ],
      providers: [UserService],
    }).compile();

    service = app.get<UserService>(UserService);

    mongoc = new MongoClient(uri);
    await mongoc.connect();
  });

  beforeAll(async () => {
    // fill db
  });

  afterAll(async () => {
    await mongoc.close();
    await disconnect();
    await mongod.stop();
  });

  it.todo('should create a new user');

  it.todo('should retrieve all users');

  it.todo('should retrieve a specific user');
});
