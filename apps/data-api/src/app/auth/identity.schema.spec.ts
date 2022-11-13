import { Test } from '@nestjs/testing';

import { Model, disconnect } from 'mongoose';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { Identity, IdentityDocument, IdentitySchema } from "./identity.schema";

describe('Identity Schema', () => {
  let mongod: MongoMemoryServer;
  let identityModel: Model<IdentityDocument>;

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
        MongooseModule.forFeature([{ name: Identity.name, schema: IdentitySchema }])
      ],
    }).compile();

    identityModel = app.get<Model<IdentityDocument>>(getModelToken(Identity.name));

    // not entirely sure why we need to wait for this...
    // https://github.com/nodkz/mongodb-memory-server/issues/102
    await identityModel.ensureIndexes();
  });

  afterAll(async () => {
    await disconnect();
    await mongod.stop();
  });

  it('has a required username', () => {
    const model = new identityModel();

    const err = model.validateSync();

    expect(err.errors.username).toBeInstanceOf(Error);
  });

  it('has a unique username', async () => {
    const original = new identityModel({username: 'samename', hash: 'h123'});
    const duplicate = new identityModel({username: 'samename', hash: 'h456'});

    await original.save();
    
    await expect(duplicate.save()).rejects.toThrow();
  });

  it('has a required password hash', () => {
    const model = new identityModel();

    const err = model.validateSync();

    expect(err.errors.hash).toBeInstanceOf(Error);
  });
});