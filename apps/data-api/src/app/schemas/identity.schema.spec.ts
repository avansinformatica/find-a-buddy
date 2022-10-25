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
  });

  afterAll(async () => {
    // await mongoc.close();
    await disconnect();
    await mongod.stop();
  });

  it('has a required username', () => {
    const model = new identityModel({hash: 'h123'});

    const err = model.validateSync();

    expect(err.errors.username).toBeInstanceOf(Error);
    expect(err.errors.hash).toBeUndefined();
  });

  it('has a required password hash', () => {
    const model = new identityModel({username: 'user123'});

    const err = model.validateSync();

    expect(err.errors.username).toBeUndefined();
    expect(err.errors.hash).toBeInstanceOf(Error);
  });
});