import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Topic, TopicDocument } from '../schemas/topic.schema';

@Injectable()
export class TopicService {
  constructor(@InjectModel(Topic.name) private topicModel: Model<TopicDocument>) {}

  async ensureExists() {

  }
}
