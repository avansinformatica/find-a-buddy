import { TopicUpdate } from '@find-a-buddy/data';
import { Test, TestingModule } from '@nestjs/testing';

import { TopicController } from './topic.controller';

import { Token } from '../auth/token.decorator';
import { TopicService } from './topic.service';

describe('TopicController', () => {
  let app: TestingModule;
  let topicController: TopicController;
  let topicService: TopicService;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [TopicController],
      providers: [{ // mock the service, to avoid providing its dependencies
        provide: TopicService,
        useValue: {
          getAll: jest.fn(),
          addTopic: jest.fn(),
          removeTopic: jest.fn(),
        },
      }],
    }).compile();

   topicController = app.get<TopicController>(TopicController);
   topicService = app.get<TopicService>(TopicService);
  });

  describe('getAll', () => {
    it('should get all topics from service and return them', async () => {
      const getAll = jest.spyOn(topicService, 'getAll')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .mockImplementation(async () => {return [{id: 'id123', title: 'programming'}];});
  
      const topics = await topicController.getAll();
  
      expect(getAll).toHaveBeenCalledTimes(1);
      expect(topics).toHaveLength(1);
      expect(topics[0]).toHaveProperty('id', 'id123');
    });
  });

  describe('addTopic', () => {
    it('should call addTopic on the service', async () => {
      const addTopic = jest.spyOn(topicService, 'addTopic')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
        .mockImplementation(async (id, topic, role) => {});

      const token: Token = {id: 'id123', username: 'wilhelm'};
      const update: TopicUpdate = {title: 'german', role: 'pupil'};
      
      await topicController.addTopic(token, update);

      expect(addTopic).toHaveBeenCalledWith(token.id, update.title, update.role);
    });
  });

  describe('removeTopic', () => {
    it('should call removeTopic on the service', async () => {
      const removeTopic = jest.spyOn(topicService, 'removeTopic')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
        .mockImplementation(async (id, topic, role) => {});

      const token: Token = {id: 'id123', username: 'wilhelm'};
      const update: TopicUpdate = {title: 'german', role: 'pupil'};
      
      await topicController.removeTopic(token, update);

      expect(removeTopic).toHaveBeenCalledWith(token.id, update.title, update.role);
    });
  });
});
