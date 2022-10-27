import { Test, TestingModule } from '@nestjs/testing';
import { TopicService } from '../data-services/topic.service';

import { TopicController } from './topic.controller';

describe('TopicController', () => {
  let app: TestingModule;
  let topicController: TopicController;
  let topicService: TopicService;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [TopicController],
      providers: [{ // mock the auth service, to avoid providing its dependencies
        provide: TopicService,
        useValue: {
          getAll: jest.fn(),
        },
      }],
    }).compile();

   topicController = app.get<TopicController>(TopicController);
   topicService = app.get<TopicService>(TopicService);
  });

  it('test all the things', async () => {
    const getAll = jest.spyOn(topicService, 'getAll')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .mockImplementation(async () => {return [{id: 'id123', title: 'programming'}];});

    const topics = await topicController.getAll();

    expect(getAll).toHaveBeenCalledTimes(1);
    expect(topics).toHaveLength(1);
    expect(topics[0]).toHaveProperty('id', 'id123');
  });
});
