import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Topic, TopicDocument } from '../schemas/topic.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Role } from '../../../../../libs/data/src/lib/role.type';

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

  async addTopic(userId: string, topic: string, role: Role) {
    await this.ensureExists(topic);

    if (role == 'tutor') {
      await this.userModel.updateOne({id: userId}, {$addToSet: {tutorTopics: topic}});
    } else {
      await this.userModel.updateOne({id: userId}, {$addToSet: {pupilTopics: topic}});
    }
  }

  async removeTopic(userId: string, topic: string, role: Role) {
    if (role == 'tutor') {
      await this.userModel.updateOne({id: userId}, {$pull: {tutorTopics: topic}});
    } else {
      await this.userModel.updateOne({id: userId}, {$pull: {pupilTopics: topic}});
    }
  }
}
