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

  const testUsers = [{
    name: 'jan',
  }, {
    name: 'dion',
  }, {
    name: 'davide',
  }]
  
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

  beforeEach(async () => {
    await mongoc.db('test').collection('users').deleteMany({});
    await mongoc.db('test').collection('users').insertMany(testUsers);
  });

  afterAll(async () => {
    await mongoc.close();
    await disconnect();
    await mongod.stop();
  });

  it('should create a new user', async () => {
    const exampleUser = {name: 'mario'};

    await service.create(exampleUser.name);

    const found = await mongoc.db('test').collection('users').findOne({name: exampleUser.name});

    expect(found.name).toBe(exampleUser.name);
  });

  it('should retrieve all users', async () => {
    const results = await service.getAll();

    expect(results).toHaveLength(3);
    expect(results.map(r => r.name)).toContain('jan');
    expect(results.map(r => r.name)).toContain('dion');
    expect(results.map(r => r.name)).toContain('davide');
  });

  it('should retrieve a specific user', async () => {
    const result = await service.getOne('jan');

    expect(result.name).toBe('jan');
  });

  it('returns null when user is not found', async () => {
    const result = await service.getOne('niemand');

    expect(result).toBeNull();
  });
});
