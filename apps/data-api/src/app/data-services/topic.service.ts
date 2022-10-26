import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Topic, TopicDocument } from '../schemas/topic.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Role } from '../schemas/roles';

@Injectable()
export class TopicService {
  constructor(
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async ensureExists(topic: string) {
    try {
      await this.topicModel.create({title: topic});
    // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  async getAll(): Promise<Topic[]> {
    return this.topicModel.find();
  }

  async addTopic(username: string, topic: string, role: Role) {
    await this.ensureExists(topic);

    if (role == 'coach') {
      await this.userModel.updateOne({name: username}, {$addToSet: {coachTopics: topic}});
    } else {
      await this.userModel.updateOne({name: username}, {$addToSet: {pupilTopics: topic}});
    }
  }

  async removeTopic(username: string, topic: string, role: Role) {
    if (role == 'coach') {
      await this.userModel.updateOne({name: username}, {$pull: {coachTopics: topic}});
    } else {
      await this.userModel.updateOne({name: username}, {$pull: {pupilTopics: topic}});
    }
  }
}
