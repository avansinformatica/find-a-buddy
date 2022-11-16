import request = require('supertest');

import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, MiddlewareConsumer, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { UserRegistration } from '@find-a-buddy/data';

import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from "mongodb-memory-server";
import { disconnect } from "mongoose";

import { AuthModule } from './app/auth/auth.module';
import { DataModule } from './app/data.module';
import { TokenMiddleware } from './app/auth/token.middleware';
import { ApiResponseInterceptor } from './app/api-response.interceptor';

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

describe('end-to-end tests of data API', () => {
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
    app.useGlobalInterceptors(new ApiResponseInterceptor());
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
    let credentials: UserRegistration;

    beforeEach(() => {
      credentials = {
        username: 'dion',
        password: 'supergeheim123',
        emailAddress: 'dion@dion.nl',
      };
    });

    it('a user registers, logs in, and has no meetups', async () => {
      const register = await request(server)
        .post('/auth-api/register')
        .send(credentials);
        
      expect(register.status).toBe(201);
      expect(register.body).toHaveProperty('results');
      expect(register.body.results).toHaveProperty('id');
      expect(register.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
  
      const login = await request(server)
        .post('/auth-api/login')
        .send(credentials);
  
      expect(login.status).toBe(201);
      expect(login.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(login.body).toHaveProperty('results.token');
  
      const token = login.body.results.token;
  
      const meetups = await request(server)
        .get('/data-api/meetup')
        .set('authorization', token);
  
      expect(meetups.status).toBe(200);
      expect(meetups.body).toHaveProperty('info', {version: '1.0', type: 'list', count: 0});
      expect(meetups.body).toHaveProperty('results', []);
    });

    it('user registers, logs in, sets tutor and pupil topic, topics are found, removes topics, topics are found, looks up own account info', async () => {
      const pupilTopic = {title: 'NestJS', role: 'pupil'};
      const tutorTopic = {title: 'SQL', role: 'tutor'};

      const register = await request(server)
        .post('/auth-api/register')
        .send(credentials);

      expect(register.status).toBe(201);
      expect(register.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(register.body).toHaveProperty('results.id');
  
      const login = await request(server)
        .post('/auth-api/login')
        .send(credentials);
  
      expect(login.status).toBe(201);
      expect(login.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(login.body).toHaveProperty('results.token');
  
      const token = login.body.results.token;
      
      const setPupilTopic = await request(server)
        .post('/data-api/topic')
        .set('authorization', token)
        .send(pupilTopic);
      
      expect(setPupilTopic.status).toBe(201);
      expect(setPupilTopic.body).toHaveProperty('info', {version: '1.0', type: 'none', count: 0});

      const setTutorTopic = await request(server)
        .post('/data-api/topic')
        .set('authorization', token)
        .send(tutorTopic);
    
      expect(setTutorTopic.status).toBe(201);
      expect(setTutorTopic.body).toHaveProperty('info', {version: '1.0', type: 'none', count: 0});

      const getTopics1 = await request(server)
        .get('/data-api/topic')
        .set('authorization', token);
        
      expect(getTopics1.status).toBe(200);
      expect(getTopics1.body).toHaveProperty('info', {version: '1.0', type: 'list', count: 2});
      expect(getTopics1.body).toHaveProperty('results');
      expect(getTopics1.body.results).toHaveLength(2);
      expect(getTopics1.body.results.map(t => t.title)).toContain(pupilTopic.title);
      expect(getTopics1.body.results.map(t => t.title)).toContain(tutorTopic.title);
      expect(getTopics1.body.results[0]).toHaveProperty('id');

      const getSelf1 = await request(server)
        .get('/data-api/user/self')
        .set('authorization', token);
        
      expect(getSelf1.status).toBe(200);
      expect(getSelf1.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(getSelf1.body).toHaveProperty('results');
      expect(getSelf1.body.results).toHaveProperty('id');
      expect(getSelf1.body.results).toHaveProperty('name', credentials.username);
      expect(getSelf1.body.results).toHaveProperty('reviews', []);
      expect(getSelf1.body.results).toHaveProperty('rating', null);
      expect(getSelf1.body.results).toHaveProperty('pupilTopics', [pupilTopic.title]);
      expect(getSelf1.body.results).toHaveProperty('tutorTopics', [tutorTopic.title]);
      expect(getSelf1.body.results).toHaveProperty('isActive', true);
      expect(getSelf1.body.results).toHaveProperty('roles', []);
      expect(getSelf1.body.results).toHaveProperty('emailAddress', credentials.emailAddress);

      const removePupilTopic = await request(server)
        .delete('/data-api/topic')
        .set('authorization', token)
        .send(pupilTopic);
      
      expect(removePupilTopic.status).toBe(200);
      expect(removePupilTopic.body).toHaveProperty('info', {version: '1.0', type: 'none', count: 0});

      const removeTutorTopic = await request(server)
        .delete('/data-api/topic')
        .set('authorization', token)
        .send(tutorTopic);
      
      expect(removeTutorTopic.status).toBe(200);
      expect(removeTutorTopic.body).toHaveProperty('info', {version: '1.0', type: 'none', count: 0});

      const getTopics2 = await request(server)
        .get('/data-api/topic')
        .set('authorization', token);
        
      expect(getTopics2.status).toBe(200);
      expect(getTopics2.body).toHaveProperty('info', {version: '1.0', type: 'list', count: 2});
      expect(getTopics2.body).toHaveProperty('results');
      expect(getTopics2.body.results).toHaveLength(2);
      expect(getTopics2.body.results.map(t => t.title)).toContain(pupilTopic.title);
      expect(getTopics2.body.results.map(t => t.title)).toContain(tutorTopic.title);
      expect(getTopics2.body.results[0]).toHaveProperty('id');
        
      const getSelf2 = await request(server)
        .get('/data-api/user/self')
        .set('authorization', token);
        
      expect(getSelf2.status).toBe(200);
      expect(getSelf2.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(getSelf2.body).toHaveProperty('results');
      expect(getSelf2.body.results).toHaveProperty('id');
      expect(getSelf2.body.results).toHaveProperty('name', credentials.username);
      expect(getSelf2.body.results).toHaveProperty('reviews', []);
      expect(getSelf2.body.results).toHaveProperty('rating', null);
      expect(getSelf2.body.results).toHaveProperty('pupilTopics', []);
      expect(getSelf2.body.results).toHaveProperty('tutorTopics', []);
      expect(getSelf2.body.results).toHaveProperty('isActive', true);
      expect(getSelf2.body.results).toHaveProperty('roles', []);
      expect(getSelf2.body.results).toHaveProperty('emailAddress', credentials.emailAddress);
    });
  });

  describe('two users', () => {
    let credsA, credsB;

    beforeEach(() => {
      credsA = {
        username: 'dion',
        password: 'supergeheim123', // ik heb altijd hetzelfde wachtwoord als jan...
        emailAddress: 'dion@dion.nl',
      };

      credsB = {
        username: 'jan',
        password: 'supergeheim123',
        emailAddress: 'jan@jan.nl',
      };
    });

    it('three users register, log in, set topics, fix a meetup, tutor sees invite, tutor accepts, tutor and pupil see the meetup, third user does not see meetup, pupil leaves a review, tutor looks at review', async () => {
      const topicA = {title: 'NestJS', role: 'pupil'};
      const topicB = {title: 'NestJS', role: 'tutor'};

      const credsC = {
        username: 'ruud',
        password: 'noggeheimer321',
        emailAddress: 'ruud@ruud.nl',
      };

      const registerA = await request(server)
        .post('/auth-api/register')
        .send(credsA);

      expect(registerA.status).toBe(201);
      expect(registerA.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(registerA.body).toHaveProperty('results.id');
  
      const registerB = await request(server)
        .post('/auth-api/register')
        .send(credsB);
      
      expect(registerB.status).toBe(201);
      expect(registerB.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(registerB.body).toHaveProperty('results.id');

      const registerC = await request(server)
        .post('/auth-api/register')
        .send(credsC);
      
      expect(registerC.status).toBe(201);
      expect(registerC.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(registerC.body).toHaveProperty('results.id');

      const loginA = await request(server)
        .post('/auth-api/login')
        .send(credsA);
  
      expect(loginA.status).toBe(201);
      expect(loginA.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(loginA.body).toHaveProperty('results.token');
      
      const loginB = await request(server)
        .post('/auth-api/login')
        .send(credsB);
      
      expect(loginB.status).toBe(201);
      expect(loginB.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(loginB.body).toHaveProperty('results.token');

      const loginC = await request(server)
        .post('/auth-api/login')
        .send(credsC);
      
      expect(loginC.status).toBe(201);
      expect(loginC.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(loginC.body).toHaveProperty('results.token');
      
      const tokenA = loginA.body.results.token;
      const tokenB = loginB.body.results.token;
      const tokenC = loginC.body.results.token;
      const idA = registerA.body.results.id;
      const idB = registerB.body.results.id;
      const idC = registerC.body.results.id;

      const setTopicA = await request(server)
        .post('/data-api/topic')
        .set('authorization', tokenA)
        .send(topicA);

      expect(setTopicA.status).toBe(201);
      expect(setTopicA.body).toHaveProperty('info', {version: '1.0', type: 'none', count: 0});
      
      const setTopicB = await request(server)
        .post('/data-api/topic')
        .set('authorization', tokenB)
        .send(topicB);

      expect(setTopicB.status).toBe(201);
      expect(setTopicB.body).toHaveProperty('info', {version: '1.0', type: 'none', count: 0});

      const meetup = {topic: 'NestJS', tutorId: idB, datetime: new Date()};

      const createMeetup = await request(server)
        .post('/data-api/meetup')
        .set('authorization', tokenA)
        .send(meetup);
      
      expect(createMeetup.status).toBe(201);
      expect(createMeetup.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(createMeetup.body).toHaveProperty('results.id');

      const meetupId = createMeetup.body.results.id;

      const checkInvite = await request(server)
        .get('/data-api/meetup/invite')
        .set('authorization', tokenB);

      expect(checkInvite.status).toBe(200);
      expect(checkInvite.body).toHaveProperty('info', {version: '1.0', type: 'list', count: 1});
      expect(checkInvite.body).toHaveProperty('results');
      expect(checkInvite.body.results).toHaveLength(1);
      expect(checkInvite.body.results[0]).toHaveProperty('topic', meetup.topic);
      expect(checkInvite.body.results[0]).toHaveProperty('datetime', meetup.datetime.toISOString());
      expect(checkInvite.body.results[0]).toHaveProperty('accepted', false);
      expect(checkInvite.body.results[0]).toHaveProperty('pupil', {name: credsA.username, id: idA});
      expect(checkInvite.body.results[0]).toHaveProperty('tutor', {name: credsB.username, id: idB});
      
      const acceptInvite = await request(server)
        .post(`/data-api/meetup/${meetupId}/accept`)
        .set('authorization', tokenB);
      
      expect(acceptInvite.status).toBe(201);
      expect(acceptInvite.body).toHaveProperty('info', {version: '1.0', type: 'none', count: 0});

      const checkMeetupListA = await request(server)
        .get('/data-api/meetup')
        .set('authorization', tokenA);

      expect(checkMeetupListA.status).toBe(200);
      expect(checkMeetupListA.body).toHaveProperty('info', {version: '1.0', type: 'list', count: 1});
      expect(checkMeetupListA.body).toHaveProperty('results');
      expect(checkMeetupListA.body.results).toHaveLength(1);
      expect(checkMeetupListA.body.results[0]).toHaveProperty('id', meetupId);
      expect(checkMeetupListA.body.results[0]).toHaveProperty('topic', topicA.title);
      expect(checkMeetupListA.body.results[0]).toHaveProperty('datetime', meetup.datetime.toISOString());
      expect(checkMeetupListA.body.results[0]).toHaveProperty('accepted', true);
      expect(checkMeetupListA.body.results[0]).toHaveProperty('pupil', {name: credsA.username, id: idA});
      expect(checkMeetupListA.body.results[0]).toHaveProperty('tutor', {name: credsB.username, id: idB});

      const checkMeetupDetailB = await request(server)
        .get(`/data-api/meetup/${meetupId}`)
        .set('authorization', tokenB);

      expect(checkMeetupDetailB.status).toBe(200);
      expect(checkMeetupDetailB.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(checkMeetupDetailB.body).toHaveProperty('results');
      expect(checkMeetupDetailB.body.results).toHaveProperty('id', meetupId);
      expect(checkMeetupDetailB.body.results).toHaveProperty('topic', topicA.title);
      expect(checkMeetupDetailB.body.results).toHaveProperty('datetime', meetup.datetime.toISOString());
      expect(checkMeetupDetailB.body.results).toHaveProperty('accepted', true);
      expect(checkMeetupDetailB.body.results).toHaveProperty('pupil', {name: credsA.username, id: idA});
      expect(checkMeetupDetailB.body.results).toHaveProperty('tutor', {name: credsB.username, id: idB});

      const checkMeetupListC = await request(server)
        .get('/data-api/meetup')
        .set('authorization', tokenC);

      expect(checkMeetupListC.status).toBe(200);
      expect(checkMeetupListC.body).toHaveProperty('info', {version: '1.0', type: 'list', count: 0});
      expect(checkMeetupListC.body).toHaveProperty('results');
      expect(checkMeetupListC.body.results).toHaveLength(0);

      const checkMeetupDetailC = await request(server)
        .get(`/data-api/meetup/${meetupId}`)
        .set('authorization', tokenC);

      expect(checkMeetupDetailC.status).toBe(200);
      expect(checkMeetupDetailC.body).toHaveProperty('info', {version: '1.0', type: 'none', count: 0});
      
      const review = {rating: 5, text: 'Goede hulp!'};

      const leaveReview = await request(server)
        .post(`/data-api/meetup/${meetupId}/review`)
        .set('authorization', tokenA)
        .send(review);
        
      expect(leaveReview.status).toBe(201);
      expect(leaveReview.body).toHaveProperty('info', {version: '1.0', type: 'none', count: 0});

      const checkReview = await request(server)
        .get(`/data-api/meetup/${meetupId}`)
        .set('authorization', tokenB);

      expect(checkReview.status).toBe(200);
      expect(checkReview.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(checkReview.body).toHaveProperty('results');
      expect(checkReview.body.results).toHaveProperty('id', meetupId);
      expect(checkReview.body.results).toHaveProperty('topic', topicA.title);
      expect(checkReview.body.results).toHaveProperty('datetime', meetup.datetime.toISOString());
      expect(checkReview.body.results).toHaveProperty('accepted', true);
      expect(checkReview.body.results).toHaveProperty('pupil', {name: credsA.username, id: idA});
      expect(checkReview.body.results).toHaveProperty('tutor', {name: credsB.username, id: idB});
      expect(checkReview.body.results).toHaveProperty('review', review);
      
      const checkUserList = await request(server)
        .get('/data-api/user')
        .set('authorization', tokenC);
        
      expect(checkUserList.status).toBe(200);
      expect(checkUserList.body).toHaveProperty('info', {version: '1.0', type: 'list', count: 3});
      expect(checkUserList.body).toHaveProperty('results');
      expect(checkUserList.body.results).toHaveLength(3);
      expect(checkUserList.body.results.filter(u => u.id == idA)[0]).toHaveProperty('name', credsA.username);
      expect(checkUserList.body.results.filter(u => u.id == idA)[0]).toHaveProperty('tutorTopics', []);
      expect(checkUserList.body.results.filter(u => u.id == idA)[0]).toHaveProperty('pupilTopics', [topicA.title]);
      expect(checkUserList.body.results.filter(u => u.id == idA)[0]).toHaveProperty('rating', null);
      expect(checkUserList.body.results.filter(u => u.id == idA)[0]).toHaveProperty('isActive', true);
      expect(checkUserList.body.results.filter(u => u.id == idA)[0]).toHaveProperty('roles', []);
      expect(checkUserList.body.results.filter(u => u.id == idA)[0]).toHaveProperty('emailAddress', credsA.emailAddress);
      
      expect(checkUserList.body.results.filter(u => u.id == idB)[0]).toHaveProperty('name', credsB.username);
      expect(checkUserList.body.results.filter(u => u.id == idB)[0]).toHaveProperty('pupilTopics', []);
      expect(checkUserList.body.results.filter(u => u.id == idB)[0]).toHaveProperty('tutorTopics', [topicB.title]);
      expect(checkUserList.body.results.filter(u => u.id == idB)[0]).toHaveProperty('rating', 5);
      expect(checkUserList.body.results.filter(u => u.id == idB)[0]).toHaveProperty('isActive', true);
      expect(checkUserList.body.results.filter(u => u.id == idB)[0]).toHaveProperty('roles', []);
      expect(checkUserList.body.results.filter(u => u.id == idB)[0]).toHaveProperty('emailAddress', credsB.emailAddress);
      
      expect(checkUserList.body.results.filter(u => u.id == idC)[0]).toHaveProperty('name', credsC.username);
      expect(checkUserList.body.results.filter(u => u.id == idC)[0]).toHaveProperty('tutorTopics', []);
      expect(checkUserList.body.results.filter(u => u.id == idC)[0]).toHaveProperty('pupilTopics', []);
      expect(checkUserList.body.results.filter(u => u.id == idC)[0]).toHaveProperty('rating', null);
      expect(checkUserList.body.results.filter(u => u.id == idC)[0]).toHaveProperty('isActive', true);
      expect(checkUserList.body.results.filter(u => u.id == idC)[0]).toHaveProperty('roles', []);
      expect(checkUserList.body.results.filter(u => u.id == idC)[0]).toHaveProperty('emailAddress', credsC.emailAddress);

      const checkUserDetail = await request(server)
        .get(`/data-api/user/${idB}`)
        .set('authorization', tokenC);

      expect(checkUserDetail.status).toBe(200);
      expect(checkUserDetail.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(checkUserDetail.body).toHaveProperty('results');
      expect(checkUserDetail.body.results).toHaveProperty('name', credsB.username);
      expect(checkUserDetail.body.results).toHaveProperty('pupilTopics', []);
      expect(checkUserDetail.body.results).toHaveProperty('tutorTopics', [topicB.title]);
      expect(checkUserDetail.body.results).toHaveProperty('rating', 5);
      expect(checkUserDetail.body.results).toHaveProperty('reviews');
      expect(checkUserDetail.body.results).toHaveProperty('isActive', true);
      expect(checkUserDetail.body.results).toHaveProperty('roles', []);
      expect(checkUserDetail.body.results).toHaveProperty('emailAddress', credsB.emailAddress);
      expect(checkUserDetail.body.results.reviews).toHaveLength(1);
      expect(checkUserDetail.body.results.reviews[0]).toHaveProperty('id', meetupId);
      expect(checkUserDetail.body.results.reviews[0]).toHaveProperty('topic', topicA.title);
      expect(checkUserDetail.body.results.reviews[0]).toHaveProperty('datetime', meetup.datetime.toISOString());
      expect(checkUserDetail.body.results.reviews[0]).toHaveProperty('rating', review.rating);
      expect(checkUserDetail.body.results.reviews[0]).toHaveProperty('text', review.text);
      expect(checkUserDetail.body.results.reviews[0]).toHaveProperty('tutor', {name: credsB.username, id: idB});
      expect(checkUserDetail.body.results.reviews[0]).toHaveProperty('pupil', {name: credsA.username, id: idA});
    });
  
    it('two users register, log in, get list of users and their own account info', async () => {
      const registerA = await request(server)
        .post('/auth-api/register')
        .send(credsA);

      expect(registerA.status).toBe(201);
      expect(registerA.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(registerA.body).toHaveProperty('results.id');
  
      const registerB = await request(server)
        .post('/auth-api/register')
        .send(credsB);
      
      expect(registerB.status).toBe(201);
      expect(registerB.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(registerB.body).toHaveProperty('results.id');

      const loginA = await request(server)
        .post('/auth-api/login')
        .send(credsA);
  
      expect(loginA.status).toBe(201);
      expect(loginA.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(loginA.body).toHaveProperty('results.token');
      
      const loginB = await request(server)
        .post('/auth-api/login')
        .send(credsB);
      
      expect(loginB.status).toBe(201);
      expect(loginB.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(loginB.body).toHaveProperty('results.token');
      
      const tokenA = loginA.body.results.token;
      const tokenB = loginB.body.results.token;

      const getUserListA = await request(server)
        .get('/data-api/user')
        .set('authorization', tokenA);

      expect(getUserListA.status).toBe(200);
      expect(getUserListA.body).toHaveProperty('info', {version: '1.0', type: 'list', count: 2});
      expect(getUserListA.body).toHaveProperty('results');
      expect(getUserListA.body.results).toHaveLength(2);
      expect(getUserListA.body.results[0]).toHaveProperty('id');
      expect(getUserListA.body.results[0]).toHaveProperty('name');
      expect(getUserListA.body.results[0]).toHaveProperty('rating');
      expect(getUserListA.body.results[0]).toHaveProperty('pupilTopics');
      expect(getUserListA.body.results[0]).toHaveProperty('tutorTopics');
      expect(getUserListA.body.results[0]).toHaveProperty('isActive');
      expect(getUserListA.body.results[0]).toHaveProperty('roles');
      expect(getUserListA.body.results[0]).toHaveProperty('emailAddress');
      expect(getUserListA.body.results.map(u => u.name)).toContain(credsA.username);
      expect(getUserListA.body.results.map(u => u.name)).toContain(credsB.username);

      const getUserListB = await request(server)
        .get('/data-api/user')
        .set('authorization', tokenB);

      expect(getUserListB.status).toBe(200);
      expect(getUserListB.body).toHaveProperty('info', {version: '1.0', type: 'list', count: 2});
      expect(getUserListB.body).toHaveProperty('results');
      expect(getUserListB.body.results).toHaveLength(2);
      expect(getUserListB.body.results[0]).toHaveProperty('id');
      expect(getUserListB.body.results[0]).toHaveProperty('name');
      expect(getUserListB.body.results[0]).toHaveProperty('rating');
      expect(getUserListB.body.results[0]).toHaveProperty('pupilTopics');
      expect(getUserListB.body.results[0]).toHaveProperty('tutorTopics');
      expect(getUserListB.body.results[0]).toHaveProperty('isActive');
      expect(getUserListB.body.results[0]).toHaveProperty('roles');
      expect(getUserListB.body.results[0]).toHaveProperty('emailAddress');
      expect(getUserListB.body.results.map(u => u.name)).toContain(credsA.username);
      expect(getUserListB.body.results.map(u => u.name)).toContain(credsB.username);

      const getSelfA = await request(server)
        .get('/data-api/user/self')
        .set('authorization', tokenA);

      expect(getSelfA.status).toBe(200);
      expect(getSelfA.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(getSelfA.body).toHaveProperty('results');
      expect(getSelfA.body.results).toHaveProperty('id');
      expect(getSelfA.body.results).toHaveProperty('name', credsA.username);
      expect(getSelfA.body.results).toHaveProperty('rating', null);
      expect(getSelfA.body.results).toHaveProperty('reviews', []);
      expect(getSelfA.body.results).toHaveProperty('tutorTopics', []);
      expect(getSelfA.body.results).toHaveProperty('pupilTopics', []);
      expect(getSelfA.body.results).toHaveProperty('isActive', true);
      expect(getSelfA.body.results).toHaveProperty('roles', []);
      expect(getSelfA.body.results).toHaveProperty('emailAddress', credsA.emailAddress);

      const getSelfB = await request(server)
        .get('/data-api/user/self')
        .set('authorization', tokenB);

      expect(getSelfB.status).toBe(200);
      expect(getSelfB.body).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
      expect(getSelfB.body).toHaveProperty('results');
      expect(getSelfB.body.results).toHaveProperty('id');
      expect(getSelfB.body.results).toHaveProperty('name', credsB.username);
      expect(getSelfB.body.results).toHaveProperty('rating', null);
      expect(getSelfB.body.results).toHaveProperty('reviews', []);
      expect(getSelfB.body.results).toHaveProperty('tutorTopics', []);
      expect(getSelfB.body.results).toHaveProperty('pupilTopics', []);
      expect(getSelfB.body.results).toHaveProperty('isActive', true);
      expect(getSelfB.body.results).toHaveProperty('roles', []);
      expect(getSelfB.body.results).toHaveProperty('emailAddress', credsB.emailAddress);
    });
  });  
});
