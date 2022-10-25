import { Test } from '@nestjs/testing';

import { Model, disconnect } from 'mongoose';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { Review, ReviewDocument, ReviewSchema } from "./review.schema";

describe('Review Schema', () => {
  let mongod: MongoMemoryServer;
  let reviewModel: Model<ReviewDocument>;

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
        MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }])
      ],
    }).compile();

    reviewModel = app.get<Model<ReviewDocument>>(getModelToken(Review.name));
  });

  afterAll(async () => {
    await disconnect();
    await mongod.stop();
  });

  it('does not have a required text', () => {
    const model = new reviewModel();

    const err = model.validateSync();

    expect(err.errors.text).toBeUndefined();
  });

  it('has a required rating', () => {
    const model = new reviewModel();

    const err = model.validateSync();

    expect(err.errors.rating).toBeInstanceOf(Error);
  });
  
  it('cannot have a rating of 1.5', () => {
    const model = new reviewModel({rating: 1.5});
    
    const err = model.validateSync();
    
    expect(err.errors.rating).toBeInstanceOf(Error);
    expect(err.errors.rating.message).toBe('rating should be 1, 2, 3, 4 or 5');
  });

  it('cannot have a rating of 0', () => {
    const model = new reviewModel({rating: 0});

    const err = model.validateSync();

    expect(err.errors.rating).toBeInstanceOf(Error);
    expect(err.errors.rating.message).toBe('rating should be 1, 2, 3, 4 or 5');
  });

  it('cannot have a rating of 6', () => {
    const model = new reviewModel({rating: 6});

    const err = model.validateSync();

    expect(err.errors.rating).toBeInstanceOf(Error);
    expect(err.errors.rating.message).toBe('rating should be 1, 2, 3, 4 or 5');
  });
});
