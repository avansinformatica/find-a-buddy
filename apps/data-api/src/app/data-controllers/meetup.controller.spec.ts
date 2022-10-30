import { Test, TestingModule } from '@nestjs/testing';

import { MeetupController } from './meetup.controller';

import { MeetupService } from '../data-services/meetup.service';

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
        .mockImplementation(async () => {});

      const topic = 'mushrooms';
      const time = new Date();
      const pupilId = 'id123';
      const tutorId = 'id456'

      await meetupController.create({id: pupilId, username: 'mario'}, {topic, tutorId, datetime: time});

      expect(create).toBeCalledTimes(1);
      expect(create).toBeCalledWith(topic, time, tutorId, pupilId);
    });

    it('throws a bad request if meetup is invalid', async () => {
      const create = jest.spyOn(meetupService, 'create')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(async () => {throw new Error('invalid')});

      const topic = 'mushrooms';
      const time = new Date();
      const pupilId = 'id123';
      const tutorId = 'id456'

      await expect(meetupController.create({id: pupilId, username: 'mario'}, {topic, tutorId, datetime: time})).rejects.toThrow();

      expect(create).toBeCalledTimes(1);
      expect(create).toBeCalledWith(topic, time, tutorId, pupilId);
    });
  });
});
