import { Test } from '@nestjs/testing';

import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model, disconnect } from 'mongoose';
import { MongoClient } from 'mongodb';

import { TopicService } from './topic.service';
import { Topic, TopicSchema, TopicDocument } from '../schemas/topic.schema';
import { User, UserSchema, UserDocument } from '../schemas/user.schema';

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
  });

  describe('user interaction', () => {
    const testUsername = 'luigi';
    const testTopic = 'mushrooms';

    beforeEach(async () => {
      await userModel.create({name: testUsername});
    });

    describe('adding topics', () => {
      describe('coach topics', () => {
        it('adds a topic when it does not exist on user', async () => {
          await service.addTopic(testUsername, testTopic, 'coach');
    
          const user = await userModel.findOne({name: testUsername});
    
          expect(user.coachTopics).toContain(testTopic);
          expect(user.coachTopics).toHaveLength(1);
        });
    
        it('does not add a topic when it does exist on user', async () => {
          const user = await userModel.findOne({name: testUsername});
          user.coachTopics.push(testTopic);
          await user.save();
          
          await service.addTopic(testUsername, testTopic, 'coach');
    
          expect(user.coachTopics).toContain(testTopic);
          expect(user.coachTopics).toHaveLength(1);
        });
    
        it('creates a topic (in topics collection) if it does not exist on user', async () => {
          await service.addTopic(testUsername, testTopic, 'coach');
    
          const topics = await mongoc.db('test').collection('topics').find().toArray();
    
          expect(topics).toHaveLength(1);
          expect(topics.map(t => t.title)).toContain(testTopic);
        });
      });

      describe('pupil topics', () => {
        it('adds a topic when it does not exist on user', async () => {
          await service.addTopic(testUsername, testTopic, 'pupil');
    
          const user = await userModel.findOne({name: testUsername});
    
          expect(user.pupilTopics).toContain(testTopic);
          expect(user.pupilTopics).toHaveLength(1);
        });
    
        it('does not add a topic when it does exist on user', async () => {
          const user = await userModel.findOne({name: testUsername});
          user.pupilTopics.push(testTopic);
          await user.save();
          
          await service.addTopic(testUsername, testTopic, 'pupil');
    
          expect(user.pupilTopics).toContain(testTopic);
          expect(user.pupilTopics).toHaveLength(1);
        });
    
        it('creates a topic (in topics collection) if it does not exist on user', async () => {
          await service.addTopic(testUsername, testTopic, 'coach');
    
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
        const user = await userModel.findOne({name: testUsername});
        user.coachTopics.push(testTopic);
        user.coachTopics.push(testTopic2);
        user.pupilTopics.push(testTopic);
        user.pupilTopics.push(testTopic2);
        await user.save();

        await topicModel.create({title: testTopic});
        await topicModel.create({title: testTopic2});
      });

      describe('coach topics', () => {
        it('does not remove a topic when it does not exist on user', async () => {
          await service.removeTopic(testUsername, testTopic3, 'coach');

          const user = await userModel.findOne({name: testUsername});

          expect(user.coachTopics).toHaveLength(2);
          expect(user.coachTopics).toContain(testTopic);
          expect(user.coachTopics).toContain(testTopic2);
        });

        it('removes a topic when it does exist on user', async () => {
          await service.removeTopic(testUsername, testTopic2, 'coach');

          const user = await userModel.findOne({name: testUsername});

          expect(user.coachTopics).toHaveLength(1);
          expect(user.coachTopics).toContain(testTopic);
        });

        it('leaves topic (in topics collection) when removing a topic', async () => {
          await service.removeTopic(testUsername, testTopic2, 'coach');

          const topics = await topicModel.find();

          expect(topics).toHaveLength(2);
          expect(topics.map(t => t.title)).toContain(testTopic);
          expect(topics.map(t => t.title)).toContain(testTopic2);
        });
      });

      describe('pupil topics', () => {
        it('does not remove a topic when it does not exist on user', async () => {
          await service.removeTopic(testUsername, testTopic3, 'pupil');

          const user = await userModel.findOne({name: testUsername});

          expect(user.pupilTopics).toHaveLength(2);
          expect(user.pupilTopics).toContain(testTopic);
          expect(user.pupilTopics).toContain(testTopic2);
        });

        it('removes a topic when it does exist on user', async () => {
          await service.removeTopic(testUsername, testTopic2, 'pupil');

          const user = await userModel.findOne({name: testUsername});

          expect(user.pupilTopics).toHaveLength(1);
          expect(user.pupilTopics).toContain(testTopic);
        });

        it('leaves topic (in topics collection) when removing a topic', async () => {
          await service.removeTopic(testUsername, testTopic2, 'pupil');

          const topics = await topicModel.find();

          expect(topics).toHaveLength(2);
          expect(topics.map(t => t.title)).toContain(testTopic);
          expect(topics.map(t => t.title)).toContain(testTopic2);
        });
      });
    });
  });
});
