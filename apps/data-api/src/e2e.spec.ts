import * as request from 'supertest';

import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, MiddlewareConsumer, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { UserCredentials } from '@find-a-buddy/data';

import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from "mongodb-memory-server";
import { disconnect } from "mongoose";

import { AuthModule } from './app/auth/auth.module';
import { DataModule } from './app/data.module';
import { TokenMiddleware } from './app/auth/token.middleware';

let mongod: MongoMemoryServer;
let uri: string;

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
        return {uri};
      },
    }),
    AuthModule,
    DataModule,
    RouterModule.register([{
      path: 'auth-api',
      module: AuthModule,
    }, {
      path: 'data-api',
      module: DataModule,
    }]),
  ],
  controllers: [],
  providers: [],
})
export class TestAppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(TokenMiddleware)
    .forRoutes('data-api')
  }
}

xdescribe('end-to-end tests of data API', () => {
  let app: INestApplication;
  let server;
  let module: TestingModule; 
  let mongoc: MongoClient;
  
  beforeAll(async () => {
    // sadly I have not found a way to override the Mongoose connection of the AppModule,
    // so here we duplicate the config of the AppModule...
    // contact me if you know how to do this better!
    // https://github.com/nestjs/nest/issues/4905
    module = await Test.createTestingModule({
        imports: [TestAppModule],
      })
      .compile();

    app = module.createNestApplication();
    await app.init();

    mongoc = new MongoClient(uri);
    await mongoc.connect();

    server = app.getHttpServer();
  });

  beforeEach(async () => {
    await mongoc.db('test').collection('identities').deleteMany({});
    await mongoc.db('test').collection('users').deleteMany({});
    await mongoc.db('test').collection('meetups').deleteMany({});
    await mongoc.db('test').collection('topics').deleteMany({});
  });

  afterAll(async () => {
    await mongoc.close();
    await disconnect();
    await mongod.stop();
  });

  describe('single user', () => {
    let credentials: UserCredentials;

    beforeEach(() => {
      credentials = {
        username: 'dion',
        password: 'supergeheim123',
      };
    });

    it('a user registers, logs in, and has no meetups', async () => {
      const register = await request(server)
        .post('/auth-api/register')
        .send(credentials);
        
      expect(register.body).toHaveProperty('id');
      expect(register.status).toBe(201);
  
      const login = await request(server)
        .post('/auth-api/login')
        .send(credentials);
  
      expect(login.status).toBe(201);
  
      const token = login.text;
  
      const meetups = await request(server)
        .get('/data-api/meetup')
        .set('authorization', token);
  
      expect(meetups.status).toBe(200);
      expect(meetups.body).toStrictEqual([]);
    });

    it('user registers, logs in, sets tutor and pupil topic, topics are found, removes topics, topics are found, looks up own account info', async () => {
      const pupilTopic = {title: 'NestJS', role: 'pupil'};
      const tutorTopic = {title: 'SQL', role: 'tutor'};

      const register = await request(server)
        .post('/auth-api/register')
        .send(credentials);

      expect(register.body).toHaveProperty('id');
      expect(register.status).toBe(201);
  
      const login = await request(server)
        .post('/auth-api/login')
        .send(credentials);
  
      expect(login.status).toBe(201);
  
      const token = login.text;
      
      const setPupilTopic = await request(server)
        .post('/data-api/topic')
        .set('authorization', token)
        .send(pupilTopic);
      
      expect(setPupilTopic.status).toBe(201);

      const setTutorTopic = await request(server)
        .post('/data-api/topic')
        .set('authorization', token)
        .send(tutorTopic);
    
      expect(setTutorTopic.status).toBe(201);

      const getTopics1 = await request(server)
        .get('/data-api/topic')
        .set('authorization', token);
        
      expect(getTopics1.status).toBe(200);
      expect(getTopics1.body).toHaveLength(2);
      expect(getTopics1.body.map(t => t.title)).toContain(pupilTopic.title);
      expect(getTopics1.body.map(t => t.title)).toContain(tutorTopic.title);
      expect(getTopics1.body[0]).toHaveProperty('id');

      const getSelf1 = await request(server)
        .get('/data-api/user/self')
        .set('authorization', token);
        
      expect(getSelf1.status).toBe(200);
      expect(getSelf1.body).toHaveProperty('id');
      expect(getSelf1.body).toHaveProperty('name', credentials.username);
      expect(getSelf1.body).toHaveProperty('reviews', []);
      expect(getSelf1.body).toHaveProperty('rating', null);
      expect(getSelf1.body).toHaveProperty('pupilTopics', [pupilTopic.title]);
      expect(getSelf1.body).toHaveProperty('tutorTopics', [tutorTopic.title]);

      const removePupilTopic = await request(server)
        .delete('/data-api/topic')
        .set('authorization', token)
        .send(pupilTopic);
      
      expect(removePupilTopic.status).toBe(200);

      const removeTutorTopic = await request(server)
        .delete('/data-api/topic')
        .set('authorization', token)
        .send(tutorTopic);
      
      expect(removeTutorTopic.status).toBe(200);

      const getTopics2 = await request(server)
        .get('/data-api/topic')
        .set('authorization', token);
        
      expect(getTopics2.status).toBe(200);
      expect(getTopics2.body).toHaveLength(2);
      expect(getTopics2.body.map(t => t.title)).toContain(pupilTopic.title);
      expect(getTopics2.body.map(t => t.title)).toContain(tutorTopic.title);
      expect(getTopics2.body[0]).toHaveProperty('id');
        
      const getSelf2 = await request(server)
        .get('/data-api/user/self')
        .set('authorization', token);
        
      expect(getSelf2.status).toBe(200);
      expect(getSelf2.body).toHaveProperty('id');
      expect(getSelf2.body).toHaveProperty('name', credentials.username);
      expect(getSelf2.body).toHaveProperty('reviews', []);
      expect(getSelf2.body).toHaveProperty('rating', null);
      expect(getSelf2.body).toHaveProperty('pupilTopics', []);
      expect(getSelf2.body).toHaveProperty('tutorTopics', []);
    });
  });

  describe('two users', () => {
    let credsA, credsB;

    beforeEach(() => {
      credsA = {
        username: 'dion',
        password: 'supergeheim123', // ik heb altijd hetzelfde wachtwoord als jan...
      };

      credsB = {
        username: 'jan',
        password: 'supergeheim123',
      };
    });

    it('three users register, log in, set topics, fix a meetup, tutor sees invite, tutor accepts, tutor and pupil see the meetup, third user does not see meetup, pupil leaves a review, tutor looks at review', async () => {
      const topicA = {title: 'NestJS', role: 'pupil'};
      const topicB = {title: 'NestJS', role: 'tutor'};

      const credsC = {
        username: 'ruud',
        password: 'noggeheimer321',
      };

      const registerA = await request(server)
        .post('/auth-api/register')
        .send(credsA);

      expect(registerA.body).toHaveProperty('id');
      expect(registerA.status).toBe(201);
  
      const registerB = await request(server)
        .post('/auth-api/register')
        .send(credsB);
      
      expect(registerB.body).toHaveProperty('id');
      expect(registerB.status).toBe(201);

      const registerC = await request(server)
        .post('/auth-api/register')
        .send(credsC);
      
      expect(registerC.body).toHaveProperty('id');
      expect(registerC.status).toBe(201);

      const loginA = await request(server)
        .post('/auth-api/login')
        .send(credsA);
  
      expect(loginA.status).toBe(201);
      
      const loginB = await request(server)
        .post('/auth-api/login')
        .send(credsB);
      
      expect(loginB.status).toBe(201);

      const loginC = await request(server)
        .post('/auth-api/login')
        .send(credsC);
      
      expect(loginC.status).toBe(201);
      
      const tokenA = loginA.text;
      const tokenB = loginB.text;
      const tokenC = loginC.text;
      const idA = registerA.body.id;
      const idB = registerB.body.id;
      const idC = registerC.body.id;

      const setTopicA = await request(server)
        .post('/data-api/topic')
        .set('authorization', tokenA)
        .send(topicA);

      expect(setTopicA.status).toBe(201);
      
      const setTopicB = await request(server)
        .post('/data-api/topic')
        .set('authorization', tokenB)
        .send(topicB);

      expect(setTopicB.status).toBe(201);

      const meetup = {topic: 'NestJS', tutorId: idB, datetime: new Date()};

      const createMeetup = await request(server)
        .post('/data-api/meetup')
        .set('authorization', tokenA)
        .send(meetup);
      
      expect(createMeetup.status).toBe(201);
      expect(createMeetup.body).toHaveProperty('id');

      const meetupId = createMeetup.body.id;

      const checkInvite = await request(server)
        .get('/data-api/meetup/invite')
        .set('authorization', tokenB);

      expect(checkInvite.status).toBe(200);
      expect(checkInvite.body).toHaveLength(1);
      expect(checkInvite.body[0]).toHaveProperty('topic', meetup.topic);
      expect(checkInvite.body[0]).toHaveProperty('datetime', meetup.datetime.toISOString());
      expect(checkInvite.body[0]).toHaveProperty('accepted', false);
      expect(checkInvite.body[0]).toHaveProperty('pupil', {name: credsA.username, id: idA});
      expect(checkInvite.body[0]).toHaveProperty('tutor', {name: credsB.username, id: idB});
      
      const acceptInvite = await request(server)
        .post(`/data-api/meetup/${meetupId}/accept`)
        .set('authorization', tokenB);
      
      expect(acceptInvite.status).toBe(201);

      const checkMeetupListA = await request(server)
        .get('/data-api/meetup')
        .set('authorization', tokenA);

      expect(checkMeetupListA.status).toBe(200);
      expect(checkMeetupListA.body).toHaveLength(1);
      expect(checkMeetupListA.body[0]).toHaveProperty('id', meetupId);
      expect(checkMeetupListA.body[0]).toHaveProperty('topic', topicA.title);
      expect(checkMeetupListA.body[0]).toHaveProperty('datetime', meetup.datetime.toISOString());
      expect(checkMeetupListA.body[0]).toHaveProperty('accepted', true);
      expect(checkMeetupListA.body[0]).toHaveProperty('pupil', {name: credsA.username, id: idA});
      expect(checkMeetupListA.body[0]).toHaveProperty('tutor', {name: credsB.username, id: idB});

      const checkMeetupDetailB = await request(server)
        .get(`/data-api/meetup/${meetupId}`)
        .set('authorization', tokenB);

      expect(checkMeetupDetailB.status).toBe(200);
      expect(checkMeetupDetailB.body).toHaveProperty('id', meetupId);
      expect(checkMeetupDetailB.body).toHaveProperty('topic', topicA.title);
      expect(checkMeetupDetailB.body).toHaveProperty('datetime', meetup.datetime.toISOString());
      expect(checkMeetupDetailB.body).toHaveProperty('accepted', true);
      expect(checkMeetupDetailB.body).toHaveProperty('pupil', {name: credsA.username, id: idA});
      expect(checkMeetupDetailB.body).toHaveProperty('tutor', {name: credsB.username, id: idB});

      const checkMeetupListC = await request(server)
        .get('/data-api/meetup')
        .set('authorization', tokenC);

      expect(checkMeetupListC.status).toBe(200);
      expect(checkMeetupListC.body).toHaveLength(0);

      const checkMeetupDetailC = await request(server)
        .get(`/data-api/meetup/${meetupId}`)
        .set('authorization', tokenC);

      expect(checkMeetupDetailC.status).toBe(200);
      expect(checkMeetupDetailC.body).toStrictEqual({});
      
      const review = {rating: 5, text: 'Goede hulp!'};

      const leaveReview = await request(server)
        .post(`/data-api/meetup/${meetupId}/review`)
        .set('authorization', tokenA)
        .send(review);
        
      expect(leaveReview.status).toBe(201);

      const checkReview = await request(server)
        .get(`/data-api/meetup/${meetupId}`)
        .set('authorization', tokenB);

      expect(checkReview.status).toBe(200);
      expect(checkReview.body).toHaveProperty('id', meetupId);
      expect(checkReview.body).toHaveProperty('topic', topicA.title);
      expect(checkReview.body).toHaveProperty('datetime', meetup.datetime.toISOString());
      expect(checkReview.body).toHaveProperty('accepted', true);
      expect(checkReview.body).toHaveProperty('pupil', {name: credsA.username, id: idA});
      expect(checkReview.body).toHaveProperty('tutor', {name: credsB.username, id: idB});
      expect(checkReview.body).toHaveProperty('review', review);
      
      const checkUserList = await request(server)
        .get('/data-api/user')
        .set('authorization', tokenC);
        
      expect(checkUserList.status).toBe(200);
      expect(checkUserList.body).toHaveLength(3);
      expect(checkUserList.body.filter(u => u.id == idA)[0]).toHaveProperty('name', credsA.username);
      expect(checkUserList.body.filter(u => u.id == idA)[0]).toHaveProperty('tutorTopics', []);
      expect(checkUserList.body.filter(u => u.id == idA)[0]).toHaveProperty('pupilTopics', [topicA.title]);
      expect(checkUserList.body.filter(u => u.id == idA)[0]).toHaveProperty('rating', null);
      expect(checkUserList.body.filter(u => u.id == idB)[0]).toHaveProperty('name', credsB.username);
      expect(checkUserList.body.filter(u => u.id == idB)[0]).toHaveProperty('pupilTopics', []);
      expect(checkUserList.body.filter(u => u.id == idB)[0]).toHaveProperty('tutorTopics', [topicB.title]);
      expect(checkUserList.body.filter(u => u.id == idB)[0]).toHaveProperty('rating', 5);
      expect(checkUserList.body.filter(u => u.id == idC)[0]).toHaveProperty('name', credsC.username);
      expect(checkUserList.body.filter(u => u.id == idC)[0]).toHaveProperty('tutorTopics', []);
      expect(checkUserList.body.filter(u => u.id == idC)[0]).toHaveProperty('pupilTopics', []);
      expect(checkUserList.body.filter(u => u.id == idC)[0]).toHaveProperty('rating', null);

      const checkUserDetail = await request(server)
        .get(`/data-api/user/${idB}`)
        .set('authorization', tokenC);

      console.log(checkUserDetail.body)

      expect(checkUserDetail.status).toBe(200);
      expect(checkUserDetail.body).toHaveProperty('name', credsB.username);
      expect(checkUserDetail.body).toHaveProperty('pupilTopics', []);
      expect(checkUserDetail.body).toHaveProperty('tutorTopics', [topicB.title]);
      expect(checkUserDetail.body).toHaveProperty('rating', 5);
      expect(checkUserDetail.body).toHaveProperty('reviews');
      expect(checkUserDetail.body.reviews).toHaveLength(1);
      expect(checkUserDetail.body.reviews[0]).toHaveProperty('id', meetupId);
      expect(checkUserDetail.body.reviews[0]).toHaveProperty('topic', topicA.title);
      expect(checkUserDetail.body.reviews[0]).toHaveProperty('datetime', meetup.datetime.toISOString());
      expect(checkUserDetail.body.reviews[0]).toHaveProperty('rating', review.rating);
      expect(checkUserDetail.body.reviews[0]).toHaveProperty('text', review.text);
      expect(checkUserDetail.body.reviews[0]).toHaveProperty('tutor', {name: credsB.username, id: idB});
      expect(checkUserDetail.body.reviews[0]).toHaveProperty('pupil', {name: credsA.username, id: idA});


    });
  
    it('two users register, log in, get list of users and their own account info', async () => {
      const registerA = await request(server)
        .post('/auth-api/register')
        .send(credsA);

      expect(registerA.body).toHaveProperty('id');
      expect(registerA.status).toBe(201);
  
      const registerB = await request(server)
        .post('/auth-api/register')
        .send(credsB);
      
      expect(registerB.body).toHaveProperty('id');
      expect(registerB.status).toBe(201);

      const loginA = await request(server)
        .post('/auth-api/login')
        .send(credsA);
  
      expect(loginA.status).toBe(201);
      
      const loginB = await request(server)
        .post('/auth-api/login')
        .send(credsB);
      
      expect(loginB.status).toBe(201);
      
      const tokenA = loginA.text;
      const tokenB = loginB.text;

      const getUserListA = await request(server)
        .get('/data-api/user')
        .set('authorization', tokenA);

      expect(getUserListA.status).toBe(200);
      expect(getUserListA.body).toHaveLength(2);
      expect(getUserListA.body[0]).toHaveProperty('id');
      expect(getUserListA.body[0]).toHaveProperty('name');
      expect(getUserListA.body[0]).toHaveProperty('rating');
      expect(getUserListA.body[0]).toHaveProperty('pupilTopics');
      expect(getUserListA.body[0]).toHaveProperty('tutorTopics');
      expect(getUserListA.body.map(u => u.name)).toContain(credsA.username);
      expect(getUserListA.body.map(u => u.name)).toContain(credsB.username);

      const getUserListB = await request(server)
        .get('/data-api/user')
        .set('authorization', tokenB);

      expect(getUserListB.status).toBe(200);
      expect(getUserListB.body).toHaveLength(2);
      expect(getUserListB.body[0]).toHaveProperty('id');
      expect(getUserListB.body[0]).toHaveProperty('name');
      expect(getUserListB.body[0]).toHaveProperty('rating');
      expect(getUserListB.body[0]).toHaveProperty('pupilTopics');
      expect(getUserListB.body[0]).toHaveProperty('tutorTopics');
      expect(getUserListB.body.map(u => u.name)).toContain(credsA.username);
      expect(getUserListB.body.map(u => u.name)).toContain(credsB.username);

      const getSelfA = await request(server)
        .get('/data-api/user/self')
        .set('authorization', tokenA);

      expect(getSelfA.status).toBe(200);
      expect(getSelfA.body).toHaveProperty('id');
      expect(getSelfA.body).toHaveProperty('name', credsA.username);
      expect(getSelfA.body).toHaveProperty('rating', null);
      expect(getSelfA.body).toHaveProperty('reviews', []);
      expect(getSelfA.body).toHaveProperty('tutorTopics', []);
      expect(getSelfA.body).toHaveProperty('pupilTopics', []);

      const getSelfB = await request(server)
        .get('/data-api/user/self')
        .set('authorization', tokenB);

      expect(getSelfB.status).toBe(200);
      expect(getSelfB.body).toHaveProperty('id');
      expect(getSelfB.body).toHaveProperty('name', credsB.username);
      expect(getSelfB.body).toHaveProperty('rating', null);
      expect(getSelfB.body).toHaveProperty('reviews', []);
      expect(getSelfB.body).toHaveProperty('tutorTopics', []);
      expect(getSelfB.body).toHaveProperty('pupilTopics', []);
    });
  });  
});
