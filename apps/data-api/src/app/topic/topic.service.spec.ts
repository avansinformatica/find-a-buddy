import { Test } from '@nestjs/testing';

import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model, disconnect } from 'mongoose';
import { MongoClient } from 'mongodb';

import { TopicService } from './topic.service';
import { Topic, TopicSchema, TopicDocument } from './topic.schema';
import { User, UserSchema, UserDocument } from '../user/user.schema';

describe('TopicService', () => {
  let service: TopicService;
  let mongod: MongoMemoryServer;
  let mongoc: MongoClient;

  let topicModel: Model<TopicDocument>;
  let userModel: Model<UserDocument>;
  
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
        MongooseModule.forFeature([{ name: Topic.name, schema: TopicSchema }]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [TopicService],
    }).compile();

    service = app.get<TopicService>(TopicService);

    topicModel = app.get<Model<TopicDocument>>(getModelToken(Topic.name));
    userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

    // not entirely sure why we need to wait for this...
    // https://github.com/nodkz/mongodb-memory-server/issues/102
    await topicModel.ensureIndexes();
    await userModel.ensureIndexes();

    mongoc = new MongoClient(uri);
    await mongoc.connect();
  });

  beforeEach(async () => {
    await mongoc.db('test').collection('topics').deleteMany({});
    await mongoc.db('test').collection('users').deleteMany({});
  })

  afterAll(async () => {
    await mongoc.close();
    await disconnect();
    await mongod.stop();
  });

  describe('ensuring a topic exists', () => {
    it('should create a topic if it does not exist', async () => {
      const testTopic = 'interesting topic';

      await service.ensureExists(testTopic);
  
      const results = await mongoc.db('test').collection('topics').find({}).toArray();

      expect(results.map(t => t.title)).toContain(testTopic);
      expect(results).toHaveLength(1);
    });

    it('should not create a topic if it exists', async () => {
      const testTopic = 'interesting topic';

      await mongoc.db('test').collection('topics').insertOne({title: testTopic});

      await service.ensureExists(testTopic);
  
      const results = await mongoc.db('test').collection('topics').find({}).toArray();

      expect(results.map(t => t.title)).toContain(testTopic);
      expect(results).toHaveLength(1);
    });
  });

  it('should give all topics', async () => {
    const testTopics = [{
      title: 'interesting topic',
    }, {
      title: 'another interesting topic',
    }];

    await mongoc.db('test').collection('topics').insertMany(testTopics);

    const results = await service.getAll();

    expect(results.map(t => t.title)).toContain(testTopics[0].title);
    expect(results.map(t => t.title)).toContain(testTopics[1].title);
    expect(results).toHaveLength(2);
    expect(results[0]).toHaveProperty('_id', undefined);
    expect(results[0]).toHaveProperty('__v', undefined);
  });

  describe('user interaction', () => {
    const testUser = {name: 'luigi', id: 'l1234', emailAddress: 'luigi@luigi.it'};
    const testTopic = 'mushrooms';

    beforeEach(async () => {
      await userModel.create(testUser);
    });

    describe('adding topics', () => {
      describe('tutor topics', () => {
        it('adds a topic when it does not exist on user', async () => {
          await service.addTopic(testUser.id, testTopic, 'tutor');
    
          const user = await userModel.findOne({name: testUser.name});
    
          expect(user.tutorTopics).toContain(testTopic);
          expect(user.tutorTopics).toHaveLength(1);
        });
    
        it('does not add a topic when it does exist on user', async () => {
          const user = await userModel.findOne({name: testUser.name});
          user.tutorTopics.push(testTopic);
          await user.save();
          
          await service.addTopic(testUser.id, testTopic, 'tutor');
    
          expect(user.tutorTopics).toContain(testTopic);
          expect(user.tutorTopics).toHaveLength(1);
        });
    
        it('creates a topic (in topics collection) if it does not exist on user', async () => {
          await service.addTopic(testUser.id, testTopic, 'tutor');
    
          const topics = await mongoc.db('test').collection('topics').find().toArray();
    
          expect(topics).toHaveLength(1);
          expect(topics.map(t => t.title)).toContain(testTopic);
        });
      });

      describe('pupil topics', () => {
        it('adds a topic when it does not exist on user', async () => {
          await service.addTopic(testUser.id, testTopic, 'pupil');
    
          const user = await userModel.findOne({name: testUser.name});
    
          expect(user.pupilTopics).toContain(testTopic);
          expect(user.pupilTopics).toHaveLength(1);
        });
    
        it('does not add a topic when it does exist on user', async () => {
          const user = await userModel.findOne({name: testUser.name});
          user.pupilTopics.push(testTopic);
          await user.save();
          
          await service.addTopic(testUser.id, testTopic, 'pupil');
    
          expect(user.pupilTopics).toContain(testTopic);
          expect(user.pupilTopics).toHaveLength(1);
        });
    
        it('creates a topic (in topics collection) if it does not exist on user', async () => {
          await service.addTopic(testUser.id, testTopic, 'tutor');
    
          const topics = await mongoc.db('test').collection('topics').find().toArray();
    
          expect(topics).toHaveLength(1);
          expect(topics.map(t => t.title)).toContain(testTopic);
        });
      });
    });

    describe('removing topics', () => {
      const testTopic2 = 'tubes';
      const testTopic3 = 'coins';

      beforeEach(async () => {
        const user = await userModel.findOne({name: testUser.name});
        user.tutorTopics.push(testTopic);
        user.tutorTopics.push(testTopic2);
        user.pupilTopics.push(testTopic);
        user.pupilTopics.push(testTopic2);
        await user.save();

        await topicModel.create({title: testTopic});
        await topicModel.create({title: testTopic2});
      });

      describe('tutor topics', () => {
        it('does not remove a topic when it does not exist on user', async () => {
          await service.removeTopic(testUser.id, testTopic3, 'tutor');

          const user = await userModel.findOne({name: testUser.name});

          expect(user.tutorTopics).toHaveLength(2);
          expect(user.tutorTopics).toContain(testTopic);
          expect(user.tutorTopics).toContain(testTopic2);
        });

        it('removes a topic when it does exist on user', async () => {
          await service.removeTopic(testUser.id, testTopic2, 'tutor');

          const user = await userModel.findOne({name: testUser.name});

          expect(user.tutorTopics).toHaveLength(1);
          expect(user.tutorTopics).toContain(testTopic);
        });

        it('leaves topic (in topics collection) when removing a topic', async () => {
          await service.removeTopic(testUser.id, testTopic2, 'tutor');

          const topics = await topicModel.find();

          expect(topics).toHaveLength(2);
          expect(topics.map(t => t.title)).toContain(testTopic);
          expect(topics.map(t => t.title)).toContain(testTopic2);
        });
      });

      describe('pupil topics', () => {
        it('does not remove a topic when it does not exist on user', async () => {
          await service.removeTopic(testUser.id, testTopic3, 'pupil');

          const user = await userModel.findOne({name: testUser.name});

          expect(user.pupilTopics).toHaveLength(2);
          expect(user.pupilTopics).toContain(testTopic);
          expect(user.pupilTopics).toContain(testTopic2);
        });

        it('removes a topic when it does exist on user', async () => {
          await service.removeTopic(testUser.id, testTopic2, 'pupil');

          const user = await userModel.findOne({name: testUser.name});

          expect(user.pupilTopics).toHaveLength(1);
          expect(user.pupilTopics).toContain(testTopic);
        });

        it('leaves topic (in topics collection) when removing a topic', async () => {
          await service.removeTopic(testUser.id, testTopic2, 'pupil');

          const topics = await topicModel.find();

          expect(topics).toHaveLength(2);
          expect(topics.map(t => t.title)).toContain(testTopic);
          expect(topics.map(t => t.title)).toContain(testTopic2);
        });
      });
    });
  });
});
