import { Test } from '@nestjs/testing';

import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { disconnect } from 'mongoose';
import { MongoClient } from 'mongodb';

import { MeetupService } from './meetup.service';
import { Meetup, MeetupSchema } from '../schemas/meetup.schema';

describe('UserService', () => {
  let service: MeetupService;
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
        MongooseModule.forFeature([{ name: Meetup.name, schema: MeetupSchema }])
      ],
      providers: [MeetupService],
    }).compile();

    service = app.get<MeetupService>(MeetupService);

    mongoc = new MongoClient(uri);
    await mongoc.connect();
  });

  beforeEach(async () => {
    await mongoc.db('test').collection('users').deleteMany({});
  });

  afterAll(async () => {
    await mongoc.close();
    await disconnect();
    await mongod.stop();
  });

  it.todo('write a test');
});
