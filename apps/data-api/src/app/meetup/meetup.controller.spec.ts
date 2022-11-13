import { Test, TestingModule } from '@nestjs/testing';

import { MeetupController } from './meetup.controller';

import { MeetupService } from './meetup.service';

describe('TopicController', () => {
  let app: TestingModule;
  let meetupController: MeetupController;
  let meetupService: MeetupService;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [MeetupController],
      providers: [{ // mock the service, to avoid providing its dependencies
        provide: MeetupService,
        useValue: {
          getInvites: jest.fn(),
          create: jest.fn(),
          getAll: jest.fn(),
          getOne: jest.fn(),
          postReview: jest.fn(),
          acceptInvite: jest.fn(),
        },
      }],
    }).compile();

   meetupController = app.get<MeetupController>(MeetupController);
   meetupService = app.get<MeetupService>(MeetupService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  })

  describe('getInvites', () => {
    it('calls getInvites on the service', async () => {
      const getInvites = jest.spyOn(meetupService, 'getInvites')
        .mockImplementation(async () => []);

      const result = await meetupController.getInvites({id: 'id123', username: 'name123'});

      expect(getInvites).toBeCalledTimes(1);
      expect(getInvites).toBeCalledWith('id123');
      expect(result).toStrictEqual([]);
    });
  });

  describe('create', () => {
    it('calls create on the service', async () => {
      const create = jest.spyOn(meetupService, 'create')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(async () => ({id: 'mid123'}));

      const topic = 'mushrooms';
      const time = new Date();
      const pupilId = 'id123';
      const tutorId = 'id456';

      const result = await meetupController.create({id: pupilId, username: 'mario'}, {topic, tutorId, datetime: time});

      expect(create).toBeCalledTimes(1);
      expect(create).toBeCalledWith(topic, time, tutorId, pupilId);
      expect(result).toHaveProperty('id', 'mid123');
    });

    it('throws a bad request if meetup is invalid', async () => {
      const create = jest.spyOn(meetupService, 'create')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(async () => {throw new Error('invalid')});

      const topic = 'mushrooms';
      const time = new Date();
      const pupilId = 'id123';
      const tutorId = 'id456';

      await expect(meetupController.create({id: pupilId, username: 'mario'}, {topic, tutorId, datetime: time})).rejects.toThrow();

      expect(create).toBeCalledTimes(1);
      expect(create).toBeCalledWith(topic, time, tutorId, pupilId);
    });
  });

  describe('getMeetups', () => {
    it('calls getAll on the service', async () => {
      const getAll = jest.spyOn(meetupService, 'getAll')
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .mockImplementation(async () => []);

    const result = await meetupController.getMeetups({id: 'id123', username: 'name123'});

    expect(getAll).toBeCalledTimes(1);
    expect(getAll).toBeCalledWith('id123');
    expect(result).toStrictEqual([]);
    });
  });

  describe('getMeetup', () => {
    it('calls getOne on the service', async () => {
      const exampleMeetup = {
        id: 'id456',
        datetime: new Date(),
        topic: 'math',
        pupil: {id: 'pupilId', name: 'pupil'},
        tutor: {id: 'tutorId', name: 'tutor'},
        accepted: true,
        review: undefined,
      };

      const getOne = jest.spyOn(meetupService, 'getOne')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(async () => exampleMeetup);

      const result = await meetupController.getMeetup({id: 'id123', username: 'name123'}, exampleMeetup.id);

      expect(getOne).toBeCalledTimes(1);
      expect(getOne).toBeCalledWith('id123', exampleMeetup.id);
      expect(result).toStrictEqual(exampleMeetup);
    });
  });

  describe('acceptInvite', () => {
    it('calls acceptInvite on service', async () => {
      const acceptInvite = jest.spyOn(meetupService, 'acceptInvite')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(async () => {});

      const token = {id: 'uid123', username: 'user123'};
      const meetupId = 'mid123';

      await meetupController.acceptInvite(token, meetupId);

      expect(acceptInvite).toBeCalledTimes(1);
      expect(acceptInvite).toBeCalledWith(token.id, meetupId);
    });

    it('throws a bad request if accept is invalid', async () => {
      const acceptInvite = jest.spyOn(meetupService, 'acceptInvite')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(async () => {throw new Error('invalid')});

        const token = {id: 'id123', username: 'user123'};
        const id = 'meetup123';

      await expect(meetupController.acceptInvite(token, id)).rejects.toThrow();

      expect(acceptInvite).toBeCalledTimes(1);
      expect(acceptInvite).toBeCalledWith(token.id, id);
    });
  });

  describe('postReview', () => {
    it('calls postReview on the service', async () => {
      const postReview = jest.spyOn(meetupService, 'postReview')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(async () => {});

      const token = {id: 'id123', username: 'user123'};
      const id = 'meetup123';
      const review = {rating: 5};

      await meetupController.postReview(token, id, review);

      expect(postReview).toBeCalledTimes(1);
      expect(postReview).toBeCalledWith(token.id, id, undefined, review.rating);
    });

    it('throws a bad request if review is invalid', async () => {
      const postReview = jest.spyOn(meetupService, 'postReview')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(async () => {throw new Error('invalid')});

        const token = {id: 'id123', username: 'user123'};
        const id = 'meetup123';
        const review = {rating: 5};

      await expect(meetupController.postReview(token, id, review)).rejects.toThrow();

      expect(postReview).toBeCalledTimes(1);
      expect(postReview).toBeCalledWith(token.id, id, undefined, review.rating);
    });
  });
});
