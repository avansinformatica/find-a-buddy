import { Test } from '@nestjs/testing';

import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { disconnect } from 'mongoose';
import { MongoClient } from 'mongodb';

import { TopicService } from './topic.service';
import { Topic, TopicSchema } from '../schemas/topic.schema';

describe('TopicService', () => {
  let service: TopicService;
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
        MongooseModule.forFeature([{ name: Topic.name, schema: TopicSchema }])
      ],
      providers: [TopicService],
    }).compile();

    service = app.get<TopicService>(TopicService);

    mongoc = new MongoClient(uri);
    await mongoc.connect();
  });

  afterAll(async () => {
    await mongoc.close();
    await disconnect();
    await mongod.stop();
  });

  it.todo('should ensure a topic exists');
});
