import { Test } from '@nestjs/testing';

import { Model, disconnect } from 'mongoose';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { validate, version } from 'uuid';

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

    // not entirely sure why we need to wait for this...
    // https://github.com/nodkz/mongodb-memory-server/issues/102
    await topicModel.ensureIndexes();
  });

  afterAll(async () => {
    await disconnect();
    await mongod.stop();
  });

  it('has a default uuid v4 as id', () => {
    const model = new topicModel();

    expect(validate(model.id)).toBeTruthy();
    expect(version(model.id)).toBe(4);
  });

  it('has a required title', () => {
    const model = new topicModel();

    const err = model.validateSync();

    expect(err.errors.title).toBeInstanceOf(Error);
  });

  it('has a unique title', async () => {
    const model = new topicModel({title: 'programming'});
    await model.save();

    const duplicate = new topicModel({title: 'programming'});
    await expect(duplicate.save()).rejects.toThrow();
  })
});