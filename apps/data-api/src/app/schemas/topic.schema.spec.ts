import { Test } from '@nestjs/testing';

import { Model, disconnect } from 'mongoose';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { Topic, TopicDocument, TopicSchema } from "./topic.schema";

describe('Topic Schema', () => {
  let mongod: MongoMemoryServer;
  let topicModel: Model<TopicDocument>;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => {
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            return {uri};
          },
        }),
        MongooseModule.forFeature([{ name: Topic.name, schema: TopicSchema }])
      ],
    }).compile();

    topicModel = app.get<Model<TopicDocument>>(getModelToken(Topic.name));
  });

  afterAll(async () => {
    await disconnect();
    await mongod.stop();
  });

  it('has a required title', () => {
    const model = new topicModel();

    const err = model.validateSync();

    expect(err.errors.title).toBeInstanceOf(Error);
  });
});