import { Test } from '@nestjs/testing';

import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { disconnect, Model } from 'mongoose';
import { MongoClient } from 'mongodb';

import { UserService } from './user.service';
import { User, UserDocument, UserSchema } from '../schemas/user.schema';
import { Meetup, MeetupDocument, MeetupSchema } from '../schemas/meetup.schema';

describe('UserService', () => {
  let service: UserService;
  let mongod: MongoMemoryServer;
  let mongoc: MongoClient;
  let userModel: Model<UserDocument>;
  let meetupModel: Model<MeetupDocument>;

  const testUsers = [{
    id: 'jan123',
    name: 'jan',
  }, {
    id: 'dion123',
    name: 'dion',
  }, {
    id: 'davide123',
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
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: Meetup.name, schema: MeetupSchema }]),
      ],
      providers: [UserService],
    }).compile();

    service = app.get<UserService>(UserService);
    userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
    meetupModel = app.get<Model<MeetupDocument>>(getModelToken(Meetup.name));

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

  describe('create', () => {
    it('should create a new user', async () => {
      const exampleUser = {name: 'mario'};
  
      await service.create(exampleUser.name);
  
      const found = await mongoc.db('test').collection('users').findOne({name: exampleUser.name});
  
      expect(found.name).toBe(exampleUser.name);
    });
  });

  describe('getAll', () => {
    it('should retrieve all users', async () => {
      const results = await service.getAll();
  
      expect(results).toHaveLength(3);
      expect(results.map(r => r.name)).toContain('jan');
      expect(results.map(r => r.name)).toContain('dion');
      expect(results.map(r => r.name)).toContain('davide');
    });
  });

  describe('getOne', () => {
    it('should retrieve a specific user', async () => {
      const result = await service.getOne('jan123');
  
      expect(result).toHaveProperty('name', 'jan');
      expect(result.meetups).toBeUndefined();
    });

    it('returns null when user is not found', async () => {
      const result = await service.getOne('niemand');
  
      expect(result).toBeNull();
    });
  });
});
