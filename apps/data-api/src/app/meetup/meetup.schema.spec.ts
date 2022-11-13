import { Test } from '@nestjs/testing';

import { Model, disconnect } from 'mongoose';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { validate, version } from 'uuid';

import { Meetup, MeetupDocument, MeetupSchema } from "./meetup.schema";

describe('Meetup Schema', () => {
  let mongod: MongoMemoryServer;
  let meetupModel: Model<MeetupDocument>;

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
        MongooseModule.forFeature([{ name: Meetup.name, schema: MeetupSchema }])
      ],
    }).compile();

    meetupModel = app.get<Model<MeetupDocument>>(getModelToken(Meetup.name));
  });

  afterAll(async () => {
    await disconnect();
    await mongod.stop();
  });

  it('has a default uuid v4 as id', () => {
    const model = new meetupModel();

    expect(validate(model.id)).toBeTruthy();
    expect(version(model.id)).toBe(4);
  });

  it('has an optional review', () => {
    const model = new meetupModel();

    const err = model.validateSync();

    expect(err.errors.review).toBeUndefined();
  });

  it('has a required topic', () => {
    const model = new meetupModel();

    const err = model.validateSync();

    expect(err.errors.topic).toBeInstanceOf(Error);
  });

  it('has a required datetime', () => {
    const model = new meetupModel();

    const err = model.validateSync();

    expect(err.errors.datetime).toBeInstanceOf(Error);
  })

  it('is not accepted by default', () => {
    const model = new meetupModel();

    expect(model.accepted).toBe(false);
  });

  it('has a required tutor', () => {
    const model = new meetupModel();

    const err = model.validateSync();

    expect(err.errors.tutorRef).toBeInstanceOf(Error);
  });

  it('has a required pupil', () => {
    const model = new meetupModel();

    const err = model.validateSync();

    expect(err.errors.pupilRef).toBeInstanceOf(Error);
  });
});
